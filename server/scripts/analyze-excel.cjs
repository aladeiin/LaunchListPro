const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const filePath = path.resolve(__dirname, '../../attached_assets/brand data1.xlsx');

function analyzeExcelFile() {
  try {
    console.log(`Analyzing Excel file: ${filePath}`);
    
    // Read with limited options to improve performance
    const options = {
      sheetRows: 100, // Only read first 100 rows
      sheets: ['A_Z_medicines_dataset_of_India '], // Try the medicines dataset sheet
      cellDates: false,
      cellNF: false,
      cellFormula: false
    };
    
    console.log('Reading Excel file (limited data)...');
    const workbook = XLSX.readFile(filePath, options);
    console.log('Excel file loaded successfully');
    
    // Get sheet names
    const sheetNames = workbook.SheetNames;
    console.log(`Found sheets: ${sheetNames.join(', ')}`);
    
    // Process the A_Z_medicines_dataset_of_India sheet
    const datasetSheet = 'A_Z_medicines_dataset_of_India ';
    if (sheetNames.includes(datasetSheet)) {
      const worksheet = workbook.Sheets[datasetSheet];
      
      if (worksheet) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        console.log(`${datasetSheet} range: ${worksheet['!ref']}`);
        console.log(`Rows: ${range.e.r - range.s.r + 1}, Columns: ${range.e.c - range.s.c + 1}`);
        
        // Convert first 100 rows to JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log(`Sample rows read: ${data.length}`);
        
        if (data.length > 0) {
          console.log('\nAnalyzing column structure:');
          
          // Try to identify by looking at first few rows
          for (let i = 0; i < Math.min(3, data.length); i++) {
            console.log(`Row ${i}: ${JSON.stringify(data[i])}`);
          }
          
          // Try to identify columns
          let brandNameIndex = -1;
          let genericNameIndex = -1;
          
          // Check if first row contains headers
          if (data[0]) {
            for (let i = 0; i < data[0].length; i++) {
              const header = data[0][i];
              if (header) {
                const headerStr = String(header).toLowerCase();
                if (headerStr.includes('medicine') || headerStr.includes('brand') || headerStr.includes('product')) {
                  brandNameIndex = i;
                  console.log(`Identified brand column at index ${i}: ${header}`);
                }
                
                if (headerStr.includes('generic') || headerStr.includes('salt') || headerStr.includes('ingredient')) {
                  genericNameIndex = i;
                  console.log(`Identified generic column at index ${i}: ${header}`);
                }
              }
            }
          }
          
          // If headers not identified, use reasonable defaults
          if (brandNameIndex === -1) brandNameIndex = 0;
          if (genericNameIndex === -1) genericNameIndex = 1;
          
          console.log(`\nUsing brand name index: ${brandNameIndex}`);
          console.log(`Using generic name index: ${genericNameIndex}`);
          
          // Extract sample relationships
          const relationships = [];
          
          for (let i = 1; i < data.length; i++) { // Skip header row
            const row = data[i];
            if (!row) continue;
            
            const brandName = row[brandNameIndex];
            const genericName = row[genericNameIndex];
            
            if (brandName && genericName) {
              relationships.push({
                brandName,
                genericName
              });
            }
          }
          
          console.log(`\nFound ${relationships.length} drug-brand relationships in the sampled data`);
          
          if (relationships.length > 0) {
            console.log('\nSample relationships:');
            for (let i = 0; i < Math.min(5, relationships.length); i++) {
              console.log(`  Brand: ${relationships[i].brandName}, Generic: ${relationships[i].genericName}`);
            }
          }
        }
        
        // Estimate total rows
        console.log(`\nEstimated total rows in ${datasetSheet}: ${range.e.r + 1}`);
        
      } else {
        console.log(`${datasetSheet} exists but has no data`);
      }
    } else {
      console.log(`${datasetSheet} not found in workbook`);
    }
    
    // Also check Sheet4 where we previously found data
    if (sheetNames.includes('Sheet4')) {
      console.log('\nChecking Sheet4...');
      const worksheet = workbook.Sheets['Sheet4'];
      
      if (worksheet) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        console.log(`Sheet4 range: ${worksheet['!ref']}`);
        console.log(`Rows: ${range.e.r - range.s.r + 1}, Columns: ${range.e.c - range.s.c + 1}`);
        
        // Convert first few rows to JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length > 0) {
          console.log('Sample data from Sheet4:');
          for (let i = 0; i < Math.min(3, data.length); i++) {
            console.log(`Row ${i}: ${JSON.stringify(data[i])}`);
          }
        }
      }
    }
    
    console.log('\nAnalysis complete');
    
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
  }
}

// Run the analysis
analyzeExcelFile();