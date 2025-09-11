#!/usr/bin/env node

/**
 * Local Integration Test Script
 * Tests the integrated frontend-backend deployment locally
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const TEST_PORT = 10000;
const TEST_URL = `http://localhost:${TEST_PORT}`;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testIntegration() {
  console.log('🧪 Testing Local Integration...\n');
  
  const tests = [
    {
      name: 'Frontend Static Files',
      test: async () => {
        const response = await makeRequest(`${TEST_URL}/`);
        return response.statusCode === 200 && response.data.includes('Booking4U');
      }
    },
    {
      name: 'API Health Endpoint',
      test: async () => {
        const response = await makeRequest(`${TEST_URL}/api/health`);
        return response.statusCode === 200;
      }
    },
    {
      name: 'API CORS Debug',
      test: async () => {
        const response = await makeRequest(`${TEST_URL}/api/debug/cors`);
        return response.statusCode === 200;
      }
    },
    {
      name: 'React Router Fallback',
      test: async () => {
        const response = await makeRequest(`${TEST_URL}/dashboard`);
        return response.statusCode === 200 && response.data.includes('Booking4U');
      }
    },
    {
      name: 'Static Assets (CSS)',
      test: async () => {
        const response = await makeRequest(`${TEST_URL}/static/css/main.`);
        return response.statusCode === 200;
      }
    },
    {
      name: 'Static Assets (JS)',
      test: async () => {
        const response = await makeRequest(`${TEST_URL}/static/js/main.`);
        return response.statusCode === 200;
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const result = await test.test();
      
      if (result) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Integration is working correctly.');
    console.log('✅ Ready for deployment to Render!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest(`${TEST_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on port', TEST_PORT);
    console.log('Please start the server first:');
    console.log('  npm run build');
    console.log('  npm start');
    process.exit(1);
  }
  
  console.log('✅ Server is running, starting tests...\n');
  
  await testIntegration();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testIntegration, checkServer };
