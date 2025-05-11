/**
 * Chatbot Training Utilities
 * 
 * This module provides functions to help train the medication chatbot
 * with specific Indian pharmaceutical knowledge.
 */

import { indianMedicinePairs, indianMedicineQueries, indianPharmaTerms } from '../data/indian-medicine-examples';
import OpenAI from "openai";

// Initialize OpenAI with API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 2
});

/**
 * Enhanced medicine detection that includes context from our Indian medicine dataset
 * @param query User's query about a medicine
 * @returns Enhanced detection with brand and generic information when available
 */
export function enhancedMedicineDetection(query: string): {
  medicineName: string | null;
  isIndianBrand: boolean;
  genericName?: string;
  alternatives?: string[];
  priceRange?: string;
} {
  if (!query) return { medicineName: null, isIndianBrand: false };
  
  const lowerQuery = query.toLowerCase();
  
  // Check against our dataset of Indian medicines
  for (const [brandName, genericName, alternativeBrand, priceRange] of indianMedicinePairs) {
    if (lowerQuery.includes(brandName.toLowerCase())) {
      return {
        medicineName: brandName,
        isIndianBrand: true,
        genericName,
        alternatives: [alternativeBrand],
        priceRange
      };
    }
  }
  
  // If no match in our dataset, use the regular detection
  // This could be the medication-api-integration detection
  // For now, we'll just extract potential medicine names
  
  // Try to detect common Indian medicine brand formats
  const indianMedicinePattern = /\b((?:[A-Za-z]+(?:-[A-Za-z]+)*)\s*(?:\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|tablet|tab|cap)?))\b/i;
  const indianMatch = indianMedicinePattern.exec(query);
  
  if (indianMatch && indianMatch[1]) {
    return {
      medicineName: indianMatch[1].trim(),
      isIndianBrand: false // We don't know for sure if it's an Indian brand
    };
  }
  
  // Default fallback - try to extract just a medicine name
  const medicineNamePattern = /\b([A-Z][a-zA-Z0-9\s-]{2,})\b/g;
  const match = medicineNamePattern.exec(query);
  
  if (match && match[1]) {
    return {
      medicineName: match[1].trim(),
      isIndianBrand: false
    };
  }
  
  return { medicineName: null, isIndianBrand: false };
}

/**
 * Generate enhanced training examples for the chatbot
 * @returns Array of training examples with questions and ideal responses
 */
export function generateTrainingExamples() {
  const trainingExamples = [];
  
  // Generate examples for each medicine in our dataset
  for (let i = 0; i < 5; i++) { // Limit to 5 examples to avoid overloading
    const medicineIndex = Math.floor(Math.random() * indianMedicinePairs.length);
    const [brandName, genericName, alternativeBrand, priceRange] = indianMedicinePairs[medicineIndex];
    
    // Generate a query for this medicine
    const queryIndex = Math.floor(Math.random() * indianMedicineQueries.length);
    const queryPattern = indianMedicineQueries[queryIndex];
    const query = queryPattern.replace('{medicine}', brandName);
    
    // Add it to our training examples
    trainingExamples.push({
      query,
      context: {
        brandName,
        genericName,
        alternativeBrand,
        priceRange
      }
    });
  }
  
  return trainingExamples;
}

/**
 * Get contextual information about a detected medicine
 * @param medicineName Name of the medicine to look up
 * @returns Context information if available
 */
