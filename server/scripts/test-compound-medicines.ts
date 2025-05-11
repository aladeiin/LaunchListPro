/**
 * Test script for compound medication detection
 * 
 * This script tests the detection of compound medications
 * using our pattern matching system
 */

import { isCompoundMedicine, getCompoundIngredients } from '../lib/compound-medication-handler';

// List of medicines to test (mix of compound and non-compound)
const medicineNames = [
  // Known compound medicines
  'Telma-AM',
  'Telma-H',
  'Glycomet-GP',
  'Glycomet-GP1',
  'Glycomet-GP2',
  'Cardace-H',
  'Cardace-AM',
  'Amlovas-AT',
  'Telma AM',  // Space instead of hyphen
  'Telma H',
  'Cardace H',
  'Telmikind AM',
  'Telpres-CT',
  'Tazloc Plus',
  
  // Non-compound medicines
  'Telma',
  'Glycomet',
  'Cardace',
  'Amlovas',
  'Telmikind',
  'Telpres',
  'Metformin',
  'Amlodipine',
  'Glimepiride',
  'Atorvastatin'
];

function testCompoundDetection() {
  console.log('=== COMPOUND MEDICATION DETECTION TEST ===');
  
  let correctDetections = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  for (const medicine of medicineNames) {
    const isCompound = isCompoundMedicine(medicine);
    // Check if the name contains common compound indicators
    const shouldBeCompound = /-|Plus|\sH|\sAM|\sAT|\sCT|\sM\b|\sGP/.test(medicine);
    
    console.log(`${medicine}: ${isCompound ? '✓ COMPOUND' : '✗ REGULAR'}`);
    
    if (isCompound && shouldBeCompound) {
      correctDetections++;
      
      // If it's a compound, test ingredient extraction
      const ingredients = getCompoundIngredients(medicine);
      if (ingredients.length > 0) {
        console.log(`  Ingredients: ${ingredients.join(', ')}`);
      } else {
        console.log('  ⚠️ No ingredients identified');
      }
    } else if (isCompound && !shouldBeCompound) {
      falsePositives++;
      console.log('  ⚠️ Possible false positive');
    } else if (!isCompound && shouldBeCompound) {
      falseNegatives++;
      console.log('  ⚠️ Possible false negative');
    } else {
      correctDetections++;
    }
  }
  
  const total = medicineNames.length;
  console.log('\n=== SUMMARY ===');
  console.log(`Total medicines tested: ${total}`);
  console.log(`Correct detections: ${correctDetections} (${(correctDetections/total*100).toFixed(1)}%)`);
  console.log(`False positives: ${falsePositives} (${(falsePositives/total*100).toFixed(1)}%)`);
  console.log(`False negatives: ${falseNegatives} (${(falseNegatives/total*100).toFixed(1)}%)`);
}

// Run the test
testCompoundDetection();