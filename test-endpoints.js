const https = require('https');

// Test function
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${description}: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, {
        'content-type': res.headers['content-type'],
        'access-control-allow-origin': res.headers['access-control-allow-origin']
      });
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`📄 Response:`, json);
        } catch (e) {
          console.log(`📄 Response:`, data.substring(0, 200));
        }
        resolve({ status: res.statusCode, success: res.statusCode === 200 });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ status: 0, success: false, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout`);
      req.destroy();
      resolve({ status: 0, success: false, error: 'timeout' });
    });
  });
}

async function runTests() {
  console.log('🚀 Starting endpoint tests...\n');
  
  const tests = [
    {
      url: 'https://booking4u-backend.onrender.com/api/health',
      description: 'Backend Health Check'
    },
    {
      url: 'https://booking4u-1.onrender.com/api/health',
      description: 'Frontend Health Check (should proxy to backend)'
    },
    {
      url: 'https://booking4u-1.onrender.com/static/css/main.c00d3f3d.css',
      description: 'Static CSS Asset'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    results.push({ ...test, ...result });
  }
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.description}: ${result.status}`);
  });
  
  const allPassed = results.every(r => r.success);
  console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

runTests().catch(console.error);
