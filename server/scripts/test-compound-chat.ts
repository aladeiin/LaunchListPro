/**
 * Test script for compound medication alternatives in the chatbot
 * 
 * This script demonstrates how to integrate compound medication detection
 * and alternatives lookup into the chatbot response flow
 */

import { isCompoundMedicine, getCompoundIngredients, getCompoundAlternativesResponse } from '../lib/compound-medication-handler';
import { detectMedicationQueryType } from '../lib/medication-api-integration';

/**
 * Format a list of ingredients for display
 */
function formatIngredients(ingredients: string[]): string {
  if (ingredients.length === 0) return 'No ingredients identified';
  return ingredients.map(ing => `- ${ing}`).join('\n');
}

/**
 * Format alternatives response in a user-friendly way
 */
function formatAlternativesResponse(medicineName: string, alternatives: string[]): string {
  if (alternatives.length === 0) {
    return `I couldn't find specific alternatives with identical ingredients for ${medicineName}. Please consult your healthcare provider for appropriate substitutions.`;
  }
  
  return `${medicineName} is a combination medication. Here are some alternative brands that contain the same combination of ingredients:
    
${alternatives.map((alt, i) => `${i+1}. ${alt}`).join('\n')}
    
These alternatives contain the same active ingredients in similar dosages. Always consult your healthcare provider before switching medications.`;
}

/**
 * Process a medication request that might involve a compound medicine
 */
async function processMedicationRequest(query: string, medicineName: string, ingredients: string[]): Promise<string> {
  console.log(`Processing request for: ${medicineName}`);
  console.log(`Ingredients: ${ingredients.join(', ')}`);
  
  if (ingredients.length === 0) {
    console.log('No ingredients identified, cannot process as compound medication');
    return `Sorry, I couldn't identify the components of ${medicineName}. Please try another medication or consult your healthcare provider.`;
  }
  
  try {
    // Format response for compound medication alternatives
    const response = await getCompoundAlternativesResponse(medicineName, ingredients);
    return response;
  } catch (error) {
    console.error(`Error getting alternatives for ${medicineName}:`, error);
    return `I encountered an error while searching for alternatives to ${medicineName}. Please try again later or consult your healthcare provider.`;
  }
}

/**
 * Main function to simulate chatbot conversation flow
 */
async function main() {
  // Sample user queries
  const queries = [
    'What are alternatives for Telma-AM?',
    'Can you suggest alternatives for Glycomet-GP2?',
    'What medications are similar to Cardace-H?',
    'Are there any other options instead of Amlovas-AT?',
    'What is a substitute for Telmikind-AM?',
    'I need an alternative to Telsar-H',
    'What can I use instead of Telpres-CT?'
  ];
  
  console.log('=== COMPOUND MEDICATION CHATBOT SIMULATION ===\n');
  
  for (const query of queries) {
    console.log(`USER: ${query}`);
    
    // Step 1: Detect medication and query type
    const medicationQuery = await detectMedicationQueryType(query);
    
    if (medicationQuery.queryType === 'unknown' || !medicationQuery.medicineName) {
      console.log('CHATBOT: I couldn\'t identify a specific medication in your question. Could you please mention the exact name of the medication you\'re asking about?\n');
      continue;
    }
    
    console.log(`Detected medication: ${medicationQuery.medicineName}`);
    console.log(`Query type: ${medicationQuery.queryType}`);
    
    // Step 2: Check if compound medicine and request is for alternatives
    if (medicationQuery.queryType === 'alternatives' && isCompoundMedicine(medicationQuery.medicineName)) {
      // Step 3: Get ingredients for the compound medication
      const ingredients = getCompoundIngredients(medicationQuery.medicineName);
      
      // Step 4: Process as compound medication
      const response = await processMedicationRequest(query, medicationQuery.medicineName, ingredients);
      console.log(`CHATBOT: ${response}\n`);
    } else {
      console.log('CHATBOT: This would be processed by the regular medication API flow.\n');
    }
    
    console.log('-'.repeat(80));
  }
}

// Run the simulation
main().catch(error => console.error('Error in simulation:', error));