/**
 * Indian Medicine Examples Dataset
 * 
 * This file contains common Indian medicine names, types, and example queries
 * to help train the medication chatbot to better recognize Indian pharmaceutical patterns.
 */

// Common Indian medicine brand names and their generics
export const indianMedicinePairs = [
  // Format: [brandName, genericName, alternativeBrandName, priceRange]
  ["Crocin", "Paracetamol", "Dolo 650", "₹15-30"],
  ["Dolo 650", "Paracetamol", "Crocin", "₹20-35"],
  ["Azithral", "Azithromycin", "Zithromax", "₹60-120"],
  ["Allegra", "Fexofenadine", "Telfast", "₹75-140"],
  ["Amlokind", "Amlodipine", "Amlopress", "₹40-90"],
  ["Ecosprin", "Aspirin", "Delisprin", "₹10-25"],
  ["Pantocid", "Pantoprazole", "Pan 40", "₹65-110"],
  ["Thyronorm", "Levothyroxine", "Eltroxin", "₹70-150"],
  ["Augmentin", "Amoxicillin + Clavulanic Acid", "Moxikind CV", "₹180-260"],
  ["Meftal", "Mefenamic Acid", "Meftal Spas", "₹30-60"],
  ["Telma", "Telmisartan", "Telsar", "₹95-170"],
  ["Glycomet", "Metformin", "Glucophage", "₹25-60"],
  ["Glimestar", "Glimepiride", "Amaryl", "₹50-120"],
  ["Stamlo", "Amlodipine", "Amlogard", "₹45-95"],
  ["Rantac", "Ranitidine", "Zinetac", "₹15-40"],
  ["Combiflam", "Ibuprofen + Paracetamol", "Flexipen", "₹35-70"],
  ["Aciloc", "Ranitidine", "Ranitidine", "₹20-45"],
  ["Cetrizet", "Cetirizine", "Alerid", "₹25-55"],
  ["Montair", "Montelukast", "Montair LC", "₹180-250"],
  ["Shelcal", "Calcium Carbonate + Vitamin D3", "Calcimax", "₹80-140"]
];

// Common Indian medicine query patterns
export const indianMedicineQueries = [
  // Alternative queries
  "Tell me about cheaper alternatives to {medicine}",
  "What are some Jan Aushadhi alternatives to {medicine}?",
  "Generic substitute for {medicine}",
  "Is there a less expensive option than {medicine}?",
  "What is the Jan Aushadhi price for {medicine}?",
  "Compare {medicine} with its generic version",
  "Affordable options similar to {medicine}",
  
  // Side effect queries
  "What are the side effects of {medicine} tablet?",
  "Is {medicine} safe during pregnancy?",
  "Can {medicine} cause drowsiness?",
  "Common side effects of {medicine} 500mg",
  "Does {medicine} have any serious side effects?",
  "Long term side effects of taking {medicine}",
  
  // Dosage queries
  "How to take {medicine} correctly?",
  "What is the proper dosage of {medicine}?",
  "How many times should I take {medicine} in a day?",
  "Can I take {medicine} on an empty stomach?",
  "What is the right time to take {medicine}?",
  "Maximum daily dose of {medicine}",
  
  // Usage queries
  "What is {medicine} used for?",
  "Does {medicine} help with fever?",
  "Can {medicine} treat high blood pressure?",
  "Is {medicine} an antibiotic?",
  "What conditions does {medicine} treat?",
  "Uses of {medicine} tablet",
  
  // Interaction queries
  "Can I take {medicine} with tea?",
  "Does {medicine} interact with alcohol?",
  "Is it safe to take {medicine} with blood pressure medication?",
  "Can I use {medicine} along with Crocin?",
  "Drug interactions with {medicine}",
  "What should I avoid while taking {medicine}?"
];

// Common Indian pharmaceutical terms and phrases
export const indianPharmaTerms = [
  "Jan Aushadhi store",
  "Branded medicine",
  "Generic medicine",
  "Medical shop",
  "Chemist shop",
  "Salt name",
  "Medicine composition",
  "Tab",
  "Capsule",
  "Syrup",
  "Injection",
  "Strip",
  "MRP",
  "Pharma company",
  "Allopathic medicine",
  "Ayurvedic alternative",
  "DPCO price",
  "NPPA regulated",
  "With or without food",
  "Before meal",
  "After meal"
];

// Generate example queries with medicine names
export function generateMedicineQueries() {
  const examples: string[] = [];
  
  // Generate 5 random examples for testing and debugging
  for (let i = 0; i < 5; i++) {
    // Pick a random medicine pair
    const medicineIndex = Math.floor(Math.random() * indianMedicinePairs.length);
    const medicinePair = indianMedicinePairs[medicineIndex];
    
    // Pick a random query pattern
    const queryIndex = Math.floor(Math.random() * indianMedicineQueries.length);
    const queryPattern = indianMedicineQueries[queryIndex];
    
    // Create the query by replacing {medicine} with a brand name
    const query = queryPattern.replace('{medicine}', medicinePair[0]);
    examples.push(query);
  }
  
  return examples;
}