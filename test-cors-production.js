const https = require('https');

const backendUrls = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com',
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com'
];

const frontendOrigin = 'https://booking4u-1.onrender.com';

async function testCors(url) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing CORS for: ${url}`);
    
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': frontendOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const req = https.request(url + '/api/health', options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 Headers:`);
      
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        const value = res.headers[header];
        if (value) {
          console.log(`   ${header}: ${value}`);
        } else {
          console.log(`   ${header}: ❌ MISSING`);
        }
      });
      
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
        corsHeaders: corsHeaders.reduce((acc, header) => {
          acc[header] = res.headers[header] || null;
          return acc;
        }, {})
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({
        url,
        error: error.message,
        status: null,
        headers: null
      });
    });

    req.end();
  });
}

async function testGetRequest(url) {
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
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📋 CORS Headers:`);
        
        const corsHeaders = [
          'access-control-allow-origin',
          'access-control-allow-credentials'
        ];
        
        corsHeaders.forEach(header => {
          const value = res.headers[header];
          if (value) {
            console.log(`   ${header}: ${value}`);
          } else {
            console.log(`   ${header}: ❌ MISSING`);
          }
        });
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`📄 Response: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (e) {
          console.log(`📄 Response: ${data}`);
        }
        
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({
        url,
        error: error.message,
        status: null,
        headers: null
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting CORS Tests');
  console.log(`🎯 Frontend Origin: ${frontendOrigin}`);
  console.log(`🔧 Testing ${backendUrls.length} backend URLs`);
  
  const results = [];
  
  for (const url of backendUrls) {
    const corsResult = await testCors(url);
    const getResult = await testGetRequest(url);
    
    results.push({
      url,
      cors: corsResult,
      get: getResult
    });
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`\n🔗 ${result.url}`);
    console.log(`   OPTIONS: ${result.cors.status || 'ERROR'}`);
    console.log(`   GET: ${result.get.status || 'ERROR'}`);
    
    if (result.cors.corsHeaders) {
      const hasOrigin = result.cors.corsHeaders['access-control-allow-origin'];
      const hasMethods = result.cors.corsHeaders['access-control-allow-methods'];
      const hasHeaders = result.cors.corsHeaders['access-control-allow-headers'];
      const hasCredentials = result.cors.corsHeaders['access-control-allow-credentials'];
      
      console.log(`   CORS Headers:`);
      console.log(`     Origin: ${hasOrigin ? '✅' : '❌'} ${hasOrigin || 'MISSING'}`);
      console.log(`     Methods: ${hasMethods ? '✅' : '❌'} ${hasMethods || 'MISSING'}`);
      console.log(`     Headers: ${hasHeaders ? '✅' : '❌'} ${hasHeaders || 'MISSING'}`);
      console.log(`     Credentials: ${hasCredentials ? '✅' : '❌'} ${hasCredentials || 'MISSING'}`);
    }
  });
}

runTests().catch(console.error);


