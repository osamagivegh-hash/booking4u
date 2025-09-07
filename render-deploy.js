#!/usr/bin/env node

/**
 * Render Deployment Entry Point
 * This file ensures the backend runs correctly on Render
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Booking4U Backend for Render...');
console.log('📁 Current working directory:', process.cwd());
console.log('📁 Backend path:', path.join(__dirname, 'backend'));

// Change to backend directory and start the server
process.chdir(path.join(__dirname, 'backend'));

console.log('📁 Changed to backend directory:', process.cwd());

// Start the backend server
const child = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'backend')
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
