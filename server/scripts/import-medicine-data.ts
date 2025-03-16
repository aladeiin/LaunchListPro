import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import { storage } from '../storage';
import { InsertMedicine } from '@shared/schema';

// Path to the CSV file
const CSV_FILE_PATH = path.resolve(__dirname, '../../attached_assets/A_Z_medicines_dataset_of_India (2).csv');

// Counter for tracking progress
let counter = 0;
const BATCH_SIZE = 100;
let batch: InsertMedicine[] = [];
let totalImported = 0;
let totalSkipped = 0;
let startTime: Date;

/**
 * Process a row from the CSV file and convert it to an InsertMedicine object
 */
function processRow(row: any): InsertMedicine | null {
  // Skip discontinued medicines
  if (row['Is_discontinued']?.trim().toUpperCase() === 'TRUE') {
    totalSkipped++;
    return null;
  }

  // Extract active ingredients from short_composition fields
  let activeIngredients = '';
  if (row['short_composition1']) {
    activeIngredients += row['short_composition1'].trim();
  }
  if (row['short_composition2'] && row['short_composition2'].trim() !== '') {
    activeIngredients += ', ' + row['short_composition2'].trim();
  }

  // Extract the generic name from the active ingredients
  // For simplicity, we'll use the first ingredient part before the dosage (mg, mcg, etc.)
  const genericNameMatch = activeIngredients.match(/^([^(]+)/);
  const genericName = genericNameMatch ? genericNameMatch[1].trim() : row['name'];

  // Clean up price string and convert to number
  const priceStr = row['price(₹)']?.toString().trim() || '0';
  const price = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;

  return {
    name: row['name']?.trim() || 'Unknown',
    genericName: genericName,
    description: `${row['name']} contains ${activeIngredients}. It is used for various medical conditions as prescribed by a doctor.`,
    manufacturer: row['manufacturer_name']?.trim() || 'Unknown',
    isGeneric: (row['type']?.toLowerCase() === 'generic') || false,
    price: price,
    dosage: row['pack_size_label']?.trim() || '',
    activeIngredient: activeIngredients,
    imageUrl: '',
    availableAt: []
  };
}

/**
 * Process a batch of medicines
 */
async function processBatch(batch: InsertMedicine[]): Promise<void> {
  for (const medicine of batch) {
    try {
      // Check if medicine already exists to avoid duplicates
      const existingMedicine = await storage.getMedicineByName(medicine.name);
      if (!existingMedicine) {
        await storage.createMedicine(medicine);
        totalImported++;
      } else {
        console.log(`Skipping duplicate medicine: ${medicine.name}`);
        totalSkipped++;
      }
    } catch (error) {
      console.error(`Error importing medicine ${medicine.name}:`, error);
      totalSkipped++;
    }
  }
}

/**
 * Main import function
 */
async function importMedicineData() {
  startTime = new Date();
  console.log(`Starting import from ${CSV_FILE_PATH}`);
  console.log(`This may take a while, please be patient...`);
  
  // This is a good place to use a stream to handle the large CSV file
  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csvParser())
    .on('data', async (row) => {
      counter++;
      
      // Log progress periodically
      if (counter % 1000 === 0) {
        const elapsed = (new Date().getTime() - startTime.getTime()) / 1000;
        console.log(`Processed ${counter} rows in ${elapsed.toFixed(1)} seconds (${(counter/elapsed).toFixed(1)} rows/sec)`);
      }
      
      const medicine = processRow(row);
      if (medicine) {
        batch.push(medicine);
        
        // Process in batches to improve performance
        if (batch.length >= BATCH_SIZE) {
          const currentBatch = [...batch];
          batch = [];
          await processBatch(currentBatch);
        }
      }
    })
    .on('end', async () => {
      // Process any remaining items in the last batch
      if (batch.length > 0) {
        await processBatch(batch);
      }
      
      const elapsed = (new Date().getTime() - startTime.getTime()) / 1000;
      console.log(`\nImport completed in ${elapsed.toFixed(1)} seconds`);
      console.log(`Total rows processed: ${counter}`);
      console.log(`Total medicines imported: ${totalImported}`);
      console.log(`Total rows skipped: ${totalSkipped}`);
      process.exit(0);
    })
    .on('error', (error) => {
      console.error('Error during import:', error);
      process.exit(1);
    });
}

// Start the import process
importMedicineData().catch(error => {
  console.error('Fatal error during import:', error);
  process.exit(1);
});