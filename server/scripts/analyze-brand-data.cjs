const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

function analyzeExcelFile() {
  try {
    console.log(`Analyzing Excel file: ${filePath}`);
    
    // Read just the workbook structure without loading all data
    const workbook = XLSX.readFile(filePath, {
      sheetRows: 10, // Just read first 10 rows of each sheet for preview
      bookSheets: true // Only read sheet structure, not data
    });
    
    // Get sheet names
    const sheetNames = workbook.SheetNames;
    console.log(`The Excel file contains ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);
    
    // Let's analyze the last sheet in the workbook (which might contain drug-brand relationships)
    const sheetToAnalyze = sheetNames[sheetNames.length - 1]; // Get the last sheet
    console.log(`\nAnalyzing sheet: ${sheetToAnalyze} (Drug-Brand relationships)...`);
    const worksheet = workbook.Sheets[sheetToAnalyze];
    
    if (!worksheet) {
      console.log(`Sheet ${sheetToAnalyze} not found in the workbook`);
      return;
    }
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const totalRows = range.e.r - range.s.r;
    const totalCols = range.e.c - range.s.c + 1;
    
    console.log(`Sheet4 contains approximately ${totalRows} rows and ${totalCols} columns`);
    
    // Load just a few rows for column analysis
    const sample = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      range: XLSX.utils.encode_range(
        { r: range.s.r, c: range.s.c },
        { r: Math.min(range.s.r + 5, range.e.r), c: range.e.c }
      )
    });
    
    if (sample.length > 0) {
      console.log(`Sample header row: ${JSON.stringify(sample[0])}`);
      
      if (sample.length > 1) {
        console.log(`Sample first data row: ${JSON.stringify(sample[1])}`);
      }
    }
    
    console.log('\nAnalysis complete. To import this data, run the import-drug-brands.cjs script.');
    
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
  }
}

// Run the analysis
analyzeExcelFile();