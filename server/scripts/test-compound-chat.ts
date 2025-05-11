/**
 * Test script for compound medication alternatives in the chatbot
 * 
 * This script demonstrates how to integrate compound medication detection
 * and alternatives lookup into the chatbot response flow
 */
import { getCompoundMedicationAlternatives } from '../openai';

// Test compound medications with sample user queries
const TEST_CASES = [
  {
    query: "What are alternatives for Telma-AM?",
    medicineName: "Telma-AM",
    ingredients: ["Telmisartan 40mg", "Amlodipine 5mg"]
  },
  {
    query: "Are there cheaper options than Glycomet-GP 2?",
    medicineName: "Glycomet-GP 2",
    ingredients: ["Metformin 500mg", "Glimepiride 2mg"]
  },
  {
    query: "Can I substitute Cardace-H with something else?",
    medicineName: "Cardace-H",
    ingredients: ["Ramipril 5mg", "Hydrochlorothiazide 12.5mg"]
  }
];

// Format the ingredients for display
function formatIngredients(ingredients: string[]): string {
  return ingredients.map(ing => `- ${ing}`).join('\n');
}

// Generate a formatted alternatives response
function formatAlternativesResponse(medicineName: string, alternatives: string[]): string {
  if (alternatives.length === 0) {
    return `**${medicineName}** is a combination medication, but I couldn't find specific alternatives with identical ingredients. Please consult your healthcare provider for appropriate substitutions.`;
  }
  
  return `**${medicineName}** is a combination medication containing multiple active ingredients. Below are some alternative brands that contain the same combination of ingredients:

${alternatives.map((alt, i) => `${i+1}. **${alt}**`).join('\n')}

These alternatives contain the same active ingredients in similar dosages. Please consult your healthcare provider before switching medications.`;
}

async function processMedicationRequest(query: string, medicineName: string, ingredients: string[]): Promise<string> {
  console.log(`\n=== Processing query: "${query}" ===`);
  console.log(`Detected compound medication: ${medicineName}`);
  console.log(`Ingredients:\n${formatIngredients(ingredients)}`);
  
  // Get alternatives
  const alternatives = await getCompoundMedicationAlternatives(medicineName, ingredients);
  console.log(`Found ${alternatives.length} alternatives`);
  
  // Format and return the response
  return formatAlternativesResponse(medicineName, alternatives);
}

async function main() {
  console.log('=== TESTING COMPOUND MEDICINE ALTERNATIVES IN CHATBOT ===\n');
  
  for (const testCase of TEST_CASES) {
    try {
      const response = await processMedicationRequest(
        testCase.query,
        testCase.medicineName, 
        testCase.ingredients
      );
      
      console.log('\nGenerated response:');
      console.log('-'.repeat(50));
      console.log(response);
      console.log('-'.repeat(50));
    } catch (error) {
      console.error('Error processing request:', error);
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  console.log('\nTests complete');
}

main().catch(console.error);