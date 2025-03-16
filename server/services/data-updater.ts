// @ts-ignore - node-cron doesn't have type definitions
import cron from 'node-cron';
import { Medicine } from '@shared/schema';
import { storage } from '../storage';
import { searchMedicines, getMedicineDetails, findAlternatives } from './1mg-scraper';

interface UpdateStats {
  totalProcessed: number;
  updated: number;
  failed: number;
  newlyAdded: number;
  startTime: Date;
  endTime?: Date;
  errors: Array<{ medicine: string; error: string }>;
}

/**
 * Service for scheduling and running medicine data updates
 */
class DataUpdaterService {
  private isUpdating: boolean = false;
  private lastUpdateTime: Date | null = null;
  private lastUpdateStats: UpdateStats | null = null;
  private scheduledTask: cron.ScheduledTask | null = null;
  private popularMedicinesList: string[] = [
    // Common medicines in India to ensure we always have updated data for these
    'Paracetamol', 'Crocin', 'Dolo', 'Combiflam', 
    'Azithromycin', 'Limcee', 'Metformin', 'Pantocid',
    'Ecosprin', 'Amoxicillin', 'Allegra', 'Shelcal',
    'Aciloc', 'Thyronorm', 'Atorvastatin', 'Pan-D',
    'Neurobion Forte', 'Revital', 'Glucon-D', 'Becosules',
    'Montair-LC', 'Taxim-O', 'Nytra', 'CalciRoll'
  ];
  
  /**
   * Initialize the data updater service
   */
  constructor() {
    console.log('Initializing DataUpdaterService');
  }
  
