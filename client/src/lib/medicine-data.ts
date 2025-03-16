import { type Medicine } from "@shared/schema";

export const calculateSavings = (originalPrice: number, alternativePrice: number): number => {
  return Math.round(((originalPrice - alternativePrice) / originalPrice) * 100);
};

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const filterMedicinesByPrice = (
  medicines: Medicine[], 
  maxPrice: number
): Medicine[] => {
  return medicines.filter(medicine => medicine.price <= maxPrice);
};

export const filterMedicinesByManufacturer = (
  medicines: Medicine[],
  manufacturers: string[]
): Medicine[] => {
  if (manufacturers.length === 0) return medicines;
  return medicines.filter(medicine => 
    manufacturers.some(m => medicine.manufacturer.toLowerCase().includes(m.toLowerCase()))
  );
};

export const filterMedicinesByType = (
  medicines: Medicine[],
  isGeneric: boolean | null
): Medicine[] => {
  if (isGeneric === null) return medicines;
  return medicines.filter(medicine => medicine.isGeneric === isGeneric);
};

export interface PharmacyPrice {
  pharmacy: string;
  price: number;
}

export const getMockPharmacyPrices = (medicine: Medicine): PharmacyPrice[] => {
  const basePrice = medicine.price;
  const indianPharmacies = ["Apollo Pharmacy", "MedPlus", "Netmeds", "PharmEasy", "1mg"];
  
  // Since all items are out of stock, return a default set of pharmacy prices
  return indianPharmacies.map(pharmacy => {
    // Generate slight variations in price for different pharmacies
    const variation = (Math.random() * 0.2) - 0.1; // -10% to +10%
    const price = basePrice * (1 + variation);
    
    return {
      pharmacy,
      price: Math.round(price * 100) / 100 // Round to 2 decimal places
    };
  });
};
