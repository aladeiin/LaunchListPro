import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { InsertMedicine, Medicine } from '@shared/schema';

interface RawMedicineData {
  id: string;
  name: string;
  'price(₹)': string;
  Is_discontinued: string;
  manufacturer_name: string;
  type: string;
  pack_size_label: string;
  short_composition1: string;
  short_composition2: string;
}

export async function processMedicineCSV(filePath: string): Promise<InsertMedicine[]> {
  const results: InsertMedicine[] = [];
  
  try {
    // Create a readable stream from the CSV file
    const csvStream = fs.createReadStream(path.resolve(filePath))
      .pipe(csv());
    
    // Process each row in the CSV
    for await (const row of csvStream) {
      try {
        const data = row as RawMedicineData;
        
        // Convert price to number
        const price = parseFloat(data['price(₹)']) || 0;
        
        // Check if medicine is discontinued
        const isDiscontinued = data.Is_discontinued?.toLowerCase() === 'true';
        
        // Skip discontinued medicines
        if (isDiscontinued) continue;
        
        // Determine if the medicine is generic
        // For simplicity, we'll assume all generic medicines have "generic" in their name or type
        // This logic can be improved later
        const isGeneric = 
          data.name.toLowerCase().includes('generic') || 
          data.type.toLowerCase().includes('generic');
        
        // Extract active ingredient from short_composition fields
        const activeIngredient = (data.short_composition1 || '').trim();
        
        // Create medicine object
        const medicine: InsertMedicine = {
          name: data.name.trim(),
          genericName: data.short_composition1.trim(),
          description: `${data.name} is a ${data.type} medication manufactured by ${data.manufacturer_name}. Available as ${data.pack_size_label}.`,
          manufacturer: data.manufacturer_name.trim(),
          isGeneric: isGeneric,
          price: price,
          dosage: data.pack_size_label.trim(),
          activeIngredient: activeIngredient,
          imageUrl: "",
          availableAt: ["Apollo Pharmacy", "MedPlus", "PharmEasy"],
          inStock: Math.random() > 0.2, // Randomly set stock status
          stockCount: Math.floor(Math.random() * 100) + 1 // Random stock count
        };
        
        results.push(medicine);
      } catch (error) {
        console.error('Error processing row:', error);
      }
    }
    
    console.log(`Processed ${results.length} medicines from CSV`);
    return results;
  } catch (error) {
    console.error('Error processing CSV file:', error);
    throw error;
  }
}