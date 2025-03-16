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

  // Initialize with some sample medicine data
  private initMedicineData() {
    const medicines: InsertMedicine[] = [
      {
        name: "Lipitor",
        genericName: "Atorvastatin",
        description: "Lipitor is a statin medication used to treat high cholesterol and to lower the risk of stroke, heart attack, and other heart complications.",
        manufacturer: "Pfizer",
        isGeneric: false,
        price: 165.99,
        dosage: "10mg, 30 tablets",
        activeIngredient: "Atorvastatin Calcium",
        imageUrl: "",
        availableAt: ["CVS", "Walgreens", "Rite Aid"]
      },
      {
        name: "Atorvastatin Calcium",
        genericName: "Atorvastatin",
        description: "Generic version of Lipitor used to treat high cholesterol and to lower the risk of stroke, heart attack, and other heart complications.",
        manufacturer: "Various",
        isGeneric: true,
        price: 14.99,
        dosage: "10mg, 30 tablets",
        activeIngredient: "Atorvastatin Calcium",
        imageUrl: "",
        availableAt: ["Walgreens", "CVS", "Walmart Pharmacy"]
      },
      {
        name: "Crestor",
        genericName: "Rosuvastatin",
        description: "Crestor is a statin medication used to treat high cholesterol and prevent cardiovascular disease.",
        manufacturer: "AstraZeneca",
        isGeneric: false,
        price: 112.99,
        dosage: "5mg, 30 tablets",
        activeIngredient: "Rosuvastatin Calcium",
        imageUrl: "",
        availableAt: ["CVS", "Rite Aid"]
      },
      {
        name: "Advil",
        genericName: "Ibuprofen",
        description: "Advil is a nonsteroidal anti-inflammatory drug used to treat pain, fever, and inflammation.",
        manufacturer: "Pfizer",
        isGeneric: false,
        price: 9.99,
        dosage: "200mg, 50 tablets",
        activeIngredient: "Ibuprofen",
        imageUrl: "",
        availableAt: ["Walgreens", "CVS", "Walmart Pharmacy", "Rite Aid"]
      },
      {
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        description: "Generic ibuprofen is a nonsteroidal anti-inflammatory drug used to treat pain, fever, and inflammation.",
        manufacturer: "Various",
        isGeneric: true,
        price: 4.99,
        dosage: "200mg, 50 tablets",
        activeIngredient: "Ibuprofen",
        imageUrl: "",
        availableAt: ["Walgreens", "CVS", "Walmart Pharmacy", "Rite Aid"]
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
