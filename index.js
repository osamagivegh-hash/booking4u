#!/usr/bin/env node

/**
 * Root entry point for Booking4U
 * This file redirects to the backend server
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Booking4U Backend...');

// Start the backend server
const backendPath = path.join(__dirname, 'backend', 'server.js');
const child = spawn('node', [backendPath], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('❌ Failed to start backend:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  child.kill('SIGINT');
});
