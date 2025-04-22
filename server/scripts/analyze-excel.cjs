const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

function analyzeExcelFile() {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
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
      console.log(`Number of rows: ${jsonData.length}`);
      
      // Display column headers (keys of the first object)
      if (jsonData.length > 0) {
        console.log('Column Headers:');
        const headers = Object.keys(jsonData[0]);
        headers.forEach(header => console.log(`  - ${header}`));
        
        // Display first row as sample
        console.log('\nSample Data (First Row):');
        console.log(JSON.stringify(jsonData[0], null, 2));
        
        // Display sample of 3 rows
        console.log('\nSample Data (First 3 Rows):');
        for (let i = 0; i < Math.min(3, jsonData.length); i++) {
          console.log(`Row ${i + 1}:`);
          console.log(JSON.stringify(jsonData[i], null, 2));
        }
      }
    });
    
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
  }
}

analyzeExcelFile();