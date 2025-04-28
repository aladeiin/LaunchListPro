import OpenAI from "openai";
import { 
  getComprehensiveMedicationInfo, 
  formatMedicationResponse,
  detectMedicationQueryType
} from "./lib/medication-api-integration";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 2    // Retry API calls twice
});

interface MedicationInfo {
  description: string;
  alternatives: string[];
  sideEffects: string[];
  interactions: string[];
  guidelines: string;
}

// Provides generic medication information when API is unavailable
function getFallbackMedicationInfo(medication: string): MedicationInfo {
  return {
    description: `${medication} is a medication that may be prescribed by healthcare professionals. Our detailed information service is currently experiencing high demand.`,
    alternatives: ["Please consult your healthcare provider for specific alternatives to this medication"],
    sideEffects: ["Information on side effects is temporarily unavailable"],
    interactions: ["Information on drug interactions is temporarily unavailable"],
    guidelines: "Please consult a healthcare professional for accurate medication information and guidelines for use."
  };
}

export async function getMedicationInfo(medication: string): Promise<MedicationInfo> {
  let apiCallCount = 0;
  const maxRetries = 1;
  
  while (apiCallCount <= maxRetries) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an Indian pharmacy assistant AI specializing in the Indian pharmaceutical market. Provide accurate information about medications available in India based on publicly available data. When listing alternatives, always include approximate price comparison information in Indian Rupees (e.g., 'Generic atorvastatin (₹80-120 per strip, 60-80% cheaper than Lipitor at ₹300-400)'. Mention Jan Aushadhi generic alternatives when available. Format your response as JSON with the following structure: { 'description': string, 'alternatives': string[], 'sideEffects': string[], 'interactions': string[], 'guidelines': string }. Always add a disclaimer that this information is not medical advice."
          },
          {
            role: "user",
            content: `Provide comprehensive information about ${medication} as available in the Indian market, including branded and generic versions.`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      
      const result = JSON.parse(content);
      return {
        description: result.description || "",
        alternatives: result.alternatives || [],
        sideEffects: result.sideEffects || [],
        interactions: result.interactions || [],
        guidelines: result.guidelines || "",
      };
    } catch (error) {
      console.error("Error getting medication info:", error);
      apiCallCount++;
      
      // Check if it's a rate limit error
      const errorMessage = String(error);
      if (errorMessage.includes("429") || 
          errorMessage.includes("rate limit") || 
          errorMessage.includes("quota exceeded") ||
          errorMessage.includes("insufficient_quota")) {
        
        // Return fallback info for the queried medication
        return getFallbackMedicationInfo(medication);
      }
      
      // If we've tried our max retries, return a general fallback
      if (apiCallCount > maxRetries) {
        return {
          description: "Unable to retrieve medication information at this time due to high service demand.",
          alternatives: [],
          sideEffects: [],
          interactions: [],
          guidelines: "Please consult a healthcare professional for accurate medication information and check back later when our service load has reduced.",
        };
      }
      
      // If it's another type of error and we haven't reached max retries, try again
      // Small delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Default fallback
  return {
    description: "Unable to retrieve medication information at this time.",
    alternatives: [],
    sideEffects: [],
    interactions: [],
    guidelines: "Please consult a healthcare professional for accurate medication information.",
  };
}

// Fallback responses to provide when the OpenAI API is unavailable
const FALLBACK_RESPONSES = [
  "As a medication alternative finder, I can help you discover more affordable options for your prescriptions. For example, if you're taking brand-name Lipitor for cholesterol (approximately ₹500), generic atorvastatin could save you up to 80% (costing around ₹100).",
  "I can provide information about common medication side effects when the service is fully operational. For now, please consult your doctor or pharmacist for specific medication questions.",
  "PharmAssist helps you find lower-cost medication options and compare prices across different pharmacies. For instance, generic alternatives often cost 40-80% less than brand-name medications. Our full service is currently experiencing high demand, but will be available shortly.",
  "When fully operational, I can answer questions about drug interactions, side effects, and lower-cost alternatives with detailed price comparisons. For immediate medication information, please consult your healthcare provider.",
  "I'm designed to help you find affordable medication alternatives with price comparisons. For example, many common prescription medications have generic alternatives that can be significantly less expensive (often 60-90% cheaper) but equally effective."
];

export async function getChatResponse(userMessage: string): Promise<string> {
  console.log("[OPENAI-CHAT] User message:", userMessage);
  console.log("[OPENAI-CHAT] API Key exists:", process.env.OPENAI_API_KEY ? "Yes (length: " + process.env.OPENAI_API_KEY.length + ")" : "No");
  
  // Sanitize and validate user input
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    console.log("[OPENAI-CHAT] Invalid or empty user message");
    return "I'm sorry, I couldn't understand your question. Could you please ask again with more details?";
  }
  
  const sanitizedMessage = userMessage.trim().substring(0, 1000); // Limit message length to 1000 characters
  console.log("[OPENAI-CHAT] Sanitized message length:", sanitizedMessage.length);
  
  // First, check if this is a medication-related query
  const medicationQuery = await detectMedicationQueryType(sanitizedMessage);
  
  // If we detected a medication query and extracted a medication name
  if (medicationQuery.queryType !== 'unknown' && medicationQuery.medicineName) {
    try {
      console.log(`[MEDICATION-API] Detected ${medicationQuery.queryType} query for "${medicationQuery.medicineName}"`);
      
      // Get comprehensive medication info
      const medicationInfo = await getComprehensiveMedicationInfo(medicationQuery.medicineName);
      
      // Enhance medication info with 1mg salt and dosage data if available
      if (medicationQuery.context && medicationQuery.context.from1mg) {
        console.log(`[MEDICATION-API] Using enhanced 1mg data for ${medicationQuery.medicineName}`);
        
        // Add salt info to the medication info if available
        if (medicationQuery.context.saltInfo) {
          medicationInfo.activeIngredient = medicationQuery.context.saltInfo;
        }
        
        // Add dosage info to the medication info if available
        if (medicationQuery.context.dosage) {
          medicationInfo.dosage = medicationQuery.context.dosage;
        }
        
        // Add description if available
        if (medicationQuery.context.description) {
          medicationInfo.description = medicationQuery.context.description;
        }
      }
      
      // Format the response based on query type
      const response = formatMedicationResponse(medicationInfo, medicationQuery.queryType);
      
      console.log("[MEDICATION-API] Successfully processed medication query");
      return response + "\n\n(Note: This information is for educational purposes only. Always consult a healthcare professional for medical advice.)";
    } catch (error) {
      console.error("[MEDICATION-API] Error processing medication query:", error);
      // If medication API fails, fall back to OpenAI
    }
  }
  
  // If not a medication query or if medication processing failed, use OpenAI
  try {
    console.log("[OPENAI-CHAT] Sending request to OpenAI");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are PharmAssist, an Indian pharmacy assistant AI specializing in the Indian pharmaceutical market. Your expertise includes Indian brand name medicines, generics, and the Jan Aushadhi initiative. Provide accurate, concise information about medications available in India, including their uses, side effects, and alternatives.\n\n" +
            "Always use Indian Rupees (₹) when discussing prices. When suggesting alternatives, prioritize Indian generic brands and medicines available at Jan Aushadhi stores which are typically 50-80% cheaper than branded equivalents.\n\n" +
            "Some key aspects to emphasize:\n" +
            "- Price comparisons between branded and generic medicines in Indian Rupees\n" +
            "- Information about medications commonly used in India\n" +
            "- Potential savings when choosing generic alternatives\n" +
            "- Availability of medicines at Jan Aushadhi stores when relevant\n" +
            "- Common Indian medical practices and terminology\n\n" + 
            "Always clarify that you're not providing medical advice, and users should consult healthcare professionals for personalized guidance. Focus on factual information about different options, including potential cost savings, without making specific recommendations."
        },
        {
          role: "user",
          content: sanitizedMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      // OpenAI client will handle retries automatically based on the configuration we set
    });

    console.log("[OPENAI-CHAT] Received response from OpenAI");
    
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("[OPENAI-CHAT] Empty response content from OpenAI");
      throw new Error("Empty response from OpenAI");
    }
    
    const finalResponse = content + "\n\n(Note: This information is for educational purposes only. Always consult a healthcare professional for medical advice.)";
    console.log("[OPENAI-CHAT] Final response (truncated):", finalResponse.substring(0, 100) + "...");
    return finalResponse;
    
  } catch (error) {
    console.error("[OPENAI-CHAT] Error getting chat response:", error);
    
    try {
      // Attempt to log structured error details
      console.error("[OPENAI-CHAT] Error details:", JSON.stringify(error, null, 2));
    } catch (jsonError) {
      console.error("[OPENAI-CHAT] Could not stringify error:", jsonError);
    }
    
    // Check if it's a rate limit error
    const errorMessage = String(error);
    if (errorMessage.includes("429") || 
        errorMessage.includes("rate limit") || 
        errorMessage.includes("quota exceeded") ||
        errorMessage.includes("insufficient_quota")) {
      
      console.log("[OPENAI-CHAT] Rate limit detected, using fallback response");
      // Select a random fallback response
      const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
      return FALLBACK_RESPONSES[randomIndex] + 
             "\n\n(Note: Our AI service is currently experiencing high demand. This is a general response. For specific medical advice, please consult a healthcare professional.)";
    }
    
    // Return a general error message for any other type of error
    return "I'm sorry, I'm having trouble processing your request at the moment. Our systems are experiencing high demand. Please try again in a few minutes.\n\n(Note: For specific medical advice, please consult a healthcare professional.)";
  }
}
