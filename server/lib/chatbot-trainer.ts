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
export function getMedicineContext(medicineName: string) {
  if (!medicineName) return null;
  
  const lowerName = medicineName.toLowerCase();
  
  // Look up in our Indian medicines dataset
  for (const [brandName, genericName, alternativeBrand, priceRange] of indianMedicinePairs) {
    if (lowerName.includes(brandName.toLowerCase())) {
      return {
        brandName,
        genericName, 
        alternativeBrand,
        priceRange,
        isKnownMedicine: true
      };
    }
  }
  
  return {
    brandName: medicineName,
    isKnownMedicine: false
  };
}

/**
 * Detect query type with improved context
 * @param query User query
 * @returns Query type classification 
 */
export function detectQueryTypeWithContext(query: string): { 
  type: 'alternative' | 'side_effect' | 'dosage' | 'usage' | 'interaction' | 'general' | 'unknown';
  medicineName: string | null;
  context: any;
} {
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
  
  // Get additional context for this medicine
  const context = getMedicineContext(medicineName);
  
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