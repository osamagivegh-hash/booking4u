#!/usr/bin/env node

/**
 * Backend Deployment Script for Render
 * This script ensures proper deployment configuration
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 Booking4U Backend Deployment Script');
console.log('=====================================');

// Check if we're in the right directory
const currentDir = process.cwd();
console.log('📁 Current directory:', currentDir);

// Check if backend directory exists
const backendDir = path.join(currentDir, 'backend');
if (!fs.existsSync(backendDir)) {
  console.error('❌ Backend directory not found!');
  process.exit(1);
}

// Check if backend package.json exists
const backendPackageJson = path.join(backendDir, 'package.json');
if (!fs.existsSync(backendPackageJson)) {
  console.error('❌ Backend package.json not found!');
  process.exit(1);
}

// Check if server.js exists
const serverJs = path.join(backendDir, 'server.js');
if (!fs.existsSync(serverJs)) {
  console.error('❌ Backend server.js not found!');
  process.exit(1);
}

console.log('✅ All backend files found');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 10000;

console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT);

// Start the backend server
console.log('🚀 Starting backend server...');
try {
  require(path.join(backendDir, 'server.js'));
  console.log('✅ Backend server started successfully');
} catch (error) {
  console.error('❌ Failed to start backend server:', error.message);
  process.exit(1);
}
