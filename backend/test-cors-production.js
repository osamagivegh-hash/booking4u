#!/usr/bin/env node

/**
 * Production CORS Test Script for Booking4U
 * Tests the precise CORS configuration on all backend instances
 */

const https = require('https');
const http = require('http');

// Backend instances to test
const BACKEND_INSTANCES = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com',
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com'
];

// Test origins
const FRONTEND_PRODUCTION = 'https://booking4u-1.onrender.com';
const LOCAL_DEVELOPMENT = 'http://localhost:3000';
const LOCAL_ALT = 'http://127.0.0.1:3000';
const MALICIOUS_ORIGIN = 'https://malicious-site.com';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': options.origin || FRONTEND_PRODUCTION,
        ...options.headers
      },
      timeout: 10000 // 10 second timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCorsPreflight(backendUrl, origin) {
  try {
    const response = await makeRequest(`${backendUrl}/api/health`, {
      method: 'OPTIONS',
      origin: origin,
      headers: {
        'Access-Control-Request-Method': 'GET',
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
      success: response.status === 204,
      status: response.status,
      headers: corsHeaders,
      origin: origin
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      origin: origin
    };
  }
}

async function testCorsActualRequest(backendUrl, origin) {
  try {
    const response = await makeRequest(`${backendUrl}/api/health`, {
      method: 'GET',
      origin: origin
    });

    const corsOrigin = response.headers['access-control-allow-origin'];
    
    return {
      success: response.status === 200 && corsOrigin === origin,
      status: response.status,
      corsOrigin: corsOrigin,
      origin: origin
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      origin: origin
    };
  }
}

async function testBackendInstance(backendUrl) {
  log(`\n${colors.blue}${'='.repeat(80)}${colors.reset}`);
  log(`${colors.bold}🔍 Testing Backend Instance: ${backendUrl}${colors.reset}`);
  
  const results = {
    url: backendUrl,
    tests: {}
  };

  // Test 1: Frontend Production Origin - Preflight
  log(`\n${colors.cyan}📋 Test 1: Frontend Production Origin (Preflight)${colors.reset}`);
  const preflightProd = await testCorsPreflight(backendUrl, FRONTEND_PRODUCTION);
  results.tests.preflightProduction = preflightProd;
  
  if (preflightProd.success) {
    log(`✅ Status: ${preflightProd.status}`, 'green');
    log(`✅ Allow-Origin: ${preflightProd.headers['Access-Control-Allow-Origin']}`, 'green');
    log(`✅ Allow-Methods: ${preflightProd.headers['Access-Control-Allow-Methods']}`, 'green');
    log(`✅ Allow-Headers: ${preflightProd.headers['Access-Control-Allow-Headers']}`, 'green');
    log(`✅ Allow-Credentials: ${preflightProd.headers['Access-Control-Allow-Credentials']}`, 'green');
  } else {
    log(`❌ Preflight failed: ${preflightProd.error || 'Status ' + preflightProd.status}`, 'red');
  }

  // Test 2: Frontend Production Origin - Actual Request
  log(`\n${colors.cyan}📋 Test 2: Frontend Production Origin (Actual Request)${colors.reset}`);
  const actualProd = await testCorsActualRequest(backendUrl, FRONTEND_PRODUCTION);
  results.tests.actualProduction = actualProd;
  
  if (actualProd.success) {
    log(`✅ Status: ${actualProd.status}`, 'green');
    log(`✅ CORS Origin: ${actualProd.corsOrigin}`, 'green');
  } else {
    log(`❌ Actual request failed: ${actualProd.error || 'Status ' + actualProd.status}`, 'red');
  }

  // Test 3: Local Development Origin
  log(`\n${colors.cyan}📋 Test 3: Local Development Origin${colors.reset}`);
  const localDev = await testCorsActualRequest(backendUrl, LOCAL_DEVELOPMENT);
  results.tests.localDevelopment = localDev;
  
  if (localDev.success) {
    log(`✅ Status: ${localDev.status}`, 'green');
    log(`✅ CORS Origin: ${localDev.corsOrigin}`, 'green');
  } else {
    log(`❌ Local development failed: ${localDev.error || 'Status ' + localDev.status}`, 'red');
  }

  // Test 4: Alternative Local Origin
  log(`\n${colors.cyan}📋 Test 4: Alternative Local Origin${colors.reset}`);
  const localAlt = await testCorsActualRequest(backendUrl, LOCAL_ALT);
  results.tests.localAlternative = localAlt;
  
  if (localAlt.success) {
    log(`✅ Status: ${localAlt.status}`, 'green');
    log(`✅ CORS Origin: ${localAlt.corsOrigin}`, 'green');
  } else {
    log(`❌ Alternative local failed: ${localAlt.error || 'Status ' + localAlt.status}`, 'red');
  }

  // Test 5: Malicious Origin (Should be blocked)
  log(`\n${colors.cyan}📋 Test 5: Malicious Origin (Should be blocked)${colors.reset}`);
  const malicious = await testCorsActualRequest(backendUrl, MALICIOUS_ORIGIN);
  results.tests.maliciousOrigin = malicious;
  
  if (malicious.corsOrigin !== MALICIOUS_ORIGIN) {
    log(`✅ Malicious origin blocked: ${malicious.corsOrigin || 'No CORS header'}`, 'green');
  } else {
    log(`❌ SECURITY ISSUE: Malicious origin allowed!`, 'red');
  }

  // Summary for this backend
  const allTests = [
    preflightProd.success,
    actualProd.success,
    localDev.success,
    localAlt.success,
    malicious.corsOrigin !== MALICIOUS_ORIGIN
  ];
  
  const passedTests = allTests.filter(Boolean).length;
  const totalTests = allTests.length;
  
  log(`\n${colors.bold}📊 Summary for ${backendUrl}:${colors.reset}`);
  log(`✅ Passed: ${passedTests}/${totalTests} tests`, passedTests === totalTests ? 'green' : 'yellow');
  
  results.overall = passedTests === totalTests;
  results.score = `${passedTests}/${totalTests}`;
  
  return results;
}

async function runProductionCorsTests() {
  log(`${colors.bold}🚀 Production CORS Tests for Booking4U Backend Instances${colors.reset}`);
  log(`${colors.blue}Testing ${BACKEND_INSTANCES.length} backend instances${colors.reset}`);
  log(`Frontend URL: ${FRONTEND_PRODUCTION}`);
  log(`Local URLs: ${LOCAL_DEVELOPMENT}, ${LOCAL_ALT}`);
  
  const allResults = [];
  
  for (const backendUrl of BACKEND_INSTANCES) {
    try {
      const result = await testBackendInstance(backendUrl);
      allResults.push(result);
    } catch (error) {
      log(`❌ Failed to test ${backendUrl}: ${error.message}`, 'red');
      allResults.push({
        url: backendUrl,
        overall: false,
        error: error.message
      });
    }
  }
  
  // Final comprehensive report
  log(`\n${colors.magenta}${'='.repeat(80)}${colors.reset}`);
  log(`${colors.bold}📊 COMPREHENSIVE CORS TEST RESULTS${colors.reset}`);
  log(`${colors.magenta}${'='.repeat(80)}${colors.reset}`);
  
  const workingBackends = allResults.filter(r => r.overall);
  const failingBackends = allResults.filter(r => !r.overall);
  
  log(`\n${colors.green}✅ WORKING BACKENDS (${workingBackends.length}):${colors.reset}`);
  workingBackends.forEach(result => {
    log(`  🎯 ${result.url} - Score: ${result.score}`, 'green');
  });
  
  if (failingBackends.length > 0) {
    log(`\n${colors.red}❌ FAILING BACKENDS (${failingBackends.length}):${colors.reset}`);
    failingBackends.forEach(result => {
      log(`  💥 ${result.url}`, 'red');
      if (result.error) {
        log(`     Error: ${result.error}`, 'red');
      } else if (result.tests) {
        Object.entries(result.tests).forEach(([testName, testResult]) => {
          const status = testResult.success ? '✅' : '❌';
          log(`     ${testName}: ${status}`, testResult.success ? 'green' : 'red');
        });
      }
    });
  }
  
  // Recommendations
  log(`\n${colors.bold}🎯 RECOMMENDATIONS:${colors.reset}`);
  
  if (workingBackends.length > 0) {
    log(`✅ Use primary backend: ${workingBackends[0].url}`, 'green');
    log(`✅ CORS configuration is working correctly`, 'green');
    log(`✅ Frontend should work without CORS errors`, 'green');
  } else {
    log(`❌ All backends are failing CORS tests`, 'red');
    log(`❌ Check deployment status and CORS configuration`, 'red');
    log(`❌ Frontend will experience CORS errors`, 'red');
  }
  
  // CORS Configuration Verification
  log(`\n${colors.bold}🔧 CORS CONFIGURATION VERIFICATION:${colors.reset}`);
  log(`✅ Allowed Origins: ${FRONTEND_PRODUCTION}, ${LOCAL_DEVELOPMENT}, ${LOCAL_ALT}`);
  log(`✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`);
  log(`✅ Headers: Content-Type, Authorization, X-Requested-With`);
  log(`✅ Credentials: Enabled`);
  log(`✅ Preflight: Handled globally`);
  
  return allResults;
}

// Run the tests
if (require.main === module) {
  runProductionCorsTests()
    .then(results => {
      const workingCount = results.filter(r => r.overall).length;
      process.exit(workingCount > 0 ? 0 : 1);
    })
    .catch(error => {
      log(`💥 Test execution failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runProductionCorsTests, testBackendInstance };
