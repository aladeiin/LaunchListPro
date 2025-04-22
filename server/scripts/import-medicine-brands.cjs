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

async function importMedicineBrands() {
  try {
    console.log(`Starting import of medicine brands from: ${filePath}`);
    console.log('This process may take some time depending on file size...');
    
    // Read with limited options to improve performance
    const options = {
      sheetRows: 5000, // Limit rows for quicker processing
      sheets: ['A_Z_medicines_dataset_of_India '], // Only load the medicines dataset sheet
      cellDates: false,
      cellNF: false,
      cellFormula: false
    };
    
    console.log('Reading Excel file (limited data)...');
    const workbook = XLSX.readFile(filePath, options);
    console.log('Excel file loaded successfully');
    
    // Get the sheet
    const datasetSheet = 'A_Z_medicines_dataset_of_India ';
    const worksheet = workbook.Sheets[datasetSheet];
    
    if (!worksheet) {
      console.error(`Sheet ${datasetSheet} not found in workbook`);
      return;
    }
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`Loaded ${data.length} rows from the sheet`);
    
    // Based on our analysis, the correct column indices are:
    // Column1 (index 1): Brand name (e.g., "Augmentin 625 Duo Tablet")
    // Column8 (index 8): Generic name (e.g., "Amoxycillin (500mg)")
    const brandNameIndex = 1;
    const genericNameIndex = 8;
    
    console.log(`Using brand name column index: ${brandNameIndex}`);
    console.log(`Using generic name column index: ${genericNameIndex}`);
    
    // Skip the first row (header row)
    const dataRows = data.slice(2); // Start from index 2 (third row) which has the actual data
    
    // Extract brand-generic relationships
    const relationships = [];
    const stats = {
      processed: 0,
      imported: 0,
      errors: 0
    };
    
    for (const row of dataRows) {
      try {
        stats.processed++;
        
        if (!row || row.length <= genericNameIndex) {
          continue; // Skip rows that don't have enough columns
        }
        
        const brandName = row[brandNameIndex];
        const genericName = row[genericNameIndex];
        
        if (!brandName || !genericName) {
          continue; // Skip rows with missing data
        }
        
        // Create a medicine object
        const medicine = {
          name: String(brandName),
          genericName: String(genericName),
          description: `${brandName} (${genericName})`,
          manufacturer: row[4] || 'Various', // Column4 has the manufacturer
          isGeneric: false,
          price: parseFloat(row[2]) || 0, // Column2 has the price
          dosage: extractDosageFromGenericName(genericName) || 'Standard dosage',
          activeIngredient: extractActiveIngredientFromGenericName(genericName),
          imageUrl: '',
          availableAt: ["Thakur Pharmacy", "Apollo Pharmacy", "MedPlus"],
          inStock: true,
          stockCount: Math.floor(Math.random() * 30) + 5 // Random stock between 5-35
        };
        
        await storage.createMedicine(medicine);
        relationships.push({ brandName, genericName });
        stats.imported++;
        
        // Log progress periodically
        if (stats.processed % 100 === 0) {
          console.log(`Processed ${stats.processed} rows, imported ${stats.imported} medicines`);
        }
      } catch (error) {
        console.error(`Error processing row ${stats.processed}:`, error);
        stats.errors++;
      }
    }
    
    // Export the data
    const outputPath = path.resolve(__dirname, '../../medicine_brands_imported.json');
    await storage.exportToJson(outputPath);
    
    // Import is complete
    console.log('\nImport Summary:');
    console.log(`Total rows processed: ${stats.processed}`);
    console.log(`Medicines imported: ${stats.imported}`);
    console.log(`Errors encountered: ${stats.errors}`);
    console.log(`Data exported to: ${outputPath}`);
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Error importing medicine brands:', error);
  }
}

// Helper function to extract dosage from generic name
function extractDosageFromGenericName(genericName) {
  // Try to extract dosage information (e.g., "Abacavir (300mg)" -> "300mg")
  const dosageMatch = String(genericName).match(/\(([0-9]+[a-zA-Z]+)\)/);
  return dosageMatch ? dosageMatch[1] : null;
}

// Helper function to extract active ingredient from generic name
function extractActiveIngredientFromGenericName(genericName) {
  // Remove dosage information (e.g., "Abacavir (300mg)" -> "Abacavir")
  return String(genericName).replace(/\s*\([^)]*\)\s*/, '').trim();
}

// Run the import
importMedicineBrands().catch(console.error);