#!/usr/bin/env node

/**
 * Start the Tweetonium application with database storage enabled
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Tweetonium with database storage...');
console.log('');

try {
  // First run database migration
  console.log('Running database migration...');
  execSync('node scripts/db-push.js', {
    cwd: resolve(__dirname, '..'), 
    stdio: 'inherit'
  });
  
  console.log('');
  console.log('Starting application with database storage...');
  
  // Start the application with database storage
  execSync('USE_DATABASE=true NODE_ENV=development tsx server/index.ts', {
    cwd: resolve(__dirname, '..'), 
    stdio: 'inherit',
    env: {
      ...process.env,
      USE_DATABASE: 'true',
      NODE_ENV: 'development'
    }
  });
  
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}