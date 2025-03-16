import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { searchMedicines, getMedicineDetails, findAlternatives } from "../services/1mg-scraper";

const medicinesRouter = Router();

// Search for medicines
medicinesRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    try {
      // Try to fetch real medicine data from 1mg
      console.log(`Searching for medicines with query: ${query}`);
      const medicines = await searchMedicines(query);
      return res.json({ medicines });
    } catch (scrapeError) {
      console.error("Error scraping medicines from 1mg:", scrapeError);
      // Fall back to local storage if scraping fails
      const medicines = await storage.searchMedicines(query);
      return res.json({ medicines });
    }
  } catch (error) {
    console.error("Error searching medicines:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get medicine details
medicinesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid medicine ID" });
    }
    
    // Get the medicine by ID from local storage first
    const medicine = await storage.getMedicineById(id);
    
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    
    // Try to enhance with 1mg data if possible
    try {
      const enhancedMedicine = await getMedicineDetails(medicine.name);
      
      if (enhancedMedicine) {
        // Return a merged object with local ID but enhanced details
        return res.json({ 
          medicine: {
            ...enhancedMedicine,
            id: medicine.id // Keep the original ID for consistency
          }
        });
      }
    } catch (scrapeError) {
      console.error("Error enhancing medicine details from 1mg:", scrapeError);
      // Fall back to local storage data if enhancement fails
    }
    
    // If enhancement fails or is unavailable, return local data
    return res.json({ medicine });
  } catch (error) {
    console.error("Error getting medicine details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get medicine alternatives
medicinesRouter.get("/:name/alternatives", async (req: Request, res: Response) => {
  try {
    const medicineName = req.params.name;
    
    try {
      // Try to fetch real alternatives from 1mg
      console.log(`Finding alternatives for: ${medicineName}`);
      const medicine = await getMedicineDetails(medicineName);
      
      if (!medicine) {
        // Fall back to local storage if medicine not found on 1mg
        const storedMedicine = await storage.getMedicineByName(medicineName);
        
        if (!storedMedicine) {
          return res.status(404).json({ message: "Medicine not found" });
        }
        
        // Find alternatives with the same active ingredient from local storage
        const alternatives = await storage.getMedicinesByActiveIngredient(storedMedicine.activeIngredient);
        
        // Remove the original medicine from alternatives
        const filteredAlternatives = alternatives.filter(alt => alt.id !== storedMedicine.id);
        
        return res.json({ 
          original: storedMedicine,
          alternatives: filteredAlternatives
        });
      }
      
      // Get alternatives from 1mg
      const alternatives = await findAlternatives(medicineName);
      
      return res.json({ 
        original: medicine,
        alternatives: alternatives
      });
    } catch (scrapeError) {
      console.error("Error scraping alternatives from 1mg:", scrapeError);
      
      // Fall back to local storage if scraping fails
      const storedMedicine = await storage.getMedicineByName(medicineName);
      
      if (!storedMedicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      
      // Find alternatives with the same active ingredient from local storage
      const alternatives = await storage.getMedicinesByActiveIngredient(storedMedicine.activeIngredient);
      
      // Remove the original medicine from alternatives
      const filteredAlternatives = alternatives.filter(alt => alt.id !== storedMedicine.id);
      
      return res.json({ 
        original: storedMedicine,
        alternatives: filteredAlternatives
      });
    }
  } catch (error) {
    console.error("Error finding medicine alternatives:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default medicinesRouter;