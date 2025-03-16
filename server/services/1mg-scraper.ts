import axios from 'axios';
import * as cheerio from 'cheerio';
import { Medicine } from '../../shared/schema';

// Base URL for 1mg
const BASE_URL = 'https://www.1mg.com';

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
 * Search for medicines on 1mg based on a query string
 * @param query The search query for medicines
 * @returns An array of medicine objects
 */
export async function searchMedicines(query: string): Promise<Medicine[]> {
  try {
    const searchUrl = `${BASE_URL}/search/all?name=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(response.data);
    const medicines: Medicine[] = [];
    let id = 1;

    // Parse the search results
    $('.style__product-box___3oEU6').each((i, element) => {
      try {
        const name = $(element).find('.style__pro-title___3zxNC').text().trim();
        const manufacturer = $(element).find('.style__pack-size___3jScl').text().trim();
        const priceText = $(element).find('.style__price-tag___KzOkY').text().trim();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        
        // Get the detail page link to fetch more info
        const detailLink = $(element).find('a').attr('href');
        let imageUrl = $(element).find('img').attr('src') || '';
        
        // If image URL is relative, make it absolute
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${BASE_URL}${imageUrl}`;
        }

        // Create a medicine object with the available information
        medicines.push({
          id: id++,
          name,
          genericName: '', // Will be populated with detailed fetch
          manufacturer,
          isGeneric: name.toLowerCase().includes('generic'),
          price,
          dosage: '', // Will be populated with detailed fetch
          activeIngredient: '', // Will be populated with detailed fetch
          description: '', // Will be populated with detailed fetch
          imageUrl,
          availableAt: ['1mg'] // Default to 1mg
        });
      } catch (err) {
        console.error('Error parsing medicine item:', err);
      }
    });

    // Return first 10 results to avoid rate limiting
    return medicines.slice(0, 10);

  } catch (error) {
    console.error('Error searching 1mg medicines:', error);
    throw new Error('Failed to search medicines on 1mg');
  }
}

/**
 * Get detailed information about a specific medicine
 * @param name The name of the medicine to lookup
 * @returns Detailed medicine data or null if not found
 */
export async function getMedicineDetails(name: string): Promise<Medicine | null> {
  try {
    // Search for the medicine first
    const searchResults = await searchMedicines(name);
    
    // If no results, return null
    if (searchResults.length === 0) {
      return null;
    }

    // Find the exact match or the closest match
    const exactMatch = searchResults.find(
      med => med.name.toLowerCase() === name.toLowerCase()
    );
    
    // Use exact match if found, otherwise use the first result
    const medicine = exactMatch || searchResults[0];
    
    // Try to fetch detailed information if possible
    try {
      const detailUrl = `${BASE_URL}/search/all?name=${encodeURIComponent(medicine.name)}`;
      const response = await axios.get(detailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Try to extract additional information
      const description = $('.DrugOverview__content___22ZBX').text().trim() || 
                         'Information not available';
      
      const dosage = $('.DrugHeader__dose-form___1SbUx').text().trim() || 
                    $('.PillItemPriceInfo__form___H6kiE').text().trim() || 
                    'Information not available';
      
      const genericNameElement = $('div:contains("Salt Composition")').next();
      const genericName = genericNameElement.length ? 
                         genericNameElement.text().trim() : 
                         medicine.name.replace(/\s*\([^)]*\)/g, ''); // Remove anything in parentheses
      
      // Update the medicine object with detailed information
      medicine.description = description;
      medicine.dosage = dosage;
      medicine.genericName = genericName;
      medicine.activeIngredient = genericName;
      
      // Return the enriched medicine object
      return medicine;
    } catch (detailError) {
      console.warn('Error fetching detailed info, returning basic info:', detailError);
      return medicine; // Return basic info if detailed fetch fails
    }
  } catch (error) {
    console.error('Error getting medicine details:', error);
    throw new Error('Failed to get medicine details from 1mg');
  }
}

/**
 * Find alternative medicines based on active ingredient
 * @param medicineName The name of the medicine to find alternatives for
 * @returns Array of alternative medicines
 */
export async function findAlternatives(medicineName: string): Promise<Medicine[]> {
  try {
    // Get the details of the requested medicine
    const medicine = await getMedicineDetails(medicineName);
    
    if (!medicine || !medicine.activeIngredient) {
      throw new Error('Medicine not found or active ingredient information not available');
    }
    
    // Search for alternatives based on the active ingredient
    const alternatives = await searchMedicines(medicine.activeIngredient);
    
    // Filter out the original medicine from alternatives
    return alternatives.filter(alt => 
      alt.name.toLowerCase() !== medicine.name.toLowerCase()
    );
  } catch (error) {
    console.error('Error finding alternatives:', error);
    throw new Error('Failed to find medicine alternatives');
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
      throw new Error('Medicine not found');
    }
    
    // This is a simulated response - in a real app we would scrape multiple sites
    return {
      '1mg': medicine.price,
      'PharmEasy': Math.round(medicine.price * 0.95 * 100) / 100, // Simulated 5% lower
      'Netmeds': Math.round(medicine.price * 1.02 * 100) / 100, // Simulated 2% higher
      'Apollo': Math.round(medicine.price * 0.98 * 100) / 100, // Simulated 2% lower
    };
  } catch (error) {
    console.error('Error comparing prices:', error);
    throw new Error('Failed to compare medicine prices');
  }
}