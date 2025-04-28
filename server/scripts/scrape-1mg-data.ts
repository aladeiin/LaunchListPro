import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MedicationSku {
  is_discontinued: boolean;
  manufacturer_name: string;
  marketer_name: string;
  type: string;
  price: number;
  name: string;
  id: number;
  sku_id: number;
  available: boolean;
  pack_size_label: string;
  rx_required: {
    header: string;
    icon_url: string;
  };
  slug: string;
  short_composition: string;
  image_url: string;
  in_stock: boolean | null;
  quantity: number;
}

interface ApiResponse {
  data: {
    skus: MedicationSku[];
  };
  meta: {
    count: number;
    total_count: number;
  };
  is_success: boolean;
  status_code: number;
}

// Function to map 1mg medication data to our application's format
function mapToAppFormat(medication: MedicationSku) {
  // Extract generic name from short_composition
  const genericName = medication.short_composition?.split('(')[0]?.trim() || '';
  
  // Extract dosage/strength from short_composition if available
  const dosageMatch = medication.short_composition?.match(/\(([^)]+)\)/);
  const dosage = dosageMatch ? dosageMatch[1] : '';
  
  return {
    name: medication.name,
    genericName,
    manufacturer: medication.manufacturer_name,
    marketer: medication.marketer_name,
    price: medication.price / 100, // Convert from paise to rupees
    type: medication.type,
    dosage,
    activeIngredient: genericName,
    composition: medication.short_composition,
    packSize: medication.pack_size_label,
    prescriptionRequired: !!medication.rx_required,
    inStock: medication.available,
    id: medication.id,
    imageUrl: medication.image_url,
    slug: medication.slug
  };
}

// Function to scrape medication data for a specific prefix
async function scrapeMedicationsByPrefix(prefix: string, maxPages: number = 3): Promise<any[]> {
  console.log(`Scraping medications with prefix: ${prefix}`);
  const allMedications: any[] = [];
  const perPage = 30;
  
  try {
    for (let page = 1; page <= maxPages; page++) {
      console.log(`  Fetching page ${page} for prefix ${prefix}...`);
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const url = `https://www.1mg.com/pharmacy_api_gateway/v4/drug_skus/by_prefix?prefix_term=${prefix}&page=${page}&per_page=${perPage}`;
      
      const response = await axios.get<ApiResponse>(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.1mg.com/'
        }
      });
      
      if (response.data.is_success && response.data.data.skus) {
        const medications = response.data.data.skus.map(mapToAppFormat);
        allMedications.push(...medications);
        console.log(`  Added ${medications.length} medications from page ${page}`);
        
        // If we got fewer items than requested, we've reached the end
        if (response.data.data.skus.length < perPage) {
          console.log(`  Reached end of data for prefix ${prefix} at page ${page}`);
          break;
        }
      } else {
        console.log(`  No data or error for prefix ${prefix} at page ${page}`);
        break;
      }
    }
    
    return allMedications;
  } catch (error) {
    console.error(`Error scraping medications with prefix ${prefix}:`, error);
    return allMedications; // Return what we've collected so far
  }
}

// Main function to scrape medications for all alphabets
async function scrapeAllMedications() {
  const alphabets = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const outputDir = path.join(__dirname, '../../data');
  
  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let totalMedications = 0;
  const allMedications: any[] = [];
  
  for (const alphabet of alphabets) {
    const medications = await scrapeMedicationsByPrefix(alphabet);
    totalMedications += medications.length;
    allMedications.push(...medications);
    
    // Save data for each alphabet separately
    const filePath = path.join(outputDir, `medications_${alphabet}.json`);
    fs.writeFileSync(filePath, JSON.stringify(medications, null, 2));
    console.log(`Saved ${medications.length} medications with prefix ${alphabet} to ${filePath}`);
    
    // Add a delay between different alphabets to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Save all medications to a single file
  const allMedicationsPath = path.join(outputDir, 'all_medications.json');
  fs.writeFileSync(allMedicationsPath, JSON.stringify(allMedications, null, 2));
  
  console.log(`Total medications scraped: ${totalMedications}`);
  console.log(`All data saved to ${allMedicationsPath}`);
}

// Create a function to test with a single alphabet
async function testScrapeWithSingleAlphabet(alphabet: string = 'a') {
  const outputDir = path.join(__dirname, '../../data');
  
  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Testing scraping with alphabet: ${alphabet}`);
  const medications = await scrapeMedicationsByPrefix(alphabet, 1); // Just get first page
  
  // Save test data
  const filePath = path.join(outputDir, `test_medications_${alphabet}.json`);
  fs.writeFileSync(filePath, JSON.stringify(medications, null, 2));
  console.log(`Saved ${medications.length} medications with prefix ${alphabet} to ${filePath}`);
}

// Determine which function to run based on command line arguments
const args = process.argv.slice(2);
if (args.includes('--test')) {
  const testAlphabet = args.find(arg => arg.startsWith('--letter='))?.split('=')[1] || 'a';
  testScrapeWithSingleAlphabet(testAlphabet);
} else {
  scrapeAllMedications();
}