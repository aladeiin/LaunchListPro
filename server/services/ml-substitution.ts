import OpenAI from 'openai';
import { Medicine } from '@shared/schema';
import { storage } from '../storage';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Interface for medicine substitution recommendation
 */
export interface SubstitutionRecommendation {
  medicine: Medicine;
  similarityScore: number;
  reasonsForSubstitution: string[];
  warningsOrCautions: string[];
  dosageAdjustment?: string;
}

/**
 * Get medicine substitution recommendations using machine learning
 * @param medicineName The name of the medicine to find substitutions for
 * @param limit The maximum number of substitution recommendations to return
 * @returns Array of substitution recommendations
 */
export async function getMlSubstitutionRecommendations(
  medicineName: string,
  limit: number = 5
): Promise<SubstitutionRecommendation[]> {
  try {
    // Get the original medicine
    const originalMedicine = await storage.getMedicineByName(medicineName);
    if (!originalMedicine) {
      throw new Error(`Medicine ${medicineName} not found`);
    }

    // Get all medicines from storage
    const allMedicines = await storage.getMedicines();
    
    // First, filter medicines by active ingredient for potential substitutes
    const potentialSubstitutes = allMedicines.filter(
      med => med.activeIngredient === originalMedicine.activeIngredient && 
             med.name !== originalMedicine.name
    );

    // If we have potential substitutes by ingredient, analyze them further
    if (potentialSubstitutes.length > 0) {
      const recommendations = await enhanceSubstitutionsWithAI(
        originalMedicine, 
        potentialSubstitutes,
        limit
      );
      return recommendations;
    }

    // If no direct active ingredient matches, use AI to find other possible substitutes
    // Get a larger set of medicines to analyze
    const medicinesForAIAnalysis = allMedicines
      .filter(med => med.name !== originalMedicine.name)
      .slice(0, 50); // Limit to 50 medicines for API efficiency
    
    return await findSubstitutesWithAI(originalMedicine, medicinesForAIAnalysis, limit);
  } catch (error) {
    console.error('Error in ML substitution service:', error);
    return [];
  }
}

/**
 * Enhance substitution recommendations with AI analysis
 * @param originalMedicine The original medicine
 * @param potentialSubstitutes Potential substitute medicines
 * @param limit Maximum number of recommendations to return
 * @returns Enhanced substitution recommendations
 */
