import importMedicineData from './import-medicines-batch';

console.log('Starting medicine data import process...');
importMedicineData()
  .then(() => {
    console.log('Import completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });