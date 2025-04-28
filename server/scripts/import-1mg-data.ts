import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from '../storage';
import { InsertMedicine } from '@shared/schema';

// ESM module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function importMedicationsFromFile(filePath: string): Promise<number> {
  try {
    console.log(`Importing medications from ${filePath}...`);
    
    // Read the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const medications: MappedMedication[] = JSON.parse(fileContent);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    // Process each medication
    for (const medication of medications) {
      try {
        // Check if medication already exists
        const existingMedicine = await storage.getMedicineByName(medication.name);
        
        if (existingMedicine) {
          // Update the existing medicine
          await storage.updateMedicineByName(medication.name, {
            genericName: medication.genericName,
            price: medication.price,
            manufacturer: medication.manufacturer,
            dosage: medication.dosage,
            activeIngredient: medication.activeIngredient,
            inStock: medication.inStock
          });
          console.log(`Updated existing medicine: ${medication.name}`);
          importedCount++;
        } else {
          // Create a new medicine entry
          const insertMedicine: InsertMedicine = {
            name: medication.name,
            genericName: medication.genericName,
            description: medication.composition || `${medication.name} contains ${medication.genericName}`,
            manufacturer: medication.manufacturer,
            isGeneric: medication.type === 'generic',
            price: medication.price,
            dosage: medication.dosage,
            activeIngredient: medication.activeIngredient,
            inStock: medication.inStock
          };
          
          await storage.createMedicine(insertMedicine);
          console.log(`Imported new medicine: ${medication.name}`);
          importedCount++;
        }
      } catch (error) {
        console.error(`Error importing medication ${medication.name}:`, error);
        skippedCount++;
      }
    }
    
    console.log(`Import completed: ${importedCount} imported, ${skippedCount} skipped`);
    return importedCount;
  } catch (error) {
    console.error('Error importing medications:', error);
    return 0;
  }
}

async function importAllMedications() {
  const dataDir = path.join(__dirname, '../../data');
  const allMedicationsPath = path.join(dataDir, 'all_medications.json');
  
  if (fs.existsSync(allMedicationsPath)) {
    const importedCount = await importMedicationsFromFile(allMedicationsPath);
    console.log(`Total medications imported: ${importedCount}`);
  } else {
    console.log('No data found. Please run scrape-1mg-data.ts first.');
  }
}

// Import data for a specific alphabet
async function importMedicationsForAlphabet(alphabet: string) {
  const dataDir = path.join(__dirname, '../../data');
  const filePath = path.join(dataDir, `medications_${alphabet}.json`);
  
  if (fs.existsSync(filePath)) {
    const importedCount = await importMedicationsFromFile(filePath);
    console.log(`Medications imported for alphabet ${alphabet}: ${importedCount}`);
  } else {
    console.log(`No data found for alphabet ${alphabet}. Please run scrape-1mg-data.ts first.`);
  }
}

// Import test data
async function importTestData() {
  const dataDir = path.join(__dirname, '../../data');
  const files = fs.readdirSync(dataDir).filter(file => file.startsWith('test_medications_'));
  
  if (files.length > 0) {
    const testFile = files[0];
    const importedCount = await importMedicationsFromFile(path.join(dataDir, testFile));
    console.log(`Test data imported: ${importedCount}`);
  } else {
    console.log('No test data found. Please run scrape-1mg-data.ts with --test flag first.');
  }
}

// Determine which function to run based on command line arguments
const args = process.argv.slice(2);
if (args.includes('--test')) {
  importTestData();
} else if (args.find(arg => arg.startsWith('--letter='))) {
  const alphabet = args.find(arg => arg.startsWith('--letter='))?.split('=')[1];
  if (alphabet) {
    importMedicationsForAlphabet(alphabet);
  }
} else {
  importAllMedications();
}