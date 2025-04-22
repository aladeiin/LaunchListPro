import { read, utils } from 'xlsx';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Excel file
const filePath = resolve(__dirname, '../../attached_assets/brand data1.xlsx');

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
      const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);
      
      // Display number of rows
      console.log(`Number of rows: ${jsonData.length}`);
      
      // Display column headers (keys of the first object)
      if (jsonData.length > 0) {
        console.log('Column Headers:');
        const headers = Object.keys(jsonData[0] as object);
        headers.forEach(header => console.log(`  - ${header}`));
        
        // Display first row as sample
        console.log('\nSample Data (First Row):');
        console.log(JSON.stringify(jsonData[0], null, 2));
      }
    });
    
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
  }
}

analyzeExcelFile();