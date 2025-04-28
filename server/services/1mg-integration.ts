import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from '../storage';
import { InsertMedicine } from '@shared/schema';

// ESM module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MedicationSku {
  is_discontinued: boolean;
  manufacturer_name: string;
  marketer_name: string;
  type: string;
  price: number;
  name: string;
  id: number;
  sku_id: number;
  available: boolean;
  pack_size_label: string;
  rx_required: {
    header: string;
    icon_url: string;
  };
  slug: string;
  short_composition: string;
  image_url: string;
  in_stock: boolean | null;
  quantity: number;
}

interface ApiResponse {
  data: {
    skus: MedicationSku[];
  };
  meta: {
    count: number;
    total_count: number;
  };
  is_success: boolean;
  status_code: number;
}

// Function to map 1mg medication data to our application's format
function mapToAppFormat(medication: MedicationSku) {
  // Extract generic name from short_composition
  const genericName = medication.short_composition?.split('(')[0]?.trim() || '';
  
  // Extract dosage/strength from short_composition if available
  const dosageMatch = medication.short_composition?.match(/\(([^)]+)\)/);
  const dosage = dosageMatch ? dosageMatch[1] : '';
  
  return {
    name: medication.name,
    genericName,
    description: medication.short_composition || `${medication.name} contains ${genericName}`,
    manufacturer: medication.manufacturer_name,
    isGeneric: medication.type === 'generic',
    price: medication.price / 100, // Convert from paise to rupees
    dosage,
    activeIngredient: genericName,
    imageUrl: medication.image_url,
    inStock: medication.available,
    stockCount: medication.quantity || 0
  };
}

/**
 * Searches for medications in 1mg API based on a query
 * @param query Search query string
 * @param limit Maximum number of results to return
 * @returns Array of medications matching the query
 */
export async function searchMedicationsFrom1mg(query: string, limit: number = 10): Promise<any[]> {
  try {
    // For demonstration purposes, let's create mock data based on the query
    // This will be replaced with actual API calls in production
    console.log(`Searching 1mg for medications with query: ${query}`);
    
    // Create synthetic medications for testing the UI
    const sampleMedications = [
      {
        name: `${query} 500mg Tablet`,
        genericName: query,
        description: `${query} 500mg Tablet is used to treat various conditions.`,
        manufacturer: 'Sun Pharmaceuticals',
        isGeneric: true,
        price: 150.00,
        dosage: '500mg',
        activeIngredient: query,
        imageUrl: '',
        inStock: true,
        stockCount: 50
      },
      {
        name: `${query} Plus Tablet`,
        genericName: `${query} + Paracetamol`,
        description: `${query} Plus Tablet is a combination medication.`,
        manufacturer: 'Cipla Ltd',
        isGeneric: false,
        price: 250.00,
        dosage: '500mg + 325mg',
        activeIngredient: `${query}, Paracetamol`,
        imageUrl: '',
        inStock: true,
        stockCount: 30
      },
      {
        name: `${query} SR Tablet`,
        genericName: `${query} Sustained Release`,
        description: `${query} SR Tablet provides extended release of the medication.`,
        manufacturer: 'Dr. Reddy\'s Laboratories',
        isGeneric: false,
        price: 350.00,
        dosage: '850mg',
        activeIngredient: query,
        imageUrl: '',
        inStock: true,
        stockCount: 20
      }
    ];
    
    // When we implement the real API call, use code like this:
    /* 
    // Use the first letter of the query as prefix
    const prefix = query.charAt(0).toLowerCase();
    
    // Build the URL
    const url = `https://www.1mg.com/pharmacy_api_gateway/v4/drug_skus/by_prefix?prefix_term=${prefix}&page=1&per_page=30`;
    
    const response = await axios.get<ApiResponse>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.1mg.com/'
      }
    });
    
    if (response.data.is_success && response.data.data.skus) {
      // Map all medications to our format
      const medications = response.data.data.skus.map(mapToAppFormat);
      
      // Filter medications based on the query (more advanced search)
      const queryLower = query.toLowerCase();
      const filteredMedications = medications.filter(med => 
        med.name.toLowerCase().includes(queryLower) || 
        med.genericName.toLowerCase().includes(queryLower) ||
        med.activeIngredient.toLowerCase().includes(queryLower)
      );
      
      // Return limited results
      return filteredMedications.slice(0, limit);
    }
    */
    
    return sampleMedications;
  } catch (error) {
    console.error('Error searching 1mg medications:', error);
    return [];
  }
}

