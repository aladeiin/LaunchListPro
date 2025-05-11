/**
 * Test script for AI-based compound medication alternatives
 * 
 * This script tests the AI-powered generation of compound medication alternatives
 * by passing compound medications to the OpenAI API
 */

import { getCompoundMedicationAlternatives } from '../openai';
import { getCompoundIngredients } from '../lib/compound-medication-handler';

// Sample compound medications to test
const compoundMedicines = [
  {
    name: 'Telma-AM',
    ingredients: ['Telmisartan 40mg', 'Amlodipine 5mg']
  },
  {
    name: 'Glycomet-GP',
    ingredients: ['Metformin 500mg', 'Glimepiride 2mg']
  },
  {
    name: 'Cardace-H',
    ingredients: ['Ramipril 5mg', 'Hydrochlorothiazide 12.5mg']
  },
  {
    name: 'Amlovas-AT',
    ingredients: ['Amlodipine 5mg', 'Atorvastatin 10mg']
  },
  {
    name: 'Ecosprin-Gold',
    ingredients: ['Aspirin 75mg', 'Clopidogrel 75mg']
  }
];

async function testAIAlternatives() {
  console.log('=== AI COMPOUND MEDICATION ALTERNATIVES TEST ===');
  
  for (const medicine of compoundMedicines) {
    console.log(`\nTesting: ${medicine.name}`);
    console.log(`Ingredients: ${medicine.ingredients.join(', ')}`);
    
    try {
      console.log('Requesting AI alternatives...');
      const alternatives = await getCompoundMedicationAlternatives(
        medicine.name,
        medicine.ingredients
      );
      
      console.log(`Found ${alternatives.length} alternatives:`);
      if (alternatives.length > 0) {
        alternatives.forEach((alt, i) => {
          console.log(`${i+1}. ${alt}`);
        });
      } else {
        console.log('No alternatives found');
      }
    } catch (error) {
      console.error(`Error getting alternatives for ${medicine.name}:`, error);
    }
  }
}

async function testDetectionAndAIAlternatives() {
  console.log('\n=== DETECTION + AI ALTERNATIVES TEST ===');
  
  // Custom test set with just names
  const medicineNames = [
    'Telmikind-AM',
    'Tazloc-H',
    'Diabetrol-G2',
    'Stamlo-Beta',
    'Cilacar-CT'
  ];
  
  for (const name of medicineNames) {
    console.log(`\nTesting: ${name}`);
    
    // Get ingredients through our detection system
    const ingredients = getCompoundIngredients(name);
    
    if (ingredients.length === 0) {
      console.log('⚠️ No ingredients detected, skipping test');
      continue;
    }
    
    console.log(`Detected ingredients: ${ingredients.join(', ')}`);
    
    try {
      console.log('Requesting AI alternatives...');
      const alternatives = await getCompoundMedicationAlternatives(name, ingredients);
      
      console.log(`Found ${alternatives.length} alternatives:`);
      if (alternatives.length > 0) {
        alternatives.forEach((alt, i) => {
          console.log(`${i+1}. ${alt}`);
        });
      } else {
        console.log('No alternatives found');
      }
    } catch (error) {
      console.error(`Error getting alternatives for ${name}:`, error);
    }
  }
}

// Run the first test
testAIAlternatives()
  .then(() => testDetectionAndAIAlternatives())
  .catch(err => console.error('Test error:', err));