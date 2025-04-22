const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

function readExcelSample() {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    console.log(`File size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Read with sheet options to limit data
    const options = {
      sheetRows: 10, // Read only first 10 rows
      raw: false,  // Return formatted text data
    };
    
    // Read the Excel file with options
    const workbook = XLSX.readFile(filePath, options);
    
    // Get all sheet names
    const sheetNames = workbook.SheetNames;
    console.log(`Sheet Names: ${sheetNames.join(', ')}`);
    
    // Analyze each sheet
    sheetNames.forEach(sheetName => {
      console.log(`\nAnalyzing Sheet: ${sheetName}`);
      
      // Get the worksheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Display number of rows
      console.log(`Number of rows (sample): ${jsonData.length}`);
      
      // Display column headers (keys of the first object)
      if (jsonData.length > 0) {
        console.log('Column Headers:');
        const headers = Object.keys(jsonData[0]);
        headers.forEach(header => console.log(`  - ${header}`));
        
        // Display first row as sample
        console.log('\nSample Data (First Row):');
        console.log(JSON.stringify(jsonData[0], null, 2));
      }
    });
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

readExcelSample();