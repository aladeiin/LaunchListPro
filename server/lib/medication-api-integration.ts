/**
 * Medication API Integration
 * 
 * This module provides comprehensive medication information by integrating
 * various data sources and APIs.
 */
import { Medicine } from '@shared/schema';
import { storage } from '../storage';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Types for medication responses
 */
export interface MedicationInfo {
  name: string;
  genericName: string;
  activeIngredient: string;
  alternatives: Medicine[];
  description: string;
  sideEffects: string[];
  interactions: string[];
  dosage: string;
  usage: string;
  price: number;
}

/**
 * Get comprehensive information about a medication
 * @param {string} medicineName - Name of the medication to look up
 * @returns {Promise<MedicationInfo>} - Medication information
 */
export async function getComprehensiveMedicationInfo(medicineName: string): Promise<MedicationInfo> {
  try {
    // Try to find the medicine in our database
    const medicine = await storage.getMedicineByName(medicineName);
    
    // Find alternatives with the same active ingredient
    let alternatives: Medicine[] = [];
    if (medicine) {
      const allMedicines = await storage.getMedicines();
      alternatives = allMedicines.filter(med => 
        med.id !== medicine.id && 
        med.activeIngredient?.toLowerCase() === medicine.activeIngredient?.toLowerCase()
      );
      
      // Sort by price (cheapest first)
      alternatives.sort((a, b) => a.price - b.price);
    }
    
    // Use OpenAI to fill in missing information
    const aiGeneratedInfo = await getAIMedicationInfo(
      medicine?.name || medicineName,
      medicine?.activeIngredient || '',
      medicine?.genericName || ''
    );
    
    return {
      name: medicine?.name || medicineName,
      genericName: medicine?.genericName || aiGeneratedInfo.genericName || '',
      activeIngredient: medicine?.activeIngredient || aiGeneratedInfo.activeIngredient || '',
      alternatives: alternatives,
      description: medicine?.description || aiGeneratedInfo.description || '',
      sideEffects: aiGeneratedInfo.sideEffects || [],
      interactions: aiGeneratedInfo.interactions || [],
      dosage: medicine?.dosage || aiGeneratedInfo.dosage || '',
      usage: aiGeneratedInfo.usage || '',
      price: medicine?.price || 0
    };
  } catch (error) {
    console.error('Error getting comprehensive medication info:', error);
    throw error;
  }
}

/**
 * Use AI to generate medication information when our database doesn't have complete data
 * @param {string} medicineName - Name of the medication
 * @param {string} activeIngredient - Active ingredient (if known)
 * @param {string} genericName - Generic name (if known)
 * @returns {Promise<Partial<MedicationInfo>>} - AI-generated medication information
 */
