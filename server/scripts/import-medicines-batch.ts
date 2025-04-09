import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { InsertMedicine } from '@shared/schema';
import { storage } from '../storage';

// Path to the CSV file in the attached_assets directory
const CSV_FILE_PATH = path.resolve('../attached_assets/A_Z_medicines_dataset_of_India (2).csv');

// Counters for statistics
let totalProcessed = 0;
let genericCount = 0;
let brandedCount = 0;
let skippedCount = 0;

// Function to convert CSV row to medicine object
function convertRowToMedicine(row: any): InsertMedicine | null {
  try {
    // Skip discontinued medicines
    if (row.Is_discontinued && row.Is_discontinued.toLowerCase() === 'true') {
      skippedCount++;
      return null;
    }
    
    // Parse price - replace any non-numeric chars if needed
    const priceString = row['price(₹)'] || '0';
    const price = parseFloat(priceString.replace(/[^\d.-]/g, ''));
    
    // Determine if medicine is generic
    // We'll consider medicines with 'generic' in the name or 'generic' type as generic medicines
    const isGeneric = 
      (row.name && row.name.toLowerCase().includes('generic')) || 
      (row.type && row.type.toLowerCase().includes('generic'));
    
    // Update counter
    if (isGeneric) {
      genericCount++;
    } else {
      brandedCount++;
    }
    
    // Prepare compositions
    const composition1 = row.short_composition1 ? row.short_composition1.trim() : '';
    const composition2 = row.short_composition2 ? row.short_composition2.trim() : '';
    
    // Build generic name from compositions
    let genericName = composition1;
    if (composition2 && composition2.length > 0) {
      genericName += composition2.startsWith(',') ? composition2 : ', ' + composition2;
    }
    
    // Combine compositions for active ingredient
    const activeIngredient = genericName;
    
    // Create the medicine object
    const medicine: InsertMedicine = {
      name: row.name ? row.name.trim() : '',
      genericName: genericName,
      description: `${row.name} is a medication manufactured by ${row.manufacturer_name}. It is available as ${row.pack_size_label} and contains ${genericName}.`,
      manufacturer: row.manufacturer_name ? row.manufacturer_name.trim() : '',
      isGeneric: isGeneric,
      price: isNaN(price) ? 0 : price,
      dosage: row.pack_size_label ? row.pack_size_label.trim() : '',
      activeIngredient: activeIngredient,
      imageUrl: '',
      availableAt: isGeneric 
        ? ['Jan Aushadhi', 'Generic Medical Store', 'Government Hospitals']
        : ['Apollo Pharmacy', 'MedPlus', 'PharmEasy'],
      inStock: Math.random() > 0.2, // Random availability
      stockCount: Math.floor(Math.random() * 100) + 5 // Random stock count
    };
    
    totalProcessed++;
    return medicine;
  } catch (error) {
    console.error('Error processing row:', error);
    skippedCount++;
    return null;
  }
}

// Main function to import data
async function importMedicineData() {
  console.log('Starting medicine data import from CSV...');
  console.log('CSV File Path:', CSV_FILE_PATH);
  
  const startTime = new Date();
  let importedCount = 0;
  const MAX_MEDICINES = 200; // Limit to first 200 medicines
  
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error('CSV file not found at path:', CSV_FILE_PATH);
      return;
    }
    
    // Create a readable stream from the CSV file
    const results: InsertMedicine[] = [];
    
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        if (results.length < MAX_MEDICINES) {
          const medicine = convertRowToMedicine(row);
          if (medicine) {
            results.push(medicine);
          }
        }
      })
      .on('end', async () => {
        console.log(`CSV parsing complete. Found ${results.length} valid medicines.`);
        
        // Process the medicines in batches
        const BATCH_SIZE = 20;
        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          const batch = results.slice(i, i + BATCH_SIZE);
          console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(results.length / BATCH_SIZE)}`);
          
          for (const medicine of batch) {
            try {
              await storage.createMedicine(medicine);
              importedCount++;
            } catch (error) {
              console.error(`Error importing medicine ${medicine.name}:`, error);
            }
          }
        }
        
        const endTime = new Date();
        const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
        
        console.log('\nImport Summary:');
        console.log('---------------');
        console.log(`Total records processed: ${totalProcessed}`);
        console.log(`Generic medicines: ${genericCount}`);
        console.log(`Branded medicines: ${brandedCount}`);
        console.log(`Skipped records: ${skippedCount}`);
        console.log(`Successfully imported: ${importedCount}`);
        console.log(`Duration: ${durationSeconds.toFixed(2)} seconds`);
        console.log('Import process complete!');
      });
  } catch (error) {
    console.error('Error importing medicine data:', error);
  }
}

// Run the import function
importMedicineData()
  .then(() => {
    console.log('Import script completed.');
  })
  .catch((error) => {
    console.error('Import script failed:', error);
  });

export default importMedicineData;