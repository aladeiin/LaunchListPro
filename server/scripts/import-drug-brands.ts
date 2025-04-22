import { readFile, utils } from 'xlsx';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { storage } from '../storage';
import { InsertMedicine } from '@shared/schema';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Excel file
const filePath = resolve(__dirname, '../../attached_assets/brand data1.xlsx');

interface DrugBrandRelationship {
  genericName: string;
  brandName: string;
}

async function importDrugBrands() {
  try {
    console.log(`Starting import of drug-brand relationships from: ${filePath}`);
    console.log('This process may take some time depending on file size...');
    
    // Read the Excel file - Sheet4 contains drug-brand mappings
    const workbook = readFile(filePath);
    
    // Target Sheet4 which contains drug-brand relationships
    const sheetName = 'Sheet4';
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      console.error(`Sheet '${sheetName}' not found in the workbook`);
      return;
    }
    
    // Convert to JSON
    const jsonData = utils.sheet_to_json(worksheet);
    console.log(`Found ${jsonData.length} rows in the Excel sheet`);
    
    // Extract drug-brand relationships
    const relationships: DrugBrandRelationship[] = [];
    const genericNames = new Set<string>();
    const brandNames = new Set<string>();
    
    jsonData.forEach((row: any) => {
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
          const newMedicine: InsertMedicine = {
            name: relationship.brandName,
            genericName: relationship.genericName,
            description: `${relationship.brandName} (${relationship.genericName})`,
            manufacturer: 'Various', // Default, can be updated later
            isGeneric: false,
            price: 0, // Default price, can be updated later
            dosage: extractDosageFromGenericName(relationship.genericName) || 'Standard dosage',
            activeIngredient: extractActiveIngredientFromGenericName(relationship.genericName),
            imageUrl: '',
            availableAt: [],
            inStock: true,
            stockCount: 10 // Default stock
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
    
    // Import is complete
    console.log('\nImport Summary:');
    console.log(`Total relationships processed: ${stats.processed}`);
    console.log(`New medicines added: ${stats.added}`);
    console.log(`Errors encountered: ${stats.errors}`);
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Error importing drug-brand relationships:', error);
  }
}

// Helper function to extract dosage from generic name
function extractDosageFromGenericName(genericName: string): string | null {
  // Try to extract dosage information (e.g., "Abacavir (300mg)" -> "300mg")
  const dosageMatch = genericName.match(/\(([0-9]+[a-zA-Z]+)\)/);
  return dosageMatch ? dosageMatch[1] : null;
}

// Helper function to extract active ingredient from generic name
function extractActiveIngredientFromGenericName(genericName: string): string {
  // Remove dosage information (e.g., "Abacavir (300mg)" -> "Abacavir")
  return genericName.replace(/\s*\([^)]*\)\s*/, '').trim();
}

// Run the import
importDrugBrands().catch(console.error);