/**
 * Fetches detailed information about a specific medication from 1mg
 * @param medicineName Name of the medication to look up
 * @returns Detailed medication information if found
 */
export async function getMedicationDetailFrom1mg(medicineName: string): Promise<any | null> {
  try {
    // First, search for the medication to get its details
    const results = await searchMedicationsFrom1mg(medicineName, 5);
    
    // Find the closest match
    const exactMatch = results.find(med => 
      med.name.toLowerCase() === medicineName.toLowerCase()
    );
    
    const bestMatch = exactMatch || results[0];
    
    if (bestMatch) {
      // For a real implementation, we could follow the slug to get more details
      // For now, we'll return what we have
      return bestMatch;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching medication details:', error);
    return null;
  }
}

/**
 * Finds alternative medications (same active ingredient) from 1mg
 * @param medicineName Name of the medication to find alternatives for
 * @returns Array of alternative medications with the same active ingredient
 */
export async function findAlternativesFrom1mg(medicineName: string): Promise<any[]> {
  try {
    // First, get the medication details to extract the active ingredient
    const medicationDetail = await getMedicationDetailFrom1mg(medicineName);
    
    if (!medicationDetail || !medicationDetail.activeIngredient) {
      return [];
    }
    
    // Now search for medications with the same active ingredient
    const activeIngredient = medicationDetail.activeIngredient;
    
    // Use the first letter of the active ingredient as prefix
    const prefix = activeIngredient.charAt(0).toLowerCase();
    
    // Build the URL
    const url = `https://www.1mg.com/pharmacy_api_gateway/v4/drug_skus/by_prefix?prefix_term=${prefix}&page=1&per_page=30`;
    
    const response = await axios.get<ApiResponse>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.1mg.com/'
      }
    });
    
    if (response.data.is_success && response.data.data.skus) {
      // Map all medications to our format
      const medications = response.data.data.skus.map(mapToAppFormat);
      
      // Filter medications with the same active ingredient
      const alternatives = medications.filter(med => 
        med.activeIngredient.toLowerCase() === activeIngredient.toLowerCase() &&
        med.name.toLowerCase() !== medicineName.toLowerCase() // Exclude the original medicine
      );
      
      // Sort by price (ascending)
      return alternatives.sort((a, b) => a.price - b.price);
    }
    
    return [];
  } catch (error) {
    console.error('Error finding alternatives:', error);
    return [];
  }
}

/**
 * Updates local database with medication data from 1mg
 * @param query Query string to search for medications
 * @param limit Maximum number of medications to update
 * @returns Number of medications updated
 */
export async function updateDatabaseWithMedications(query: string, limit: number = 10): Promise<number> {
  try {
    // Search for medications
    const medications = await searchMedicationsFrom1mg(query, limit);
    
    let updatedCount = 0;
    
    // Update or create each medication in our database
    for (const medication of medications) {
      try {
        // Check if medication already exists
        const existingMedicine = await storage.getMedicineByName(medication.name);
        
        if (existingMedicine) {
          // Update the existing medicine
          await storage.updateMedicineByName(medication.name, {
            genericName: medication.genericName,
            price: medication.price,
            manufacturer: medication.manufacturer,
            dosage: medication.dosage,
            activeIngredient: medication.activeIngredient,
            imageUrl: medication.imageUrl,
            inStock: medication.inStock,
            stockCount: medication.stockCount
          });
          console.log(`Updated existing medicine: ${medication.name}`);
        } else {
          // Create a new medicine entry
          const insertMedicine: InsertMedicine = {
            name: medication.name,
            genericName: medication.genericName,
            description: medication.description,
            manufacturer: medication.manufacturer,
            isGeneric: medication.isGeneric,
            price: medication.price,
            dosage: medication.dosage,
            activeIngredient: medication.activeIngredient,
            imageUrl: medication.imageUrl,
            inStock: medication.inStock,
            stockCount: medication.stockCount
          };
          
          await storage.createMedicine(insertMedicine);
          console.log(`Created new medicine: ${medication.name}`);
        }
        
        updatedCount++;
      } catch (error) {
        console.error(`Error updating medication ${medication.name}:`, error);
      }
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Error updating database:', error);
    return 0;
  }
}