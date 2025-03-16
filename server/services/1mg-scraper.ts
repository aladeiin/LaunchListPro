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
    console.log(`Making request to 1mg for query: ${query}`);
    const searchUrl = `${BASE_URL}/search/all?name=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000 // 15 seconds timeout
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to search medicines: ${response.status}`);
    }
    
    const html = response.data;
    const $ = cheerio.load(html);
    let medicines: Medicine[] = [];
    
    console.log(`Loaded HTML from 1mg, starting to parse...`);
    
    // Try multiple potential selectors to future-proof against website changes
    const selectors = [
      // Try the specific class-based selectors first
      '.style__product-box___3oEU6',
      '.style__product-box___zRpfL',
      // Generic product card selectors
      '[data-widget="productCard"]',
      '.product-card',
      '.product-grid-card',
      '.style__product-card',
      // More generic containers
      '.product-list div[class*="product"]',
      '.search-results div[class*="product"]',
      // Most generic approach - look for divs with images and prices
      'div:has(img):has(div[class*="price"])'
    ];
    
    // Debug HTML structure
    console.log(`HTML structure debug (section titles): `);
    $('h1, h2, h3, h4, h5').each((i, el) => {
      console.log(`  ${$(el).text().trim()}`);
    });
    
    // Try each selector
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      
      $(selector).each(function(i, element) {
        try {
          // Extract basic info with flexible selectors
          // Try multiple potential selectors for each piece of information
          const nameSelectors = [
            // Specific class-based selectors
            '.style__pro-title___3G3rr', '.style__title', 
            // Generic element + class patterns
            'h2', 'h3', 'h4', '.product-title', '[class*="title"]',
            // Direct child text nodes if nothing else works
            '*'
          ];
          
          let name = '';
          for (const sel of nameSelectors) {
            const text = $(element).find(sel).first().text().trim();
            if (text) {
              name = text;
              break;
            }
          }
          
          // If still no name, try the element itself
          if (!name) {
            name = $(element).text().trim().split('\n')[0] || 'Unknown Medicine';
          }
          
          // Extract price with similar approach
          const priceSelectors = [
            '.style__price-tag___B2csA', '.style__price-tag___KzOkY',
            '[class*="price"]', '[class*="mrp"]', '.product-price',
            'span:contains("₹")', 'div:contains("₹")'
          ];
          
          let priceText = '';
          for (const sel of priceSelectors) {
            const text = $(element).find(sel).first().text().trim();
            if (text && text.includes('₹')) {
              priceText = text;
              break;
            }
          }
          
          let price = 0;
          if (priceText) {
            // Extract digits and decimal points only
            const priceMatch = priceText.match(/₹\s*(\d+(?:\.\d+)?)/);
            price = priceMatch ? parseFloat(priceMatch[1]) : 0;
          }
          
          // Get image URL
          const imgUrl = $(element).find('img').attr('src') || 
                         $(element).find('img').attr('data-src') || 
                         $(element).find('[class*="image"]').attr('src') || '';
          
          // Extract manufacturer
          const manufacturerSelectors = [
            '.style__pack-size___3jScl', '.style__manufacturer___2IyM8',
            '[class*="manufacturer"]', '[class*="company"]', '.product-company',
            'span:contains("By")' // Often "By Company Name"
          ];
          
          let manufacturer = '';
          for (const sel of manufacturerSelectors) {
            const text = $(element).find(sel).first().text().trim();
            if (text) {
              // Often contains "By Company" or similar
              manufacturer = text.replace(/^By\s+/i, '');
              break;
            }
          }
          
          if (!manufacturer) {
            manufacturer = 'Unknown Manufacturer';
          }
          
          // Try to extract generic name
          const genericNameSelectors = [
            '[class*="salt"]', '[class*="generic"]', '.salt-name',
            'div:contains("Salt:")', 'div:contains("Generic Name:")'
          ];
          
          let genericName = '';
          for (const sel of genericNameSelectors) {
            const text = $(element).find(sel).first().text().trim();
            if (text) {
              // Clean up text that might contain labels
              genericName = text.replace(/^(Salt:|Generic Name:)\s*/i, '');
              break;
            }
          }
          
          // If no generic name found, use the first part of the product name
          if (!genericName) {
            genericName = name.split(' ')[0];
          }
          
          // Determine if it's a generic medicine
          const isGeneric = name.toLowerCase().includes('generic') || 
                           manufacturer.toLowerCase().includes('generic') ||
                           genericName.toLowerCase() === name.toLowerCase();
          
          // Create a medicine object
          const medicine: Medicine = {
            id: i + 1, // Temporary ID, will be replaced in the actual implementation
            name,
            genericName,
            manufacturer,
            price,
            dosage: 'Standard dosage', // Placeholder
            isGeneric,
            description: `${name} by ${manufacturer}`, // Basic description
            activeIngredient: genericName,
            imageUrl: imgUrl,
            availableAt: ['1mg'] // Default availability
          };
          
          medicines.push(medicine);
          console.log(`Found medicine: ${name} (${price})`);
        } catch (err) {
          console.error('Error parsing medicine data:', err);
        }
      });
      
      // If we found any medicines with this selector, we can stop trying others
      if (medicines.length > 0) {
        console.log(`Successfully found ${medicines.length} medicines using selector: ${selector}`);
        break;
      }
    }
    
    if (medicines.length === 0) {
      console.log(`No medicines found with any selectors. Falling back to local storage.`);
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
    console.log(`Getting details for medicine: ${name}`);
    // First try to search for the medicine
    const searchResults = await searchMedicines(name);
    
    if (searchResults.length === 0) {
      console.log(`No search results found for: ${name}`);
      return null;
    }
    
    // Find best match from search results
    let bestMatch = searchResults[0];
    let bestMatchScore = 0;
    
    for (const medicine of searchResults) {
      // String similarity check
      const score = calculateSimilarity(medicine.name.toLowerCase(), name.toLowerCase());
      console.log(`Similarity score for ${medicine.name}: ${score}`);
      
      if (score > bestMatchScore) {
        bestMatch = medicine;
        bestMatchScore = score;
      }
    }
    
    // Try to get additional details from the product page if possible
    // This would typically involve:
    // 1. Constructing a URL for the product page based on the product name
    // 2. Fetching that page and extracting detailed info
    
    try {
      // Convert medicine name to URL-friendly format
      const urlName = name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      // Common URL patterns for medicine pages
      const possibleUrls = [
        `${BASE_URL}/drugs/${urlName}`,
        `${BASE_URL}/otc/${urlName}`,
        `${BASE_URL}/product/${urlName}`
      ];
      
      // Try each URL pattern
      for (const url of possibleUrls) {
        try {
          console.log(`Attempting to fetch details from: ${url}`);
          
          const response = await axios.get(url, {
            headers: {
              'User-Agent': USER_AGENT,
              'Accept': 'text/html,application/xhtml+xml,application/xml',
              'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
          });
          
          if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            
            // Try to extract detailed information
            const description = $('[class*="description"], [class*="DescriptionListing"], .DrugOverview__description')
              .text().trim() || bestMatch.description;
            
            const dosage = $('[class*="dosage"], span:contains("Dosage"), div:contains("Dosage")')
              .text().trim().replace(/^Dosage:?\s*/i, '') || bestMatch.dosage;
            
            // Try to extract additional information like side effects, interactions, etc.
            
            // Update the best match with the additional information
            bestMatch = {
              ...bestMatch,
              description: description || bestMatch.description,
              dosage: dosage || bestMatch.dosage
            };
            
            console.log(`Successfully enhanced medicine details from product page`);
            break; // Exit the URL loop if successful
          }
        } catch (urlError) {
          console.log(`Error fetching from ${url}: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
          // Continue to the next URL
        }
      }
    } catch (enhancementError) {
      console.log(`Could not enhance medicine details, using search result data only`);
      // Continue with the best match from search results
    }
    
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
    console.log(`Finding alternatives for medicine: ${medicineName}`);
    
    // First get the details of the requested medicine
    const medicine = await getMedicineDetails(medicineName);
    
    if (!medicine) {
      console.log(`Could not find medicine: ${medicineName}`);
      throw new Error(`Medicine not found: ${medicineName}`);
    }
    
    console.log(`Found original medicine: ${medicine.name} with active ingredient: ${medicine.activeIngredient}`);
    
    // Try alternative approaches to find substitutes
    
    // 1. Search using the active ingredient
    console.log(`Searching for alternatives with active ingredient: ${medicine.activeIngredient}`);
    let alternatives = await searchMedicines(medicine.activeIngredient);
    
    // 2. If few results, try a more generic search by the first part of the active ingredient
    if (alternatives.length < 2) {
      const genericIngredient = medicine.activeIngredient.split(' ')[0];
      console.log(`Few alternatives found. Trying more generic search with: ${genericIngredient}`);
      
      if (genericIngredient !== medicine.activeIngredient) {
        const genericAlternatives = await searchMedicines(genericIngredient);
        
        // Merge unique results
        for (const alt of genericAlternatives) {
          if (!alternatives.find(a => a.name === alt.name)) {
            alternatives.push(alt);
          }
        }
      }
    }
    
    // 3. Try searching for "generic" + the medicine name
    if (alternatives.length < 3 && !medicine.isGeneric) {
      console.log(`Searching for generic versions of: ${medicine.name}`);
      const genericKeyword = `generic ${medicine.name}`;
      const genericResults = await searchMedicines(genericKeyword);
      
      // Merge unique results
      for (const alt of genericResults) {
        if (!alternatives.find(a => a.name === alt.name)) {
          alternatives.push(alt);
        }
      }
    }
    
    // Filter out the original medicine and sort by price
    alternatives = alternatives
      .filter(alt => alt.name.toLowerCase() !== medicine.name.toLowerCase())
      .sort((a, b) => a.price - b.price);
    
    console.log(`Found ${alternatives.length} alternatives for ${medicine.name}`);
    
    // Calculate similarity scores to help identify truly related medicines
    alternatives = alternatives.map(alt => {
      // Check similarity with both name and ingredient
      const nameSimilarity = calculateSimilarity(alt.name.toLowerCase(), medicine.name.toLowerCase());
      const ingredientSimilarity = calculateSimilarity(alt.activeIngredient.toLowerCase(), medicine.activeIngredient.toLowerCase());
      
      // Use the better of the two scores
      alt.similarityScore = Math.max(nameSimilarity, ingredientSimilarity);
      return alt;
    });
    
    // If we have many alternatives, prefer those with higher similarity
    if (alternatives.length > 5) {
      alternatives = alternatives
        .filter(alt => alt.similarityScore > 0.3) // Keep only somewhat related medicines
        .sort((a, b) => a.price - b.price);       // Still sort by price
    }
    
    return alternatives;
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to compare prices: ${errorMessage}`);
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