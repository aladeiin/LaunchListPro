import { Router, Request, Response } from "express";
import { dataUpdaterService } from "../services/data-updater";

const updaterRouter = Router();

/**
 * GET /api/data-updater/status
 * Get the current status of the data updater service
 */
updaterRouter.get("/status", (req: Request, res: Response) => {
  try {
    const status = dataUpdaterService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error("Error getting data updater status:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/data-updater/start
 * Start a manual data update process
 */
updaterRouter.post("/start", async (req: Request, res: Response) => {
  try {
    if (dataUpdaterService.getStatus().isUpdating) {
      return res.status(409).json({
        success: false,
        error: "Update is already in progress"
      });
    }

    // Start the update process in the background
    dataUpdaterService.updateDatabase()
      .then(results => {
        console.log("Data update completed successfully:", results);
      })
      .catch(error => {
        console.error("Data update failed:", error);
      });

    // Immediately return a response
    res.json({
      success: true,
      message: "Data update started"
    });
  } catch (error) {
    console.error("Error starting data update:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/data-updater/schedule
 * Set up a schedule for automatic data updates
 */
updaterRouter.post("/schedule", (req: Request, res: Response) => {
  try {
    const { cronExpression } = req.body;

    if (!cronExpression) {
      return res.status(400).json({
        success: false,
        error: "Missing cronExpression in request body"
      });
    }

    dataUpdaterService.scheduleUpdates(cronExpression);

    res.json({
      success: true,
      message: `Data updates scheduled with cron expression: ${cronExpression}`
    });
  } catch (error) {
    console.error("Error scheduling data updates:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/data-updater/stop-schedule
 * Stop scheduled data updates
 */
updaterRouter.post("/stop-schedule", (req: Request, res: Response) => {
  try {
    dataUpdaterService.stopScheduledUpdates();
    
    res.json({
      success: true,
      message: "Scheduled data updates stopped"
    });
  } catch (error) {
    console.error("Error stopping scheduled data updates:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/data-updater/popular-medicines
 * Update the list of popular medicines to track
 */
updaterRouter.post("/popular-medicines", (req: Request, res: Response) => {
  try {
    const { medicines } = req.body;

    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid medicines array in request body"
      });
    }

    dataUpdaterService.setPopularMedicinesList(medicines);

    res.json({
      success: true,
      message: `Popular medicines list updated with ${medicines.length} items`
    });
  } catch (error) {
    console.error("Error updating popular medicines list:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default updaterRouter;