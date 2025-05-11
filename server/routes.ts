import { Router } from "express";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistUserSchema, insertChatMessageSchema } from "@shared/schema";
import { getMedicationInfo, getChatResponse } from "./openai";
import { z } from "zod";
import medicinesRouter from "./routes/medicines";
import updaterRouter from "./routes/data-updater";
import { mlSubstitutionRouter } from "./routes/ml-substitution";
import { symptomWizardRouter } from "./routes/symptom-wizard";
import blogRouter from "./routes/blog";
import { alternativesRouter } from "./routes/alternatives";
import { merchantsRouter } from "./routes/merchants";
import { externalDataRouter } from "./routes/external-data";
import { compoundsRouter } from "./routes/compounds";

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
  
  // Mount ML substitution router
  apiRouter.use("/ml-substitution", mlSubstitutionRouter);
  
  // Mount symptom wizard router
  apiRouter.use("/symptom-wizard", symptomWizardRouter);
  
  // Mount blog router
  apiRouter.use("/blog", blogRouter);
  
  // Mount alternatives router
  apiRouter.use("/alternatives", alternativesRouter);
  
  // Mount merchants router
  apiRouter.use("/merchants", merchantsRouter);
  
  // Mount external data router
  apiRouter.use("/external-data", externalDataRouter);
  
  // Mount compounds router
  apiRouter.use("/compounds", compoundsRouter);

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
      console.log("[CHAT] Request body:", JSON.stringify(req.body));
      const validatedData = insertChatMessageSchema.parse(req.body);
      console.log("[CHAT] Validated data:", JSON.stringify(validatedData));
      
      // Store user message
      await storage.createChatMessage({
        ...validatedData,
        isUserMessage: true
      });
      
      // Get response from OpenAI
      console.log("[CHAT] Getting response from OpenAI...");
      const response = await getChatResponse(validatedData.message);
      console.log("[CHAT] OpenAI response received");
      
      // Store AI response
      const chatMessage = await storage.createChatMessage({
        userId: validatedData.userId,
        message: response,
        isUserMessage: false
      });
      
      console.log("[CHAT] Sending response back to client");
      res.status(201).json({ message: chatMessage, response: response });
    } catch (error) {
      console.error("[CHAT] Error in chat route:", error);
      if (error instanceof z.ZodError) {
        console.error("[CHAT] Validation error details:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error: String(error) });
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
