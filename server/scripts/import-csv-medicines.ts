import path from 'path';
import { processMedicineCSV } from '../utils/csv-processor';
import { storage } from '../storage';

// CSV file path
const CSV_FILE_PATH = path.resolve('./attached_assets/A_Z_medicines_dataset_of_India (2).csv');

async function importMedicines() {
  console.log('Starting medicine import from CSV...');
  
  try {
    // Process the CSV file to get medicine data
    const medicines = await processMedicineCSV(CSV_FILE_PATH);
    console.log(`Found ${medicines.length} medicines to import`);
    
    // Batch size for processing
    const BATCH_SIZE = 100;
    let processed = 0;
    
    // Process medicines in batches
    for (let i = 0; i < medicines.length; i += BATCH_SIZE) {
      const batch = medicines.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(medicines.length / BATCH_SIZE)}`);
      
      // Create each medicine in the batch
      for (const medicine of batch) {
        try {
          await storage.createMedicine(medicine);
          processed++;
        } catch (error) {
          console.error(`Error creating medicine ${medicine.name}:`, error);
        }
      }
      
      console.log(`Processed ${processed} of ${medicines.length} medicines`);
    }
    
    console.log('Import completed successfully!');
    console.log(`Total medicines imported: ${processed}`);
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// For direct execution of the script
if (require.main === module) {
  importMedicines()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Import script failed:', error);
      process.exit(1);
    });
}

export default importMedicines;