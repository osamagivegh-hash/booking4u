// Test CORS configuration
const https = require('https');

const testCors = async (url) => {
  return new Promise((resolve) => {
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://booking4u-1.onrender.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = https.request(url, options, (res) => {
      console.log(`\n🔍 Testing: ${url}`);
      console.log(`Status: ${res.statusCode}`);
      console.log('CORS Headers:');
      console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
      console.log(`  Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NOT SET'}`);
      console.log(`  Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NOT SET'}`);
      
      resolve({
        url,
        status: res.statusCode,
        corsOrigin: res.headers['access-control-allow-origin'],
        corsMethods: res.headers['access-control-allow-methods'],
        corsHeaders: res.headers['access-control-allow-headers']
      });
    });

    req.on('error', (err) => {
      console.log(`\n❌ Error testing ${url}:`, err.message);
      resolve({
        url,
        error: err.message
      });
    });

    req.end();
  });
};

const testHealthEndpoint = async (url) => {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'Origin': 'https://booking4u-1.onrender.com'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n🏥 Health Check: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`CORS Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
        if (res.statusCode === 200) {
          try {
            const health = JSON.parse(data);
            console.log(`✅ Health Status: ${health.status}`);
          } catch (e) {
            console.log(`Response: ${data.substring(0, 100)}...`);
          }
        }
        resolve({
          url,
          status: res.statusCode,
          corsOrigin: res.headers['access-control-allow-origin']
        });
      });
    });

    req.on('error', (err) => {
      console.log(`\n❌ Error testing health ${url}:`, err.message);
      resolve({
        url,
        error: err.message
      });
    });

    req.end();
  });
};

const main = async () => {
  console.log('🚀 Testing CORS Configuration for Booking4U Backend');
  console.log('=' .repeat(60));
  
  const backendUrls = [
    'https://booking4u-backend.onrender.com/api/health',
    'https://booking4u-backend-1.onrender.com/api/health',
    'https://booking4u-backend-2.onrender.com/api/health',
    'https://booking4u-backend-3.onrender.com/api/health'
  ];

  // Test CORS preflight
  console.log('\n📋 Testing CORS Preflight Requests...');
  for (const url of backendUrls) {
    await testCors(url);
  }

  // Test health endpoints
  console.log('\n🏥 Testing Health Endpoints...');
  for (const url of backendUrls) {
    await testHealthEndpoint(url);
  }

  console.log('\n✅ CORS testing completed!');
};

main().catch(console.error);
