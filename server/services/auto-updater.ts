import cron from 'node-cron';
import { updateDatabaseWithMedications } from './1mg-integration';

// Common medications to regularly check and update
const COMMON_MEDICATIONS = [
  'paracetamol',
  'amoxicillin',
  'metformin',
  'atorvastatin',
  'omeprazole',
  'ibuprofen',
  'amlodipine',
  'pantoprazole',
  'cefixime',
  'diclofenac'
];

// Common prefixes to regularly update
const COMMON_PREFIXES = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

/**
 * Initialize the auto-update service for medication data
 * @param cronExpression When to run the updates (default: daily at 2 AM)
 */
export function initializeAutoUpdateService(cronExpression = '0 2 * * *') {
  console.log('Data updater service initialized');
  
  // Schedule the update job
  const job = cron.schedule(cronExpression, async () => {
    console.log(`Running scheduled database update at ${new Date().toLocaleString()}`);
    await runDatabaseUpdate();
  });
  
  // Log the schedule
  console.log(`Updates scheduled with cron expression: ${cronExpression}`);
  
  return {
    runManualUpdate: runDatabaseUpdate,
    stopSchedule: () => job.stop()
  };
}

/**
 * Run a database update with external medication data
 */
async function runDatabaseUpdate() {
  let totalUpdated = 0;
  
  try {
    // Update common medications
    for (const medication of COMMON_MEDICATIONS) {
      try {
        console.log(`Updating data for ${medication}...`);
        const count = await updateDatabaseWithMedications(medication, 5);
        console.log(`Updated ${count} records for ${medication}`);
        totalUpdated += count;
      } catch (error) {
        console.error(`Error updating ${medication}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Update each prefix (less frequently)
    // Get a random subset of prefixes (5 per run)
    const shuffled = COMMON_PREFIXES.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    for (const prefix of selected) {
      try {
        console.log(`Updating data for prefix ${prefix}...`);
        const count = await updateDatabaseWithMedications(prefix, 10);
        console.log(`Updated ${count} records for prefix ${prefix}`);
        totalUpdated += count;
      } catch (error) {
        console.error(`Error updating prefix ${prefix}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Database update completed. Total updated: ${totalUpdated}`);
    return totalUpdated;
  } catch (error) {
    console.error('Error in database auto-update:', error);
    return 0;
  }
}