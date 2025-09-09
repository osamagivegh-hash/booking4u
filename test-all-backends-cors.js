const https = require('https');

// All backend domains to test
const backendDomains = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com',
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com'
];

const frontendOrigin = 'https://booking4u-1.onrender.com';

async function testCorsOptions(url) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing OPTIONS request for: ${url}`);
    
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': frontendOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const req = https.request(url + '/api/health', options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials']
      };
      
      console.log(`   CORS Headers:`);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`     ✅ ${key}: ${value}`);
        } else {
          console.log(`     ❌ ${key}: MISSING`);
        }
      });
      
      resolve({
        url,
        status: res.statusCode,
        corsHeaders,
        success: corsHeaders['access-control-allow-origin'] === frontendOrigin
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({
        url,
        status: null,
        error: error.message,
        success: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Timeout`);
      resolve({
        url,
        status: null,
        error: 'Timeout',
        success: false
      });
    });

    req.end();
  });
}

async function testCorsGet(url) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing GET request for: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'Origin': frontendOrigin
      }
    };

    const req = https.request(url + '/api/health', options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        
        const corsHeaders = {
          'access-control-allow-origin': res.headers['access-control-allow-origin'],
          'access-control-allow-credentials': res.headers['access-control-allow-credentials']
        };
        
        console.log(`   CORS Headers:`);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          if (value) {
            console.log(`     ✅ ${key}: ${value}`);
          } else {
            console.log(`     ❌ ${key}: MISSING`);
          }
        });
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 200)}`);
        }
        
        resolve({
          url,
          status: res.statusCode,
          corsHeaders,
          success: corsHeaders['access-control-allow-origin'] === frontendOrigin
        });
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({
        url,
        status: null,
        error: error.message,
        success: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Timeout`);
      resolve({
        url,
        status: null,
        error: 'Timeout',
        success: false
      });
    });

    req.end();
  });
}

async function testAllBackends() {
  console.log('🚀 Testing CORS on All Backend Domains');
  console.log(`🎯 Frontend Origin: ${frontendOrigin}`);
  console.log(`🔧 Testing ${backendDomains.length} backend domains`);
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const domain of backendDomains) {
    console.log(`\n📡 Testing: ${domain}`);
    console.log('-'.repeat(50));
    
    const optionsResult = await testCorsOptions(domain);
    const getResult = await testCorsGet(domain);
    
    results.push({
      domain,
      options: optionsResult,
      get: getResult,
      overallSuccess: optionsResult.success && getResult.success
    });
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 SUMMARY REPORT');
  console.log('='.repeat(60));
  
  const workingBackends = results.filter(r => r.overallSuccess);
  const failingBackends = results.filter(r => !r.overallSuccess);
  
  if (workingBackends.length > 0) {
    console.log('\n✅ WORKING BACKENDS (CORS Headers Present):');
    workingBackends.forEach(result => {
      console.log(`   ${result.domain}`);
      console.log(`     OPTIONS: ${result.options.status} ✅`);
      console.log(`     GET: ${result.get.status} ✅`);
    });
  }
  
  if (failingBackends.length > 0) {
    console.log('\n❌ FAILING BACKENDS (Missing CORS Headers):');
    failingBackends.forEach(result => {
      console.log(`   ${result.domain}`);
      console.log(`     OPTIONS: ${result.options.status || result.options.error} ${result.options.success ? '✅' : '❌'}`);
      console.log(`     GET: ${result.get.status || result.get.error} ${result.get.success ? '✅' : '❌'}`);
    });
  }
  
  console.log('\n🔧 RECOMMENDATIONS:');
  if (workingBackends.length > 0) {
    console.log(`1. Use ${workingBackends[0].domain} as the primary backend URL`);
    console.log('2. Update frontend config to use only this working backend');
    console.log('3. Remove fallback URLs to prevent random switching');
  } else {
    console.log('1. Deploy backend services with CORS fix');
    console.log('2. Ensure CORS middleware is applied before all routes');
    console.log('3. Test again after deployment');
  }
  
  return results;
}

testAllBackends().catch(console.error);
