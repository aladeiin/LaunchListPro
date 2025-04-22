import { Router, Request, Response } from 'express';
import { storage } from '../storage';

export const alternativesRouter = Router();

/**
 * GET /api/alternatives/:medicineName
 * Get alternative medicines based on active ingredient
 */
alternativesRouter.get('/:medicineName', async (req: Request, res: Response) => {
  try {
    const { medicineName } = req.params;
    
    if (!medicineName) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    
    // Find the requested medicine
    const medicine = await storage.getMedicineByName(medicineName);
    
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    // Find alternatives with the same active ingredient
    const allMedicines = await storage.getMedicines();
    const alternatives = allMedicines.filter(med => 
      med.id !== medicine.id && 
      med.activeIngredient?.toLowerCase() === medicine.activeIngredient?.toLowerCase()
    );
    
    // Sort by price
    alternatives.sort((a, b) => a.price - b.price);
    
    // Calculate savings
    const alternativesWithSavings = alternatives.map(alt => {
      const priceDiff = alt.price - medicine.price;
      const percentageSavings = medicine.price > 0 
        ? ((medicine.price - alt.price) / medicine.price) * 100 
        : 0;
        
      return {
        ...alt,
        priceDifference: priceDiff,
        percentageSavings: priceDiff < 0 ? Math.abs(percentageSavings) : 0
      };
    });
    
    return res.json({
      requestedMedicine: medicine,
      alternatives: alternativesWithSavings,
      count: alternatives.length
    });
    
  } catch (error) {
    console.error('Error finding medicine alternatives:', error);
    return res.status(500).json({ error: 'Failed to find medicine alternatives' });
  }
});

/**
 * GET /api/alternatives/ingredient/:ingredient
 * Get medicines by active ingredient
 */
alternativesRouter.get('/ingredient/:ingredient', async (req: Request, res: Response) => {
  try {
    const { ingredient } = req.params;
    
    if (!ingredient) {
      return res.status(400).json({ error: 'Active ingredient is required' });
    }
    
    // Find medicines with the specified active ingredient
    const medicines = await storage.getMedicinesByActiveIngredient(ingredient);
    
    // Sort by price
    medicines.sort((a, b) => a.price - b.price);
    
    return res.json({
      activeIngredient: ingredient,
      medicines,
      count: medicines.length
    });
    
  } catch (error) {
    console.error('Error finding medicines by active ingredient:', error);
    return res.status(500).json({ error: 'Failed to find medicines by active ingredient' });
  }
});