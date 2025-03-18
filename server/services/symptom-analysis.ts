import OpenAI from "openai";
import { Medicine, type InsertMedicine } from "@shared/schema";
import { storage } from "../storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Interface representing a symptom for analysis
 */
export interface Symptom {
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string; // e.g. "2 days", "1 week"
  timeOfDay?: string; // e.g. "morning", "night"
  triggeredBy?: string;
  relievedBy?: string;
}

/**
 * Interface for a medical condition with related symptoms
 */
export interface Condition {
  name: string;
  confidence: number; // 0-100
  description: string;
  commonTreatments: string[];
}

/**
 * Interface for medicine recommendations based on symptoms
 */
export interface MedicineRecommendation {
  medicine: Medicine;
  conditionTreated: string;
  confidenceScore: number; // 0-100
  dosageRecommendation?: string;
  warnings: string[];
  sideEffects: string[];
}

/**
 * Wizard step types for the symptom-to-medicine flow
 */
export enum WizardStepType {
  SYMPTOM_SELECTION = 'symptom_selection',
  SYMPTOM_DETAILS = 'symptom_details',
  CONDITION_RESULTS = 'condition_results',
  MEDICINE_RECOMMENDATIONS = 'medicine_recommendations'
}

/**
 * Common symptom categories and their related symptoms
 */
export const symptomCategories = [
  {
    category: 'Pain',
    symptoms: ['Headache', 'Backache', 'Joint pain', 'Muscle pain', 'Abdominal pain', 'Chest pain']
  },
  {
    category: 'Digestive',
    symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Bloating', 'Indigestion', 'Heartburn']
  },
  {
    category: 'Respiratory',
    symptoms: ['Cough', 'Shortness of breath', 'Sore throat', 'Runny nose', 'Congestion', 'Wheezing']
  },
  {
    category: 'Neurological',
    symptoms: ['Dizziness', 'Fatigue', 'Difficulty sleeping', 'Anxiety', 'Mood changes', 'Memory issues']
  },
  {
    category: 'Skin',
    symptoms: ['Rash', 'Itching', 'Hives', 'Dry skin', 'Bruising', 'Swelling']
  },
  {
    category: 'Other',
    symptoms: ['Fever', 'Chills', 'Sweating', 'Weight changes', 'Vision changes', 'Hearing changes']
  }
];

/**
 * Find potential conditions based on symptom descriptions
 * This function uses OpenAI to analyze symptoms and suggest possible conditions
 * 
 * @param symptoms Array of symptom objects with descriptions and details
 * @returns Promise with array of potential conditions
 */
export async function analyzeSymptoms(symptoms: Symptom[]): Promise<Condition[]> {
  try {
    // Format symptoms for analysis
    const symptomDescriptions = symptoms.map(s => {
      return `Symptom: ${s.description}
Severity: ${s.severity}
Duration: ${s.duration}
${s.timeOfDay ? `Time of day: ${s.timeOfDay}` : ''}
${s.triggeredBy ? `Triggered by: ${s.triggeredBy}` : ''}
${s.relievedBy ? `Relieved by: ${s.relievedBy}` : ''}`;
    }).join('\n\n');

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical analysis assistant that helps identify potential conditions based on symptoms. 
          Focus only on common conditions that can be treated with over-the-counter medications available in India.
          DO NOT suggest conditions that require prescription medication or emergency care.
          For each condition, provide a brief description and common treatments.
          Format your response as a JSON array with the following structure for each condition:
          [
            {
              "name": "condition name",
              "confidence": confidence percentage (0-100),
              "description": "brief description of the condition",
              "commonTreatments": ["treatment1", "treatment2"]
            }
          ]`
        },
        {
          role: "user",
          content: `Based on these symptoms, what are the most likely conditions that can be treated with over-the-counter medications?\n\n${symptomDescriptions}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{"conditions": []}';
    const result = JSON.parse(content);
    return result.conditions || [];
  } catch (error) {
    console.error("Error analyzing symptoms with OpenAI:", error);
    // Return default conditions if AI analysis fails
    return getDefaultConditions(symptoms);
  }
}

/**
 * Get medicine recommendations based on identified conditions
 * 
 * @param conditions Array of potential medical conditions
 * @returns Promise with array of medicine recommendations
 */
export async function getMedicineRecommendations(conditions: Condition[]): Promise<MedicineRecommendation[]> {
  try {
    // Get all medicines from storage
    const allMedicines = await storage.getMedicines();
    
    // Search for medicines that match the condition names or treatments
    const recommendations: MedicineRecommendation[] = [];
    
    for (const condition of conditions) {
      // Skip conditions with very low confidence
      if (condition.confidence < 30) continue;
      
      // Search for medicines based on condition name and common treatments
      const searchTerms = [
        condition.name,
        ...condition.commonTreatments
      ];
      
      for (const term of searchTerms) {
        const matchedMedicines = await storage.searchMedicines(term);
        
        for (const medicine of matchedMedicines) {
          // Check if this medicine is already in recommendations
          const existingRec = recommendations.find(r => 
            r.medicine.id === medicine.id && r.conditionTreated === condition.name);
          
          if (!existingRec) {
            // Convert similarity score to confidence
            const confidenceScore = Math.min(
              Math.round((medicine.similarityScore || 0.5) * 100),
              condition.confidence
            );
            
            // Add new recommendation
            recommendations.push({
              medicine,
              conditionTreated: condition.name,
              confidenceScore,
              warnings: [],
              sideEffects: []
            });
          }
        }
      }
    }
    
    // Sort by confidence score
    return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
  } catch (error) {
    console.error("Error getting medicine recommendations:", error);
    return [];
  }
}

