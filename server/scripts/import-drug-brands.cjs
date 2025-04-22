const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Import the storage
const storage = require('../storage').storage;

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

async function importDrugBrands() {
  try {
    console.log(`Starting import of drug-brand relationships from: ${filePath}`);
    console.log('This process may take some time depending on file size...');
    
    // Read with sheet options to limit memory usage
    const options = {
      sheetStubs: true,
      cellDates: true
    };
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath, options);
    
    // Target Sheet4 which contains drug-brand relationships
    const sheetName = 'Sheet4';
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      console.error(`Sheet '${sheetName}' not found in the workbook`);
      return;
    }
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${jsonData.length} rows in the Excel sheet`);
    
    // Extract drug-brand relationships
    const relationships = [];
    const genericNames = new Set();
    const brandNames = new Set();
    
    jsonData.forEach(row => {
      const genericName = row.Column8;
      const brandName = row.Column1;
      
      if (genericName && brandName) {
        relationships.push({
          genericName,
          brandName
        });
        
        genericNames.add(genericName);
        brandNames.add(brandName);
      }
    });
    
    console.log(`Extracted ${relationships.length} valid drug-brand relationships`);
    console.log(`Found ${genericNames.size} unique generic names`);
    console.log(`Found ${brandNames.size} unique brand names`);
    
    // Process the data
    const stats = {
      total: relationships.length,
      processed: 0,
      added: 0,
      errors: 0
    };
    
    // Create/update medicines based on the relationships
    for (const relationship of relationships) {
      try {
        stats.processed++;
        
        // First check if brand already exists
        const existingBrand = await storage.getMedicineByName(relationship.brandName);
        
        if (existingBrand) {
          // Update with generic name if needed
          if (existingBrand.genericName !== relationship.genericName) {
            await storage.updateMedicineByName(relationship.brandName, {
              genericName: relationship.genericName
            });
            console.log(`Updated existing medicine: ${relationship.brandName} with generic: ${relationship.genericName}`);
          }
        } else {
          // Create new medicine entry
          const newMedicine = {
            name: relationship.brandName,
            genericName: relationship.genericName,
            description: `${relationship.brandName} (${relationship.genericName})`,
            manufacturer: 'Various', // Default, can be updated later
            isGeneric: false,
            price: 0, // Default price, can be updated later
            dosage: extractDosageFromGenericName(relationship.genericName) || 'Standard dosage',
            activeIngredient: extractActiveIngredientFromGenericName(relationship.genericName),
            imageUrl: '',
            availableAt: [],
            inStock: true,
            stockCount: 10 // Default stock
          };
          
          await storage.createMedicine(newMedicine);
          stats.added++;
          
          // Log progress periodically
          if (stats.processed % 100 === 0 || stats.processed === stats.total) {
            console.log(`Progress: ${stats.processed}/${stats.total} (${Math.round((stats.processed/stats.total)*100)}%)`);
          }
        }
      } catch (error) {
        console.error(`Error processing relationship: ${relationship.genericName} - ${relationship.brandName}`, error);
        stats.errors++;
      }
    }
    
    // Import is complete
    console.log('\nImport Summary:');
    console.log(`Total relationships processed: ${stats.processed}`);
    console.log(`New medicines added: ${stats.added}`);
    console.log(`Errors encountered: ${stats.errors}`);
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Error importing drug-brand relationships:', error);
  }
}

// Helper function to extract dosage from generic name
function extractDosageFromGenericName(genericName) {
  // Try to extract dosage information (e.g., "Abacavir (300mg)" -> "300mg")
  const dosageMatch = genericName.match(/\(([0-9]+[a-zA-Z]+)\)/);
  return dosageMatch ? dosageMatch[1] : null;
}

// Helper function to extract active ingredient from generic name
function extractActiveIngredientFromGenericName(genericName) {
  // Remove dosage information (e.g., "Abacavir (300mg)" -> "Abacavir")
  return genericName.replace(/\s*\([^)]*\)\s*/, '').trim();
}

// Run the import
importDrugBrands().catch(console.error);