async function getAIMedicationInfo(
  medicineName: string, 
  activeIngredient: string = '', 
  genericName: string = ''
): Promise<Partial<MedicationInfo>> {
  try {
    const prompt = `
      Provide comprehensive information about the medication "${medicineName}" in JSON format.
      ${activeIngredient ? `Active ingredient: ${activeIngredient}` : ''}
      ${genericName ? `Generic name: ${genericName}` : ''}
      
      Return the information as valid JSON with the following structure:
      {
        "genericName": "The generic name of the medicine",
        "activeIngredient": "The active ingredient(s)",
        "description": "A brief description of what the medicine is and how it works",
        "sideEffects": ["List", "of", "common", "side", "effects"],
        "interactions": ["List", "of", "common", "drug", "interactions"],
        "dosage": "Typical dosage information",
        "usage": "What the medicine is used for (indications)"
      }
      
      If you don't know any specific piece of information, use an empty string or empty array as appropriate.
      Ensure your response contains ONLY the JSON data, no additional text.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a pharmaceutical information assistant that provides accurate, concise information about medications. Always format your responses in the requested JSON format without any additional text." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      return {
        genericName: '',
        activeIngredient: '',
        description: '',
        sideEffects: [],
        interactions: [],
        dosage: '',
        usage: ''
      };
    }
    
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Error parsing AI response as JSON:', e);
      return {
        genericName: '',
        activeIngredient: '',
        description: '',
        sideEffects: [],
        interactions: [],
        dosage: '',
        usage: ''
      };
    }
  } catch (error) {
    console.error('Error getting AI-generated medication info:', error);
    return {
      genericName: '',
      activeIngredient: '',
      description: '',
      sideEffects: [],
      interactions: [],
      dosage: '',
      usage: ''
    };
  }
}

/**
 * Format medication information into a readable chat response
 * @param {MedicationInfo} info - Medication information
 * @param {string} queryType - Type of query (e.g., 'general', 'side_effects', 'alternatives')
 * @returns {string} - Formatted response for chat
 */
export function formatMedicationResponse(info: MedicationInfo, queryType: string = 'general'): string {
  let response = '';
  
  switch (queryType.toLowerCase()) {
    case 'alternatives':
    case 'substitutes':
      response = formatAlternativesResponse(info);
      break;
      
    case 'side_effects':
      response = formatSideEffectsResponse(info);
      break;
      
    case 'interactions':
      response = formatInteractionsResponse(info);
      break;
      
    case 'dosage':
      response = formatDosageResponse(info);
      break;
      
    case 'usage':
    case 'indications':
      response = formatUsageResponse(info);
      break;
      
    case 'general':
    default:
      response = formatGeneralInfoResponse(info);
  }
  
  return response;
}

/**
 * Format alternatives information
 */
function formatAlternativesResponse(info: MedicationInfo): string {
  if (!info.alternatives || info.alternatives.length === 0) {
    return `I couldn't find any alternatives for ${info.name} with the same active ingredient (${info.activeIngredient || 'unknown'}).`;
  }
  
  let response = `**${info.name}** contains ${info.activeIngredient || info.genericName}.\n\n`;
  
  if (info.description) {
    response += `${info.description}\n\n`;
  }
  
  response += `Here are some alternatives with the same active ingredient:\n\n`;
  
  // Get up to 5 alternatives
  const topAlternatives = info.alternatives.slice(0, 5);
  
  // Sort alternatives by price (cheapest first)
  const sortedAlternatives = [...topAlternatives].sort((a, b) => a.price - b.price);
  
  sortedAlternatives.forEach((alt, index) => {
    const savingsPercent = info.name !== alt.name && alt.price > 0 && info.price > 0
      ? Math.floor(((info.price - alt.price) / info.price) * 100)
      : 0;
      
    const savingsText = savingsPercent > 0 
      ? ` (Save ${savingsPercent}%)`
      : '';
      
    response += `${index + 1}. **${alt.name}** - ₹${alt.price.toFixed(2)}${savingsText}\n`;
    response += `   Manufacturer: ${alt.manufacturer}\n`;
    response += `   ${alt.isGeneric ? 'Generic' : 'Branded'} Medicine\n\n`;
  });
  
  if (info.alternatives.length > 5) {
    response += `\nI found a total of ${info.alternatives.length} alternatives for this medicine.\n\n`;
  }
  
  // Add a summary of potential savings with the cheapest alternative
  if (sortedAlternatives.length > 0) {
    const cheapestAlt = sortedAlternatives[0];
    if (cheapestAlt && cheapestAlt.price < info.price) {
      const savings = info.price - cheapestAlt.price;
      const savingsPercent = (savings / info.price) * 100;
      
      response += `**Potential Savings:** By switching to ${cheapestAlt.name}, you could save ₹${savings.toFixed(2)} (${savingsPercent.toFixed(0)}% less).\n\n`;
    }
  }
  
  response += `Remember, it's important to consult your healthcare provider before making any changes to your medication regimen.`;
  
  return response;
}

/**
 * Format side effects information
 */
function formatSideEffectsResponse(info: MedicationInfo): string {
  let response = `**Side Effects of ${info.name}**\n\n`;
  
  if (!info.sideEffects || info.sideEffects.length === 0) {
    response += `I don't have detailed side effect information for ${info.name}. Please consult your doctor or pharmacist for this information.`;
  } else {
    response += `Common side effects may include:\n\n`;
    info.sideEffects.forEach(effect => {
      response += `- ${effect}\n`;
    });
    
    response += `\nThis is not a complete list of side effects. Please consult your healthcare provider for medical advice about side effects.`;
  }
  
  return response;
}

/**
 * Format interactions information
 */
function formatInteractionsResponse(info: MedicationInfo): string {
  let response = `**Drug Interactions with ${info.name}**\n\n`;
  
  if (!info.interactions || info.interactions.length === 0) {
    response += `I don't have detailed drug interaction information for ${info.name}. Please consult your doctor or pharmacist for this information.`;
  } else {
    response += `${info.name} may interact with the following:\n\n`;
    info.interactions.forEach(interaction => {
      response += `- ${interaction}\n`;
    });
    
    response += `\nThis is not a complete list of interactions. Always inform your doctor about all medications you are taking, including prescription, over-the-counter, and herbal products.`;
  }
  
  return response;
}

/**
 * Format dosage information
 */
function formatDosageResponse(info: MedicationInfo): string {
  let response = `**Dosage Information for ${info.name}**\n\n`;
  
  if (!info.dosage) {
    response += `I don't have specific dosage information for ${info.name}. Always follow your doctor's prescription and the instructions provided with your medication.`;
  } else {
    response += `${info.dosage}\n\n`;
    response += `Remember that dosages may vary based on individual factors like age, weight, medical conditions, and other medications. Always follow your doctor's instructions.`;
  }
  
  return response;
}

/**
 * Format usage/indications information
 */
