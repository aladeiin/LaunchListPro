import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { storage } from '../storage';
import { InsertMedicine } from '@shared/schema';

// Get the current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let startTime: Date;
let totalRows = 0;
let processedRows = 0;
let successfulImports = 0;
let failedImports = 0;
let batchSize = 100;
let currentBatch: InsertMedicine[] = [];

/**
 * Process a row from the CSV file and convert it to an InsertMedicine object
 */
function processRow(row: Record<string, string>): InsertMedicine | null {
  try {
    // Process based on the CSV structure in A_Z_medicines_dataset_of_India (2).csv
    // id,name,price(₹),Is_discontinued,manufacturer_name,type,pack_size_label,short_composition1,short_composition2
    
    // Skip discontinued medicines
    if (row.Is_discontinued && row.Is_discontinued.toLowerCase() === 'true') {
      return null;
    }
    
    // Parse price - remove the ₹ symbol if present
    const priceString = row['price(₹)'] || row.price || '0';
    const price = parseFloat(priceString.replace('₹', '').trim());
    
    // Generate a random stock status and count
    const inStock = Math.random() > 0.2; // 80% chance of being in stock
    const stockCount = inStock ? Math.floor(Math.random() * 100) + 1 : 0;
    
    // Get the active ingredients from composition fields
    const activeIngredient = [row.short_composition1, row.short_composition2]
      .filter(Boolean)
      .join(', ');
    
    // Determine if it's generic based on the type field
    const isGeneric = (row.type || '').toLowerCase() === 'generic' || 
                      (row.type || '').toLowerCase() === 'ayurvedic';
    
    const medicine: InsertMedicine = {
      name: row.name || '',
      genericName: row.short_composition1 || row.name || '',
      manufacturer: row.manufacturer_name || '',
      price: price,
      isGeneric: isGeneric,
      dosage: row.pack_size_label || '',
      description: `${row.name} is a ${row.type || 'medication'} manufactured by ${row.manufacturer_name || 'a pharmaceutical company'}. It contains ${activeIngredient || 'active ingredients'}.`,
      activeIngredient: activeIngredient,
      imageUrl: '',
      availableAt: ['Apollo Pharmacy', 'MedPlus', 'PharmEasy'],
      inStock: inStock,
      stockCount: stockCount
    };

    // Validate required fields
    if (!medicine.name) {
      console.error('Row missing required field: name');
      return null;
    }

    // Default values for missing fields
    if (!medicine.genericName) {
      medicine.genericName = medicine.name.split(' ')[0];
    }

    if (!medicine.manufacturer) {
      medicine.manufacturer = 'Unknown Manufacturer';
    }

    if (isNaN(medicine.price) || medicine.price <= 0) {
      medicine.price = Math.floor(Math.random() * 1000) + 50; // Random price between 50 and 1050 INR
    }

    if (!medicine.description) {
      medicine.description = `${medicine.name} is a medication containing ${medicine.activeIngredient || 'active ingredients'}.`;
    }

    if (!medicine.dosage) {
      medicine.dosage = 'As directed by physician';
    }

    if (!medicine.activeIngredient) {
      medicine.activeIngredient = medicine.genericName;
    }

    return medicine;
  } catch (error) {
    console.error(`Error processing row: ${JSON.stringify(row)}`, error);
    return null;
  }
}

/**
 * Process a batch of medicines
 */
async function processBatch(batch: InsertMedicine[]): Promise<void> {
  const promises = batch.map(async (medicine) => {
    try {
      // Check if the medicine already exists by name
      const existingMedicine = await storage.getMedicineByName(medicine.name);
      
      if (existingMedicine) {
        // Update existing medicine with new data
        await storage.updateMedicineByName(medicine.name, medicine);
        console.log(`Updated medicine: ${medicine.name}`);
      } else {
        // Create new medicine
        await storage.createMedicine(medicine);
        console.log(`Imported medicine: ${medicine.name}`);
      }
      
      successfulImports++;
    } catch (error) {
      console.error(`Failed to import medicine: ${medicine.name}`, error);
      failedImports++;
    }
  });

  await Promise.all(promises);
}

/**
 * Main import function
 */
async function importMedicineData() {
  startTime = new Date();
  console.log(`Starting import at ${startTime.toISOString()}`);
  console.log('---------------------------------------------------');

  // Path to the CSV file
  const csvFilePath = path.resolve(path.join(__dirname, '../../attached_assets/A_Z_medicines_dataset_of_India (2).csv'));
  
  // Check if the file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found at path: ${csvFilePath}`);
    return;
  }

  console.log(`Reading from CSV file: ${csvFilePath}`);

  // Create a read stream for the CSV file
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(csv());

  // Process each row
  for await (const row of parser) {
    totalRows++;
    
    const medicine = processRow(row);
    if (medicine) {
      currentBatch.push(medicine);
      processedRows++;
      
      // Process in batches for better performance
      if (currentBatch.length >= batchSize) {
        await processBatch([...currentBatch]);
        currentBatch = [];
        
        // Log progress every 1000 rows
        if (processedRows % 1000 === 0) {
          const elapsed = (new Date().getTime() - startTime.getTime()) / 1000;
          console.log(`Processed ${processedRows} rows in ${elapsed.toFixed(2)} seconds`);
        }
      }
    }
  }

  // Process any remaining medicines in the last batch
  if (currentBatch.length > 0) {
    await processBatch([...currentBatch]);
  }

  const endTime = new Date();
  const elapsed = (endTime.getTime() - startTime.getTime()) / 1000;
  
  console.log('---------------------------------------------------');
  console.log(`Import completed at ${endTime.toISOString()}`);
  console.log(`Total rows in CSV: ${totalRows}`);
  console.log(`Processed rows: ${processedRows}`);
  console.log(`Successfully imported: ${successfulImports}`);
  console.log(`Failed imports: ${failedImports}`);
  console.log(`Total time: ${elapsed.toFixed(2)} seconds`);
}

// Run the import
importMedicineData().catch((error) => {
  console.error('Import failed with error:', error);
  process.exit(1);
});