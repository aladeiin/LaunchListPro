const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

// Define a simplified mock storage for the script
class MockStorage {
  constructor() {
    this.medicines = [];
    this.currentId = 1;
  }

  async getMedicineByName(name) {
    return this.medicines.find(med => med.name === name);
  }

  async updateMedicineByName(name, updates) {
    const index = this.medicines.findIndex(med => med.name === name);
    if (index >= 0) {
      this.medicines[index] = { ...this.medicines[index], ...updates };
      return this.medicines[index];
    }
    return undefined;
  }

  async createMedicine(medicine) {
    const newMedicine = {
      id: this.currentId++,
      ...medicine
    };
    this.medicines.push(newMedicine);
    return newMedicine;
  }

  // Export the medicines data
  async exportToJson(outputPath) {
    try {
      fs.writeFileSync(
        outputPath, 
        JSON.stringify(this.medicines, null, 2),
        'utf8'
      );
      console.log(`Medicines data exported to ${outputPath}`);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }
}

const storage = new MockStorage();

async function importDrugBrands() {
  try {
    console.log(`Starting import of drug-brand relationships from: ${filePath}`);
    console.log('This process may take some time depending on file size...');
    
    // Read with sheet options to limit memory usage
    const options = {
      sheetStubs: true,
      cellDates: true,
      sheetRows: 2000 // Limit to 2000 rows for testing
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
            price: Math.floor(Math.random() * 500) + 50, // Random price between 50-550 INR
            dosage: extractDosageFromGenericName(relationship.genericName) || 'Standard dosage',
            activeIngredient: extractActiveIngredientFromGenericName(relationship.genericName),
            imageUrl: '',
            availableAt: ["Thakur Pharmacy", "Apollo Pharmacy", "MedPlus"],
            inStock: true,
            stockCount: Math.floor(Math.random() * 30) + 5 // Random stock between 5-35
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
    
    // Export the medicine data to a JSON file
    const outputPath = path.resolve(__dirname, '../../drug_brands_imported.json');
    await storage.exportToJson(outputPath);
    
    // Import is complete
    console.log('\nImport Summary:');
    console.log(`Total relationships processed: ${stats.processed}`);
    console.log(`New medicines added: ${stats.added}`);
    console.log(`Errors encountered: ${stats.errors}`);
    console.log(`Data exported to: ${outputPath}`);
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