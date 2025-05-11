/**
 * Test script for compound medicine substitutes
 * This script tests the ability of our system to find alternatives for compound medications
 */
import { getMedicineContext } from '../lib/chatbot-trainer';
import { getChatResponse } from '../openai';

// Test compound medicines
const TEST_COMPOUND_MEDICINES = [
  'Telvas Beta 50', // Contains telmisartan and metoprolol
  'Telma-AM Tablet',  // Contains telmisartan and amlodipine
  'Amaryl-M 1mg Tablet', // Contains glimepiride and metformin
  'Glycomet-GP 1 Tablet', // Contains metformin and glimepiride
  'Trivastal LA 50mg/1000mg Tablet', // Contains teriflunomide and metformin
  'Trika Plus', // Contains alprazolam and propranolol
  'Cardace H 10', // Contains ramipril and hydrochlorothiazide
  'Cilacar T', // Contains cilnidipine and telmisartan
];

async function testCompoundMedicineContext() {
  console.log('\n=== TESTING COMPOUND MEDICINE CONTEXT ===\n');
  
  for (const medicine of TEST_COMPOUND_MEDICINES) {
    console.log(`\n--- Testing: ${medicine} ---`);
    
    try {
      const context = await getMedicineContext(medicine);
      console.log(`Context found: ${context ? 'Yes' : 'No'}`);
      if (context) {
        console.log(`Brand Name: ${context.brandName}`);
        console.log(`Generic Name: ${context.genericName}`);
        console.log(`Salt Info: ${context.saltInfo}`);
        console.log(`Alternatives: ${context.alternatives?.join(', ') || 'None'}`);
      } else {
        console.log('No context found in our medicine database');
      }
    } catch (error) {
      console.error('Error getting medicine context:', error);
    }
  }
}

async function testCompoundMedicineChatbot() {
  console.log('\n=== TESTING COMPOUND MEDICINE ALTERNATIVES IN CHATBOT ===\n');
  
  for (const medicine of TEST_COMPOUND_MEDICINES) {
    console.log(`\n--- Testing Chatbot with: ${medicine} ---`);
    
    try {
      const query = `What are substitutes for ${medicine}?`;
      console.log(`Query: "${query}"`);
      
      const response = await getChatResponse(query);
      console.log(`\nChatbot Response:\n${response}`);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
    }
    
    console.log('\n' + '-'.repeat(80));
  }
}

async function main() {
  console.log('=== COMPOUND MEDICINE TEST ===');
  
  await testCompoundMedicineContext();
  await testCompoundMedicineChatbot();
  
  console.log('\n=== TEST COMPLETED ===');
}

main().catch(console.error);