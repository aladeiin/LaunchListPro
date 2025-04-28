import { Router, Request, Response } from 'express';
import { 
  searchMedicationsFrom1mg, 
  getMedicationDetailFrom1mg, 
  findAlternativesFrom1mg,
  updateDatabaseWithMedications
} from '../services/1mg-integration';

export const externalDataRouter = Router();

/**
 * GET /api/external-data/search
 * Search for medications from external data sources
 */
externalDataRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string || '10');
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const results = await searchMedicationsFrom1mg(query, limit);
    
    res.json({
      source: '1mg',
      query,
      medications: results
    });
  } catch (error) {
    console.error('Error in external data search:', error);
    res.status(500).json({ error: 'Failed to search external medication data' });
  }
});

/**
 * GET /api/external-data/medication/:name
 * Get detailed medication information from external sources
 */
externalDataRouter.get('/medication/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    
    if (!name) {
      return res.status(400).json({ error: 'Medication name is required' });
    }
    
    const medicationInfo = await getMedicationDetailFrom1mg(name);
    
    if (!medicationInfo) {
      return res.status(404).json({ error: 'Medication not found in external sources' });
    }
    
    res.json({
      source: '1mg',
      medicationInfo
    });
  } catch (error) {
    console.error('Error fetching external medication details:', error);
    res.status(500).json({ error: 'Failed to get external medication details' });
  }
});

/**
 * GET /api/external-data/alternatives/:name
 * Find alternative medications from external sources
 */
externalDataRouter.get('/alternatives/:name', async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    
    if (!name) {
      return res.status(400).json({ error: 'Medication name is required' });
    }
    
    const alternatives = await findAlternativesFrom1mg(name);
    
    res.json({
      source: '1mg',
      originalMedicineName: name,
      alternatives
    });
  } catch (error) {
    console.error('Error finding external alternatives:', error);
    res.status(500).json({ error: 'Failed to find external medication alternatives' });
  }
});

/**
 * POST /api/external-data/update-database
 * Update our database with medication data from external sources
 */
externalDataRouter.post('/update-database', async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const updatedCount = await updateDatabaseWithMedications(query, limit);
    
    res.json({
      success: true,
      query,
      updatedCount
    });
  } catch (error) {
    console.error('Error updating database with external data:', error);
    res.status(500).json({ error: 'Failed to update database with external medication data' });
  }
});