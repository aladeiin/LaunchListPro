/**
 * 1mg Medicine Processor Service
 * 
 * This service processes medicine data scraped from 1mg to extract and utilize
 * information about active ingredients (salts) and dosages to enhance the chatbot.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';
import OpenAI from 'openai';

// ESM module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define interfaces for the data structures
interface MappedMedication {
  name: string;
  genericName: string;
  manufacturer: string;
  marketer: string;
  price: number;
  type: string;
  dosage: string;
  activeIngredient: string;
  composition: string;
  packSize: string;
  prescriptionRequired: boolean;
  inStock: boolean;
  id: number;
  imageUrl: string;
  slug: string;
}

interface ProcessedMedication {
  name: string;
  brandName: string;
  genericName: string;
  activeIngredients: Array<{
    name: string;
    dosage: string;
    unit: string;
  }>;
  description: string;
  manufacturer: string;
  price: number;
  isGeneric: boolean;
  hasSimilarBrands: boolean;
  similarBrands?: string[];
}

interface MedicineDataset {
  [key: string]: ProcessedMedication;
}

// In-memory cache for processed medications
const medicineCache: MedicineDataset = {};

/**
 * Process the dosage string to extract standardized information
 * @param dosageStr The raw dosage string from 1mg data
 * @returns Object with parsed dosage value and unit
 */
function processDosage(dosageStr: string): { value: string; unit: string } {
  if (!dosageStr) return { value: '', unit: '' };

  // Try to match common dosage patterns
  const match = dosageStr.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z%]+)/);
  if (match) {
    return {
      value: match[1],
      unit: match[2].toLowerCase()
    };
  }

  return { value: dosageStr, unit: '' };
}

/**
 * Process the composition string to extract active ingredients and their dosages
 * @param compositionStr Composition string from 1mg data
 * @returns Array of active ingredient objects with names and dosages
 */
function processComposition(compositionStr: string): Array<{ name: string; dosage: string; unit: string }> {
  if (!compositionStr) return [];

  const ingredients: Array<{ name: string; dosage: string; unit: string }> = [];

  // Try to split multiple ingredients if present
  const ingredientParts = compositionStr.split(/\s*\+\s*/);

  for (const part of ingredientParts) {
    // Look for patterns like "Ingredient (123mg)" or "Ingredient 123mg"
    const match1 = part.match(/([^(]+)\s*\(([^)]+)\)/);
    const match2 = part.match(/([^0-9]+)\s*(\d+(?:\.\d+)?[a-zA-Z%]+)/);

    if (match1) {
      // Format: "Ingredient (123mg)"
      const name = match1[1].trim();
      const dosageStr = match1[2].trim();
      const dosage = processDosage(dosageStr);
      
      ingredients.push({
        name,
        dosage: dosage.value,
        unit: dosage.unit
      });
    } else if (match2) {
      // Format: "Ingredient 123mg"
      const name = match2[1].trim();
      const dosageStr = match2[2].trim();
      const dosage = processDosage(dosageStr);
      
      ingredients.push({
        name,
        dosage: dosage.value,
        unit: dosage.unit
      });
    } else {
      // Format: Just the ingredient name
      ingredients.push({
        name: part.trim(),
        dosage: '',
        unit: ''
      });
    }
  }

  return ingredients;
}

/**
 * Process a raw 1mg medication object into our standardized format
 * @param medication Raw 1mg medication data
 * @returns Processed medication object
 */
function processMedication(medication: MappedMedication): ProcessedMedication {
  // Extract brand name (without dosage/form info)
  const brandNameMatch = medication.name.match(/^([^0-9]+?)(?:\s+\d|\s+Tablet|\s+Capsule|\s+Syrup|\s+Injection|\s+Cream|\s+Gel|\s+Solution|\s+Suspension|$)/i);
  const brandName = brandNameMatch ? brandNameMatch[1].trim() : medication.name;
  
  // Process active ingredients from composition
  const activeIngredients = processComposition(medication.composition || medication.genericName);
  
  // Use composition as generic name if available, otherwise use the existing generic name
  const genericName = medication.composition || medication.genericName;
  
  // Build a description that includes dosage information
  let description = `${medication.name} contains `;
  if (activeIngredients.length > 0) {
    description += activeIngredients.map(ing => 
      `${ing.name}${ing.dosage ? ` ${ing.dosage}${ing.unit}` : ''}`
    ).join(', ');
  } else {
    description += medication.genericName;
  }
  
  description += `. It is manufactured by ${medication.manufacturer} and ${medication.prescriptionRequired ? 'requires a prescription' : 'is available without a prescription'}.`;
  
  return {
    name: medication.name,
    brandName,
    genericName,
    activeIngredients,
    description,
    manufacturer: medication.manufacturer,
    price: medication.price,
    isGeneric: medication.type === 'generic',
    hasSimilarBrands: false // Will be updated later when we compare all medications
  };
}

