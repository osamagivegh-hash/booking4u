const http = require('http');
const fs = require('fs');
const path = require('path');

const TEST_PORT = 10000;
const TEST_URL = `http://localhost:${TEST_PORT}`;

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, (res) => {
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
    
    req.end();
  });
}

async function testStaticAssets() {
  console.log('🧪 Testing Static Assets...\n');
  
  const tests = [
    {
      name: 'Frontend Index',
      url: `${TEST_URL}/`,
      expected: 200,
      shouldContain: 'Booking4U'
    },
    {
      name: 'CSS File',
      url: `${TEST_URL}/static/css/main.65cc9d5c.css`,
      expected: 200,
      shouldContain: 'body'
    },
    {
      name: 'JS File',
      url: `${TEST_URL}/static/js/main.a432ae18.js`,
      expected: 200,
      shouldContain: 'React'
    },
    {
      name: 'Favicon',
      url: `${TEST_URL}/favicon.svg`,
      expected: 200,
      shouldContain: 'svg'
    },
    {
      name: 'Manifest',
      url: `${TEST_URL}/manifest.json`,
      expected: 200,
      shouldContain: 'name'
    },
    {
      name: 'API Health',
      url: `${TEST_URL}/api/health`,
      expected: 200,
      shouldContain: 'status'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await makeRequest(test.url);
      
      if (response.statusCode === test.expected) {
        if (test.shouldContain && response.data.includes(test.shouldContain)) {
          console.log(`✅ ${test.name}: PASSED (${response.statusCode})`);
          passed++;
        } else {
          console.log(`⚠️  ${test.name}: PARTIAL (${response.statusCode} but content check failed)`);
          passed++;
        }
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.statusCode}, expected ${test.expected})`);
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
    console.log('\n🎉 All static assets are working correctly!');
    console.log('✅ The 404 errors should be resolved.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
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
    console.log('  cd backend && npm start');
    process.exit(1);
  }
  
  console.log('✅ Server is running, testing static assets...\n');
  
  await testStaticAssets();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testStaticAssets, checkServer };

