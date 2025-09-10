const https = require('https');

// Test all possible backend URLs
const backendUrls = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com',
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com',
  'https://booking4u-backend-4.onrender.com'
];

async function testBackend(url) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing backend: ${url}/api/health`);
    
    const req = https.get(`${url}/api/health`, (res) => {
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
        resolve({ 
          url, 
          status: res.statusCode, 
          success: res.statusCode === 200,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ 
        url, 
        status: 0, 
        success: false, 
        error: err.message 
      });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout`);
      req.destroy();
      resolve({ 
        url, 
        status: 0, 
        success: false, 
        error: 'timeout' 
      });
    });
  });
}

async function testAllBackends() {
  console.log('🚀 Testing all backend instances...\n');
  
  const results = [];
  
  for (const url of backendUrls) {
    const result = await testBackend(url);
    results.push(result);
  }
  
  console.log('\n📊 Backend Test Summary:');
  console.log('========================');
  
  const workingBackends = results.filter(r => r.success);
  const failedBackends = results.filter(r => !r.success);
  
  if (workingBackends.length > 0) {
    console.log('✅ Working backends:');
    workingBackends.forEach(result => {
      console.log(`   ${result.url} - Status: ${result.status}`);
    });
  }
  
  if (failedBackends.length > 0) {
    console.log('❌ Failed backends:');
    failedBackends.forEach(result => {
      console.log(`   ${result.url} - Status: ${result.status} - Error: ${result.error || 'N/A'}`);
    });
  }
  
  console.log(`\n🎯 Found ${workingBackends.length} working backend(s) out of ${backendUrls.length} tested`);
  
  return workingBackends;
}

testAllBackends().catch(console.error);
