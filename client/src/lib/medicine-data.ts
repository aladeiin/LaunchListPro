import { Medicine } from '@shared/schema';

/**
 * Calculate savings percentage when comparing original price to alternative price
 * @param originalPrice The original medicine price
 * @param alternativePrice The alternative medicine price
 * @returns The percentage of savings (rounded to whole number)
 */
export const calculateSavings = (originalPrice: number, alternativePrice: number): number => {
  if (originalPrice <= 0 || alternativePrice <= 0) return 0;
  const savingsPercentage = ((originalPrice - alternativePrice) / originalPrice) * 100;
  return Math.round(savingsPercentage);
};

/**
 * Format price to display in a consistent format
 * @param price The price to format
 * @returns Formatted price string without the currency symbol
 */
export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

/**
 * Filter medicines by price range
 * @param medicines Array of medicines to filter
 * @param minPrice Minimum price (inclusive)
 * @param maxPrice Maximum price (inclusive), use null for no upper limit
 * @returns Filtered array of medicines
 */
export const filterMedicinesByPrice = (
  medicines: Medicine[],
  minPrice: number,
  maxPrice: number | null
): Medicine[] => {
  return medicines.filter((medicine) => {
    const isAboveMin = medicine.price >= minPrice;
    const isBelowMax = maxPrice === null || medicine.price <= maxPrice;
    return isAboveMin && isBelowMax;
  });
};

/**
 * Filter medicines by manufacturer
 * @param medicines Array of medicines to filter
 * @param manufacturers Array of manufacturer names to include
 * @returns Filtered array of medicines
 */
export const filterMedicinesByManufacturer = (
  medicines: Medicine[],
  manufacturers: string[]
): Medicine[] => {
  if (manufacturers.length === 0) return medicines;
  return medicines.filter((medicine) =>
    manufacturers.some((m) => medicine.manufacturer.includes(m))
  );
};

/**
 * Filter medicines by type (generic/branded)
 * @param medicines Array of medicines to filter
 * @param isGeneric If true, return only generic medicines. If false, return only branded medicines. If null, return all.
 * @returns Filtered array of medicines
 */
export const filterMedicinesByType = (
  medicines: Medicine[],
  isGeneric: boolean | null
): Medicine[] => {
  if (isGeneric === null) return medicines;
  return medicines.filter((medicine) => medicine.isGeneric === isGeneric);
};

/**
 * Interface for pharmacy price information
 */
export interface PharmacyPrice {
  pharmacy: string;
  price: number;
}

/**
 * Get mock pharmacy prices for a medicine
 * In a real application, this would fetch actual prices from different pharmacies
 * @param medicine The medicine to get prices for
 * @returns Array of pharmacy prices
 */
export const getMockPharmacyPrices = (medicine: Medicine): PharmacyPrice[] => {
  const availablePharmacies = medicine.availableAt || [];
  
  // In a real implementation, these would be actual prices from different pharmacies
  return availablePharmacies.map((pharmacy) => {
    // Generate slightly different prices for each pharmacy for demonstration
    const variationFactor = 0.9 + Math.random() * 0.2; // 10% lower to 10% higher
    return {
      pharmacy,
      price: Math.round(medicine.price * variationFactor * 100) / 100,
    };
  });
};