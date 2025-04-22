import { Medicine } from '@shared/schema';

// Response types
export interface MedicationResponse {
  type: 'medication_response';
  message: string;
  medicationData?: any;
}

export interface RegularResponse {
  type: 'regular_response';
  message: string;
}

export type ChatbotResponse = MedicationResponse | RegularResponse;

// Patterns to recognize medication queries
const MEDICATION_PATTERNS = [
  /cheaper (alternative|option|substitute|version|replacement|generic) (for|to|of) ([a-zA-Z0-9\s]+)/i,
  /alternative (to|for) ([a-zA-Z0-9\s]+)/i,
  /generic (version|alternative|substitute) (of|for|to) ([a-zA-Z0-9\s]+)/i,
  /find (?:a |an |)(cheaper|affordable|less expensive|budget) (?:version|option|medicine|medication|drug|alternative|substitute) (?:for|to|of) ([a-zA-Z0-9\s]+)/i,
  /is there (?:a |an |)(cheaper|affordable|less expensive|budget) (?:version|option|medicine|medication|drug|alternative|substitute) (?:for|to|of) ([a-zA-Z0-9\s]+)/i,
  /compare ([a-zA-Z0-9\s]+) (with|to|and) ([a-zA-Z0-9\s]+)/i,
  /difference between ([a-zA-Z0-9\s]+) and ([a-zA-Z0-9\s]+)/i,
];

/**
 * Extract the medicine name from a medication query
 */
function extractMedicineName(message: string): string | null {
  for (const pattern of MEDICATION_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      // Different patterns have the medicine name in different capture groups
      // Check patterns and extract accordingly
      if (pattern.toString().includes('compare') || pattern.toString().includes('difference between')) {
        // Handle comparison queries separately if needed
        return match[1]?.trim() || null;
      }
      
      // For most patterns, the medicine name is in the last capture group
      return match[match.length - 1]?.trim() || null;
    }
  }
  return null;
}

/**
 * Determine if a message is asking about alternative medicines
 */
function isAlternativeMedicineQuery(message: string): boolean {
  return MEDICATION_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Fetch medicine alternatives from the API
 */
async function fetchMedicineAlternatives(medicineName: string): Promise<any> {
  try {
    const response = await fetch(`/api/alternatives/${encodeURIComponent(medicineName)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch alternatives: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching medicine alternatives:', error);
    return null;
  }
}

/**
 * Format alternatives into a readable chat message
 */
function formatAlternativesResponse(alternativesData: any, medicineName: string): string {
  if (!alternativesData || !alternativesData.alternatives || alternativesData.alternatives.length === 0) {
    return `I couldn't find any alternatives for ${medicineName}. Please check the spelling or try another medicine name.`;
  }
  
  const { requestedMedicine, alternatives } = alternativesData;
  
  // Format the original medicine info
  let response = `**${requestedMedicine.name}** (₹${requestedMedicine.price.toFixed(2)})\n`;
  response += `Manufactured by: ${requestedMedicine.manufacturer}\n`;
  response += `Active ingredient: ${requestedMedicine.activeIngredient}\n\n`;
  
  // Sort alternatives by price
  const sortedAlternatives = [...alternatives].sort((a, b) => a.price - b.price);
  
  // Get up to 5 cheapest alternatives
  const cheapestAlternatives = sortedAlternatives.slice(0, 5);
  
  response += `Here are some alternatives with the same active ingredient:\n\n`;
  
  cheapestAlternatives.forEach((alt, index) => {
    const savings = alt.percentageSavings > 0 
      ? ` (Save ${alt.percentageSavings.toFixed(0)}%)` 
      : '';
      
    response += `${index + 1}. **${alt.name}** - ₹${alt.price.toFixed(2)}${savings}\n`;
    response += `   Manufacturer: ${alt.manufacturer}\n`;
    response += `   ${alt.isGeneric ? 'Generic' : 'Branded'} Medicine\n\n`;
  });
  
  // Add a summary of potential savings
  const cheapestAlt = cheapestAlternatives[0];
  if (cheapestAlt && cheapestAlt.price < requestedMedicine.price) {
    const savings = requestedMedicine.price - cheapestAlt.price;
    const savingsPercent = (savings / requestedMedicine.price) * 100;
    
    response += `Potential savings: By switching to ${cheapestAlt.name}, you could save ₹${savings.toFixed(2)} (${savingsPercent.toFixed(0)}% less).\n\n`;
  }
  
  response += `I found a total of ${alternatives.length} alternatives for this medicine. Click on any medicine name to view more details.`;
  
  return response;
}

/**
 * Process a user message to check if it's asking about medication alternatives
 */
export async function processMedicationMessage(message: string): Promise<ChatbotResponse> {
  // Check if message is asking about alternatives
  if (isAlternativeMedicineQuery(message)) {
    const medicineName = extractMedicineName(message);
    
    if (!medicineName) {
      return {
        type: 'medication_response',
        message: "I understand you're looking for medication alternatives, but I couldn't identify which medicine you're asking about. Could you please specify the medicine name clearly?"
      };
    }
    
    // Fetch alternatives data
    const alternativesData = await fetchMedicineAlternatives(medicineName);
    
    if (!alternativesData) {
      return {
        type: 'medication_response',
        message: `I couldn't find information about ${medicineName}. Please check the spelling or try another medicine name.`
      };
    }
    
    // Format response
    const responseMessage = formatAlternativesResponse(alternativesData, medicineName);
    
    return {
      type: 'medication_response',
      message: responseMessage,
      medicationData: alternativesData
    };
  }
  
  // Not a medication query
  return {
    type: 'regular_response',
    message: ''
  };
}