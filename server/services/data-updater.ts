import * as cron from 'node-cron';
import { storage } from '../storage';
import { Medicine } from '@shared/schema';
import { getMedicineDetails } from './1mg-scraper';

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
    'Augmentin 625 Duo Tablet',
    'Azithral 500 Tablet',
    'Dolo 650 Tablet',
    'Pan D Capsule',
    'Ecosprin 75 Tablet',
    'Crocin 500 Tablet',
    'Allegra 120mg Tablet',
    'Thyronorm 50mcg Tablet',
    'Ascoril LS Syrup',
    'Avil 25 Tablet'
  ];

  /**
   * Initialize the data updater service
   */
  constructor() {
    console.log('Data updater service initialized');
  }

  /**
   * Schedule regular updates using cron
   * @param cronExpression Cron expression for update frequency (default: every day at 2 AM)
   */
  scheduleUpdates(cronExpression: string = '0 2 * * *'): void {
    // Stop any existing scheduled task
    this.stopScheduledUpdates();

    // Create a new scheduled task
    this.scheduledTask = cron.schedule(cronExpression, () => {
      console.log(`Scheduled update triggered at ${new Date().toISOString()}`);
      this.updateDatabase().catch(error => {
        console.error('Error during scheduled update:', error);
      });
    });

    console.log(`Updates scheduled with cron expression: ${cronExpression}`);
  }

  /**
   * Stop scheduled updates
   */
  stopScheduledUpdates(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log('Scheduled updates stopped');
    }
  }

  /**
   * Run the database update process
   */
  async updateDatabase(): Promise<UpdateStats> {
    if (this.isUpdating) {
      throw new Error('Update already in progress');
    }

    this.isUpdating = true;
    console.log('Starting database update process');

    const stats: UpdateStats = {
      totalProcessed: 0,
      updated: 0,
      failed: 0,
      newlyAdded: 0,
      startTime: new Date(),
      errors: []
    };

    try {
      // Update popular medicines first (high priority)
      await this.updatePopularMedicines(stats);

      // Update recently added medicines (medium priority)
      await this.updateRecentAdditions(stats);

      // Update oldest entries (low priority)
      await this.updateOldestEntries(stats, 50);

      stats.endTime = new Date();
      this.lastUpdateTime = stats.endTime;
      this.lastUpdateStats = stats;

      console.log(`Update completed: ${stats.updated} medicines updated, ${stats.failed} failed, ${stats.newlyAdded} newly added`);
      return stats;
    } catch (error) {
      console.error('Error during database update:', error);
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
      await this.updateSingleMedicine(medicineName, stats);
    }
  }

  /**
   * Update medicines that were recently added to the database
   */
  private async updateRecentAdditions(stats: UpdateStats): Promise<void> {
    // In a real implementation, we would sort by createdAt
    // For now, we'll just take the first 20 medicines as a sample
    const allMedicines = await storage.getMedicines();
    const recentAdditions = allMedicines.slice(0, 20);
    
    console.log(`Updating ${recentAdditions.length} recently added medicines`);
    
    for (const medicine of recentAdditions) {
      await this.updateSingleMedicine(medicine.name, stats);
    }
  }

  /**
   * Update medicines that haven't been updated in the longest time
   */
  private async updateOldestEntries(stats: UpdateStats, limit: number): Promise<void> {
    // In a real implementation, we would sort by updatedAt
    // For now, we'll just take the last 50 medicines as a sample
    const allMedicines = await storage.getMedicines();
    const oldestEntries = allMedicines.slice(-limit);
    
    console.log(`Updating ${oldestEntries.length} oldest entries`);
    
    for (const medicine of oldestEntries) {
      await this.updateSingleMedicine(medicine.name, stats);
    }
  }

  /**
   * Update a single medicine's information
   */
  private async updateSingleMedicine(medicineName: string, stats: UpdateStats): Promise<void> {
    try {
      stats.totalProcessed++;
      
      console.log(`Updating medicine: ${medicineName}`);
      
      // Fetch the latest details from external source
      const updatedDetails = await getMedicineDetails(medicineName);
      
      if (!updatedDetails) {
        console.log(`No details found for medicine: ${medicineName}`);
        stats.failed++;
        stats.errors.push({ 
          medicine: medicineName, 
          error: 'Failed to fetch updated details' 
        });
        return;
      }
      
      // Check if the medicine exists in our database
      const existingMedicine = await storage.getMedicineByName(medicineName);
      
      if (existingMedicine) {
        // Update existing medicine
        await storage.updateMedicineByName(medicineName, updatedDetails);
        stats.updated++;
        console.log(`Updated medicine: ${medicineName}`);
      } else {
        // Add new medicine
        await storage.createMedicine({
          ...updatedDetails,
          name: medicineName
        });
        stats.newlyAdded++;
        console.log(`Added new medicine: ${medicineName}`);
      }
    } catch (error) {
      stats.failed++;
      stats.errors.push({ 
        medicine: medicineName, 
        error: error.message || 'Unknown error' 
      });
      console.error(`Error updating medicine ${medicineName}:`, error);
    }
  }

  /**
   * Get the status of the updater service
   */
  getStatus(): {
    isUpdating: boolean;
    lastUpdateTime: Date | null;
    lastUpdateStats: UpdateStats | null;
    scheduledUpdatesActive: boolean;
    popularMedicinesList: string[];
  } {
    return {
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      lastUpdateStats: this.lastUpdateStats,
      scheduledUpdatesActive: this.scheduledTask !== null,
      popularMedicinesList: [...this.popularMedicinesList]
    };
  }

  /**
   * Update the list of popular medicines to track
   */
  setPopularMedicinesList(medicinesList: string[]): void {
    this.popularMedicinesList = [...medicinesList];
    console.log(`Updated popular medicines list with ${medicinesList.length} medicines`);
  }
}

export const dataUpdaterService = new DataUpdaterService();