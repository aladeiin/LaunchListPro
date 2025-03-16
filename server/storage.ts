import { 
  type WaitlistUser, 
  type InsertWaitlistUser, 
  type Medicine, 
  type InsertMedicine, 
  type ChatMessage, 
  type InsertChatMessage 
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
  
  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByUserId(userId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private waitlistUsers: Map<number, WaitlistUser>;
  private medicines: Map<number, Medicine>;
  private chatMessages: Map<number, ChatMessage>;
  private waitlistUserCurrentId: number;
  private medicineCurrentId: number;
  private chatMessageCurrentId: number;

  constructor() {
    this.waitlistUsers = new Map();
    this.medicines = new Map();
    this.chatMessages = new Map();
    this.waitlistUserCurrentId = 1;
    this.medicineCurrentId = 1;
    this.chatMessageCurrentId = 1;

    // Initialize with some sample medicine data
    this.initMedicineData();
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
    query = query.toLowerCase();
    return Array.from(this.medicines.values()).filter(
      (medicine) => 
        medicine.name.toLowerCase().includes(query) || 
        medicine.genericName.toLowerCase().includes(query) || 
        medicine.activeIngredient.toLowerCase().includes(query)
    );
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

  // Initialize with medicine data from Indian dataset
  private initMedicineData() {
    const medicines: InsertMedicine[] = [
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
      }
    ];

    for (const medicine of medicines) {
      const id = this.medicineCurrentId++;
      // Ensure all required fields are present
      this.medicines.set(id, { 
        ...medicine, 
        id,
        imageUrl: medicine.imageUrl || "",
        availableAt: medicine.availableAt || []
      });
    }
  }
}

export const storage = new MemStorage();
