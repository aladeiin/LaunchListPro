import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { findAlternatives } from '../services/1mg-scraper';
import { z } from 'zod';

const medicinesRouter = Router();

// GET /api/medicines
medicinesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const medicines = await storage.getMedicines();
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// GET /api/medicines/search
medicinesRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const medicines = await storage.searchMedicines(q);
    res.json(medicines);
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({ error: 'Failed to search medicines' });
  }
});

// GET /api/medicines/:id
medicinesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medicineId = parseInt(id, 10);
    
    if (isNaN(medicineId)) {
      return res.status(400).json({ error: 'Invalid medicine ID' });
    }
    
    const medicine = await storage.getMedicineById(medicineId);
    
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json(medicine);
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

// GET /api/medicines/name/:name
medicinesRouter.get("/name/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    
    const medicine = await storage.getMedicineByName(name);
    
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json(medicine);
  } catch (error) {
    console.error('Error fetching medicine by name:', error);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

// GET /api/medicines/:name/alternatives
medicinesRouter.get("/:name/alternatives", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    
    // Get the original medicine to find its active ingredient
    const medicine = await storage.getMedicineByName(name);
    
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    // Find alternatives based on the same active ingredient
    const alternatives = await storage.getMedicinesByActiveIngredient(medicine.activeIngredient);
    
    // Filter out the original medicine
    const filteredAlternatives = alternatives.filter(alt => alt.id !== medicine.id);
    
    // Sort alternatives by price (lowest first)
    const sortedAlternatives = filteredAlternatives.sort((a, b) => a.price - b.price);
    
    res.json(sortedAlternatives);
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({ error: 'Failed to fetch alternatives' });
  }
});

// GET /api/medicines/ingredient/:ingredient
medicinesRouter.get("/ingredient/:ingredient", async (req: Request, res: Response) => {
  try {
    const { ingredient } = req.params;
    
    if (!ingredient) {
      return res.status(400).json({ error: 'Active ingredient is required' });
    }
    
    const medicines = await storage.getMedicinesByActiveIngredient(ingredient);
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines by ingredient:', error);
    res.status(500).json({ error: 'Failed to fetch medicines by ingredient' });
  }
});

export default medicinesRouter;