async function enhanceSubstitutionsWithAI(
  originalMedicine: Medicine,
  potentialSubstitutes: Medicine[],
  limit: number
): Promise<SubstitutionRecommendation[]> {
  try {
    // Construct a prompt for the AI to analyze the substitutions
    const prompt = `
    Original Medicine:
    Name: ${originalMedicine.name}
    Generic Name: ${originalMedicine.genericName}
    Active Ingredient: ${originalMedicine.activeIngredient}
    Dosage: ${originalMedicine.dosage}
    Description: ${originalMedicine.description}
    
    Potential Substitutes (analyze for medical equivalence, efficacy, and safety):
    ${potentialSubstitutes.map(med => `
    - Name: ${med.name}
    - Generic Name: ${med.genericName}
    - Active Ingredient: ${med.activeIngredient}
    - Dosage: ${med.dosage}
    - Description: ${med.description}
    - Is Generic: ${med.isGeneric}
    `).join('\n')}
    
    For each potential substitute, provide:
    1. A similarity score (0-100) indicating how suitable it is as a substitute
    2. 2-3 reasons why it's a good substitution
    3. Any warnings or cautions when substituting
    4. Dosage adjustment recommendations if needed
    
    Format your response as a JSON array with objects containing:
    {
      "name": "Medicine Name",
      "similarityScore": 85,
      "reasonsForSubstitution": ["Reason 1", "Reason 2"],
      "warningsOrCautions": ["Warning 1", "Warning 2"],
      "dosageAdjustment": "Dosage adjustment note or null if none needed"
    }
    
    Return only the best ${limit} substitutes, sorted by similarityScore in descending order.
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    // Parse the AI response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(content);
      
      // Check if the response has the expected structure
      if (!aiResponse.substitutes || !Array.isArray(aiResponse.substitutes)) {
        throw new Error('AI response missing substitutes array');
      }
    } catch (error) {
      console.warn('Invalid AI response format:', error);
      // Create a default response structure
      aiResponse = {
        substitutes: potentialSubstitutes.slice(0, limit).map(med => ({
          name: med.name,
          similarityScore: 80,
          reasonsForSubstitution: ["Same active ingredient"],
          warningsOrCautions: ["Consult your doctor before substituting any medication"],
          dosageAdjustment: null
        }))
      };
    }
    
    // Map the AI recommendations back to our Medicine objects
    const recommendationsWithMedicines = aiResponse.substitutes.map((rec: any) => {
      const medicine = potentialSubstitutes.find(med => med.name === rec.name);
      if (!medicine) {
        return null;
      }
      
      // Calculate price savings
      const priceDifference = originalMedicine.price - medicine.price;
      const savingsPercentage = (priceDifference / originalMedicine.price) * 100;
      
      return {
        medicine: {
          ...medicine,
          similarityScore: rec.similarityScore / 100 // Convert to 0-1 range
        },
        similarityScore: rec.similarityScore / 100,
        reasonsForSubstitution: rec.reasonsForSubstitution,
        warningsOrCautions: rec.warningsOrCautions,
        dosageAdjustment: rec.dosageAdjustment === 'null' ? undefined : rec.dosageAdjustment,
        savingsPercentage: savingsPercentage > 0 ? parseFloat(savingsPercentage.toFixed(2)) : 0
      };
    }).filter(Boolean);
    
    return recommendationsWithMedicines.slice(0, limit);
  } catch (error) {
    console.error('Error enhancing substitutions with AI:', error);
    
    // Fallback: provide basic recommendations without AI enhancement
    return potentialSubstitutes.slice(0, limit).map(medicine => {
      const priceDifference = originalMedicine.price - medicine.price;
      const savingsPercentage = (priceDifference / originalMedicine.price) * 100;
      
      return {
        medicine: {
          ...medicine,
          similarityScore: 0.8 // Default similarity score
        },
        similarityScore: 0.8,
        reasonsForSubstitution: [
          "Same active ingredient",
          medicine.isGeneric ? "Generic alternative" : "Branded alternative"
        ],
        warningsOrCautions: [
          "Consult your doctor before substituting any medication"
        ],
        dosageAdjustment: undefined,
        savingsPercentage: savingsPercentage > 0 ? parseFloat(savingsPercentage.toFixed(2)) : 0
      };
    });
  }
}

/**
 * Find substitutes using AI when no direct active ingredient matches are found
 * @param originalMedicine The original medicine
 * @param allMedicines All medicines to consider
 * @param limit Maximum number of recommendations to return
 * @returns Substitution recommendations
 */
async function findSubstitutesWithAI(
  originalMedicine: Medicine,
  allMedicines: Medicine[],
  limit: number
): Promise<SubstitutionRecommendation[]> {
  try {
    // Construct a more comprehensive prompt for finding substitutes
    const prompt = `
    I need to find possible alternative medicines for a patient who is currently taking:
    
    Original Medicine:
    Name: ${originalMedicine.name}
    Generic Name: ${originalMedicine.genericName}
    Active Ingredient: ${originalMedicine.activeIngredient}
    Dosage: ${originalMedicine.dosage}
    Description: ${originalMedicine.description}
    
    Based on your medical knowledge, analyze the following list of medicines and determine which could potentially serve as substitutes or alternatives. These might include:
    1. Medicines with the same therapeutic class but different active ingredients
    2. Medicines that treat the same condition but through different mechanisms
    3. Newer generation medicines that have replaced older treatments for the same condition
    
    Available medicines:
    ${allMedicines.slice(0, 30).map(med => `
    - Name: ${med.name}
    - Generic Name: ${med.genericName}
    - Active Ingredient: ${med.activeIngredient}
    - Dosage: ${med.dosage}
    - Description: ${med.description.substring(0, 100)}...
    - Is Generic: ${med.isGeneric}
    `).join('\n')}
    
    For each potential substitute, provide:
    1. A similarity score (0-100) indicating how suitable it is as a substitute
    2. 2-3 reasons why it's a good substitution
    3. Any warnings or cautions when substituting
    4. Dosage adjustment recommendations if needed
    
    Format your response as a JSON object with this structure:
    {
      "substitutes": [
        {
          "name": "Medicine Name",
          "similarityScore": 85,
          "reasonsForSubstitution": ["Reason 1", "Reason 2"],
          "warningsOrCautions": ["Warning 1", "Warning 2"],
          "dosageAdjustment": "Dosage adjustment note or null if none needed"
        }
      ]
    }
    
    Return only the best ${limit} substitutes, sorted by similarityScore in descending order.
    Only include medicines that would be appropriate to substitute with medical supervision.
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    // Parse the AI response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(content);
      
      // Check if the response has the expected structure
      if (!aiResponse.substitutes || !Array.isArray(aiResponse.substitutes)) {
        throw new Error('AI response missing substitutes array');
      }
    } catch (error) {
      console.warn('Invalid AI response format:', error);
      // Create a default response structure
      aiResponse = {
        substitutes: allMedicines.slice(0, limit).map(med => ({
          name: med.name,
          similarityScore: 75,
          reasonsForSubstitution: ["Alternative medication option"],
          warningsOrCautions: ["Consult your doctor before substituting any medication"],
          dosageAdjustment: null
        }))
      };
    }
    
    // Map the AI recommendations back to our Medicine objects
    const recommendationsWithMedicines = aiResponse.substitutes.map((rec: any) => {
      const medicine = allMedicines.find(med => med.name === rec.name);
      if (!medicine) {
        return null;
      }
      
      // Calculate price savings
      const priceDifference = originalMedicine.price - medicine.price;
      const savingsPercentage = (priceDifference / originalMedicine.price) * 100;
      
      return {
        medicine: {
          ...medicine,
          similarityScore: rec.similarityScore / 100 // Convert to 0-1 range
        },
        similarityScore: rec.similarityScore / 100,
        reasonsForSubstitution: rec.reasonsForSubstitution,
        warningsOrCautions: rec.warningsOrCautions,
        dosageAdjustment: rec.dosageAdjustment === 'null' ? undefined : rec.dosageAdjustment,
        savingsPercentage: savingsPercentage > 0 ? parseFloat(savingsPercentage.toFixed(2)) : 0
      };
    }).filter(Boolean);
    
    return recommendationsWithMedicines.slice(0, limit);
  } catch (error) {
    console.error('Error finding substitutes with AI:', error);
    
    // Return empty array if AI analysis fails
    return [];
  }
}