/**
 * Load and process all medicine data from 1mg
 * @returns A dataset containing all processed medicine information
 */
export async function loadAllMedicineData(): Promise<MedicineDataset> {
  try {
    // If we already have the data in memory, return it
    if (Object.keys(medicineCache).length > 0) {
      console.log(`[1MG-PROCESSOR] Returning ${Object.keys(medicineCache).length} medications from cache`);
      return medicineCache;
    }
    
    // Path to the data directory
    const dataDir = path.join(__dirname, '../../data');
    
    // Find all JSON files with medication data
    const jsonFiles = glob.sync(`${dataDir}/medications_*.json`).concat(
                      glob.sync(`${dataDir}/test_medications_*.json`));
    
    if (jsonFiles.length === 0) {
      // Fallback to the file we found earlier
      jsonFiles.push(path.join(dataDir, 'test_medications_p.json'));
    }
    
    let totalMedications = 0;
    
    // Process each file
    for (const filePath of jsonFiles) {
      console.log(`[1MG-PROCESSOR] Processing file ${filePath}`);
      
      if (fs.existsSync(filePath)) {
        // Read and parse the JSON file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const medications: MappedMedication[] = JSON.parse(fileContent);
        
        // Process each medication
        for (const medication of medications) {
          try {
            const processed = processMedication(medication);
            
            // Add to our dataset using the name as a key
            medicineCache[medication.name.toLowerCase()] = processed;
            totalMedications++;
          } catch (error) {
            console.error(`[1MG-PROCESSOR] Error processing medication ${medication.name}:`, error);
          }
        }
      }
    }
    
    console.log(`[1MG-PROCESSOR] Loaded and processed ${totalMedications} medications from ${jsonFiles.length} files`);
    
    // If we have medications, let's find similar brands
    if (totalMedications > 0) {
      await findSimilarBrands();
    }
    
    return medicineCache;
  } catch (error) {
    console.error('[1MG-PROCESSOR] Error loading medicine data:', error);
    return {};
  }
}

/**
 * Find similar brands for each medication based on active ingredients
 */
async function findSimilarBrands(): Promise<void> {
  console.log('[1MG-PROCESSOR] Finding similar brands based on active ingredients');
  
  // Create an index of medications by active ingredient
  const ingredientIndex: { [key: string]: string[] } = {};
  
  // First pass: build the ingredient index
  for (const [name, medication] of Object.entries(medicineCache)) {
    for (const ingredient of medication.activeIngredients) {
      const key = ingredient.name.toLowerCase();
      if (!ingredientIndex[key]) {
        ingredientIndex[key] = [];
      }
      ingredientIndex[key].push(name);
    }
  }
  
  // Second pass: find similar brands
  for (const [name, medication] of Object.entries(medicineCache)) {
    const similarBrands: string[] = [];
    
    for (const ingredient of medication.activeIngredients) {
      const key = ingredient.name.toLowerCase();
      if (ingredientIndex[key]) {
        // Add all medications with this ingredient
        for (const similarName of ingredientIndex[key]) {
          if (similarName !== name && !similarBrands.includes(similarName)) {
            similarBrands.push(similarName);
          }
        }
      }
    }
    
    if (similarBrands.length > 0) {
      medication.hasSimilarBrands = true;
      medication.similarBrands = similarBrands;
    }
  }
  
  console.log('[1MG-PROCESSOR] Completed finding similar brands');
}

/**
 * Get detailed information for a specific medicine
 * @param medicineName The name of the medicine to look up
 * @returns Detailed medication information or null if not found
 */
