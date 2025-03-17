import { Router, Request, Response } from 'express';
import { 
  getMlSubstitutionRecommendations,
  analyzeSubstitutionEfficacy
} from '../services/ml-substitution';
import { storage } from '../storage';

export const mlSubstitutionRouter = Router();

/**
 * GET /api/ml-substitution/:medicineName
 * Get ML-powered substitution recommendations for a specific medicine
 */
mlSubstitutionRouter.get('/:medicineName', async (req: Request, res: Response) => {
  try {
    const { medicineName } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    
    if (!medicineName) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    
    const recommendations = await getMlSubstitutionRecommendations(medicineName, limit);
    
    if (recommendations.length === 0) {
      return res.status(404).json({ 
        error: 'No substitution recommendations found',
        message: 'No suitable alternatives could be found for this medicine'
      });
    }
    
    return res.status(200).json({ recommendations });
  } catch (error: any) {
    console.error('Error getting ML substitution recommendations:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/ml-substitution/analyze/:originalName/:substituteName
 * Get detailed efficacy analysis between original medicine and substitute
 */
mlSubstitutionRouter.get('/analyze/:originalName/:substituteName', async (req: Request, res: Response) => {
  try {
    const { originalName, substituteName } = req.params;
    
    if (!originalName || !substituteName) {
      return res.status(400).json({ 
        error: 'Both original and substitute medicine names are required' 
      });
    }
    
    const originalMedicine = await storage.getMedicineByName(originalName);
    if (!originalMedicine) {
      return res.status(404).json({ error: `Original medicine ${originalName} not found` });
    }
    
    const substituteMedicine = await storage.getMedicineByName(substituteName);
    if (!substituteMedicine) {
      return res.status(404).json({ error: `Substitute medicine ${substituteName} not found` });
    }
    
    const analysis = await analyzeSubstitutionEfficacy(originalMedicine, substituteMedicine);
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error('Error analyzing substitution efficacy:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze substitution efficacy',
      message: error.message || 'An unexpected error occurred'
    });
  }
});