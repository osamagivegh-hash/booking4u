#!/usr/bin/env node

/**
 * Comprehensive CORS Test Script for Booking4U
 * Tests CORS configuration across all environments and endpoints
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Test configuration
const TEST_CONFIG = {
  // Backend URLs to test
  backends: [
    'https://booking4u-backend.onrender.com',
    'https://booking4u-backend-1.onrender.com',
    'https://booking4u-1.onrender.com',
    'http://localhost:10000'
  ],
  
  // Frontend origins to test
  origins: [
    'https://booking4u-1.onrender.com',
    'https://booking4u.onrender.com',
    'https://booking4u-frontend.onrender.com',
    'https://osamagivegh-hash.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  
  // Endpoints to test
  endpoints: [
    '/api/health',
    '/api/test-cors',
    '/api/debug/cors',
    '/api/auth/login'
  ],
  
  // HTTP methods to test
  methods: ['GET', 'POST', 'OPTIONS']
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CORS-Test-Script/1.0',
        ...options.headers
      },
      timeout: 10000
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url,
          method: requestOptions.method
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        error: error.message,
        url: url,
        method: requestOptions.method
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        url: url,
        method: requestOptions.method
      });
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testCorsEndpoint(backend, origin, endpoint, method = 'GET') {
  const url = `${backend}${endpoint}`;
  
  try {
    const response = await makeRequest(url, {
      method: method,
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
      'Access-Control-Max-Age': response.headers['access-control-max-age']
    };
    
    return {
      success: true,
      url: url,
      origin: origin,
      method: method,
      statusCode: response.statusCode,
      corsHeaders: corsHeaders,
      response: response.data
    };
  } catch (error) {
    return {
      success: false,
      url: url,
      origin: origin,
      method: method,
      error: error.error || error.message
    };
  }
}

async function testPreflightRequest(backend, origin, endpoint, method = 'POST') {
  const url = `${backend}${endpoint}`;
  
  try {
    const response = await makeRequest(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
      'Access-Control-Max-Age': response.headers['access-control-max-age']
    };
    
    return {
      success: true,
      url: url,
      origin: origin,
      method: 'OPTIONS',
      statusCode: response.statusCode,
      corsHeaders: corsHeaders,
      preflight: true
    };
  } catch (error) {
    return {
      success: false,
      url: url,
      origin: origin,
      method: 'OPTIONS',
      error: error.error || error.message,
      preflight: true
    };
  }
}

async function runComprehensiveTest() {
  log('🚀 Starting Comprehensive CORS Test for Booking4U', 'bright');
  log('='.repeat(80), 'cyan');
  
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    details: []
  };
  
  for (const backend of TEST_CONFIG.backends) {
    log(`\n🔍 Testing Backend: ${backend}`, 'blue');
    log('-'.repeat(60), 'cyan');
    
    for (const origin of TEST_CONFIG.origins) {
      log(`\n  🌐 Testing Origin: ${origin}`, 'yellow');
      
      for (const endpoint of TEST_CONFIG.endpoints) {
        for (const method of TEST_CONFIG.methods) {
          results.total++;
          
          let result;
          if (method === 'OPTIONS') {
            result = await testPreflightRequest(backend, origin, endpoint, 'POST');
          } else {
            result = await testCorsEndpoint(backend, origin, endpoint, method);
          }
          
          results.details.push(result);
          
          if (result.success) {
            results.successful++;
            log(`    ✅ ${method} ${endpoint} - Status: ${result.statusCode}`, 'green');
            
            // Log CORS headers
            if (result.corsHeaders) {
              const corsInfo = Object.entries(result.corsHeaders)
                .filter(([key, value]) => value)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              
              if (corsInfo) {
                log(`       🔒 CORS: ${corsInfo}`, 'cyan');
              }
            }
          } else {
            results.failed++;
            log(`    ❌ ${method} ${endpoint} - Error: ${result.error}`, 'red');
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  }
  
  // Summary
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 CORS Test Summary', 'bright');
  log('='.repeat(80), 'cyan');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Successful: ${results.successful}`, 'green');
  log(`Failed: ${results.failed}`, 'red');
  log(`Success Rate: ${((results.successful / results.total) * 100).toFixed(2)}%`, 'yellow');
  
  // Detailed results
  log('\n📋 Detailed Results:', 'bright');
  results.details.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`${index + 1}. ${status} ${result.method} ${result.url} (Origin: ${result.origin})`, color);
    
    if (!result.success) {
      log(`   Error: ${result.error}`, 'red');
    } else if (result.corsHeaders) {
      const hasCorsHeaders = Object.values(result.corsHeaders).some(header => header);
      if (hasCorsHeaders) {
        log(`   CORS Headers: Present`, 'green');
      } else {
        log(`   CORS Headers: Missing`, 'yellow');
      }
    }
  });
  
  // Recommendations
  log('\n💡 Recommendations:', 'bright');
  if (results.failed > 0) {
    log('1. Check backend CORS configuration', 'yellow');
    log('2. Verify allowed origins list', 'yellow');
    log('3. Ensure preflight requests are handled', 'yellow');
    log('4. Check server logs for CORS errors', 'yellow');
  } else {
    log('✅ All CORS tests passed! Configuration looks good.', 'green');
  }
  
  log('\n🔧 Debug Endpoints:', 'bright');
  TEST_CONFIG.backends.forEach(backend => {
    log(`   ${backend}/api/debug/cors`, 'cyan');
    log(`   ${backend}/api/health`, 'cyan');
  });
  
  log('\n' + '='.repeat(80), 'cyan');
  log('🏁 CORS Test Complete', 'bright');
}

// Run the test
if (require.main === module) {
  runComprehensiveTest().catch(error => {
    log(`❌ Test failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testCorsEndpoint,
  testPreflightRequest,
  runComprehensiveTest
};
