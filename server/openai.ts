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

export async function getMedicationInfo(medication: string): Promise<MedicationInfo> {
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
    return {
      description: "Unable to retrieve medication information at this time.",
      alternatives: [],
      sideEffects: [],
      interactions: [],
      guidelines: "Please consult a healthcare professional for accurate medication information.",
    };
  }
}

export async function getChatResponse(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are MediAssist, a helpful pharmacy assistant AI that can answer questions about medications, their uses, side effects, and alternatives. Provide accurate, concise information based on publicly available medical data. Always clarify that you're not providing medical advice, and users should consult healthcare professionals for personalized guidance. When discussing medication alternatives, focus on factual information about different options without making specific recommendations."
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
    return "I'm sorry, I'm having trouble processing your request at the moment. Please try again later.";
  }
}