/**
 * Analyze the efficacy of a substitution between two medicines
 * @param originalMedicine The original medicine
 * @param substituteMedicine The substitute medicine
 * @returns Detailed analysis of the substitution
 */
export async function analyzeSubstitutionEfficacy(
  originalMedicine: Medicine,
  substituteMedicine: Medicine
): Promise<{
  efficacyScore: number;
  detailedAnalysis: string;
  potentialSideEffects: string[];
  recommendedUsage: string;
  additionalNotes: string;
}> {
  try {
    const prompt = `
    Perform a detailed comparative analysis between these two medicines for substitution purposes:
    
    Original Medicine:
    Name: ${originalMedicine.name}
    Generic Name: ${originalMedicine.genericName}
    Active Ingredient: ${originalMedicine.activeIngredient}
    Dosage: ${originalMedicine.dosage}
    Description: ${originalMedicine.description}
    
    Potential Substitute:
    Name: ${substituteMedicine.name}
    Generic Name: ${substituteMedicine.genericName}
    Active Ingredient: ${substituteMedicine.activeIngredient}
    Dosage: ${substituteMedicine.dosage}
    Description: ${substituteMedicine.description}
    
    Provide the following in your analysis:
    1. Efficacy score (0-100) based on therapeutic equivalence
    2. Detailed analysis of similarities and differences
    3. Potential differences in side effects
    4. Recommended usage guidelines when substituting
    5. Additional important notes for healthcare professionals
    
    Format your response as a JSON object with this structure:
    {
      "efficacyScore": 85,
      "detailedAnalysis": "Detailed text analyzing the substitution...",
      "potentialSideEffects": ["Side effect difference 1", "Side effect difference 2"],
      "recommendedUsage": "Guidelines for proper substitution usage",
      "additionalNotes": "Any other important information"
    }
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // Parse the AI response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    let analysis;
    try {
      analysis = JSON.parse(content);
      
      // Validate required fields
      if (!analysis.efficacyScore || 
          typeof analysis.efficacyScore !== 'number' ||
          !analysis.detailedAnalysis ||
          !Array.isArray(analysis.potentialSideEffects) ||
          !analysis.recommendedUsage) {
        throw new Error('AI response missing required fields');
      }
    } catch (error) {
      console.warn('Invalid efficacy analysis format:', error);
      // Provide fallback analysis
      analysis = {
        efficacyScore: 50, // Neutral score
        detailedAnalysis: `Both ${originalMedicine.name} and ${substituteMedicine.name} contain the same active ingredient: ${originalMedicine.activeIngredient}. They should have similar therapeutic effects.`,
        potentialSideEffects: ['Side effects profile should be similar for both medications'],
        recommendedUsage: 'Follow your doctor\'s instructions for dosing',
        additionalNotes: 'Consult a healthcare professional before making any substitutions'
      };
    }
    
    return {
      ...analysis,
      efficacyScore: analysis.efficacyScore / 100 // Convert to 0-1 range
    };
  } catch (error) {
    console.error('Error analyzing substitution efficacy:', error);
    
    // Return fallback analysis
    return {
      efficacyScore: 0.5,
      detailedAnalysis: 'Analysis could not be completed. Please consult with a healthcare professional.',
      potentialSideEffects: ['Unknown - please consult with a healthcare professional'],
      recommendedUsage: 'Do not substitute without professional medical advice',
      additionalNotes: 'This fallback response is provided due to an error in analysis'
    };
  }
}