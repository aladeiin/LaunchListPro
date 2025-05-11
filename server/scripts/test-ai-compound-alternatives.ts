/**
 * Test script for AI compound medicine alternatives
 * This script tests the OpenAI-powered compound medicine alternative finder
 */
import { getCompoundMedicationAlternatives } from '../openai';

// Test compounds
const TEST_CASES = [
  { 
    name: 'Telma-AM', 
    ingredients: ['Telmisartan 40mg', 'Amlodipine 5mg'] 
  },
  { 
    name: 'Telvas Beta 50', 
    ingredients: ['Telmisartan 40mg', 'Metoprolol 50mg'] 
  },
  { 
    name: 'Cardace-H', 
    ingredients: ['Ramipril 5mg', 'Hydrochlorothiazide 12.5mg'] 
  },
  { 
    name: 'Glycomet-GP', 
    ingredients: ['Metformin 500mg', 'Glimepiride 2mg'] 
  }
];

async function main() {
  console.log('=== TESTING AI COMPOUND MEDICINE ALTERNATIVES ===\n');
  
  for (const testCase of TEST_CASES) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    console.log(`Ingredients: ${testCase.ingredients.join(', ')}`);
    
    try {
      const alternatives = await getCompoundMedicationAlternatives(
        testCase.name, 
        testCase.ingredients
      );
      
      console.log(`\nFound ${alternatives.length} alternatives:`);
      
      if (alternatives.length > 0) {
        alternatives.forEach((alt, index) => {
          console.log(`${index + 1}. ${alt}`);
        });
      } else {
        console.log('No alternatives found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    
    console.log('\n' + '-'.repeat(80));
  }
  
  console.log('\n=== TEST COMPLETED ===');
}

main().catch(console.error);