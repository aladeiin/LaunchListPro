/**
 * Compound Medication Handler
 * 
 * This module provides utilities for detecting and processing requests about
 * compound medications (medications with multiple active ingredients)
 */
import { getCompoundMedicationAlternatives } from '../openai';

/**
 * Common ingredients in compound medications by medication name pattern
 * This helps identify the components of known compound medications
 */
const knownCompoundIngredients: Record<string, string[]> = {
  // Telmisartan combinations
  'telma-am': ['Telmisartan 40mg', 'Amlodipine 5mg'],
  'telsar-am': ['Telmisartan 40mg', 'Amlodipine 5mg'],
  'telma-h': ['Telmisartan 40mg', 'Hydrochlorothiazide 12.5mg'],
  'telsar-h': ['Telmisartan 40mg', 'Hydrochlorothiazide 12.5mg'],
  'telvas-beta': ['Telmisartan 40mg', 'Metoprolol 50mg'],
  
  // Metformin combinations
  'glycomet-gp': ['Metformin 500mg', 'Glimepiride 2mg'],
  'glycomet-gp1': ['Metformin 500mg', 'Glimepiride 1mg'],
  'glycomet-gp2': ['Metformin 500mg', 'Glimepiride 2mg'],
  
  // Ramipril combinations
  'cardace-h': ['Ramipril 5mg', 'Hydrochlorothiazide 12.5mg'],
  'cardace-am': ['Ramipril 5mg', 'Amlodipine 5mg'],
  
  // Amlodipine combinations
  'amlovas-at': ['Amlodipine 5mg', 'Atorvastatin 10mg'],
  'amlodac-at': ['Amlodipine 5mg', 'Atorvastatin 10mg'],
  
  // Telmisartan complex combinations
  'telpres-ct': ['Telmisartan 40mg', 'Chlorthalidone 12.5mg'],
  'telpres-amt': ['Telmisartan 40mg', 'Amlodipine 5mg', 'Chlorthalidone 12.5mg'],
};

/**
 * Check if a medicine name appears to be a compound medication
 * @param name Medicine name to check
 * @returns True if it appears to be a compound medicine
 */
export function isCompoundMedicine(name: string): boolean {
  // Common patterns for compound medicines in India
  const compoundPatterns = [
    /-am$/i, // e.g., Telma-AM
    /-h$/i,  // e.g., Telma-H
    /\bam\b/i, // e.g., Telsar AM
    /\bh\b/i,  // e.g., Telsar H
    /\bbeta\b/i, // e.g., Telvas Beta
    /\bplus\b/i, // e.g., Ecosprin Plus
    /-gp\d*/i, // e.g., Glycomet-GP, Glycomet-GP1
    /-m\b/i,   // e.g., Glimestar-M
    /-mt\b/i,  // e.g., Telpres-MT
    /-ct\b/i,  // e.g., Telpres-CT
    /-forte\b/i, // e.g., Ecosprin-Forte
    /\bforte\b/i // e.g., Ecosprin Forte
  ];
  
  return compoundPatterns.some(pattern => pattern.test(name));
}

/**
 * Get ingredients for a known compound medication
 * @param medicineName Name of the compound medication
 * @returns Array of ingredient strings, or empty array if unknown
 */
export function getCompoundIngredients(medicineName: string): string[] {
  // Normalize the name for lookup
  const normalizedName = medicineName.toLowerCase().replace(/\s+/g, '-');
  
  // Return ingredients if found
  if (knownCompoundIngredients[normalizedName]) {
    return knownCompoundIngredients[normalizedName];
  }
  
  // For unknown compounds, try to guess based on patterns
  if (/-am$/i.test(normalizedName) || /\bam\b/i.test(normalizedName)) {
    // Likely a combination with Amlodipine
    const baseName = normalizedName.replace(/-am$/i, '').replace(/\bam\b/i, '').trim();
    if (baseName.includes('telm') || baseName.includes('tels') || baseName.includes('telv')) {
      return ['Telmisartan 40mg', 'Amlodipine 5mg'];
    }
    if (baseName.includes('card') || baseName.includes('rami')) {
      return ['Ramipril 5mg', 'Amlodipine 5mg'];
    }
  }
  
  if (/-h$/i.test(normalizedName) || /\bh\b/i.test(normalizedName)) {
    // Likely a combination with Hydrochlorothiazide
    const baseName = normalizedName.replace(/-h$/i, '').replace(/\bh\b/i, '').trim();
    if (baseName.includes('telm') || baseName.includes('tels') || baseName.includes('telv')) {
      return ['Telmisartan 40mg', 'Hydrochlorothiazide 12.5mg'];
    }
    if (baseName.includes('card') || baseName.includes('rami')) {
      return ['Ramipril 5mg', 'Hydrochlorothiazide 12.5mg'];
    }
  }
  
  // No matching pattern found
  return [];
}

/**
 * Generate a formatted response for compound medication alternatives
 * @param medicineName Name of the compound medication
 * @param ingredients List of ingredients in the compound
 * @returns Formatted response string for the chatbot
 */
export async function getCompoundAlternativesResponse(medicineName: string, ingredients: string[]): Promise<string> {
  console.log(`[COMPOUND-HANDLER] Getting alternatives for ${medicineName}`);
  console.log(`[COMPOUND-HANDLER] Ingredients: ${ingredients.join(', ')}`);
  
  // Get alternatives
  const alternatives = await getCompoundMedicationAlternatives(medicineName, ingredients);
  console.log(`[COMPOUND-HANDLER] Found ${alternatives.length} alternatives`);
  
  // Format response based on results
  if (alternatives.length === 0) {
    return `**${medicineName}** is a combination medication, but I couldn't find specific alternatives with identical ingredients. Please consult your healthcare provider for appropriate substitutions.`;
  }
  
  return `**${medicineName}** is a combination medication containing multiple active ingredients:
${ingredients.map(ing => `- ${ing}`).join('\n')}

Here are some alternative brands that contain the same combination of ingredients:

${alternatives.map((alt, i) => `${i+1}. **${alt}**`).join('\n')}

These alternatives contain the same active ingredients in similar dosages. Please consult your healthcare provider before switching medications.

(Note: This information is for educational purposes only. Always consult a healthcare professional for medical advice.)`;
}

/**
 * Process a medication query that might involve a compound medication
 * @param medicineName Name of the possible compound medication
 * @returns Response string if it's a compound medication, null otherwise
 */
export async function processCompoundMedicationQuery(medicineName: string): Promise<string | null> {
  if (!isCompoundMedicine(medicineName)) {
    return null; // Not a compound medication
  }
  
  console.log(`[COMPOUND-HANDLER] Detected potential compound medication: ${medicineName}`);
  
  // Get ingredients
  const ingredients = getCompoundIngredients(medicineName);
  if (ingredients.length < 2) {
    console.log(`[COMPOUND-HANDLER] Not enough ingredients found for ${medicineName}`);
    return null; // Not enough information to treat as compound
  }
  
  // Process and return response
  return await getCompoundAlternativesResponse(medicineName, ingredients);
}