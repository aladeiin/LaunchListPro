const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

function analyzeDrugBrands() {
  try {
    console.log(`Reading drug-brand relationships from: ${filePath}`);
    
    // Read with sheet options
    const options = {
      sheetRows: 30, // Read first 30 rows for sample
    };
    
    // Read the Excel file with options
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
    
    // Display number of rows
    console.log(`Number of drug-brand relationships (sample): ${jsonData.length}`);
    
    // Analyze data structure
    if (jsonData.length > 0) {
      // Display column headers
      console.log('\nColumn Headers:');
      const headers = Object.keys(jsonData[0]);
      headers.forEach(header => console.log(`  - ${header}`));
      
      // Display sample rows
      console.log('\nSample Drug-Brand Relationships:');
      for (let i = 0; i < Math.min(20, jsonData.length); i++) {
        const row = jsonData[i];
        console.log(`\nRow ${i + 1}:`);
        console.log(`Generic: ${row.Column8 || 'N/A'}`);
        console.log(`Brand: ${row.Column1 || 'N/A'}`);
      }
      
      // Organize data by generic name
      const drugMap = new Map();
      
      jsonData.forEach(row => {
        const genericName = row.Column8;
        const brandName = row.Column1;
        
        if (genericName && brandName) {
          if (!drugMap.has(genericName)) {
            drugMap.set(genericName, []);
          }
          drugMap.get(genericName).push(brandName);
        }
      });
      
      // Display organized data
      console.log('\nDrug-Brand Organized Data (Sample):');
      let count = 0;
      for (const [genericName, brands] of drugMap.entries()) {
        if (count >= 5) break; // Show only first 5 generics
        
        console.log(`\nGeneric: ${genericName}`);
        console.log(`Available Brands (${brands.length}):`);
        brands.slice(0, 5).forEach(brand => console.log(`  - ${brand}`));
        if (brands.length > 5) {
          console.log(`  ...and ${brands.length - 5} more brands`);
        }
        
        count++;
      }
    }
    
  } catch (error) {
    console.error('Error analyzing drug-brand relationships:', error);
  }
}

analyzeDrugBrands();