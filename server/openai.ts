import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
              "You are a pharmacy assistant AI. Provide accurate information about medications based on publicly available data. Format your response as JSON with the following structure: { 'description': string, 'alternatives': string[], 'sideEffects': string[], 'interactions': string[], 'guidelines': string }. Always add a disclaimer that this information is not medical advice."
          },
          {
            role: "user",
            content: `Provide information about ${medication}.`,
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
  "As a medication alternative finder, I can help you discover more affordable options for your prescriptions. For example, if you're taking brand-name Lipitor for cholesterol, generic atorvastatin could save you up to 80%.",
  "I can provide information about common medication side effects when the service is fully operational. For now, please consult your doctor or pharmacist for specific medication questions.",
  "PharmAssist helps you find lower-cost medication options and compare prices across different pharmacies. Our full service is currently experiencing high demand, but will be available shortly.",
  "When fully operational, I can answer questions about drug interactions, side effects, and lower-cost alternatives. For immediate medication information, please consult your healthcare provider.",
  "I'm designed to help you find affordable medication alternatives. For example, many common prescription medications have generic alternatives that can be significantly less expensive but equally effective."
];

export async function getChatResponse(userMessage: string): Promise<string> {
  // Rate limiting protection: if we detect specific phrases in the error message, use fallback responses
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
              "You are PharmAssist, a helpful pharmacy assistant AI that can answer questions about medications, their uses, side effects, and alternatives. Provide accurate, concise information based on publicly available medical data. Always clarify that you're not providing medical advice, and users should consult healthcare professionals for personalized guidance. When discussing medication alternatives, focus on factual information about different options without making specific recommendations."
          },
          {
            role: "user",
            content: userMessage,
          },
        ]
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }
      return content + "\n\n(Note: This information is for educational purposes only. Always consult a healthcare professional for medical advice.)";
    } catch (error) {
      console.error("Error getting chat response:", error);
      apiCallCount++;
      
      // Check if it's a rate limit error
      const errorMessage = String(error);
      if (errorMessage.includes("429") || 
          errorMessage.includes("rate limit") || 
          errorMessage.includes("quota exceeded") ||
          errorMessage.includes("insufficient_quota")) {
        
        // Select a random fallback response
        const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
        return FALLBACK_RESPONSES[randomIndex] + 
               "\n\n(Note: Our AI service is currently experiencing high demand. This is a general response. For specific medical advice, please consult a healthcare professional.)";
      }
      
      // If we've tried our max retries, send a general error message
      if (apiCallCount > maxRetries) {
        return "I'm sorry, I'm having trouble processing your request at the moment. Our systems are experiencing high demand. Please try again in a few minutes.\n\n(Note: For specific medical advice, please consult a healthcare professional.)";
      }
      
      // If it's another type of error and we haven't reached max retries, try again
      // Small delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Fallback if loop exits unexpectedly
  return "I'm sorry, I'm having trouble processing your request at the moment. Please try again later.";
}
