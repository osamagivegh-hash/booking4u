const https = require('https');

console.log('🔍 Testing Backend Service Status');
console.log('==================================');

const backendUrl = 'https://booking4u-backend.onrender.com';

// Test 1: Basic GET request
function testBasicRequest() {
  return new Promise((resolve) => {
    console.log('\n📡 Test 1: Basic GET Request');
    console.log(`URL: ${backendUrl}/api/health`);
    
    const req = https.request(`${backendUrl}/api/health`, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📋 Headers:`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   Content-Length: ${res.headers['content-length']}`);
        console.log(`📄 Response: ${data.substring(0, 200)}`);
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({
        status: null,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ Timeout`);
      resolve({
        status: null,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

// Test 2: OPTIONS request (preflight)
function testOptionsRequest() {
  return new Promise((resolve) => {
    console.log('\n📡 Test 2: OPTIONS Request (Preflight)');
    console.log(`URL: ${backendUrl}/api/health`);
    
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://booking4u-1.onrender.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const req = https.request(`${backendUrl}/api/health`, options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 CORS Headers:`);
      
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        const value = res.headers[header];
        if (value) {
          console.log(`   ✅ ${header}: ${value}`);
        } else {
          console.log(`   ❌ ${header}: MISSING`);
        }
      });
      
      resolve({
        status: res.statusCode,
        corsHeaders: corsHeaders.reduce((acc, header) => {
          acc[header] = res.headers[header] || null;
          return acc;
        }, {})
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({
        status: null,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ Timeout`);
      resolve({
        status: null,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

// Test 3: GET request with Origin header
function testGetWithOrigin() {
  return new Promise((resolve) => {
    console.log('\n📡 Test 3: GET Request with Origin Header');
    console.log(`URL: ${backendUrl}/api/health`);
    
    const options = {
      method: 'GET',
      headers: {
        'Origin': 'https://booking4u-1.onrender.com'
      }
    };

    const req = https.request(`${backendUrl}/api/health`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📋 CORS Headers:`);
        
        const corsHeaders = [
          'access-control-allow-origin',
          'access-control-allow-credentials'
        ];
        
        corsHeaders.forEach(header => {
          const value = res.headers[header];
          if (value) {
            console.log(`   ✅ ${header}: ${value}`);
          } else {
            console.log(`   ❌ ${header}: MISSING`);
          }
        });
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`📄 Response: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (e) {
          console.log(`📄 Response: ${data}`);
        }
        
        resolve({
          status: res.statusCode,
          corsHeaders: corsHeaders.reduce((acc, header) => {
            acc[header] = res.headers[header] || null;
            return acc;
          }, {}),
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({
        status: null,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ Timeout`);
      resolve({
        status: null,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log(`🎯 Testing: ${backendUrl}`);
  console.log(`🎯 Frontend Origin: https://booking4u-1.onrender.com`);
  
  const results = [];
  
  const test1 = await testBasicRequest();
  const test2 = await testOptionsRequest();
  const test3 = await testGetWithOrigin();
  
  results.push({ test: 'Basic GET', result: test1 });
  results.push({ test: 'OPTIONS', result: test2 });
  results.push({ test: 'GET with Origin', result: test3 });
  
  console.log('\n📊 SUMMARY');
  console.log('===========');
  
  results.forEach(({ test, result }) => {
    console.log(`\n${test}:`);
    if (result.status) {
      console.log(`   Status: ${result.status}`);
      if (result.corsHeaders) {
        const hasOrigin = result.corsHeaders['access-control-allow-origin'];
        console.log(`   CORS Origin: ${hasOrigin ? '✅ ' + hasOrigin : '❌ MISSING'}`);
      }
    } else {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n🔧 DIAGNOSIS:');
  const basicWorking = results[0].result.status === 200;
  const optionsWorking = results[1].result.status === 200;
  const corsHeadersPresent = results[1].result.corsHeaders && results[1].result.corsHeaders['access-control-allow-origin'];
  
  if (!basicWorking) {
    console.log('❌ Backend service is not accessible (404/500/timeout)');
    console.log('   → Service is not deployed or not running');
  } else if (!optionsWorking) {
    console.log('❌ OPTIONS requests are failing');
    console.log('   → CORS preflight handling is broken');
  } else if (!corsHeadersPresent) {
    console.log('❌ CORS headers are missing');
    console.log('   → CORS middleware is not working');
  } else {
    console.log('✅ Backend service is working correctly');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  if (!basicWorking) {
    console.log('1. Deploy backend service on Render dashboard');
    console.log('2. Check service logs for errors');
    console.log('3. Verify environment variables');
  } else if (!optionsWorking || !corsHeadersPresent) {
    console.log('1. Check CORS middleware configuration');
    console.log('2. Verify OPTIONS request handling');
    console.log('3. Test with updated CORS fix');
  }
}

runTests().catch(console.error);
