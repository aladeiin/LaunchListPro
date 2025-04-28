/**
 * Test script for chatbot with 1mg medicine data integration
 * This script tests the enhanced chatbot with medicine information from 1mg data
 */

import { getChatResponse } from '../openai';

// Test queries about medicines in our dataset
const TEST_QUERIES = [
  'What is PegGRAfeel 6mg Injection used for?',
  'Tell me about Paclitax 300mg',
  'What are the side effects of Pazoci 400?',
  'Is there a generic alternative to Plamumab 40mg?',
  'What is the dosage of Pamorelin LA 11.25mg?',
  'What is Pertuzumab used for?'
];

async function main() {
  console.log('=== CHATBOT MEDICINE INTEGRATION TEST ===\n');

  for (const query of TEST_QUERIES) {
    console.log(`📝 Query: "${query}"`);
    
    try {
      console.log('⏳ Getting response...');
      const response = await getChatResponse(query);
      console.log('📢 Response:');
      console.log(response);
    } catch (error) {
      console.error('❌ Error getting response:', error);
    }
    
    console.log('\n' + '-'.repeat(80) + '\n');
  }
  
  console.log('=== TEST COMPLETED ===');
}

main().catch(console.error);