export async function getMedicineInfo(medicineName: string): Promise<ProcessedMedication | null> {
  try {
    // Load all medicine data if not already loaded
    if (Object.keys(medicineCache).length === 0) {
      await loadAllMedicineData();
    }
    
    // Try direct lookup first
    const key = medicineName.toLowerCase();
    if (medicineCache[key]) {
      return medicineCache[key];
    }
    
    // Try fuzzy matching
    const possibleMatches: [string, number][] = [];
    for (const name of Object.keys(medicineCache)) {
      const similarity = calculateSimilarity(name, key);
      if (similarity > 0.8) {
        possibleMatches.push([name, similarity]);
      }
    }
    
    // Sort by similarity (highest first)
    possibleMatches.sort((a, b) => b[1] - a[1]);
    
    // Return the highest match if available
    if (possibleMatches.length > 0) {
      return medicineCache[possibleMatches[0][0]];
    }
    
    // No match found
    return null;
  } catch (error) {
    console.error(`[1MG-PROCESSOR] Error getting medicine info for ${medicineName}:`, error);
    return null;
  }
}

/**
 * Search for medications by salt (active ingredient)
 * @param saltName The name of the active ingredient to search for
 * @returns Array of medications containing the specified salt
 */
export async function searchMedicationsBySalt(saltName: string): Promise<ProcessedMedication[]> {
  try {
    // Load all medicine data if not already loaded
    if (Object.keys(medicineCache).length === 0) {
      await loadAllMedicineData();
    }
    
    const results: ProcessedMedication[] = [];
    const salt = saltName.toLowerCase();
    
    for (const medication of Object.values(medicineCache)) {
      for (const ingredient of medication.activeIngredients) {
        if (ingredient.name.toLowerCase().includes(salt)) {
          results.push(medication);
          break;
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`[1MG-PROCESSOR] Error searching medications by salt ${saltName}:`, error);
    return [];
  }
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param a First string
 * @param b Second string
 * @returns Similarity score (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
  if (a.length === 0) return b.length === 0 ? 1 : 0;
  if (b.length === 0) return 0;
  
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[a.length][b.length];
  const maxLength = Math.max(a.length, b.length);
  return maxLength > 0 ? 1 - distance / maxLength : 1;
}

/**
 * Use AI to enhance information about a medication when our database doesn't have complete data
 * @param medicineName The name of the medication
 * @param saltInfo Information about the active ingredients (if known)
 * @returns AI-enhanced medication information
 */
export async function enhanceMedicineInfoWithAI(
  medicineName: string,
  saltInfo: string = ''
): Promise<any> {
  try {
    const prompt = `
      Provide detailed pharmaceutical information about "${medicineName}" for the Indian market.
      ${saltInfo ? `Active ingredients: ${saltInfo}` : ''}
      
      This is a medicine available in India. Include information about:
      - Complete and accurate active ingredients with their dosages
      - Therapeutic uses and indications
      - Typical dosage regimens used in Indian medical practice
      - Common side effects categorized by frequency
      - Jan Aushadhi or other generic alternatives available in India
      - Approximate price comparison in Indian Rupees (₹)
      
      Return ONLY valid JSON with this structure:
      {
        "activeIngredients": [
          {"name": "String", "dosage": "String", "unit": "String"}
        ],
        "therapeuticUses": ["String"],
        "dosageRegimen": "String",
        "sideEffects": {
          "common": ["String"],
          "uncommon": ["String"],
          "rare": ["String"]
        },
        "genericAlternatives": ["String"],
        "priceRange": "String"
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are an expert Indian pharmaceutical database providing accurate, detailed information about medications in the Indian market. Focus on scientific accuracy while maintaining a structured, database-like response format." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      return null;
    }
    
    // Parse and return the enhanced information
    return JSON.parse(content);
  } catch (error) {
    console.error(`[1MG-PROCESSOR] Error enhancing medicine info with AI for ${medicineName}:`, error);
    return null;
  }
}

/**
 * Extract salt information as a string from a medicine
 * @param medicine The processed medication object
 * @returns A formatted string with salt and dosage information
 */
export function extractSaltInfo(medicine: ProcessedMedication): string {
  if (!medicine || !medicine.activeIngredients || medicine.activeIngredients.length === 0) {
    return '';
  }
  
  return medicine.activeIngredients.map(ing => 
    `${ing.name}${ing.dosage ? ` ${ing.dosage}${ing.unit}` : ''}`
  ).join(', ');
}