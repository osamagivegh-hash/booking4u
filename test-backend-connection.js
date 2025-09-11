#!/usr/bin/env node

/**
 * Simple Backend Connection Test
 * Tests if the backend is accessible and responding correctly
 */

const https = require('https');
const http = require('http');

// Test URLs
const testUrls = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend.onrender.com/api/health',
  'https://booking4u-backend.onrender.com/api/debug/cors',
  'https://booking4u-backend.onrender.com/api/test-cors'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url: url,
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        url: url,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        url: url,
        error: 'Request timeout'
      });
    });
  });
}

async function testBackend() {
  console.log('🔍 Testing Backend Connection...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const result = await makeRequest(url);
      
      if (result.statusCode === 200) {
        console.log(`✅ SUCCESS: ${result.statusCode}`);
        try {
          const jsonData = JSON.parse(result.data);
          console.log(`📋 Response:`, JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log(`📋 Response: ${result.data.substring(0, 200)}...`);
        }
      } else {
        console.log(`⚠️  WARNING: ${result.statusCode}`);
        console.log(`📋 Response: ${result.data.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.error}`);
    }
    
    console.log('---');
  }
  
  console.log('\n🏁 Backend test completed!');
}

// Run the test
testBackend().catch(console.error);
