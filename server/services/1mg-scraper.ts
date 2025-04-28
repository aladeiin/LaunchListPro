import axios from 'axios';
import * as cheerio from 'cheerio';
import { Medicine } from '@shared/schema';

/**
 * Interface for the medicine data structure from 1mg
 */
interface OneMilligramMedicine {
  name: string;
  genericName: string;
  manufacturer: string;
  price: number;
  dosage: string;
  isGeneric: boolean;
  description: string;
  imageUrl: string;
  activeIngredient: string;
  availableAt: string[];
}

/**
 * User agent to mimic a browser request
 */
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

/**
 * Base URL for 1mg website
 */
const BASE_URL = 'https://www.1mg.com';

/**
 * Search for medicines on 1mg based on a query string
 * @param query The search query for medicines
 * @returns An array of medicine objects
 */
export async function searchMedicines(query: string): Promise<Medicine[]> {
  try {
    console.log(`Searching for medicines matching: ${query}`);

    // In a real implementation, we would scrape the 1mg search results
    // For now, we'll return sample data or search in our local database
    
    // Simulate API call
    console.log(`Simulating API call to ${BASE_URL}/search/all?name=${encodeURIComponent(query)}`);
    
    // For demonstration, we'll just return empty data
    // In a real implementation, we would:
    // 1. Make an HTTP request to the search endpoint
    // 2. Parse the HTML response to extract medicine information
    // 3. Convert the data to our Medicine type
    // 4. Return the results
    
    return [];
  } catch (error) {
    console.error('Error searching for medicines:', error);
    return [];
  }
}

/**
 * Get detailed information about a specific medicine
 * @param name The name of the medicine to lookup
 * @returns Detailed medicine data or null if not found
 */
export async function getMedicineDetails(name: string): Promise<Medicine | null> {
  try {
    console.log(`Getting details for medicine: ${name}`);
    
    // Import here to avoid circular dependencies
    const { getMedicationDetailFrom1mg } = await import('./1mg-integration');
    
    // Try to get data from 1mg
    const medicationInfo = await getMedicationDetailFrom1mg(name);
    
    if (!medicationInfo) {
      console.log(`No details found for medicine: ${name} in external source`);
      return null;
    }
    
    // Convert the 1mg data format to our Medicine type
    const medicine: Medicine = {
      id: Date.now(), // Generate a temporary ID
      name: medicationInfo.name,
      genericName: medicationInfo.genericName || name,
      manufacturer: medicationInfo.manufacturer || 'Unknown',
      price: medicationInfo.price || 0,
      isGeneric: medicationInfo.isGeneric || false,
      description: medicationInfo.description || `${name} is a medication.`,
      dosage: medicationInfo.dosage || 'As directed by physician',
      activeIngredient: medicationInfo.activeIngredient || '',
      imageUrl: medicationInfo.imageUrl || '',
      availableAt: ['Online Pharmacy'],
      inStock: medicationInfo.inStock || false,
      stockCount: medicationInfo.stockCount || 0
    };
    
    return medicine;
  } catch (error) {
    console.error(`Error getting details for medicine ${name}:`, error);
    return null;
  }
}

/**
 * Find alternative medicines based on active ingredient
 * @param medicineName The name of the medicine to find alternatives for
 * @returns Array of alternative medicines
 */
export async function findAlternatives(medicineName: string): Promise<Medicine[]> {
  try {
    console.log(`Finding alternatives for medicine: ${medicineName}`);
    
    // Import here to avoid circular dependencies
    const { findAlternativesFrom1mg } = await import('./1mg-integration');
    
    // Try to get alternatives from 1mg
    const alternatives = await findAlternativesFrom1mg(medicineName);
    
    if (!alternatives || alternatives.length === 0) {
      console.log(`No alternatives found for medicine: ${medicineName} in external source`);
      return [];
    }
    
    // Convert the 1mg data format to our Medicine type
    return alternatives.map(alt => ({
      id: Date.now() + Math.floor(Math.random() * 1000), // Generate a temporary ID
      name: alt.name,
      genericName: alt.genericName || alt.name,
      manufacturer: alt.manufacturer || 'Unknown',
      price: alt.price || 0,
      isGeneric: alt.isGeneric || false,
      description: alt.description || `${alt.name} is a medication.`,
      dosage: alt.dosage || 'As directed by physician',
      activeIngredient: alt.activeIngredient || '',
      imageUrl: alt.imageUrl || '',
      availableAt: ['Online Pharmacy'],
      inStock: alt.inStock || false,
      stockCount: alt.stockCount || 0
    }));
  } catch (error) {
    console.error(`Error finding alternatives for medicine ${medicineName}:`, error);
    return [];
  }
}

/**
 * Compare prices for a medicine across different pharmacies
 * Note: This is a placeholder as 1mg doesn't directly provide this comparison
 * In a real implementation, we would aggregate data from multiple sources
 */
export async function comparePrices(medicineName: string): Promise<Record<string, number>> {
  try {
    console.log(`Comparing prices for medicine: ${medicineName}`);
    
    // In a real implementation, we would:
    // 1. Search for the medicine on multiple pharmacy websites
    // 2. Extract the prices from each
    // 3. Return a mapping of pharmacy name to price
    
    // For demonstration, we'll return an empty object
    return {};
  } catch (error) {
    console.error(`Error comparing prices for medicine ${medicineName}:`, error);
    return {};
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