/**
 * Enhance medicine recommendations with AI-generated details
 * 
 * @param recommendations Initial medicine recommendations
 * @param conditions The identified conditions
 * @returns Enhanced recommendations with dosage, warnings, etc.
 */
export async function enhanceMedicineRecommendations(
  recommendations: MedicineRecommendation[],
  conditions: Condition[]
): Promise<MedicineRecommendation[]> {
  try {
    // Take only top 5 recommendations to enhance
    const topRecommendations = recommendations.slice(0, 5);
    
    const enhancedRecommendations: MedicineRecommendation[] = [];
    
    for (const recommendation of topRecommendations) {
      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a pharmaceutical expert. You will provide specific information about medication 
              for treating a particular condition. Focus on over-the-counter medications available in India.
              Provide information in JSON format with the following structure:
              {
                "dosageRecommendation": "clear dosage guidance",
                "warnings": ["warning1", "warning2"],
                "sideEffects": ["side effect1", "side effect2"]
              }`
            },
            {
              role: "user",
              content: `Provide information about "${recommendation.medicine.name}" (containing ${recommendation.medicine.activeIngredient}) 
              for treating ${recommendation.conditionTreated}. The medicine is ${recommendation.medicine.isGeneric ? 'generic' : 'branded'} 
              and manufactured by ${recommendation.medicine.manufacturer}.`
            }
          ],
          response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content || '{"dosageRecommendation":"","warnings":[],"sideEffects":[]}';
        const result = JSON.parse(content);
        
        enhancedRecommendations.push({
          ...recommendation,
          dosageRecommendation: result.dosageRecommendation || "Follow package instructions",
          warnings: result.warnings || [],
          sideEffects: result.sideEffects || []
        });
      } catch (error) {
        console.error(`Error enhancing recommendation for ${recommendation.medicine.name}:`, error);
        enhancedRecommendations.push(recommendation);
      }
    }
    
    return enhancedRecommendations;
  } catch (error) {
    console.error("Error enhancing medicine recommendations:", error);
    return recommendations;
  }
}

/**
 * Provide fallback conditions when AI analysis fails
 * 
 * @param symptoms Array of symptom objects
 * @returns Array of default conditions based on symptoms
 */
function getDefaultConditions(symptoms: Symptom[]): Condition[] {
  const conditions: Condition[] = [];
  
  // Map common symptoms to default conditions
  for (const symptom of symptoms) {
    const symptomLower = symptom.description.toLowerCase();
    
    if (symptomLower.includes('headache') || symptomLower.includes('pain')) {
      conditions.push({
        name: 'General Pain',
        confidence: 70,
        description: 'General pain or discomfort that can be managed with over-the-counter pain relievers.',
        commonTreatments: ['Paracetamol', 'Ibuprofen', 'Aspirin']
      });
    } else if (symptomLower.includes('fever') || symptomLower.includes('temperature')) {
      conditions.push({
        name: 'Fever',
        confidence: 65,
        description: 'Elevated body temperature, often due to infection or inflammation.',
        commonTreatments: ['Paracetamol', 'NSAIDs']
      });
    } else if (symptomLower.includes('cough') || symptomLower.includes('cold') || 
               symptomLower.includes('congestion') || symptomLower.includes('sinus')) {
      conditions.push({
        name: 'Common Cold',
        confidence: 60,
        description: 'Viral infection affecting the upper respiratory tract.',
        commonTreatments: ['Antihistamines', 'Decongestants', 'Cough suppressants']
      });
    } else if (symptomLower.includes('stomach') || symptomLower.includes('nausea') || 
               symptomLower.includes('digestion') || symptomLower.includes('indigestion')) {
      conditions.push({
        name: 'Indigestion',
        confidence: 55,
        description: 'Discomfort or pain in the upper abdomen often related to eating.',
        commonTreatments: ['Antacids', 'Proton Pump Inhibitors', 'H2 Blockers']
      });
    } else if (symptomLower.includes('allergy') || symptomLower.includes('itching') || 
               symptomLower.includes('rash') || symptomLower.includes('skin')) {
      conditions.push({
        name: 'Allergic Reaction',
        confidence: 50,
        description: 'Immune system response to a substance that is normally harmless.',
        commonTreatments: ['Antihistamines', 'Topical corticosteroids']
      });
    } else {
      conditions.push({
        name: 'General Discomfort',
        confidence: 40,
        description: 'Non-specific symptoms that may be related to minor conditions.',
        commonTreatments: ['Rest', 'Hydration', 'Over-the-counter pain relievers']
      });
    }
  }
  
  // Remove duplicates
  return conditions.filter((condition, index, self) =>
    index === self.findIndex((c) => c.name === condition.name)
  );
}