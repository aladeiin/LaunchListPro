const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

// Helper function for error handling
function safeRead(workbook, options = {}) {
  try {
    // Get all sheet names
    const allSheets = workbook.SheetNames;
    console.log(`Available sheets: ${allSheets.join(', ')}`);
    
    // Process each sheet
    for (const sheetName of allSheets) {
      try {
        console.log(`\nAttempting to process sheet: ${sheetName}`);
        
        // Read just the first few rows to understand structure
        const sampleOptions = {
          ...options,
          sheetRows: 10, // Just get 10 rows for sampling
          sheetStubs: true
        };
        
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet || !worksheet['!ref']) {
          console.log(`  Sheet ${sheetName} is empty or has no defined range`);
          continue;
        }
        
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const rowCount = range.e.r - range.s.r + 1;
        const colCount = range.e.c - range.s.c + 1;
        
        console.log(`  Sheet contains ${rowCount} rows and ${colCount} columns`);
        
        // Get a sample to identify column structure
        const sample = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: XLSX.utils.encode_range(
            { r: range.s.r, c: range.s.c },
            { r: Math.min(range.s.r + 2, range.e.r), c: range.e.c }
          )
        });
        
        if (sample.length > 0) {
          console.log(`  First row data: ${JSON.stringify(sample[0])}`);
          
          if (sample.length > 1) {
            console.log(`  Second row data: ${JSON.stringify(sample[1])}`);
          }
          
          // Try to identify brand and generic columns based on content
          let possibleData = analyzeSampleData(sample, sheetName);
          if (possibleData.hasDrugBrandData) {
            return {
              sheetName,
              brandNameIndex: possibleData.brandNameIndex,
              genericNameIndex: possibleData.genericNameIndex,
              rowCount
            };
          }
        }
      } catch (err) {
        console.error(`  Error processing sheet ${sheetName}:`, err.message);
      }
    }
    
    // If no suitable sheet was found, return null
    return null;
  } catch (err) {
    console.error('Error reading workbook:', err.message);
    return null;
  }
}

// Try to identify which columns might contain brand and generic names
function analyzeSampleData(sample, sheetName) {
  let result = {
    hasDrugBrandData: false,
    brandNameIndex: -1,
    genericNameIndex: -1
  };
  
  // No data
  if (!sample || sample.length === 0) return result;
  
  // Special case for Sheet3
  if (sheetName === 'Sheet3') {
    // Column 0 typically contains brand names
    result.brandNameIndex = 0;
    
    // Column 7 typically contains generic names
    result.genericNameIndex = 7;
    
    // Check if these columns actually exist and have data
    if (sample[0] && sample[0].length > 7) {
      result.hasDrugBrandData = true;
    }
    return result;
  }
  
  // For other sheets, try to identify columns by headers or content
  const headerRow = sample[0];
  
  // If we have headers, try to identify by column names
  if (headerRow) {
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i] || '').toLowerCase();
      
      if (header.includes('brand') || header.includes('product') || header.includes('medicine name')) {
        result.brandNameIndex = i;
      }
      
      if (header.includes('generic') || header.includes('ingredient') || header.includes('molecule')) {
        result.genericNameIndex = i;
      }
    }
  }
  
  // If headers didn't work, try to analyze content patterns
  if (result.brandNameIndex === -1 || result.genericNameIndex === -1) {
    // Look at the first data row
    if (sample.length > 1) {
      const dataRow = sample[1];
      
      for (let i = 0; i < dataRow.length; i++) {
        const value = String(dataRow[i] || '');
        
        // Brand names often end with "Tablet", "Capsule", etc.
        if (value.match(/\b(tablet|capsule|injection|syrup|gel|cream|ointment)\b/i)) {
          result.brandNameIndex = i;
        }
        
        // Generic names often have dosage in parentheses
        if (value.match(/\(\d+\s*(mg|ml|mcg|g)\)/i)) {
          result.genericNameIndex = i;
        }
      }
    }
  }
  
  // If still not found, use reasonable defaults based on typical Excel structure
  if (result.brandNameIndex === -1) result.brandNameIndex = 0; // First column
  if (result.genericNameIndex === -1) result.genericNameIndex = 1; // Second column
  
  // Consider the data valid if both columns are identified
  result.hasDrugBrandData = (result.brandNameIndex !== -1 && result.genericNameIndex !== -1);
  
  return result;
}

