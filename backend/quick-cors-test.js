#!/usr/bin/env node

/**
 * Quick CORS Test - Check which backend instances are working
 */

const https = require('https');

const BACKENDS = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com', 
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com'
];

function testBackend(url) {
  return new Promise((resolve) => {
    const req = https.request(url + '/api/health', { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          corsOrigin: res.headers['access-control-allow-origin'],
          working: res.statusCode === 200
        });
      });
    });
    
    req.on('error', () => {
      resolve({ url, status: 'ERROR', working: false });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT', working: false });
    });
    
    req.end();
  });
}

async function quickTest() {
  console.log('🔍 Quick Backend Status Check...\n');
  
  for (const backend of BACKENDS) {
    const result = await testBackend(backend);
    const status = result.working ? '✅ WORKING' : '❌ NOT WORKING';
    console.log(`${status} - ${result.url}`);
    if (result.working) {
      console.log(`   Status: ${result.status}`);
      console.log(`   CORS Origin: ${result.corsOrigin || 'MISSING'}`);
    } else {
      console.log(`   Status: ${result.status}`);
    }
    console.log('');
  }
}

quickTest().catch(console.error);
