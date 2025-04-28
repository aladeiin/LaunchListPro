/**
 * Test script for the 1mg Medicine Processor
 * This script tests the functionality of the 1mg medicine processor service
 * to extract salt (active ingredient) and dosage information from 1mg data.
 */

import { getMedicineInfo, loadAllMedicineData, searchMedicationsBySalt } from '../services/1mg-medicine-processor';

// Test medicines to look up (using actual medicines from our dataset)
const TEST_MEDICINES = [
  'PegGRAfeel 6mg Injection',
  'Plamumab 40mg Injection (0.8ml Each)',
  'Pamorelin LA 11.25mg Powder for Injection',
  'Paclitax Nab 100mg Injection',
  'Paclitax 260mg Injection',
  'Pazoci 400 Tablet',
  'Paclitax 300mg Injection',
  'Pamorelin LA 3.75mg Powder for Injection'
];

// Test salt names to search for (using actual active ingredients from our dataset)
const TEST_SALTS = [
  'Pegfilgrastim',
  'Adalimumab',
  'Paclitaxel',
  'Palbociclib',
  'Pazopanib',
  'Pertuzumab'
];

async function main() {
  try {
    console.log('=== 1MG MEDICINE PROCESSOR TEST ===');
    
    // 1. Load all medicine data
    console.log('\n--- Loading Medicine Data ---');
    const allMedicines = await loadAllMedicineData();
    console.log(`Loaded ${Object.keys(allMedicines).length} medicines`);
    
    // 2. Test getting medicine info for specific medicines
    console.log('\n--- Testing Medicine Lookup ---');
    for (const medicineName of TEST_MEDICINES) {
      console.log(`\nLooking up: ${medicineName}`);
      const medicine = await getMedicineInfo(medicineName);
      
      if (medicine) {
        console.log(`✓ Found: ${medicine.name}`);
        console.log(`  Brand: ${medicine.brandName}`);
        console.log(`  Generic: ${medicine.genericName}`);
        console.log(`  Manufacturer: ${medicine.manufacturer}`);
        console.log(`  Price: ₹${medicine.price}`);
        console.log(`  Is Generic: ${medicine.isGeneric ? 'Yes' : 'No'}`);
        
        // Show active ingredients
        if (medicine.activeIngredients.length > 0) {
          console.log(`  Active Ingredients:`);
          medicine.activeIngredients.forEach(ing => {
            console.log(`    - ${ing.name} ${ing.dosage}${ing.unit}`);
          });
        }
        
        // Show similar brands
        if (medicine.similarBrands && medicine.similarBrands.length > 0) {
          console.log(`  Similar Brands: ${medicine.similarBrands.slice(0, 3).join(', ')}${medicine.similarBrands.length > 3 ? ` and ${medicine.similarBrands.length - 3} more` : ''}`);
        }
      } else {
        console.log(`✗ Not found: ${medicineName}`);
      }
    }
    
    // 3. Test searching by salt
    console.log('\n--- Testing Salt Search ---');
    for (const saltName of TEST_SALTS) {
      console.log(`\nSearching for salt: ${saltName}`);
      const medicines = await searchMedicationsBySalt(saltName);
      
      if (medicines.length > 0) {
        console.log(`✓ Found ${medicines.length} medicines containing ${saltName}`);
        console.log(`  Examples: ${medicines.slice(0, 3).map(m => m.name).join(', ')}${medicines.length > 3 ? ` and ${medicines.length - 3} more` : ''}`);
      } else {
        console.log(`✗ No medicines found containing ${saltName}`);
      }
    }
    
    console.log('\n=== TEST COMPLETED ===');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
main();