// Main function to import the drug brands
async function importDrugBrands() {
  try {
    console.log(`Starting import of drug-brand relationships from: ${filePath}`);
    console.log('This process may take some time depending on file size...');
    
    // Read options for the Excel file
    const options = {
      cellDates: true,
      cellNF: false,
      cellFormula: false
    };
    
    // Read the Excel file
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile(filePath, options);
    console.log('Excel file loaded successfully');
    
    // Identify which sheet contains our data
    const sheetInfo = safeRead(workbook, options);
    
    if (!sheetInfo) {
      console.error('No suitable drug-brand data found in the Excel file');
      return;
    }
    
    console.log(`\nFound drug-brand data in sheet: ${sheetInfo.sheetName}`);
    console.log(`Brand name column index: ${sheetInfo.brandNameIndex}`);
    console.log(`Generic name column index: ${sheetInfo.genericNameIndex}`);
    console.log(`Total rows to process: ${sheetInfo.rowCount}`);
    
    // Process the identified sheet to extract relationships
    console.log('\nProcessing drug-brand relationships...');
    
    // Read the full sheet with the identified structure
    const worksheet = workbook.Sheets[sheetInfo.sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Skip header row if it exists
    const startRow = (jsonData[0] && typeof jsonData[0][0] === 'string' && 
                     !jsonData[0][0].match(/\b(tablet|capsule|injection)\b/i)) ? 1 : 0;
    
    // Extract drug-brand relationships
    const relationships = [];
    const genericNames = new Set();
    const brandNames = new Set();
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;
      
      const brandName = row[sheetInfo.brandNameIndex];
      const genericName = row[sheetInfo.genericNameIndex];
      
      if (brandName && genericName) {
        relationships.push({
          brandName: String(brandName),
          genericName: String(genericName)
        });
        
        brandNames.add(String(brandName));
        genericNames.add(String(genericName));
      }
    }
    
    console.log(`Extracted ${relationships.length} valid drug-brand relationships`);
    console.log(`Found ${brandNames.size} unique brand names`);
    console.log(`Found ${genericNames.size} unique generic names`);
    
    // Create a mock storage with the relationships
    const medicines = createSampleMedicines(relationships);
    
    // Export to JSON file
    const outputPath = path.resolve(__dirname, '../../drug_brands_imported.json');
    fs.writeFileSync(
      outputPath, 
      JSON.stringify(medicines, null, 2),
      'utf8'
    );
    
    console.log(`\nMedicines data exported to ${outputPath}`);
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Error importing drug-brand relationships:', error);
  }
}

// Create sample medicines from the relationships
function createSampleMedicines(relationships) {
  const medicines = [];
  let id = 1;
  
  for (const rel of relationships) {
    const medicine = {
      id: id++,
      name: rel.brandName,
      genericName: rel.genericName,
      description: `${rel.brandName} (${rel.genericName})`,
      manufacturer: 'Various',
      isGeneric: false,
      price: Math.floor(Math.random() * 500) + 50, // Random price between 50-550 INR
      dosage: extractDosageFromGenericName(rel.genericName) || 'Standard dosage',
      activeIngredient: extractActiveIngredientFromGenericName(rel.genericName),
      imageUrl: '',
      availableAt: ["Thakur Pharmacy", "Apollo Pharmacy", "MedPlus"],
      inStock: true,
      stockCount: Math.floor(Math.random() * 30) + 5 // Random stock between 5-35
    };
    
    medicines.push(medicine);
  }
  
  return medicines;
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
importDrugBrands().catch(console.error);