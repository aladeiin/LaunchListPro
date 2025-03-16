import { Router } from "express";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistUserSchema, insertChatMessageSchema } from "@shared/schema";
import { getMedicationInfo, getChatResponse } from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API router
  const apiRouter = Router();
  app.use("/api", apiRouter);

  // Waitlist routes
  apiRouter.post("/waitlist", async (req: Request, res: Response) => {
    try {
      const validatedData = insertWaitlistUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getWaitlistUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }
      
      // Create new waitlist user
      const user = await storage.createWaitlistUser(validatedData);
      
      res.status(201).json({ message: "Successfully joined waitlist", user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Medicine search routes
  apiRouter.get("/medicines/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // Import the 1mg scraper
      const { searchMedicines } = require('./services/1mg-scraper');
      
      try {
        // Try to fetch real medicine data from 1mg
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

  apiRouter.get("/medicines/:id", async (req: Request, res: Response) => {
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
        const { getMedicineDetails } = require('./services/1mg-scraper');
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

  apiRouter.get("/medicines/:name/alternatives", async (req: Request, res: Response) => {
    try {
      const medicineName = req.params.name;
      
      // Import the 1mg scraper
      const { findAlternatives, getMedicineDetails } = require('./services/1mg-scraper');
      
      try {
        // Try to fetch real alternatives from 1mg
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

  // Get medication info via OpenAI
  apiRouter.get("/medication-info/:name", async (req: Request, res: Response) => {
    try {
      const medicineName = req.params.name;
      const medicationInfo = await getMedicationInfo(medicineName);
      res.json({ info: medicationInfo });
    } catch (error) {
      res.status(500).json({ message: "Failed to get medication information" });
    }
  });

  // Chat routes
  apiRouter.post("/chat", async (req: Request, res: Response) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Store user message
      await storage.createChatMessage({
        ...validatedData,
        isUserMessage: true
      });
      
      // Get response from OpenAI
      const response = await getChatResponse(validatedData.message);
      
      // Store AI response
      const chatMessage = await storage.createChatMessage({
        userId: validatedData.userId,
        message: response,
        isUserMessage: false
      });
      
      res.status(201).json({ message: chatMessage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.get("/chat/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
