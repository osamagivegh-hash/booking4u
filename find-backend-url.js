const https = require('https');

// Common Render URL patterns to test
const possibleUrls = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com', 
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com',
  'https://booking4u-backend-4.onrender.com',
  'https://booking4u-backend-5.onrender.com',
  'https://booking4u-backend-6.onrender.com',
  'https://booking4u-backend-7.onrender.com',
  'https://booking4u-backend-8.onrender.com',
  'https://booking4u-backend-9.onrender.com',
  'https://booking4u-backend-10.onrender.com',
  // Also try without numbers
  'https://booking4u-backend-main.onrender.com',
  'https://booking4u-backend-prod.onrender.com',
  'https://booking4u-backend-production.onrender.com',
  'https://booking4u-backend-api.onrender.com',
  'https://booking4u-api.onrender.com',
  'https://booking4u-backend-service.onrender.com'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url + '/api/health', { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode === 200,
          data: data.substring(0, 200) // First 200 chars
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: null,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: null,
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function findWorkingBackend() {
  console.log('🔍 Searching for working backend URLs...');
  console.log(`Testing ${possibleUrls.length} possible URLs\n`);
  
  const results = [];
  
  for (const url of possibleUrls) {
    process.stdout.write(`Testing ${url}... `);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ WORKING! (${result.status})`);
    } else {
      console.log(`❌ ${result.status || result.error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 RESULTS:');
  console.log('='.repeat(60));
  
  const workingUrls = results.filter(r => r.success);
  
  if (workingUrls.length > 0) {
    console.log('✅ WORKING BACKEND URLS:');
    workingUrls.forEach(result => {
      console.log(`   ${result.url}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${result.data}`);
      console.log('');
    });
  } else {
    console.log('❌ NO WORKING BACKEND URLS FOUND');
    console.log('\nAll tested URLs returned errors or timeouts.');
    console.log('\nPossible issues:');
    console.log('1. Backend services are not deployed on Render');
    console.log('2. Backend services are down/sleeping');
    console.log('3. URLs are incorrect');
    console.log('4. Services are deployed with different names');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (workingUrls.length > 0) {
    console.log('1. Use one of the working URLs above');
    console.log('2. Test CORS with the working URL');
    console.log('3. Update frontend configuration if needed');
  } else {
    console.log('1. Check Render dashboard for actual service URLs');
    console.log('2. Deploy backend services if they are not deployed');
    console.log('3. Check if services are sleeping (Render free tier limitation)');
  }
}

findWorkingBackend().catch(console.error);
