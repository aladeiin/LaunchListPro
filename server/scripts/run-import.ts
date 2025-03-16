import { spawn } from 'child_process';
import * as path from 'path';

console.log('Starting medicine data import process...');
console.log('This will import data from the large Indian medicine dataset.');
console.log('The process may take some time, please be patient.');
console.log('------------------------------------------------');

// Path to the import script
const importScriptPath = path.resolve(__dirname, './import-medicine-data.ts');

// Run the import script with tsx
const child = spawn('tsx', [importScriptPath], {
  stdio: 'inherit', // This will pipe the child process's stdout/stderr to the parent process
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Import completed successfully.');
  } else {
    console.error(`Import failed with code ${code}`);
  }
});

child.on('error', (err) => {
  console.error('Failed to start import process:', err);
});