export async function getMedicineContext(medicineName: string) {
  if (!medicineName) return null;
  
  const lowerName = medicineName.toLowerCase();
  
  try {
    // First try to get information from our 1mg processor
    const { getMedicineInfo, searchMedicationsBySalt } = await import('../services/1mg-medicine-processor');
    const medicineInfo = await getMedicineInfo(medicineName);
    
    if (medicineInfo) {
      // We have detailed information from 1mg
      console.log(`[CHATBOT-TRAINER] Found medicine info for ${medicineName} in 1mg data`);
      
      // Extract active ingredients as a string
      const saltInfo = medicineInfo.activeIngredients.map(ing => 
        `${ing.name}${ing.dosage ? ` ${ing.dosage}${ing.unit}` : ''}`
      ).join(', ');
      
      // Check if this is a compound medication (has multiple ingredients)
      const isCompoundMedication = medicineInfo.activeIngredients.length > 1;
      console.log(`[CHATBOT-TRAINER] Medicine is${isCompoundMedication ? '' : ' not'} a compound medication with ${medicineInfo.activeIngredients.length} ingredients`);
      
      // Find alternatives from similarBrands
      let alternatives = medicineInfo.similarBrands?.slice(0, 5) || [];
      
      // For compound medications, aggressively search for alternatives if none found
      if (isCompoundMedication && (!alternatives || alternatives.length === 0)) {
        console.log(`[CHATBOT-TRAINER] Compound medication with no direct alternatives, searching by ingredients...`);
        
        // Try to find substitutes by searching for each active ingredient
        interface IngredientSubstitutes {
          ingredient: string;
          medications: string[];
        }
        const allSubstitutesByIngredient: IngredientSubstitutes[] = [];
        
        for (const ingredient of medicineInfo.activeIngredients) {
          // Skip ingredients without a name
          if (!ingredient.name) continue;
          
          // Search for medications with this ingredient
          const medicationsWithIngredient = await searchMedicationsBySalt(ingredient.name);
          
          // Add to our list of potential substitutes
          if (medicationsWithIngredient && medicationsWithIngredient.length > 0) {
            const matchingMeds = medicationsWithIngredient
              .filter(med => med.name.toLowerCase() !== medicineName.toLowerCase())
              .map(med => med.name);
            
            allSubstitutesByIngredient.push({
              ingredient: ingredient.name,
              medications: matchingMeds
            });
          }
        }
        
        // Log what we found
        console.log(`[CHATBOT-TRAINER] Found potential alternatives by ingredient search:`, 
          allSubstitutesByIngredient.map(x => `${x.ingredient}: ${x.medications.length} matches`).join(', '));
        
        // Look for medications that include all the active ingredients
        // This is a simplistic approach - in a real system we'd use a more sophisticated algorithm
        if (allSubstitutesByIngredient.length > 0) {
          const firstIngredientMeds = allSubstitutesByIngredient[0].medications;
          
          // Find medications that appear in all ingredient lists (crude intersection)
          const commonMeds = firstIngredientMeds.filter(med => {
            // Check if this med appears in all other ingredient lists
            return allSubstitutesByIngredient.every(subList => 
              subList.medications.includes(med)
            );
          });
          
          if (commonMeds.length > 0) {
            alternatives = commonMeds.slice(0, 5);
            console.log(`[CHATBOT-TRAINER] Found ${alternatives.length} compound alternatives with all ingredients`);
          }
        }
      }
      
      return {
        brandName: medicineInfo.brandName,
        genericName: medicineInfo.genericName,
        alternativeBrand: alternatives.length > 0 ? alternatives[0] : '',
        priceRange: `₹${medicineInfo.price}`,
        isKnownMedicine: true,
        saltInfo,
        description: medicineInfo.description,
        manufacturer: medicineInfo.manufacturer,
        isGeneric: medicineInfo.isGeneric,
        dosage: medicineInfo.activeIngredients.map(ing => `${ing.dosage}${ing.unit}`).join(', '),
        from1mg: true,
        alternatives,
        isCompoundMedication
      };
    }
  } catch (error) {
    console.error('[CHATBOT-TRAINER] Error getting medicine context from 1mg:', error);
  }
  
  // Fallback to our legacy dataset
  for (const [brandName, genericName, alternativeBrand, priceRange] of indianMedicinePairs) {
    if (lowerName.includes(brandName.toLowerCase())) {
      return {
        brandName,
        genericName, 
        alternativeBrand,
        priceRange,
        isKnownMedicine: true,
        from1mg: false
      };
    }
  }
  
  return {
    brandName: medicineName,
    isKnownMedicine: false,
    from1mg: false
  };
}

/**
 * Detect query type with improved context
 * @param query User query
 * @returns Query type classification 
 */
export async function detectQueryTypeWithContext(query: string): Promise<{ 
  type: 'alternative' | 'side_effect' | 'dosage' | 'usage' | 'interaction' | 'general' | 'unknown';
  medicineName: string | null;
  context: any;
}> {
  // Detect the medicine first
  const medicineInfo = enhancedMedicineDetection(query);
  const medicineName = medicineInfo.medicineName;
  
  if (!medicineName) {
    return {
      type: 'unknown',
      medicineName: null,
      context: {}
    };
  }
  
  // Get additional context for this medicine (now async)
  const context = await getMedicineContext(medicineName);
  
  // Determine query type
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('alternative') || 
      lowerQuery.includes('cheaper') || 
      lowerQuery.includes('generic') || 
      lowerQuery.includes('substitute') ||
      lowerQuery.includes('instead of') ||
      lowerQuery.includes('jan aushadhi')) {
    return { type: 'alternative', medicineName, context };
  }
  
  if (lowerQuery.includes('side effect') || 
      lowerQuery.includes('adverse') || 
      lowerQuery.includes('safe during') ||
      lowerQuery.includes('risk') ||
      lowerQuery.includes('reaction')) {
    return { type: 'side_effect', medicineName, context };
  }
  
  if (lowerQuery.includes('dosage') || 
      lowerQuery.includes('how to take') || 
      lowerQuery.includes('times a day') ||
      lowerQuery.includes('how many') ||
      lowerQuery.includes('dose')) {
    return { type: 'dosage', medicineName, context };
  }
  
  if (lowerQuery.includes('used for') || 
      lowerQuery.includes('treat') || 
      lowerQuery.includes('helps with') ||
      lowerQuery.includes('purpose of') ||
      lowerQuery.includes('what is it for')) {
    return { type: 'usage', medicineName, context };
  }
  
  if (lowerQuery.includes('interact') || 
      lowerQuery.includes('with food') || 
      lowerQuery.includes('with water') ||
      lowerQuery.includes('alcohol') ||
      lowerQuery.includes('together with')) {
    return { type: 'interaction', medicineName, context };
  }
  
  // Default to general query about the medicine
  return { type: 'general', medicineName, context };
}