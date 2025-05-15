#!/usr/bin/env node

/**
 * Database migration script for Tweetonium
 * This script pushes the Drizzle schema to the PostgreSQL database
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting database migration...');
console.log('Running drizzle-kit push to update database schema...');

try {
  // Execute drizzle-kit push command
  const output = execSync('npx drizzle-kit push', {
    cwd: resolve(__dirname, '..'), 
    stdio: 'inherit'
  });
  
  console.log('Database migration completed successfully!');
  console.log('');
  console.log('To use the database storage:');
  console.log('1. Set the environment variable USE_DATABASE=true');
  console.log('2. Restart the application');
} catch (error) {
  console.error('Error during migration:', error.message);
  process.exit(1);
}