import { Router, Request, Response } from 'express';
import { dataUpdaterService } from '../services/data-updater';
import { z } from 'zod';

const updaterRouter = Router();

/**
 * GET /api/data-updater/status
 * Get the current status of the data updater service
 */
updaterRouter.get("/status", (req: Request, res: Response) => {
  try {
    const status = dataUpdaterService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting updater status:', error);
    res.status(500).json({ error: 'Failed to get updater status' });
  }
});

/**
 * POST /api/data-updater/start
 * Start a manual data update process
 */
updaterRouter.post("/start", async (req: Request, res: Response) => {
  try {
    if (dataUpdaterService.getStatus().isUpdating) {
      return res.status(409).json({ error: 'Update already in progress' });
    }

    // Run update in the background
    const updatePromise = dataUpdaterService.updateDatabase();
    
    // Immediately return a response
    res.json({ message: 'Update started successfully', status: 'in_progress' });
    
    // Handle the update asynchronously
    updatePromise.catch(error => {
      console.error('Error during manual update:', error);
    });
  } catch (error) {
    console.error('Error starting update:', error);
    res.status(500).json({ error: 'Failed to start update process' });
  }
});

/**
 * POST /api/data-updater/schedule
 * Set up a schedule for automatic data updates
 */
updaterRouter.post("/schedule", (req: Request, res: Response) => {
  try {
    const scheduleSchema = z.object({
      cronExpression: z.string().optional()
    });
    
    const parsedBody = scheduleSchema.safeParse(req.body);
    
    if (!parsedBody.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parsedBody.error });
    }
    
    const { cronExpression } = parsedBody.data;
    dataUpdaterService.scheduleUpdates(cronExpression);
    
    res.json({ 
      message: 'Schedule updated successfully', 
      cronExpression: cronExpression || '0 2 * * *' // Default is 2 AM daily
    });
  } catch (error) {
    console.error('Error scheduling updates:', error);
    res.status(500).json({ error: 'Failed to schedule updates' });
  }
});

/**
 * POST /api/data-updater/stop-schedule
 * Stop scheduled data updates
 */
updaterRouter.post("/stop-schedule", (req: Request, res: Response) => {
  try {
    dataUpdaterService.stopScheduledUpdates();
    res.json({ message: 'Scheduled updates stopped successfully' });
  } catch (error) {
    console.error('Error stopping scheduled updates:', error);
    res.status(500).json({ error: 'Failed to stop scheduled updates' });
  }
});

/**
 * POST /api/data-updater/popular-medicines
 * Update the list of popular medicines to track
 */
updaterRouter.post("/popular-medicines", (req: Request, res: Response) => {
  try {
    const popularMedicinesSchema = z.object({
      medicines: z.array(z.string())
    });
    
    const parsedBody = popularMedicinesSchema.safeParse(req.body);
    
    if (!parsedBody.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parsedBody.error });
    }
    
    const { medicines } = parsedBody.data;
    dataUpdaterService.setPopularMedicinesList(medicines);
    
    res.json({ 
      message: 'Popular medicines list updated successfully', 
      count: medicines.length
    });
  } catch (error) {
    console.error('Error updating popular medicines list:', error);
    res.status(500).json({ error: 'Failed to update popular medicines list' });
  }
});

export default updaterRouter;