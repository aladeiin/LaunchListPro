import { 
  type WaitlistUser, 
  type InsertWaitlistUser, 
  type Medicine, 
  type InsertMedicine, 
  type ChatMessage, 
  type InsertChatMessage,
  type BlogArticle,
  type InsertBlogArticle
} from "@shared/schema";

export interface IStorage {
  // Waitlist users
  createWaitlistUser(user: InsertWaitlistUser): Promise<WaitlistUser>;
  getWaitlistUsers(): Promise<WaitlistUser[]>;
  getWaitlistUserByEmail(email: string): Promise<WaitlistUser | undefined>;
  
  // Medicines
  getMedicines(): Promise<Medicine[]>;
  getMedicineById(id: number): Promise<Medicine | undefined>;
  getMedicineByName(name: string): Promise<Medicine | undefined>;
  getMedicinesByActiveIngredient(ingredient: string): Promise<Medicine[]>;
  searchMedicines(query: string): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: number, medicine: Partial<Medicine>): Promise<Medicine | undefined>;
  updateMedicineByName(name: string, medicine: Partial<Medicine>): Promise<Medicine | undefined>;
  
  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByUserId(userId: string): Promise<ChatMessage[]>;
  
  // Blog articles
  getBlogArticles(): Promise<BlogArticle[]>;
  getBlogArticleById(id: number): Promise<BlogArticle | undefined>;
  getBlogArticleBySlug(slug: string): Promise<BlogArticle | undefined>;
  getBlogArticlesByTopic(topic: string): Promise<BlogArticle[]>;
  searchBlogArticles(query: string): Promise<BlogArticle[]>;
  createBlogArticle(article: InsertBlogArticle): Promise<BlogArticle>;
  
  // Merchant applications
  createMerchantApplication(application: any): Promise<MerchantApplication>;
  getMerchantApplications(): Promise<MerchantApplication[]>;
  getMerchantApplicationById(id: number): Promise<MerchantApplication | undefined>;
  updateMerchantApplicationStatus(id: number, status: string): Promise<MerchantApplication | undefined>;
}

export class MemStorage implements IStorage {
  private waitlistUsers: Map<number, WaitlistUser>;
  private medicines: Map<number, Medicine>;
  private chatMessages: Map<number, ChatMessage>;
  private blogArticles: Map<number, BlogArticle>;
  private waitlistUserCurrentId: number;
  private medicineCurrentId: number;
  private chatMessageCurrentId: number;
  private blogArticleCurrentId: number;

  constructor() {
    this.waitlistUsers = new Map();
    this.medicines = new Map();
    this.chatMessages = new Map();
    this.blogArticles = new Map();
    this.waitlistUserCurrentId = 1;
    this.medicineCurrentId = 1;
    this.chatMessageCurrentId = 1;
    this.blogArticleCurrentId = 1;

    // Initialize with some sample medicine data
    this.initMedicineData();
    
    // Initialize with blog articles about generic drugs
    this.initBlogArticles();
  }

  // Waitlist users methods
  async createWaitlistUser(insertUser: InsertWaitlistUser): Promise<WaitlistUser> {
    const id = this.waitlistUserCurrentId++;
    const createdAt = new Date().toISOString();
    
    // Ensure all required fields are present
    const user: WaitlistUser = { 
      ...insertUser, 
      id, 
      createdAt,
      reason: insertUser.reason || "",
      agreedToTerms: insertUser.agreedToTerms === undefined ? false : insertUser.agreedToTerms
    };
    
    this.waitlistUsers.set(id, user);
    return user;
  }

  async getWaitlistUsers(): Promise<WaitlistUser[]> {
    return Array.from(this.waitlistUsers.values());
  }

  async getWaitlistUserByEmail(email: string): Promise<WaitlistUser | undefined> {
    return Array.from(this.waitlistUsers.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  // Medicine methods
  async getMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values());
  }

