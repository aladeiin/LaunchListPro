import { Router } from "express";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistUserSchema, insertChatMessageSchema } from "@shared/schema";
import { getMedicationInfo, getChatResponse } from "./openai";
import { z } from "zod";
import medicinesRouter from "./routes/medicines";
import updaterRouter from "./routes/data-updater";

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

  // Mount medicines router
  apiRouter.use("/medicines", medicinesRouter);
  
  // Mount data updater router
  apiRouter.use("/data-updater", updaterRouter);

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
      
      res.status(201).json({ message: chatMessage, response: response });
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