  /**
   * Schedule regular updates using cron
   * @param cronExpression Cron expression for update frequency (default: every day at 2 AM)
   */
  scheduleUpdates(cronExpression: string = '0 2 * * *'): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
    }
    
    console.log(`Scheduling medicine database updates with cron: ${cronExpression}`);
    this.scheduledTask = cron.schedule(cronExpression, () => {
      this.updateDatabase();
    });
    
    console.log('Medicine database update scheduler is active');
  }
  
  /**
   * Stop scheduled updates
   */
  stopScheduledUpdates(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log('Medicine database update scheduler stopped');
    }
  }
  
  /**
   * Run the database update process
   */
  async updateDatabase(): Promise<UpdateStats> {
    if (this.isUpdating) {
      console.log('Update already in progress, skipping');
      throw new Error('Update already in progress');
    }
    
    this.isUpdating = true;
    const stats: UpdateStats = {
      totalProcessed: 0,
      updated: 0,
      failed: 0,
      newlyAdded: 0,
      startTime: new Date(),
      errors: []
    };
    
    try {
      console.log('Starting medicine database update');
      
      // 1. Update popular medicines first
      await this.updatePopularMedicines(stats);
      
      // 2. Update recent additions (medicines added in the last 30 days)
      await this.updateRecentAdditions(stats);
      
      // 3. Update medicines that haven't been updated in the longest time
      await this.updateOldestEntries(stats, 50); // Update 50 of the oldest entries
      
      this.lastUpdateTime = new Date();
      stats.endTime = this.lastUpdateTime;
      this.lastUpdateStats = stats;
      
      console.log(`Medicine database update completed: Processed ${stats.totalProcessed}, Updated ${stats.updated}, Failed ${stats.failed}, Added ${stats.newlyAdded}`);
      
      return stats;
    } catch (error) {
      console.error('Error during medicine database update:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }
  
  /**
   * Update information for the popular medicines list
   */
  private async updatePopularMedicines(stats: UpdateStats): Promise<void> {
    console.log(`Updating ${this.popularMedicinesList.length} popular medicines`);
    
    for (const medicineName of this.popularMedicinesList) {
      try {
        await this.updateSingleMedicine(medicineName, stats);
      } catch (error) {
        console.error(`Failed to update popular medicine: ${medicineName}`, error);
        stats.failed++;
        stats.errors.push({
          medicine: medicineName,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
  
  /**
   * Update medicines that were recently added to the database
   */
  private async updateRecentAdditions(stats: UpdateStats): Promise<void> {
    try {
      // Get all medicines from storage
      const allMedicines = await storage.getMedicines();
      
      // Filter to those added in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentMedicines = allMedicines.filter(medicine => {
        // Check if createdAt exists and is within the last 30 days
        // Note: This assumes the Medicine type has a createdAt property
        if ((medicine as any).createdAt) {
          const createdAt = new Date((medicine as any).createdAt);
          return createdAt >= thirtyDaysAgo;
        }
        return false;
      });
      
      console.log(`Updating ${recentMedicines.length} recently added medicines`);
      
      for (const medicine of recentMedicines) {
        try {
          await this.updateSingleMedicine(medicine.name, stats);
        } catch (error) {
          console.error(`Failed to update recent medicine: ${medicine.name}`, error);
          stats.failed++;
          stats.errors.push({
            medicine: medicine.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      console.error('Error updating recent additions:', error);
      stats.errors.push({
        medicine: 'recent_additions_batch',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Update medicines that haven't been updated in the longest time
   */
  private async updateOldestEntries(stats: UpdateStats, limit: number): Promise<void> {
    try {
      // Get all medicines from storage
      const allMedicines = await storage.getMedicines();
      
      // Sort by last update time (oldest first)
      // Note: This assumes the Medicine type has a lastUpdated property
      const sortedMedicines = allMedicines.sort((a, b) => {
        const aUpdate = (a as any).lastUpdated ? new Date((a as any).lastUpdated).getTime() : 0;
        const bUpdate = (b as any).lastUpdated ? new Date((b as any).lastUpdated).getTime() : 0;
        return aUpdate - bUpdate;
      });
      
      // Take the oldest 'limit' entries
      const oldestMedicines = sortedMedicines.slice(0, limit);
      
      console.log(`Updating ${oldestMedicines.length} oldest medicine entries`);
      
      for (const medicine of oldestMedicines) {
        try {
          await this.updateSingleMedicine(medicine.name, stats);
        } catch (error) {
          console.error(`Failed to update old medicine: ${medicine.name}`, error);
          stats.failed++;
          stats.errors.push({
            medicine: medicine.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      console.error('Error updating oldest entries:', error);
      stats.errors.push({
        medicine: 'oldest_entries_batch',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Update a single medicine's information
   */
  private async updateSingleMedicine(medicineName: string, stats: UpdateStats): Promise<void> {
    try {
      stats.totalProcessed++;
      
      console.log(`Updating medicine: ${medicineName}`);
      
      // Try to get the medicine from 1mg
      const updatedMedicine = await getMedicineDetails(medicineName);
      
      if (!updatedMedicine) {
        console.log(`No details found for medicine: ${medicineName}`);
        return;
      }
      
      // Check if this medicine already exists in our database
      const existingMedicine = await storage.getMedicineByName(medicineName);
      
      if (!existingMedicine) {
        // This is a new medicine, add it to the database
        console.log(`Adding new medicine to database: ${medicineName}`);
        
        await storage.createMedicine({
          name: updatedMedicine.name,
          genericName: updatedMedicine.genericName,
          description: updatedMedicine.description,
          manufacturer: updatedMedicine.manufacturer,
          isGeneric: updatedMedicine.isGeneric,
          price: updatedMedicine.price,
          dosage: updatedMedicine.dosage,
          activeIngredient: updatedMedicine.activeIngredient,
          imageUrl: updatedMedicine.imageUrl,
          availableAt: updatedMedicine.availableAt
        });
        
        stats.newlyAdded++;
        return;
      }
      
      // Update the existing medicine with new information
      await storage.updateMedicineByName(medicineName, {
        // Only update fields that might change
        price: updatedMedicine.price,
        description: updatedMedicine.description,
        imageUrl: updatedMedicine.imageUrl,
        availableAt: updatedMedicine.availableAt
      });
      
      console.log(`Medicine information updated: ${medicineName}`);
      stats.updated++;
      
      // Also update alternatives for this medicine
      try {
        const alternatives = await findAlternatives(medicineName);
        console.log(`Found ${alternatives.length} alternatives for ${medicineName}`);
        
        // We don't currently have a direct method to update alternatives in the database,
        // but we could add them as new medicines if they don't exist
        for (const alternative of alternatives) {
          const existingAlt = await storage.getMedicineByName(alternative.name);
          if (!existingAlt) {
            // Add this alternative to the database
            await storage.createMedicine({
              name: alternative.name,
              genericName: alternative.genericName,
              description: alternative.description,
              manufacturer: alternative.manufacturer,
              isGeneric: alternative.isGeneric,
              price: alternative.price,
              dosage: alternative.dosage,
              activeIngredient: alternative.activeIngredient,
              imageUrl: alternative.imageUrl,
              availableAt: alternative.availableAt
            });
            
            stats.newlyAdded++;
          }
        }
      } catch (error) {
        console.error(`Error updating alternatives for ${medicineName}:`, error);
        // Don't count this as a complete failure since the main medicine was updated
      }
    } catch (error) {
      console.error(`Failed to update medicine: ${medicineName}`, error);
      throw error;
    }
  }
  
  /**
   * Get the status of the updater service
   */
  getStatus(): {
    isUpdating: boolean;
    lastUpdateTime: Date | null;
    lastUpdateStats: UpdateStats | null;
    scheduledTaskActive: boolean;
  } {
    return {
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      lastUpdateStats: this.lastUpdateStats,
      scheduledTaskActive: this.scheduledTask !== null
    };
  }
  
  /**
   * Update the list of popular medicines to track
   */
  setPopularMedicinesList(medicinesList: string[]): void {
    this.popularMedicinesList = medicinesList;
    console.log(`Popular medicines list updated: ${medicinesList.length} medicines`);
  }
}

// Create a singleton instance of the data updater service
export const dataUpdaterService = new DataUpdaterService();