function formatUsageResponse(info: MedicationInfo): string {
  let response = `**Uses of ${info.name}**\n\n`;
  
  if (!info.usage) {
    response += `I don't have specific information about the uses of ${info.name}. Please consult your doctor or pharmacist for this information.`;
  } else {
    response += `${info.usage}\n\n`;
    response += `${info.name} contains ${info.activeIngredient || info.genericName}`;
    if (info.description) {
      response += ` and ${info.description.toLowerCase()}`;
    }
    response += `.`;
  }
  
  return response;
}

/**
 * Format general information
 */
function formatGeneralInfoResponse(info: MedicationInfo): string {
  let response = `**${info.name}**\n\n`;
  
  if (info.genericName) {
    response += `**Generic Name:** ${info.genericName}\n`;
  }
  
  if (info.activeIngredient) {
    response += `**Active Ingredient:** ${info.activeIngredient}\n`;
  }
  
  if (info.description) {
    response += `\n${info.description}\n`;
  }
  
  if (info.usage) {
    response += `\n**Uses:** ${info.usage}\n`;
  }
  
  if (info.dosage) {
    response += `\n**Typical Dosage:** ${info.dosage}\n`;
  }
  
  if (info.sideEffects && info.sideEffects.length > 0) {
    response += `\n**Common Side Effects:**\n`;
    info.sideEffects.slice(0, 5).forEach(effect => {
      response += `- ${effect}\n`;
    });
    
    if (info.sideEffects.length > 5) {
      response += `- And others...\n`;
    }
  }
  
  response += `\nThis information is for educational purposes only. Always consult with a healthcare professional for medical advice.`;
  
  return response;
}

/**
 * Detect what type of medication query is being asked
 * @param {string} message - User message
 * @returns {Object} - Query type and extracted medicine name
 */
export function detectMedicationQueryType(message: string): { 
  queryType: string; 
  medicineName: string | null;
} {
  const lowerMsg = message.toLowerCase();
  
  // Pattern matching for different query types
  const patterns = [
    {
      type: 'alternatives',
      regex: [
        /(?:alternative|substitute|generic|cheaper)\s+(?:for|to|version of|option for)\s+([a-zA-Z0-9\s]+)/i,
        /(?:find|get|give me)\s+(?:a|an)?\s*(?:alternative|substitute|generic|cheaper)\s+(?:for|to|version of|option for)\s+([a-zA-Z0-9\s]+)/i
      ]
    },
    {
      type: 'side_effects',
      regex: [
        /(?:side effect|adverse effect|reaction).*\s+([a-zA-Z0-9\s]+)/i,
        /([a-zA-Z0-9\s]+).*(?:side effect|adverse effect|reaction)/i
      ]
    },
    {
      type: 'interactions',
      regex: [
        /(?:interact|interaction).*\s+([a-zA-Z0-9\s]+)/i,
        /([a-zA-Z0-9\s]+).*(?:interact|interaction)/i
      ]
    },
    {
      type: 'dosage',
      regex: [
        /(?:dosage|dose|how to take|how much).*\s+([a-zA-Z0-9\s]+)/i,
        /([a-zA-Z0-9\s]+).*(?:dosage|dose|how to take|how much)/i
      ]
    },
    {
      type: 'usage',
      regex: [
        /(?:use|used for|treat|indication).*\s+([a-zA-Z0-9\s]+)/i,
        /([a-zA-Z0-9\s]+).*(?:use|used for|treat|indication)/i,
        /what.*\s+([a-zA-Z0-9\s]+)\s+.*(?:for|treat|do)/i
      ]
    },
    {
      type: 'general',
      regex: [
        /(?:information|info|about|details).*\s+([a-zA-Z0-9\s]+)/i,
        /(?:what is|tell me about)\s+([a-zA-Z0-9\s]+)/i
      ]
    }
  ];
  
  // Check each pattern type
  for (const patternGroup of patterns) {
    for (const pattern of patternGroup.regex) {
      const match = lowerMsg.match(pattern);
      if (match && match[1]) {
        return {
          queryType: patternGroup.type,
          medicineName: match[1].trim()
        };
      }
    }
  }
  
  // Try to detect common Indian medicine brand formats like:
  // - Brand name followed by dosage: "Telma 40" "Ecosprin 75"
  // - Common suffix formats: "-stat", "-pril", "-sartan", "-zole", etc.
  const indianMedicinePattern = /\b((?:[A-Za-z]+(?:-[A-Za-z]+)*)\s*(?:\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|tablet|tab|cap)?))\b/i;
  const indianMatch = indianMedicinePattern.exec(message);
  
  if (indianMatch && indianMatch[1]) {
    return {
      queryType: 'general',
      medicineName: indianMatch[1].trim()
    };
  }
  
  // Default fallback - try to extract just a medicine name
  const medicineNamePattern = /\b([A-Z][a-zA-Z0-9\s-]{2,})\b/g;
  const match = medicineNamePattern.exec(lowerMsg);
  
  if (match && match[1]) {
    return {
      queryType: 'general',
      medicineName: match[1].trim()
    };
  }
  
  return {
    queryType: 'unknown',
    medicineName: null
  };
}