const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

function analyzeExcelFile() {
  try {
    console.log(`Analyzing Excel file: ${filePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Get sheet names
    const sheetNames = workbook.SheetNames;
    console.log(`The Excel file contains ${sheetNames.length} sheets:`);
    
    // Analyze each sheet
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      
      // Get the range of the sheet
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const rowCount = range.e.r - range.s.r + 1;
      const colCount = range.e.c - range.s.c + 1;
      
      console.log(`\nSheet: ${sheetName}`);
      console.log(`  Rows: ${rowCount}`);
      console.log(`  Columns: ${colCount}`);
      
      // Convert to JSON to analyze column names
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length > 0) {
        const headerRow = data[0];
        console.log(`  Header row: ${JSON.stringify(headerRow)}`);
        
        // Sample a few rows
        if (data.length > 1) {
          console.log(`  Sample data (first 3 rows):`);
          for (let i = 1; i < Math.min(4, data.length); i++) {
            console.log(`    Row ${i}: ${JSON.stringify(data[i])}`);
          }
        }
        
        // For Sheet4 specifically, do a more detailed analysis
        if (sheetName === 'Sheet4') {
          analyzeSheet4Data(data);
        }
      }
    });
    
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
  }
}

function analyzeSheet4Data(data) {
  try {
    // Skip header row
    const rows = data.slice(1);
    console.log(`\nDetailed analysis of Sheet4 (Drug-Brand relationships):`);
    
    if (rows.length === 0) {
      console.log('  No data rows found');
      return;
    }
    
    // Identify relevant columns
    let brandNameColIndex = -1;
    let genericNameColIndex = -1;
    
    // Try to identify columns based on data
    if (data[0] && data[0].length > 0) {
      // Look for reasonable column indices
      for (let i = 0; i < data[0].length; i++) {
        if (typeof data[0][i] === 'string') {
          if (data[0][i].toLowerCase().includes('brand')) {
            brandNameColIndex = i;
          } else if (data[0][i].toLowerCase().includes('generic')) {
            genericNameColIndex = i;
          }
        }
      }
      
      // If columns couldn't be identified, use known indices
      if (brandNameColIndex === -1) brandNameColIndex = 0; // First column
      if (genericNameColIndex === -1) genericNameColIndex = 7; // Eighth column
    }
    
    console.log(`  Using brand name column index: ${brandNameColIndex}`);
    console.log(`  Using generic name column index: ${genericNameColIndex}`);
    
    // Count valid relationships
    let validRelationships = 0;
    let uniqueBrandNames = new Set();
    let uniqueGenericNames = new Set();
    
    rows.forEach(row => {
      if (row[brandNameColIndex] && row[genericNameColIndex]) {
        validRelationships++;
        uniqueBrandNames.add(row[brandNameColIndex]);
        uniqueGenericNames.add(row[genericNameColIndex]);
      }
    });
    
    console.log(`  Total valid relationships: ${validRelationships}`);
    console.log(`  Unique brand names: ${uniqueBrandNames.size}`);
    console.log(`  Unique generic names: ${uniqueGenericNames.size}`);
    
    // Get a few sample relationships
    console.log(`  Sample brand-generic relationships:`);
    let count = 0;
    for (let i = 0; i < rows.length && count < 5; i++) {
      if (rows[i][brandNameColIndex] && rows[i][genericNameColIndex]) {
        console.log(`    Brand: ${rows[i][brandNameColIndex]}, Generic: ${rows[i][genericNameColIndex]}`);
        count++;
      }
    }
    
  } catch (error) {
    console.error('Error during Sheet4 analysis:', error);
  }
}

// Run the analysis
analyzeExcelFile();