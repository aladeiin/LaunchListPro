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
    const searchUrl = `${BASE_URL}/search/all?name=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to search medicines: ${response.status}`);
    }
    
    const html = response.data;
    const $ = cheerio.load(html);
    const medicines: Medicine[] = [];
    
    // Extract medicine data from search results
    // The selector below will need to be adjusted based on 1mg's actual HTML structure
    $('.style__product-box___3oEU6').each(function(i, element) {
      try {
        const name = $(element).find('.style__pro-title___3G3rr').text().trim();
        const manufacturer = $(element).find('.style__pack-size___3jScl').text().trim();
        const priceText = $(element).find('.style__price-tag___B2csA').text().trim();
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
        const imageUrl = $(element).find('img').attr('src') || '';
        const genericName = $(element).find('.style__pack-size___3jScl').text().split('|')[0]?.trim() || name;
        const description = $(element).find('.style__product-description___1vPge').text().trim();
        
        // Create a medicine object
        const medicine: Medicine = {
          id: i + 1, // Temporary ID, will be replaced in the actual implementation
          name,
          genericName,
          manufacturer,
          price,
          dosage: 'Unknown', // Placeholder, could be extracted if available
          isGeneric: genericName !== name,
          description: description || `${name} by ${manufacturer}`,
          activeIngredient: genericName,
          imageUrl,
          availableAt: ['1mg'] // Default availability
        };
        
        medicines.push(medicine);
      } catch (err) {
        console.error('Error parsing medicine data:', err);
      }
    });
    
    if (medicines.length === 0) {
      // If no medicines found with the complex selector, try a simpler approach
      $('.style__product-box___zRpfL').each(function(i, element) {
        try {
          const name = $(element).find('h2').text().trim();
          const manufacturer = $(element).find('.style__manufacturer___2IyM8').text().trim();
          const priceText = $(element).find('.style__price-tag___KzOkY').text().trim();
          const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
          const imageUrl = $(element).find('img').attr('src') || '';
          
          // Create a medicine object with more basic info
          const medicine: Medicine = {
            id: i + 1, // Temporary ID
            name,
            genericName: name, // Placeholder
            manufacturer,
            price,
            dosage: 'Unknown', // Placeholder
            isGeneric: false, // Default
            description: `${name} by ${manufacturer}`, // Basic description
            activeIngredient: name.split(' ')[0], // Naive extraction
            imageUrl,
            availableAt: ['1mg'] // Default availability
          };
          
          medicines.push(medicine);
        } catch (err) {
          console.error('Error parsing medicine data (fallback):', err);
        }
      });
    }
    
    return medicines;
  } catch (error) {
    console.error('Error searching medicines on 1mg:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to search medicines on 1mg: ${errorMessage}`);
  }
}

/**
 * Get detailed information about a specific medicine
 * @param name The name of the medicine to lookup
 * @returns Detailed medicine data or null if not found
 */
export async function getMedicineDetails(name: string): Promise<Medicine | null> {
  try {
    // First we need to search for the medicine to get its URL
    const searchResults = await searchMedicines(name);
    
    if (searchResults.length === 0) {
      return null;
    }
    
    // Find best match from search results
    let bestMatch = searchResults[0];
    let bestMatchScore = 0;
    
    for (const medicine of searchResults) {
      // Simple string similarity check (can be improved)
      const score = calculateSimilarity(medicine.name.toLowerCase(), name.toLowerCase());
      if (score > bestMatchScore) {
        bestMatch = medicine;
        bestMatchScore = score;
      }
    }
    
    // For now, return the best match directly
    // In a full implementation, we would fetch the detailed page for the medicine
    // and extract more comprehensive information
    return bestMatch;
  } catch (error) {
    console.error('Error getting medicine details:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get medicine details: ${errorMessage}`);
  }
}

/**
 * Find alternative medicines based on active ingredient
 * @param medicineName The name of the medicine to find alternatives for
 * @returns Array of alternative medicines
 */
export async function findAlternatives(medicineName: string): Promise<Medicine[]> {
  try {
    // First get the details of the requested medicine
    const medicine = await getMedicineDetails(medicineName);
    
    if (!medicine) {
      throw new Error(`Medicine not found: ${medicineName}`);
    }
    
    // Search for alternatives using the active ingredient
    const alternatives = await searchMedicines(medicine.activeIngredient);
    
    // Filter out the original medicine and sort by price
    return alternatives
      .filter(alt => alt.name.toLowerCase() !== medicine.name.toLowerCase())
      .sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error('Error finding alternatives:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to find alternatives: ${errorMessage}`);
  }
}

/**
 * Compare prices for a medicine across different pharmacies
 * Note: This is a placeholder as 1mg doesn't directly provide this comparison
 * In a real implementation, we would aggregate data from multiple sources
 */
export async function comparePrices(medicineName: string): Promise<Record<string, number>> {
  try {
    const medicine = await getMedicineDetails(medicineName);
    
    if (!medicine) {
      throw new Error(`Medicine not found: ${medicineName}`);
    }
    
    // In a real implementation, we would scrape multiple pharmacy websites
    // For now, return simulated data based on the 1mg price
    const basePrice = medicine.price;
    
    return {
      '1mg': basePrice,
      'PharmEasy': Math.round((basePrice * 0.95) * 100) / 100, // 5% less
      'Netmeds': Math.round((basePrice * 1.02) * 100) / 100,   // 2% more
      'Apollo': Math.round((basePrice * 0.97) * 100) / 100     // 3% less
    };
  } catch (error) {
    console.error('Error comparing prices:', error);
    throw new Error(`Failed to compare prices: ${error.message}`);
  }
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param a First string
 * @param b Second string
 * @returns Similarity score (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  
  const lenA = a.length;
  const lenB = b.length;
  
  if (lenA === 0 || lenB === 0) {
    return 0;
  }
  
  // Calculate Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const distance = matrix[lenA][lenB];
  const maxLen = Math.max(lenA, lenB);
  
  // Convert distance to similarity score (0-1)
  return 1 - (distance / maxLen);
}