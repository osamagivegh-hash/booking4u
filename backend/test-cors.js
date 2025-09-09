#!/usr/bin/env node

/**
 * CORS Test Script
 * Tests the CORS configuration for the Booking4U backend
 */

const fetch = require('node-fetch');

const BACKEND_URLS = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com',
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com'
];

const FRONTEND_ORIGIN = 'https://booking4u-1.onrender.com';

async function testCORS(backendUrl) {
  console.log(`\n🔍 Testing CORS for: ${backendUrl}`);
  
  try {
    // Test preflight request
    const preflightResponse = await fetch(`${backendUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`📡 Preflight Status: ${preflightResponse.status}`);
    console.log(`📡 Preflight Headers:`, {
      'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': preflightResponse.headers.get('Access-Control-Allow-Credentials')
    });
    
    // Test actual request
    const actualResponse = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Actual Request Status: ${actualResponse.status}`);
    console.log(`📡 Actual Request Headers:`, {
      'Access-Control-Allow-Origin': actualResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': actualResponse.headers.get('Access-Control-Allow-Credentials')
    });
    
    if (actualResponse.ok) {
      const data = await actualResponse.json();
      console.log(`✅ Health check successful:`, data.status);
    } else {
      console.log(`❌ Health check failed:`, actualResponse.statusText);
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${backendUrl}:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting CORS tests...');
  console.log(`🎯 Frontend Origin: ${FRONTEND_ORIGIN}`);
  
  for (const backendUrl of BACKEND_URLS) {
    await testCORS(backendUrl);
  }
  
  console.log('\n✅ CORS tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCORS, runTests };
