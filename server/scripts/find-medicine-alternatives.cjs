const fs = require('fs');
const path = require('path');

// Path to the imported medicines file
const filePath = path.resolve(__dirname, '../../medicine_brands_imported.json');

// Function to find alternative medicines by active ingredient
function findAlternatives(targetMedicineName) {
  try {
    console.log(`Finding alternatives for medicine: ${targetMedicineName}`);
    
    // Load the medicines data
    const medicines = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${medicines.length} medicines from file`);
    
    // Find the target medicine
    const targetMedicine = medicines.find(med => 
      med.name.toLowerCase() === targetMedicineName.toLowerCase()
    );
    
    if (!targetMedicine) {
      console.log(`Medicine "${targetMedicineName}" not found`);
      
      // Try to find similar medicine names
      const similarMedicines = medicines
        .filter(med => med.name.toLowerCase().includes(targetMedicineName.toLowerCase()))
        .slice(0, 5);
      
      if (similarMedicines.length > 0) {
        console.log('\nDid you mean one of these?');
        similarMedicines.forEach(med => console.log(`- ${med.name}`));
      }
      
      return;
    }
    
    console.log(`\nFound medicine: ${targetMedicine.name}`);
    console.log(`Generic name: ${targetMedicine.genericName}`);
    console.log(`Active ingredient: ${targetMedicine.activeIngredient}`);
    console.log(`Manufacturer: ${targetMedicine.manufacturer}`);
    console.log(`Price: ₹${targetMedicine.price.toFixed(2)}`);
    
    // Extract the active ingredient to find alternatives
    const activeIngredient = targetMedicine.activeIngredient;
    
    // Find alternatives with the same active ingredient
    const alternatives = medicines.filter(med => 
      med.id !== targetMedicine.id && 
      med.activeIngredient.toLowerCase() === activeIngredient.toLowerCase()
    );
    
    if (alternatives.length === 0) {
      console.log('\nNo alternatives found with the same active ingredient');
      return;
    }
    
    // Sort alternatives by price
    alternatives.sort((a, b) => a.price - b.price);
    
    // Display alternatives
    console.log(`\nFound ${alternatives.length} alternatives:`);
    console.log('\nName | Generic Name | Manufacturer | Price | Price Difference');
    console.log('-----|--------------|--------------|-------|----------------');
    
    alternatives.slice(0, 10).forEach(alt => {
      const priceDiff = alt.price - targetMedicine.price;
      const priceDiffStr = priceDiff >= 0 
        ? `+₹${priceDiff.toFixed(2)}` 
        : `-₹${Math.abs(priceDiff).toFixed(2)}`;
        
      console.log(`${alt.name} | ${alt.genericName} | ${alt.manufacturer} | ₹${alt.price.toFixed(2)} | ${priceDiffStr}`);
    });
    
    // Summary
    const cheapestAlt = alternatives[0];
    if (cheapestAlt.price < targetMedicine.price) {
      const savings = targetMedicine.price - cheapestAlt.price;
      const savingsPercent = (savings / targetMedicine.price) * 100;
      
      console.log(`\nPotential savings: By switching to ${cheapestAlt.name}, you could save ₹${savings.toFixed(2)} (${savingsPercent.toFixed(2)}%)`);
    }
    
  } catch (error) {
    console.error('Error finding alternatives:', error);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Please provide a medicine name to find alternatives');
    console.log('Usage: node find-medicine-alternatives.cjs "Medicine Name"');
    return;
  }
  
  const medicineName = args[0];
  findAlternatives(medicineName);
}

// Run the main function
main();