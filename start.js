#!/usr/bin/env node

/**
 * Simple start script for Render
 */

const path = require('path');

console.log('🚀 Starting Booking4U Backend...');

// Start the server from backend directory
require(path.join(__dirname, 'backend', 'server.js'));
