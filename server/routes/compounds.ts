/**
 * Compound Medication Routes
 * 
 * This module provides API routes for working with compound medications
 * (medications that contain multiple active ingredients)
 */
import { Router, Request, Response } from 'express';
import { getCompoundMedicationAlternatives } from '../openai';

export const compoundsRouter = Router();

// Known compound medications with their ingredients
const knownCompounds: Record<string, string[]> = {
  'telma-am': ['Telmisartan 40mg', 'Amlodipine 5mg'],
  'telsar-am': ['Telmisartan 40mg', 'Amlodipine 5mg'],
  'telvas-am': ['Telmisartan 40mg', 'Amlodipine 5mg'],
  'telma-h': ['Telmisartan 40mg', 'Hydrochlorothiazide 12.5mg'],
  'telsar-h': ['Telmisartan 40mg', 'Hydrochlorothiazide 12.5mg'],
  'telvas-h': ['Telmisartan 40mg', 'Hydrochlorothiazide 12.5mg'],
  'glycomet-gp': ['Metformin 500mg', 'Glimepiride 2mg'],
  'glycomet-gp1': ['Metformin 500mg', 'Glimepiride 1mg'],
  'glycomet-gp2': ['Metformin 500mg', 'Glimepiride 2mg'],
  'cardace-h': ['Ramipril 5mg', 'Hydrochlorothiazide 12.5mg'],
  'cardace-am': ['Ramipril 5mg', 'Amlodipine 5mg'],
  'amlovas-at': ['Amlodipine 5mg', 'Atorvastatin 10mg'],
  'amlodac-at': ['Amlodipine 5mg', 'Atorvastatin 10mg'],
};

/**
 * GET /api/compounds/:name
 * Get information about a compound medication
 */
compoundsRouter.get('/:name', async (req: Request, res: Response) => {
  const name = req.params.name.toLowerCase();
  
  // Look up ingredients
  let ingredients: string[] = [];
  
  // Try to find in our known compounds dictionary
  const normalizedName = name.replace(/\s+/g, '-');
  if (knownCompounds[normalizedName]) {
    ingredients = knownCompounds[normalizedName];
  }
  
  // If not found, return 404
  if (ingredients.length === 0) {
    return res.status(404).json({
      error: 'Compound medication not found',
      message: `Could not find compound medication: ${req.params.name}`
    });
  }
  
  // Return the compound information
  return res.json({
    name: req.params.name,
    ingredients,
    isCompound: true
  });
});

/**
 * GET /api/compounds/:name/alternatives
 * Get alternative medications for a compound
 */
compoundsRouter.get('/:name/alternatives', async (req: Request, res: Response) => {
  const name = req.params.name.toLowerCase();
  
  // Look up ingredients
  let ingredients: string[] = [];
  
  // Try to find in our known compounds dictionary
  const normalizedName = name.replace(/\s+/g, '-');
  if (knownCompounds[normalizedName]) {
    ingredients = knownCompounds[normalizedName];
  }
  
  // If not found, return 404
  if (ingredients.length === 0) {
    return res.status(404).json({
      error: 'Compound medication not found',
      message: `Could not find compound medication: ${req.params.name}`
    });
  }
  
  try {
    // Get alternatives from OpenAI
    const alternatives = await getCompoundMedicationAlternatives(
      req.params.name,
      ingredients
    );
    
    // Return the alternatives
    return res.json({
      name: req.params.name,
      ingredients,
      alternatives,
      count: alternatives.length
    });
  } catch (error: any) {
    console.error('Error getting alternatives:', error);
    return res.status(500).json({
      error: 'Failed to get alternatives',
      message: error?.message || 'Unknown error'
    });
  }
});