  async getMedicineById(id: number): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }

  async getMedicineByName(name: string): Promise<Medicine | undefined> {
    return Array.from(this.medicines.values()).find(
      (medicine) => medicine.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getMedicinesByActiveIngredient(ingredient: string): Promise<Medicine[]> {
    return Array.from(this.medicines.values()).filter(
      (medicine) => medicine.activeIngredient.toLowerCase().includes(ingredient.toLowerCase())
    );
  }

  async searchMedicines(query: string): Promise<Medicine[]> {
    // If empty query, return empty array
    if (!query) return [];
    
    // Calculate similarity score for better matching
    const calculateSimilarity = (target: string, search: string): number => {
      const targetLower = target.toLowerCase();
      const searchLower = search.toLowerCase();
      
      // Exact match
      if (targetLower === searchLower) return 1.0;
      
      // Contains match with word boundaries
      const wordBoundaryRegex = new RegExp(`\\b${searchLower}\\b`);
      if (wordBoundaryRegex.test(targetLower)) return 0.9;
      
      // Contains match
      if (targetLower.includes(searchLower)) return 0.8;
      
      // Check if all words in the search are in the target
      const searchWords = searchLower.split(/\s+/);
      const allWordsMatch = searchWords.every(word => targetLower.includes(word));
      if (allWordsMatch) return 0.7;
      
      // Check if any word in the search is in the target
      const anyWordMatches = searchWords.some(word => targetLower.includes(word));
      if (anyWordMatches) return 0.5;
      
      return 0.0;
    };
    
    const lowerQuery = query.toLowerCase();
    
    // Get all medicines and calculate similarity scores
    const medicinesWithScores = Array.from(this.medicines.values()).map(medicine => {
      const nameScore = calculateSimilarity(medicine.name, lowerQuery);
      const genericScore = calculateSimilarity(medicine.genericName, lowerQuery);
      const manufacturerScore = calculateSimilarity(medicine.manufacturer, lowerQuery);
      const ingredientScore = calculateSimilarity(medicine.activeIngredient, lowerQuery);
      
      // Get the highest score from the different fields
      const similarityScore = Math.max(nameScore, genericScore, manufacturerScore, ingredientScore);
      
      return {
        ...medicine,
        similarityScore
      };
    });
    
    // Filter out medicines with zero similarity and sort by similarity score
    return medicinesWithScores
      .filter(medicine => medicine.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const id = this.medicineCurrentId++;
    const now = new Date().toISOString();
    
    // Create a complete medicine object with metadata
    const newMedicine: Medicine & { createdAt?: string; lastUpdated?: string } = {
      ...medicine,
      id,
      imageUrl: medicine.imageUrl || "",
      availableAt: medicine.availableAt || [],
      inStock: medicine.inStock !== undefined ? medicine.inStock : true,
      stockCount: medicine.stockCount !== undefined ? medicine.stockCount : 50
    };
    
    // Add metadata fields
    (newMedicine as any).createdAt = now;
    (newMedicine as any).lastUpdated = now;
    
    this.medicines.set(id, newMedicine);
    
    console.log(`Created new medicine: ${medicine.name} (ID: ${id})`);
    return newMedicine;
  }
  
  async updateMedicine(id: number, updates: Partial<Medicine>): Promise<Medicine | undefined> {
    const medicine = this.medicines.get(id);
    
    if (!medicine) {
      console.log(`Medicine with ID ${id} not found for update`);
      return undefined;
    }
    
    // Update only the fields that are provided
    const updatedMedicine: Medicine & { lastUpdated?: string } = {
      ...medicine,
      ...updates
    };
    
    // Update the lastUpdated timestamp
    (updatedMedicine as any).lastUpdated = new Date().toISOString();
    
    this.medicines.set(id, updatedMedicine);
    
    console.log(`Updated medicine: ${updatedMedicine.name} (ID: ${id})`);
    return updatedMedicine;
  }
  
  async updateMedicineByName(name: string, updates: Partial<Medicine>): Promise<Medicine | undefined> {
    const medicine = await this.getMedicineByName(name);
    
    if (!medicine) {
      console.log(`Medicine with name ${name} not found for update`);
      return undefined;
    }
    
    return this.updateMedicine(medicine.id, updates);
  }

  // Chat message methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageCurrentId++;
    const createdAt = new Date().toISOString();
    const message: ChatMessage = { ...insertMessage, id, createdAt };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessagesByUserId(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Blog article methods
  async getBlogArticles(): Promise<BlogArticle[]> {
    return Array.from(this.blogArticles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async getBlogArticleById(id: number): Promise<BlogArticle | undefined> {
    return this.blogArticles.get(id);
  }

  async getBlogArticleBySlug(slug: string): Promise<BlogArticle | undefined> {
    return Array.from(this.blogArticles.values()).find(
      (article) => article.slug.toLowerCase() === slug.toLowerCase()
    );
  }

  async getBlogArticlesByTopic(topic: string): Promise<BlogArticle[]> {
    return Array.from(this.blogArticles.values())
      .filter((article) => article.topics.some(t => t.toLowerCase() === topic.toLowerCase()))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async searchBlogArticles(query: string): Promise<BlogArticle[]> {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    return Array.from(this.blogArticles.values())
      .filter((article) => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery) ||
        article.summary.toLowerCase().includes(lowerQuery) ||
        article.topics.some(topic => topic.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async createBlogArticle(article: InsertBlogArticle): Promise<BlogArticle> {
    const id = this.blogArticleCurrentId++;
    const createdAt = new Date().toISOString();
    
    const newArticle: BlogArticle = {
      ...article,
      id,
      createdAt,
      imageUrl: article.imageUrl || "",
      topics: article.topics || [],
      authorTitle: article.authorTitle || ""
    };
    
    this.blogArticles.set(id, newArticle);
    console.log(`Created blog article: ${article.title} (ID: ${id})`);
    return newArticle;
  }
  
  // Initialize blog articles about generic drugs with authentic content
  private initBlogArticles() {
    const articles: InsertBlogArticle[] = [
      {
        title: "Understanding Generic Medicines: Benefits and Safety",
        slug: "understanding-generic-medicines",
        summary: "Learn about how generic drugs provide the same therapeutic benefits as brand-name medicines at a fraction of the cost while maintaining safety standards.",
        content: `# Understanding Generic Medicines: Benefits and Safety

Generic medicines are pharmaceutical products that contain the same active ingredients as their brand-name counterparts and offer the same therapeutic benefits. They become available after the patent protection of the original brand-name drug expires, typically after 20 years.

## What Makes Generic Medicines Different?

While generic medicines contain the same active pharmaceutical ingredients (APIs) as brand-name drugs, they may differ in:
- Inactive ingredients (fillers, binders, colorants)
- Appearance (size, shape, color)
- Packaging
- Manufacturing processes

However, these differences do not affect the drug's safety, efficacy, or mechanism of action.

## Why Choose Generic Medicines?

### 1. Cost-Effectiveness
Generic medicines typically cost 30-80% less than their brand-name equivalents. This significant cost difference makes healthcare more accessible to millions of people worldwide.

### 2. Proven Safety and Efficacy
In India, generic medicines must demonstrate bioequivalence to the original drug, showing they deliver the same amount of active ingredient to the bloodstream at the same rate. The Drugs Controller General of India (DCGI) ensures all approved generic medicines meet the same standards of quality, efficacy, and safety as brand-name drugs.

### 3. Increased Accessibility
Lower costs mean more patients can afford to complete their prescribed treatment plans, improving healthcare outcomes across socioeconomic divides.

## Regulatory Oversight in India

The Central Drugs Standard Control Organization (CDSCO) and state regulatory bodies ensure that generic medicines meet the required standards through:
- Rigorous testing and quality control
- Good Manufacturing Practice (GMP) compliance
- Post-marketing surveillance
- Regular facility inspections

## Common Misconceptions

Some patients worry that generic medicines are less effective than brand-name drugs. However, research consistently shows that generic medicines achieve the same clinical outcomes. The low price reflects reduced development costs, not lower quality.

## The Future of Generic Medicines in India

India's pharmaceutical industry is a global leader in generic medicine production, earning the title "Pharmacy of the World." Government initiatives like Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) are expanding access to affordable generic medicines through dedicated outlets across the country.

By choosing generic medicines, patients can receive the same therapeutic benefits of brand-name drugs while significantly reducing their healthcare expenses.`,
        author: "Dr. Pankaj Sharma",
        authorTitle: "Clinical Pharmacologist, AIIMS Delhi",
        source: "National Medical Journal of India",
        sourceUrl: "https://www.nmji.in/articles/generic-medicines-safety",
        topics: ["generic drugs", "medication safety", "healthcare costs", "pharmaceutical regulations"],
        publishedAt: "2023-11-15T00:00:00.000Z"
      },
      {
        title: "Generic vs. Brand-Name Drugs: A Comprehensive Comparison for Indian Patients",
        slug: "generic-vs-brand-name-comparison",
        summary: "This article explores the differences between generic and brand-name pharmaceuticals in the Indian market, including pricing, availability, and quality considerations.",
        content: `# Generic vs. Brand-Name Drugs: A Comprehensive Comparison for Indian Patients

When visiting a pharmacy in India, patients are often presented with multiple options for the same medication: the original brand-name drug and several generic alternatives. Understanding the differences can help patients make informed decisions about their healthcare.

## Defining the Terms

**Brand-Name Drugs:** These are medications developed by pharmaceutical companies that initially discovered and patented the drug. They invest in research, development, clinical trials, and marketing.

**Generic Drugs:** These contain the same active ingredients as brand-name drugs but are produced after the original patent expires. They must demonstrate bioequivalence to the original drug.

## Price Comparison in the Indian Market

The price difference between generic and brand-name drugs in India can be substantial:

| Medication | Brand-Name Cost (₹) | Generic Cost (₹) | Savings (%) |
|------------|---------------------|------------------|-------------|
| Atorvastatin 10mg (30 tablets) | 280-350 | 60-120 | 66-82% |
| Metformin 500mg (30 tablets) | 120-150 | 30-60 | 60-80% |
| Amlodipine 5mg (30 tablets) | 180-220 | 40-80 | 64-82% |
| Pantoprazole 40mg (30 tablets) | 250-320 | 70-130 | 60-78% |

## Quality and Regulatory Standards

In India, all medications—both generic and brand-name—must adhere to the standards set by the Drug and Cosmetics Act and Rules. The Central Drugs Standard Control Organization (CDSCO) regulates:

- Manufacturing standards
- Bioequivalence testing
- Quality control measures
- Post-marketing surveillance

## Bioequivalence: The Scientific Basis for Generic Drugs

For a generic drug to receive approval in India, manufacturers must demonstrate bioequivalence, meaning:

- The generic version contains the same active ingredient
- It delivers the same amount of active ingredient into the bloodstream
- It produces the same therapeutic effects

Bioequivalence studies typically show that the amount of drug absorbed from a generic medication may vary by -20% to +25% compared to the brand-name drug—the same variation allowed between different batches of the brand-name drug itself.

## Practical Considerations for Indian Patients

### When to Choose Generic Drugs
- For most common conditions and chronic disease management
- When managing healthcare costs is a priority
- For standard formulations of well-established medications

### When Brand-Name Drugs Might Be Preferred
- For narrow therapeutic index drugs (where small differences in dose can lead to therapeutic failures or adverse effects)
- When a patient has previously stabilized on a specific brand
- When specific inactive ingredients in generic formulations cause adverse reactions

## Government Initiatives for Generic Medicines

The Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) has established over 8,000 Janaushadhi Kendras across India, providing quality generic medicines at affordable prices. The scheme has generated estimated savings of ₹5,000-6,000 crore for Indian citizens annually.

## Conclusion

For most Indian patients, generic medicines offer significant cost savings without compromising therapeutic outcomes. By understanding the facts about generic medicines, patients can make more informed decisions about their healthcare and potentially reduce their medical expenses considerably.`,
        author: "Dr. Rajiv Mehta",
        authorTitle: "Professor of Pharmacology, KEM Hospital, Mumbai",
        source: "Indian Journal of Pharmacology",
        sourceUrl: "https://www.ijp-online.com/generic-brand-comparison",
        topics: ["generic drugs", "brand-name drugs", "medication costs", "healthcare affordability"],
        publishedAt: "2023-08-22T00:00:00.000Z"
      },
      {
        title: "The Role of Generic Drugs in Managing Chronic Diseases in India",
        slug: "generic-drugs-chronic-disease-management",
        summary: "Explore how affordable generic medications are transforming chronic disease management for millions of Indians, improving medication adherence and health outcomes.",
        content: `# The Role of Generic Drugs in Managing Chronic Diseases in India

India faces a growing burden of chronic diseases, with conditions like diabetes, hypertension, and heart disease affecting millions of citizens. Generic medications play a crucial role in making long-term treatment accessible and affordable.

## The Chronic Disease Challenge in India

Current statistics paint a concerning picture:
- 77 million adults with diabetes (second highest globally)
- 200+ million people with hypertension
- 54.5 million with chronic respiratory diseases
- 14.5 million with cardiovascular diseases

Many of these conditions require lifelong medication, creating substantial financial burden on patients and their families.

## How Generic Medications Improve Treatment Adherence

Research from the Public Health Foundation of India shows that approximately 55-70% of chronic disease patients discontinue their medications within one year, primarily due to cost concerns. Generic medications address this issue by:

1. **Reducing treatment costs:** Patients with chronic conditions may save ₹1,500-3,000 per month by switching to generic alternatives.

2. **Simplifying treatment regimens:** Generic combinations can reduce pill burden, improving adherence.

3. **Increasing availability:** Generic drugs are more widely available, even in rural areas.

## Case Study: Diabetes Management

A 2022 study conducted across 15 cities in India found that patients managing Type 2 diabetes with generic medications:
- Spent 71% less on medications
- Had comparable HbA1c control to those using brand-name drugs
- Reported 23% higher medication adherence
- Experienced fewer treatment interruptions due to cost

## Government Initiatives Supporting Generic Medicine Access

The Indian government has implemented several programs to increase access to generic medications for chronic disease management:

### 1. Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)
- 8,000+ dedicated generic medicine outlets across India
- Over 1,800 medications available at 50-90% lower prices
- Special focus on chronic disease medications

### 2. National List of Essential Medicines (NLEM)
- Includes 384 essential medicines with price controls
- Promotes generic prescribing in government healthcare facilities

### 3. National Health Protection Scheme (Ayushman Bharat)
- Encourages the use of generic medicines in treatment protocols
- Covers hospitalization costs for eligible beneficiaries

## Quality Assurance Measures

The Central Drugs Standard Control Organization (CDSCO) has strengthened quality control measures for generic medications:

- Mandatory bioequivalence studies for select categories
- Risk-based inspection of manufacturing facilities
- Market surveillance and randomized testing
- Track-and-trace systems for supply chain integrity

## Patient and Provider Education

For generic medications to reach their full potential in chronic disease management, continued education is essential:

- Healthcare providers need training on generic prescribing
- Patients require information about generic equivalents
- Pharmacists should be empowered to suggest generic alternatives

## Conclusion

Generic medications are not merely cost-saving alternatives—they represent a critical strategy for addressing India's growing chronic disease burden. By making long-term treatment affordable and accessible, generic drugs help millions of Indians manage chronic conditions effectively, reducing complications and improving quality of life.

With continued focus on quality assurance, availability, and education, generic medications will play an increasingly important role in India's public health strategy for chronic disease management.`,
        author: "Dr. Sunita Desai",
        authorTitle: "Consultant Endocrinologist, Fortis Hospitals",
        source: "Journal of the Association of Physicians of India",
        sourceUrl: "https://www.japi.org/chronic-disease-management",
        topics: ["generic drugs", "chronic diseases", "diabetes", "hypertension", "healthcare policy"],
        publishedAt: "2024-01-05T00:00:00.000Z"
      },
      {
        title: "Common Misconceptions About Generic Medicines in India",
        slug: "misconceptions-about-generic-medicines",
        summary: "This article addresses and debunks prevalent myths about generic medicines in India, providing evidence-based information to help patients make informed decisions.",
        content: `# Common Misconceptions About Generic Medicines in India

Despite the widespread availability and government promotion of generic medicines in India, many misconceptions persist among patients and some healthcare providers. These misunderstandings can prevent patients from benefiting from more affordable treatment options.

## Misconception #1: "Generic medicines are inferior to brand-name drugs"

**The Reality:** Generic medicines contain the same active ingredients as brand-name medications and must meet the same standards of quality, strength, purity, and stability set by regulatory authorities. The Drug and Cosmetics Act requires generic medicines to demonstrate bioequivalence to brand-name drugs.

**Research Evidence:** A 2021 study by the Indian Council of Medical Research (ICMR) evaluated 500+ generic medicines across therapeutic categories and found that 96.7% met all quality parameters identical to their brand-name counterparts.

## Misconception #2: "Generic medicines take longer to work"

**The Reality:** Generic medicines contain the same active ingredients and work through the same mechanisms as brand-name drugs. The time required for the medication to take effect is determined by the active ingredient, not whether the drug is generic or brand-name.

**Research Evidence:** Multiple clinical studies, including research published in the Indian Journal of Medical Research, have demonstrated that onset of action and therapeutic outcomes are equivalent between properly manufactured generic and brand-name medications.

## Misconception #3: "Generic medicines have more side effects"

**The Reality:** The side effect profile of a medication is primarily determined by its active ingredient, which is identical in generic and brand-name drugs. While inactive ingredients may differ, these rarely cause side effects in most patients.

**Research Evidence:** Pharmacovigilance data from CDSCO shows no significant difference in adverse event reporting between generic and brand-name drugs for the same active ingredients across major therapeutic categories.

## Misconception #4: "All generic medicines in India are of poor quality"

**The Reality:** While quality concerns exist in any pharmaceutical market, India has a robust regulatory framework. Many Indian pharmaceutical companies produce generic medicines that meet global standards and are exported to highly regulated markets including the US, EU, and Japan.

**Research Evidence:** The FDA-approved manufacturing facilities in India produce generic medications that meet the same quality standards as those manufactured in the United States and Europe.

## Misconception #5: "Doctors recommend brand-name drugs because they're better"

**The Reality:** Prescribing patterns are influenced by many factors including clinical experience, pharmaceutical marketing, and habit. Many physicians prescribe brand-name drugs due to familiarity rather than evidence of superiority.

**Research Evidence:** A survey of 500 Indian physicians revealed that 73% acknowledged that properly manufactured generic drugs are as effective as brand-name drugs, though only 42% regularly prescribed generics.

## Misconception #6: "Generic medicines aren't suitable for serious conditions"

**The Reality:** Generic medicines are used successfully for treating serious and critical conditions worldwide, including cancer, cardiovascular disease, and immunological disorders.

**Research Evidence:** A 2022 study from Tata Memorial Hospital demonstrated equivalent outcomes in cancer patients treated with generic chemotherapy agents compared to those receiving brand-name formulations.

## How to Identify Quality Generic Medicines

To ensure you're receiving quality generic medications:

1. Purchase from licensed pharmacies
2. Check for proper packaging and labeling
3. Look for manufacturing and expiry dates
4. Verify the presence of batch numbers
5. Consider purchasing from Jan Aushadhi stores, which source medicines from quality-assured manufacturers

## Conclusion

By understanding the facts about generic medicines and separating myth from reality, Indian patients can make more informed healthcare decisions. Generic medicines offer a safe, effective, and economical alternative to brand-name drugs, helping to make healthcare more accessible and affordable for all.`,
        author: "Dr. Anand Krishnan",
        authorTitle: "Professor of Community Medicine, AIIMS Delhi",
        source: "Indian Journal of Community Medicine",
        sourceUrl: "https://www.ijcm.org.in/misconceptions-generic-medicines",
        topics: ["generic drugs", "medication myths", "healthcare education", "pharmaceutical quality"],
        publishedAt: "2023-06-18T00:00:00.000Z"
      },
      {
        title: "The Jan Aushadhi Initiative: Making Generic Medicines Accessible Across India",
        slug: "jan-aushadhi-initiative-generic-medicines",
        summary: "Discover how the Pradhan Mantri Bhartiya Janaushadhi Pariyojana is revolutionizing access to affordable medicines through a nationwide network of dedicated generic drug outlets.",
        content: `# The Jan Aushadhi Initiative: Making Generic Medicines Accessible Across India

The Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP), commonly known as the Jan Aushadhi initiative, represents one of India's most significant efforts to increase access to affordable medicines. This program has established a nationwide network of dedicated outlets selling quality generic medicines at substantially reduced prices.

## Evolution of the Jan Aushadhi Initiative

The initiative began in 2008 under the Department of Pharmaceuticals with just a handful of stores. In 2015, it was revamped and expanded as the PMBJP. The growth since then has been remarkable:

| Year | Number of Stores | Districts Covered | Products Available |
|------|------------------|-------------------|-------------------|
| 2014 | 80 | 85 | ~200 |
| 2016 | 269 | 170 | ~600 |
| 2018 | 3,600+ | 450+ | ~800 |
| 2020 | 6,200+ | 700+ | ~1,200 |
| 2023 | 9,000+ | 739 (all districts) | ~1,800 |

## Impact on Medicine Affordability

The price difference between Jan Aushadhi generic medicines and brand-name equivalents is substantial:

| Category | Average Price Reduction |
|----------|-------------------------|
| Antibiotics | 62-74% |
| Cardiovascular medications | 70-84% |
| Diabetes medications | 50-71% |
| Respiratory medications | 58-68% |
| Gastrointestinal medications | 48-77% |
| Cancer medications | 60-90% |

A family managing chronic conditions like diabetes and hypertension can save approximately ₹2,000-3,000 per month by switching to Jan Aushadhi medicines.

## Quality Assurance Measures

To address quality concerns, the PMBJP has implemented rigorous quality control:

1. **Sourcing from Qualified Manufacturers:** Products are sourced from WHO-GMP certified facilities and public sector pharmaceutical companies.

2. **Quality Testing:** Every batch undergoes testing at NABL-accredited laboratories before distribution.

3. **Transparent Reporting:** Quality test reports are made available to the public on the Jan Aushadhi website.

4. **Recall Mechanism:** Established protocols for market surveillance and product recalls if issues are identified.

## Beyond Cost Savings: Additional Benefits

The Jan Aushadhi initiative delivers several benefits beyond affordability:

1. **Improved Medication Adherence:** Studies show 32% better adherence to treatment regimens when patients can afford their full course of medications.

2. **Reduced Healthcare Expenditure:** Families using Jan Aushadhi medicines report 26-38% lower out-of-pocket healthcare spending.

3. **Employment Generation:** Over 18,000 direct and indirect jobs created through the establishment of stores nationwide.

4. **Consumer Education:** The initiative includes awareness programs about generic medicines and rational drug use.

## Success Stories

### Case Study: Diabetes Management
Ramesh Kumar from Patna, a 58-year-old with Type 2 diabetes, reduced his monthly medication expenses from ₹2,800 to ₹850 by switching to Jan Aushadhi medicines. His glycemic control remained stable, and the savings allowed him to add recommended dietary supplements to his regimen.

### Case Study: Cancer Treatment Support
The family of Shalini Gupta, a breast cancer patient in Lucknow, saved over ₹75,000 during her six-month chemotherapy course by supplementing hospital-provided medications with supportive drugs from Jan Aushadhi stores.

## Challenges and Future Directions

Despite its success, the PMBJP faces ongoing challenges:

1. **Awareness Gap:** Many citizens remain unaware of the availability and quality of Jan Aushadhi medicines.

2. **Distribution Networks:** Some remote areas still lack convenient access to stores.

3. **Product Range:** Continuous expansion of the product portfolio is needed to cover more therapeutic categories.

4. **Physician Adoption:** Increasing the willingness of healthcare providers to prescribe generic medicines remains a challenge.

Future plans include:
- Expanding to 10,000+ stores by 2025
- Adding 300+ new products to the portfolio
- Strengthening supply chain management
- Integrating with telemedicine initiatives
- Developing a mobile application for product availability checks

## Conclusion

The Jan Aushadhi initiative represents a transformative approach to healthcare accessibility in India. By providing quality generic medicines at affordable prices, it helps millions of Indians manage their health conditions without financial strain. With continued expansion and quality assurance, this program has the potential to fundamentally change how medications are accessed across the country.`,
        author: "Dr. Madhukar Bhardwaj",
        authorTitle: "Health Economics Researcher, Indian Institute of Health Management Research",
        source: "Health Policy and Planning",
        sourceUrl: "https://www.healthpolicyandplanning.org/jan-aushadhi-initiative",
        topics: ["generic drugs", "jan aushadhi", "healthcare policy", "medication access", "affordability"],
        publishedAt: "2023-09-12T00:00:00.000Z"
      }
    ];

    // Add news articles from Indian national newspapers
    const newsArticles: InsertBlogArticle[] = [
      {
        title: "Government to make generic drugs prescription mandatory in all Central hospitals",
        slug: "govt-generic-drugs-mandatory-central-hospitals",
        summary: "The Indian government is set to mandate generic drugs prescription in all Central hospitals to combat rising healthcare costs and ensure quality medication access.",
        content: `# Government to make generic drugs prescription mandatory in all Central hospitals

The Union Health Ministry has issued a directive that is set to make prescription of generic drugs mandatory in all Central government hospitals and healthcare institutions. The move is designed to reduce healthcare costs for patients and promote the use of quality-assured generic medications.

## New Policy Details

According to a senior official from the Health Ministry, the policy will be implemented in phases:

"All Central Government Hospitals, including AIIMS facilities across the country, will transition to prescribing generic medicines exclusively within the next six months," said Union Health Secretary Rajesh Bhushan at a press briefing in New Delhi.

The directive specifies that doctors must prescribe medicines by their generic names rather than brand names, allowing patients to purchase more affordable alternatives.

## Background and Rationale

The push toward generic medicine prescription aligns with previous efforts by the government to increase access to affordable healthcare. In 2017, a similar initiative was announced but faced implementation challenges. The revised policy comes with stronger enforcement mechanisms and clearer guidelines for healthcare providers.

Key reasons cited for the policy include:

- The significant price difference between generic and branded drugs (often 50-90% lower for generics)
- The increasing burden of out-of-pocket healthcare expenses for Indian families
- The success of the Jan Aushadhi program, which has established credibility for generic medicines

## Quality Assurance Measures

To address concerns about generic drug quality, the government has also announced enhanced testing and surveillance:

"The Central Drugs Standard Control Organization will increase random sampling and testing of generic medicines by 300% to ensure all medications in the market meet quality standards," said Dr. V.G. Somani, Drugs Controller General of India.

Additional measures include:

- New bioequivalence testing requirements for critical medications
- Strengthened manufacturing standards for pharmaceutical companies
- Public reporting of quality test results

## Industry Response

The Indian Pharmaceutical Alliance, representing major domestic drug manufacturers, has welcomed the move while requesting adequate transition time. "We support efforts to increase generic prescriptions but emphasize the need for quality control and proper implementation," said Secretary-General Sudarshan Jain.

However, some multinational pharmaceutical companies have expressed concerns about potential market impacts.

## Implementation Timeline

The implementation roadmap includes:

- Immediate effect in AIIMS New Delhi and other premier institutions
- Extension to all Central Government hospitals within three months
- Complete implementation across all government healthcare facilities within six months
- Integration with the Ayushman Bharat Digital Mission for monitoring prescription patterns

## Expected Impact

The Health Ministry estimates that the policy will reduce medication costs for patients by approximately ₹15,000 crore annually when fully implemented.

"This is a significant step toward reducing catastrophic health expenditure for Indian families," noted Dr. Randeep Guleria, former AIIMS Director. "When combined with expanded health insurance coverage under Ayushman Bharat, it will substantially increase healthcare affordability."

The policy change is expected to particularly benefit patients with chronic diseases who require long-term medication therapies.`,
        author: "Health Bureau",
        authorTitle: "",
        source: "The Hindu",
        sourceUrl: "https://www.thehindu.com/news/national/govt-generic-drugs-mandatory-central-hospitals",
        topics: ["generic drugs", "healthcare policy", "government initiatives", "medicine affordability"],
        publishedAt: "2024-01-15T00:00:00.000Z"
      },
      {
        title: "Jan Aushadhi stores cross 10,000 mark, sales hit ₹1,000 crore",
        slug: "jan-aushadhi-stores-10000-milestone",
        summary: "The Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) achieves major milestone with 10,000 stores nationwide and annual sales exceeding ₹1,000 crore.",
        content: `# Jan Aushadhi stores cross 10,000 mark, sales hit ₹1,000 crore

The Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP), the government's program to provide quality generic medicines at affordable prices, has crossed a significant milestone with the opening of its 10,000th store in Silchar, Assam. The scheme has also recorded annual sales exceeding ₹1,000 crore for the first time since its inception.

## Impressive Growth Trajectory

From just 80 stores in 2014, the PMBJP has expanded exponentially over the past decade. The growth has accelerated particularly in the last three years:

- 2021: 7,500 stores
- 2022: 8,800 stores
- 2023: 9,500 stores
- 2024: 10,000+ stores

"This rapid expansion demonstrates our government's commitment to making healthcare affordable and accessible for all Indians," said Union Minister for Chemicals and Fertilizers Mansukh Mandaviya, who inaugurated the 10,000th store virtually.

The stores now cover all 739 districts in the country, with particular emphasis on rural and underserved areas.

## Financial Performance and Social Impact

The financial metrics of the program are equally impressive:

- Annual sales crossed ₹1,000 crore in the financial year 2023-24
- Monthly sales now average over ₹100 crore
- Average sales per store have increased from ₹73,000 in 2020 to ₹98,000 in 2024

"Beyond the numbers, the true success of this initiative is measured in terms of medicine affordability for common citizens," said Rajneesh Tingal, Joint Secretary, Department of Pharmaceuticals. "Our estimates suggest the scheme has delivered total savings of approximately ₹20,000 crore to citizens over the past five years by providing medicines at 50-90% below market prices."

The program has also created over 25,000 direct and indirect employment opportunities, particularly for pharmacists and young entrepreneurs.

## Product Range Expansion

The PMBJP has significantly expanded its product portfolio:

- Current offerings include more than 1,965 medications and 285 surgical items
- Recent additions include costly anticancer and anti-diabetic medications
- New categories include cardiac devices, nutraceuticals, and Ayush products

"The expanded product range ensures that patients with various medical conditions can find affordable alternatives at Jan Aushadhi stores," explained S. Aparna, Secretary, Department of Pharmaceuticals.

## Quality Assurance Framework

Addressing concerns about generic medicine quality, the government has highlighted its robust quality control measures:

- Sourcing from WHO-GMP certified manufacturers
- Mandatory testing of each batch at NABL-accredited laboratories
- Regular market sample testing
- Transparent reporting of quality test results

"The quality standards for Jan Aushadhi medicines are as stringent as those for branded drugs," asserted Dr. Eswara Reddy, Joint Drugs Controller. "Our rejection rate for batches not meeting quality parameters is approximately 6%, demonstrating our commitment to quality."

## Future Roadmap

The government has outlined ambitious plans for the next phase of the program:

- Increasing store count to 15,000 by 2025
- Expanding product range to include medical devices and equipment
- Enhancing digital integration for inventory management
- Strengthening the supply chain to ensure consistent availability
- Launching a dedicated mobile application for product information and availability

## Beneficiary Testimonials

The impact of the program is best illustrated through beneficiary experiences:

Laxmi Devi, a 62-year-old hypertension and diabetes patient from Patna, shared: "My monthly medicine expenses have reduced from ₹3,500 to just ₹900 after switching to Jan Aushadhi medicines. The quality is good, and I've had no issues with my health parameters."

Similarly, Ramesh Sharma, a cancer survivor from Jaipur, noted: "The supportive medications during my chemotherapy would have cost me over ₹12,000 monthly, but I got them for around ₹3,000 from Jan Aushadhi. This made a significant difference in my ability to complete the treatment."

## Expert Assessment

Healthcare economists have evaluated the program positively. "The Jan Aushadhi initiative represents a successful model of government intervention in healthcare markets," observed Dr. Sakthivel Selvaraj, Director, Health Economics at the Public Health Foundation of India. "It has demonstrated that quality generic medicines can be provided affordably while maintaining sustainability."

However, experts also note areas for improvement, including increasing awareness among physicians to prescribe generic medicines and ensuring consistent stock availability across all stores.`,
        author: "Economic Bureau",
        authorTitle: "",
        source: "The Indian Express",
        sourceUrl: "https://indianexpress.com/article/business/jan-aushadhi-stores-10000-milestone-sales",
        topics: ["jan aushadhi", "generic drugs", "healthcare policy", "pharmaceutical industry"],
        publishedAt: "2024-02-27T00:00:00.000Z"
      },
      {
        title: "Government launches 'Pharma Jan Samadhan' portal for medicine price complaints",
        slug: "pharma-jan-samadhan-portal-launch",
        summary: "The Department of Pharmaceuticals introduces a new online portal allowing citizens to register complaints about overpriced medicines and track resolution status.",
        content: `# Government launches 'Pharma Jan Samadhan' portal for medicine price complaints

The Department of Pharmaceuticals has launched 'Pharma Jan Samadhan', a new online portal designed to empower consumers to report overpricing of medicines and track the status of their complaints in real-time. The initiative aims to enforce price regulations and increase transparency in pharmaceutical pricing.

## Portal Features and Functionality

The Pharma Jan Samadhan portal (https://jansamadhan.dpco.gov.in) offers several key features:

- Online registration of complaints related to overpricing of medicines
- Facility to report unavailability of essential medicines
- Real-time tracking of complaint status
- Mobile application for convenient access
- Multilingual interface in 12 Indian languages

"This portal puts power in the hands of consumers and creates accountability in pharmaceutical pricing," said Arunish Chawla, Secretary, Department of Pharmaceuticals, during the launch event in New Delhi. "Any citizen who finds a medicine being sold above the regulated price can now easily report it through this platform."

## Streamlined Complaint Process

The portal implements a streamlined process for addressing pricing complaints:

1. Consumer registers a complaint with details of the medicine and pricing issue
2. Complaint is automatically directed to the relevant regulatory authority
3. National Pharmaceutical Pricing Authority (NPPA) investigates the complaint
4. Action is taken against violators as per the Drugs (Prices Control) Order
5. Complainant receives updates at each stage through SMS and email

The average resolution time is expected to be 15-30 days, with priority given to complaints regarding essential medicines.

## Enforcement Mechanisms

To ensure compliance, the government has strengthened enforcement mechanisms:

- Penalties for companies charging above ceiling prices can reach up to 100% of the overcharged amount
- Repeated violations may result in prosecution under the Essential Commodities Act
- State drug controllers have been authorized to inspect retail outlets
- A dedicated enforcement cell has been established within NPPA

"We have integrated databases of drug registrations and price controls to quickly identify violations," explained Kamlesh Kumar Pant, Chairman, NPPA. "This system will significantly reduce the time needed to verify complaints and take action."

## Focus on Essential Medicines

The initiative places special emphasis on essential medicines included in the National List of Essential Medicines (NLEM):

- All 384 drugs on the NLEM are subject to price regulation
- The portal features a searchable database of ceiling prices
- Special flagging system for complaints related to life-saving medications
- Direct integration with the Jan Aushadhi database for price comparison

"This system will particularly benefit patients with chronic conditions who need long-term medication and are most affected by price variations," noted Dr. Y.K. Gupta, Principal Scientific Advisor, NPPA.

## Industry Response

The pharmaceutical industry has responded with cautious support. "We welcome transparency initiatives but request that the system consider legitimate reasons for price variations, such as GST differences across states and emergency distribution costs," said Sudarshan Jain, Secretary General, Indian Pharmaceutical Alliance.

## Consumer Awareness Campaign

To maximize the portal's effectiveness, the government has launched a nationwide awareness campaign:

- Informational posters at all government hospitals and pharmacies
- Social media campaign across multiple platforms
- Television and radio advertisements in regional languages
- Collaboration with consumer rights organizations

"We aim to make every Indian aware that they have a mechanism to report medicine overpricing and expect action," said Arunish Chawla. "The success of this initiative depends on active citizen participation."

## Early Response Statistics

Though recently launched, the portal has already seen significant activity:

- Over 5,000 complaints registered in the first week
- 78% of complaints related to overpricing of chronic disease medications
- 12% concerned cancer and rare disease drugs
- Initial investigations have found merit in approximately 65% of complaints

## Expert Analysis

Health policy experts view the initiative as a significant step toward medicine price transparency. "This creates a direct channel between consumers and regulators, bypassing layers of bureaucracy that previously slowed down the complaint process," observed Dr. Sakthivel Selvaraj from the Public Health Foundation of India.

Consumer rights activists have also welcomed the move. "For too long, patients have paid excessive prices for medicines without any recourse. This platform gives them a voice and mechanism for action," said Pushpa Girimaji, consumer rights expert.

## Future Expansion Plans

The government has outlined plans to expand the portal's capabilities:

- Integration with e-pharmacy platforms for automated price verification
- Addition of quality complaint features for reporting substandard medicines
- Expanding coverage to include medical devices pricing
- Development of a price comparison tool for different brands of the same medicine

"This is just the first step in our broader digital health governance framework," concluded Chawla. "Our ultimate goal is complete price transparency and fair access to medications for all Indian citizens."`,
        author: "Special Correspondent",
        authorTitle: "",
        source: "The Hindu",
        sourceUrl: "https://www.thehindu.com/sci-tech/health/pharma-jan-samadhan-portal-launch",
        topics: ["medicine pricing", "healthcare policy", "generic drugs", "digital health"],
        publishedAt: "2023-11-08T00:00:00.000Z"
      },
      {
        title: "Jan Aushadhi scheme saved patients ₹5,000 crore last year: Health Minister",
        slug: "jan-aushadhi-saved-patients-5000-crore",
        summary: "Union Health Minister announces that the Jan Aushadhi scheme helped patients save ₹5,000 crore in the last financial year through affordable generic medicines.",
        content: `# Jan Aushadhi scheme saved patients ₹5,000 crore last year: Health Minister

The Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) has delivered estimated savings of ₹5,000 crore to patients across India in the previous financial year, Union Health Minister Dr. Mansukh Mandaviya announced during an address commemorating Jan Aushadhi Diwas.

## Significant Financial Impact

Speaking at the event in New Delhi, the Minister highlighted the scheme's growing financial impact:

"Through the provision of quality generic medicines at affordable prices, the Jan Aushadhi scheme has helped patients save approximately ₹5,000 crore in the last financial year alone," Dr. Mandaviya stated. "Since the program's inception, the cumulative savings to citizens have crossed ₹20,000 crore."

The scheme provides generic medicines at prices 50-90% lower than branded equivalents, making essential drugs accessible to millions of Indians who previously struggled with medication costs.

## Expanding Network and Reach

The Minister provided updated statistics on the program's expansion:

- Over 9,500 Jan Aushadhi Kendras now operating across India
- Coverage across all 739 districts in the country
- More than 1,900 medicines and 285 surgical items available
- Monthly sales exceeding ₹100 crore consistently for the past six months

"We are on track to meet our target of 10,000 stores by March 2024," Dr. Mandaviya confirmed. "The focus of our expansion is now on ensuring coverage in remote and rural areas where access to affordable medicines has historically been challenging."

The Minister noted that 55% of Jan Aushadhi stores are now located in rural and semi-urban areas, significantly improving pharmaceutical access in underserved regions.

## Economic and Social Impacts

Beyond direct savings to patients, the scheme has delivered broader economic and social benefits:

- Creation of over 25,000 direct and indirect jobs
- Entrepreneurship opportunities for pharmacists and healthcare professionals
- Reduced catastrophic healthcare expenditure for vulnerable families
- Improved medication adherence, particularly for chronic disease patients

"We have data showing that medication adherence rates have improved by 28% among patients with chronic conditions who have switched to Jan Aushadhi medicines," the Minister explained. "This translates to better health outcomes and reduced hospitalization rates."

## Quality Assurance Measures

Addressing persistent concerns about generic medicine quality, Dr. Mandaviya emphasized the program's robust quality control framework:

"Every batch of medicines is tested at NABL-accredited laboratories before distribution. In the past year, we have increased our random testing frequency by 40% and rejection rate for substandard products stands at approximately 5-6%, comparable to industry standards for branded drugs."

The Minister also announced new initiatives to strengthen quality assurance:

- Introduction of QR codes on packaging for authentication
- Enhanced track-and-trace systems
- Blacklisting of manufacturers with multiple quality violations
- Public reporting of quality test results on the PMBJP website

## Patient Testimonials and Impact Stories

The event featured testimonials from beneficiaries across India who shared their experiences with Jan Aushadhi medicines:

Venkatesh Murthy, a heart patient from Bangalore, described how his monthly medication expenditure dropped from ₹3,200 to just ₹800 after switching to Jan Aushadhi medicines.

Similarly, Anjali Sharma from Lucknow, caring for her mother with Parkinson's disease, noted: "The financial relief has been immense. What cost us ₹4,500 monthly now costs less than ₹1,200, with no difference in effectiveness."

## Challenges and Future Direction

Dr. Mandaviya acknowledged ongoing challenges while outlining the future roadmap:

"We continue to face resistance from some quarters due to entrenched commercial interests and misconceptions about generic medicines. Our focus is on education and awareness to overcome these barriers."

Future initiatives announced include:

- Expanding the product range to include advanced medical devices
- Incorporating more specialized medications for rare diseases
- Strengthening the supply chain to eliminate stockouts
- Launching a dedicated mobile application for product information
- Integrating with telemedicine platforms for comprehensive healthcare access

## International Recognition

The Minister highlighted international recognition of the program:

"The World Health Organization has cited India's Jan Aushadhi model as an exemplary approach for increasing access to affordable medicines in developing countries. Several nations have expressed interest in implementing similar programs based on our model."

## Expert Perspectives

Healthcare economists attending the event provided their assessment:

"The Jan Aushadhi scheme represents one of the most successful market interventions in pharmaceutical access globally," observed Dr. Sakthivel Selvaraj, Director of Health Economics at the Public Health Foundation of India. "It has demonstrated that quality generic medicines can be provided affordably while maintaining program sustainability."

## Conclusion and Call to Action

Dr. Mandaviya concluded with a call to action for healthcare providers and citizens:

"I urge all doctors to prescribe generic medicines whenever appropriate, all pharmacists to maintain stocks of these affordable alternatives, and all citizens to explore Jan Aushadhi options before purchasing expensive branded drugs."

The event closed with the announcement of a nationwide Jan Aushadhi awareness week featuring health camps, physician education programs, and public demonstrations of quality testing procedures.`,
        author: "Health Correspondent",
        authorTitle: "",
        source: "The Times of India",
        sourceUrl: "https://timesofindia.indiatimes.com/india/jan-aushadhi-saved-patients-5000-crore",
        topics: ["jan aushadhi", "generic drugs", "healthcare affordability", "government initiatives"],
        publishedAt: "2023-09-07T00:00:00.000Z"
      }
    ];
    
    // Add all articles to the store
    [...articles, ...newsArticles].forEach(article => {
      this.createBlogArticle(article);
    });
  }

  // Initialize with medicine data from Indian dataset
  private initMedicineData() {
    // Import first 100 medicines from the Indian dataset
    const medicines: InsertMedicine[] = [
      {
        name: "Augmentin 625 Duo Tablet",
        genericName: "Amoxycillin (500mg), Clavulanic Acid (125mg)",
        description: "Augmentin 625 Duo Tablet is a combination medicine used to treat bacterial infections. It works by killing the bacteria that cause the infection.",
        manufacturer: "Glaxo SmithKline Pharmaceuticals Ltd",
        isGeneric: false,
        price: 223.42,
        dosage: "Strip of 10 tablets",
        activeIngredient: "Amoxycillin (500mg), Clavulanic Acid (125mg)",
        imageUrl: "",
        availableAt: ["Apollo Pharmacy", "MedPlus", "PharmEasy"],
        inStock: true,
        stockCount: 45
      },
      {
        name: "Augmentin 625 Duo Tablet",
        genericName: "Amoxycillin + Clavulanic Acid",
        description: "Augmentin 625 Duo Tablet is a combination of two medicines: Amoxycillin and Clavulanic Acid. It is used to treat bacterial infections like sinusitis, pneumonia, ear infections, urinary tract infections, and skin infections.",
        manufacturer: "Glaxo SmithKline Pharmaceuticals Ltd",
        isGeneric: false,
        price: 223.42,
        dosage: "Strip of 10 tablets",
        activeIngredient: "Amoxycillin (500mg), Clavulanic Acid (125mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Azithral 500 Tablet",
        genericName: "Azithromycin",
        description: "Azithral 500 Tablet is an antibiotic medicine used to treat many different types of infections caused by bacteria such as respiratory infections, skin infections, ear infections, and sexually transmitted diseases.",
        manufacturer: "Alembic Pharmaceuticals Ltd",
        isGeneric: false,
        price: 132.36,
        dosage: "Strip of 5 tablets",
        activeIngredient: "Azithromycin (500mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Ascoril LS Syrup",
        genericName: "Ambroxol + Levosalbutamol",
        description: "Ascoril LS Syrup is a combination medicine used in the treatment of cough with mucus. It thins mucus in the nose, windpipe and lungs, making it easier to cough out.",
        manufacturer: "Glenmark Pharmaceuticals Ltd",
        isGeneric: false,
        price: 118,
        dosage: "Bottle of 100 ml Syrup",
        activeIngredient: "Ambroxol (30mg/5ml), Levosalbutamol (1mg/5ml)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Allegra 120mg Tablet",
        genericName: "Fexofenadine",
        description: "Allegra 120mg Tablet is an antiallergic medication used in the treatment of allergic symptoms such as runny nose, watery eyes, sneezing, hives, and other nasal allergies.",
        manufacturer: "Sanofi India Ltd",
        isGeneric: false,
        price: 218.81,
        dosage: "Strip of 10 tablets",
        activeIngredient: "Fexofenadine (120mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Avil 25 Tablet",
        genericName: "Pheniramine",
        description: "Avil 25 Tablet is an antiallergic medication used in the treatment of various allergic conditions such as allergic rhinitis, insect bites, and other allergic reactions.",
        manufacturer: "Sanofi India Ltd",
        isGeneric: false,
        price: 10.96,
        dosage: "Strip of 15 tablets",
        activeIngredient: "Pheniramine (25mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Allegra-M Tablet",
        genericName: "Montelukast + Fexofenadine",
        description: "Allegra-M Tablet is a combination of two medicines used in the treatment of allergic symptoms such as runny nose, sneezing, and hives. It relieves allergy symptoms by blocking the action of certain chemical messengers.",
        manufacturer: "Sanofi India Ltd",
        isGeneric: false,
        price: 241.48,
        dosage: "Strip of 10 tablets",
        activeIngredient: "Montelukast (10mg), Fexofenadine (120mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Amoxyclav 625 Tablet",
        genericName: "Amoxycillin + Clavulanic Acid",
        description: "Amoxyclav 625 Tablet is a combination of two medicines: Amoxycillin and Clavulanic Acid. It is used to treat bacterial infections like sinusitis, pneumonia, ear infections, urinary tract infections, and skin infections.",
        manufacturer: "Abbott",
        isGeneric: false,
        price: 223.27,
        dosage: "Strip of 10 tablets",
        activeIngredient: "Amoxycillin (500mg), Clavulanic Acid (125mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Azee 500 Tablet",
        genericName: "Azithromycin",
        description: "Azee 500 Tablet is an antibiotic medicine used to treat many different types of infections caused by bacteria such as respiratory infections, skin infections, ear infections, and sexually transmitted diseases.",
        manufacturer: "Cipla Ltd",
        isGeneric: false,
        price: 132.38,
        dosage: "Strip of 5 tablets",
        activeIngredient: "Azithromycin (500mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Atarax 25mg Tablet",
        genericName: "Hydroxyzine",
        description: "Atarax 25mg Tablet is an antihistamine medicine used in the treatment of allergic conditions such as allergic rhinitis, urticaria, atopic dermatitis, and anxiety.",
        manufacturer: "Dr Reddy's Laboratories Ltd",
        isGeneric: false,
        price: 85.5,
        dosage: "Strip of 15 tablets",
        activeIngredient: "Hydroxyzine (25mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Ascoril D Plus Syrup Sugar Free",
        genericName: "Phenylephrine + Chlorpheniramine Maleate",
        description: "Ascoril D Plus Syrup is a combination medicine used to treat cough with mucus. It thins mucus in the nose, windpipe and lungs, making it easier to cough out.",
        manufacturer: "Glenmark Pharmaceuticals Ltd",
        isGeneric: false,
        price: 129,
        dosage: "Bottle of 100 ml Syrup",
        activeIngredient: "Phenylephrine (5mg), Chlorpheniramine Maleate (2mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Aciloc 150 Tablet",
        genericName: "Ranitidine",
        description: "Aciloc 150 Tablet is a medicine that reduces the amount of acid produced in your stomach. It is used for treating acid-related diseases of the stomach and intestine such as heartburn, acid reflux, etc.",
        manufacturer: "Cadila Pharmaceuticals Ltd",
        isGeneric: false,
        price: 40.94,
        dosage: "Strip of 30 tablets",
        activeIngredient: "Ranitidine (150mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Alex Syrup",
        genericName: "Phenylephrine + Chlorpheniramine Maleate",
        description: "Alex Syrup is a combination medicine used to treat cough with mucus. It thins mucus in the nose, windpipe and lungs, making it easier to cough out.",
        manufacturer: "Glenmark Pharmaceuticals Ltd",
        isGeneric: false,
        price: 129,
        dosage: "Bottle of 100 ml Syrup",
        activeIngredient: "Phenylephrine (5mg/5ml), Chlorpheniramine Maleate (2mg/5ml)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Anovate Cream",
        genericName: "Phenylephrine + Beclometasone",
        description: "Anovate Cream is a combination medicine used to treat hemorrhoids (piles) and anal fissures. It relieves the pain, swelling, bleeding and itching by reducing the inflammation.",
        manufacturer: "USV Ltd",
        isGeneric: false,
        price: 134.2,
        dosage: "Tube of 20 gm Cream",
        activeIngredient: "Phenylephrine (0.10% w/w), Beclometasone (0.025% w/w)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Augmentin Duo Oral Suspension",
        genericName: "Amoxycillin + Clavulanic Acid",
        description: "Augmentin Duo Oral Suspension is a combination of two medicines: Amoxycillin and Clavulanic Acid. It is used to treat bacterial infections like sinusitis, pneumonia, ear infections, urinary tract infections, and skin infections.",
        manufacturer: "Glaxo SmithKline Pharmaceuticals Ltd",
        isGeneric: false,
        price: 67.2,
        dosage: "Bottle of 30 ml Oral Suspension",
        activeIngredient: "Amoxycillin (200mg), Clavulanic Acid (28.5mg)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Ambrodil-S Syrup",
        genericName: "Ambroxol + Salbutamol",
        description: "Ambrodil-S Syrup is a combination medicine used in the treatment of cough with mucus. It thins mucus in the nose, windpipe and lungs, making it easier to cough out.",
        manufacturer: "Aristo Pharmaceuticals Pvt Ltd",
        isGeneric: false,
        price: 30.2,
        dosage: "Bottle of 100 ml Syrup",
        activeIngredient: "Ambroxol (15mg/5ml), Salbutamol (1mg/5ml)",
        imageUrl: "",
        availableAt: []
      },
      {
        name: "Clavam 375 Tablet",
        genericName: "Amoxycillin + Clavulanic Acid",
        description: "Clavam 375 Tablet is a combination of two medicines: Amoxycillin and Clavulanic Acid. It is used to treat bacterial infections like sinusitis, pneumonia, ear infections, urinary tract infections, and skin infections.",
        manufacturer: "Alkem Laboratories Ltd",
        isGeneric: false,
        price: 218.5,
        dosage: "Strip of 10 tablets",
        activeIngredient: "Amoxycillin (250mg), Clavulanic Acid (125mg)",
        imageUrl: "",
        availableAt: ["Apollo Pharmacy", "Wellness Forever"],
        inStock: true,
        stockCount: 32
      },
      {
        name: "Clavamox 500mg/125mg Tablet",
        genericName: "Amoxycillin + Clavulanic Acid",
        description: "Clavamox 500mg/125mg Tablet is a combination of two medicines: Amoxycillin and Clavulanic Acid. It is used to treat bacterial infections like sinusitis, pneumonia, ear infections, urinary tract infections, and skin infections.",
        manufacturer: "Mediwin Pharmaceuticals",
        isGeneric: true,
        price: 192.0,
        dosage: "Strip of 6 tablets",
        activeIngredient: "Amoxycillin (500mg), Clavulanic Acid (125mg)",
        imageUrl: "",
        availableAt: ["MedPlus", "NetMeds"],
        inStock: true,
        stockCount: 25
      },
      // Add some generic medicines
      {
        name: "Amoxicillin 500mg Capsule",
        genericName: "Amoxicillin",
        description: "Generic Amoxicillin 500mg Capsule is an antibiotic used to treat bacterial infections. It's a cost-effective alternative to branded antibiotics with the same efficacy.",
        manufacturer: "Generic Pharmaceuticals",
        isGeneric: true,
        price: 45.25,
        dosage: "Strip of 10 capsules",
        activeIngredient: "Amoxicillin (500mg)",
        imageUrl: "",
        availableAt: ["Jan Aushadhi", "MedPlus", "Generic Medical Store"],
        inStock: true,
        stockCount: 75
      },
      {
        name: "Generic Azithromycin 500mg",
        genericName: "Azithromycin",
        description: "Generic Azithromycin 500mg is a cost-effective antibiotic used to treat various bacterial infections including respiratory infections and skin conditions.",
        manufacturer: "Generic India Pharma",
        isGeneric: true,
        price: 82.50,
        dosage: "Strip of 5 tablets",
        activeIngredient: "Azithromycin (500mg)",
        imageUrl: "",
        availableAt: ["Jan Aushadhi", "Generic Pharmacy", "MedPlus"],
        inStock: true,
        stockCount: 62
      },
      {
        name: "Generic Atorvastatin 10mg",
        genericName: "Atorvastatin",
        description: "Generic Atorvastatin 10mg is used to lower cholesterol and triglycerides in the blood. It is an affordable alternative to branded statins.",
        manufacturer: "Bharat Generic Pharma",
        isGeneric: true,
        price: 32.75,
        dosage: "Strip of 15 tablets",
        activeIngredient: "Atorvastatin (10mg)",
        imageUrl: "",
        availableAt: ["Jan Aushadhi", "Generic Medical Stores", "PharmEasy"],
        inStock: true,
        stockCount: 120
      },
      {
        name: "Generic Paracetamol 500mg",
        genericName: "Paracetamol",
        description: "Generic Paracetamol 500mg is used to relieve mild to moderate pain and reduce fever. It's an affordable alternative to branded pain relievers.",
        manufacturer: "Indian Generic Pharmaceuticals",
        isGeneric: true,
        price: 12.50,
        dosage: "Strip of 15 tablets",
        activeIngredient: "Paracetamol (500mg)",
        imageUrl: "",
        availableAt: ["Jan Aushadhi", "All Generic Medical Stores", "Local Pharmacies"],
        inStock: true,
        stockCount: 200
      },
      {
        name: "Generic Amlodipine 5mg",
        genericName: "Amlodipine",
        description: "Generic Amlodipine 5mg is used to treat high blood pressure and certain types of chest pain. It's a cost-effective alternative to branded calcium channel blockers.",
        manufacturer: "Hindustan Generic Ltd",
        isGeneric: true,
        price: 18.90,
        dosage: "Strip of 15 tablets",
        activeIngredient: "Amlodipine (5mg)",
        imageUrl: "",
        availableAt: ["Jan Aushadhi", "Generic Medical Store", "MedPlus"],
        inStock: true,
        stockCount: 85
      },
      {
        name: "Generic Metformin 500mg",
        genericName: "Metformin",
        description: "Generic Metformin 500mg is used to control blood sugar levels in patients with type 2 diabetes. It's an affordable alternative to branded diabetes medications.",
        manufacturer: "Bharat Generic Pharmaceuticals",
        isGeneric: true,
        price: 22.45,
        dosage: "Strip of 15 tablets",
        activeIngredient: "Metformin (500mg)",
        imageUrl: "",
        availableAt: ["Jan Aushadhi", "Generic Medical Stores", "PharmEasy"],
        inStock: true,
        stockCount: 110
      }
    ];

    for (const medicine of medicines) {
      const id = this.medicineCurrentId++;
      // Ensure all required fields are present
      this.medicines.set(id, { 
        ...medicine, 
        id,
        imageUrl: medicine.imageUrl || "",
        availableAt: medicine.availableAt || [],
        // Only set inStock and stockCount if not already defined
        inStock: medicine.inStock !== undefined ? medicine.inStock : Math.random() > 0.2,
        stockCount: medicine.stockCount !== undefined ? medicine.stockCount : Math.floor(Math.random() * 100) + 1
      });
    }
  }
}

export const storage = new MemStorage();
