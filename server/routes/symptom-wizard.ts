import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { 
  analyzeSymptoms, 
  getMedicineRecommendations, 
  enhanceMedicineRecommendations,
  symptomCategories,
  type Symptom
} from "../services/symptom-analysis";

export const symptomWizardRouter = Router();

// Get symptom categories
symptomWizardRouter.get("/categories", (req: Request, res: Response) => {
  try {
    res.json({ categories: symptomCategories });
  } catch (error) {
    res.status(500).json({ message: "Failed to get symptom categories" });
  }
});

// Schema for symptom data validation
const symptomSchema = z.object({
  description: z.string(),
  severity: z.enum(["mild", "moderate", "severe"]),
  duration: z.string(),
  timeOfDay: z.string().optional(),
  triggeredBy: z.string().optional(),
  relievedBy: z.string().optional()
});

// Schema for symptoms analysis request
const symptomsAnalysisSchema = z.object({
  symptoms: z.array(symptomSchema)
});

// Analyze symptoms and provide condition results
symptomWizardRouter.post("/analyze", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = symptomsAnalysisSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error("Symptom analysis validation error:", validationResult.error);
      return res.status(400).json({ 
        message: "Invalid symptom data", 
        errors: validationResult.error.errors 
      });
    }
    
    const { symptoms } = validationResult.data;
    
    // Check if we have at least one symptom
    if (symptoms.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one symptom"
      });
    }
    
    console.log(`Analyzing ${symptoms.length} symptoms...`);
    
    // Analyze symptoms to identify conditions
    const conditions = await analyzeSymptoms(symptoms);
    
    console.log(`Found ${conditions.length} potential conditions`);
    
    res.json({ conditions });
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    res.status(500).json({ 
      message: "Failed to analyze symptoms",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Schema for recommendations request
const recommendationsRequestSchema = z.object({
  conditions: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    description: z.string(),
    commonTreatments: z.array(z.string())
  }))
});

// Get medicine recommendations based on conditions
symptomWizardRouter.post("/recommendations", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = recommendationsRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid condition data", 
        errors: validationResult.error.errors 
      });
    }
    
    const { conditions } = validationResult.data;
    
    // Get medicine recommendations
    const recommendations = await getMedicineRecommendations(conditions);
    
    // Enhance top recommendations with additional details (dosage, warnings, etc.)
    const enhancedRecommendations = await enhanceMedicineRecommendations(
      recommendations,
      conditions
    );
    
    res.json({ recommendations: enhancedRecommendations });
  } catch (error) {
    console.error("Error getting medicine recommendations:", error);
    res.status(500).json({ 
      message: "Failed to get medicine recommendations",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});