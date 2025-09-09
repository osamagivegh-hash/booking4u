#!/usr/bin/env node

/**
 * CORS Test Script
 * Tests the CORS configuration for the Booking4U backend
 */

const https = require('https');
const http = require('http');

// Test configuration
const BACKEND_URLS = [
  'https://booking4u-backend.onrender.com',
  'https://booking4u-backend-1.onrender.com',
  'https://booking4u-backend-2.onrender.com',
  'https://booking4u-backend-3.onrender.com'
];

const FRONTEND_URL = 'https://booking4u-1.onrender.com';
const LOCAL_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
        'Origin': options.origin || FRONTEND_URL,
        ...options.headers
      }
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
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCorsPreflight(backendUrl) {
  log(`\n${colors.bold}Testing CORS Preflight for: ${backendUrl}${colors.reset}`);
  
  try {
    // Test OPTIONS request (preflight)
    const response = await makeRequest(`${backendUrl}/api/health`, {
      method: 'OPTIONS',
      origin: FRONTEND_URL,
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

    log(`Status: ${response.status}`, response.status === 204 ? 'green' : 'red');
    
    // Check CORS headers
    const checks = [
      { name: 'Allow-Origin', value: corsHeaders['Access-Control-Allow-Origin'], expected: FRONTEND_URL },
      { name: 'Allow-Methods', value: corsHeaders['Access-Control-Allow-Methods'], expected: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
      { name: 'Allow-Headers', value: corsHeaders['Access-Control-Allow-Headers'], expected: 'Content-Type,Authorization,X-Requested-With' },
      { name: 'Allow-Credentials', value: corsHeaders['Access-Control-Allow-Credentials'], expected: 'true' }
    ];

    checks.forEach(check => {
      const isValid = check.value === check.expected;
      log(`  ${check.name}: ${check.value || 'MISSING'} ${isValid ? '✅' : '❌'}`, isValid ? 'green' : 'red');
    });

    return response.status === 204 && corsHeaders['Access-Control-Allow-Origin'] === FRONTEND_URL;

  } catch (error) {
    log(`❌ Preflight test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCorsActualRequest(backendUrl) {
  log(`\n${colors.bold}Testing CORS Actual Request for: ${backendUrl}${colors.reset}`);
  
  try {
    // Test actual GET request
    const response = await makeRequest(`${backendUrl}/api/health`, {
      method: 'GET',
      origin: FRONTEND_URL
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    const corsOrigin = response.headers['access-control-allow-origin'];
    log(`CORS Origin: ${corsOrigin || 'MISSING'} ${corsOrigin === FRONTEND_URL ? '✅' : '❌'}`, corsOrigin === FRONTEND_URL ? 'green' : 'red');

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.data);
        log(`Response: ${data.message || 'OK'}`, 'green');
        return true;
      } catch (e) {
        log(`❌ Invalid JSON response`, 'red');
        return false;
      }
    }

    return false;

  } catch (error) {
    log(`❌ Actual request test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testLocalOrigin(backendUrl) {
  log(`\n${colors.bold}Testing Local Origin for: ${backendUrl}${colors.reset}`);
  
  try {
    const response = await makeRequest(`${backendUrl}/api/health`, {
      method: 'GET',
      origin: LOCAL_URL
    });

    const corsOrigin = response.headers['access-control-allow-origin'];
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`CORS Origin: ${corsOrigin || 'MISSING'} ${corsOrigin === LOCAL_URL ? '✅' : '❌'}`, corsOrigin === LOCAL_URL ? 'green' : 'red');

    return response.status === 200 && corsOrigin === LOCAL_URL;

  } catch (error) {
    log(`❌ Local origin test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testBlockedOrigin(backendUrl) {
  log(`\n${colors.bold}Testing Blocked Origin for: ${backendUrl}${colors.reset}`);
  
  try {
    const response = await makeRequest(`${backendUrl}/api/health`, {
      method: 'GET',
      origin: 'https://malicious-site.com'
    });

    const corsOrigin = response.headers['access-control-allow-origin'];
    log(`Status: ${response.status}`, 'yellow');
    log(`CORS Origin: ${corsOrigin || 'MISSING'} ${corsOrigin === 'https://malicious-site.com' ? '❌ ALLOWED!' : '✅ BLOCKED'}`, corsOrigin === 'https://malicious-site.com' ? 'red' : 'green');

    return corsOrigin !== 'https://malicious-site.com';

  } catch (error) {
    log(`❌ Blocked origin test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log(`${colors.bold}🚀 Starting CORS Tests for Booking4U Backend${colors.reset}`);
  log(`Frontend URL: ${FRONTEND_URL}`);
  log(`Local URL: ${LOCAL_URL}`);
  
  const results = {};
  
  for (const backendUrl of BACKEND_URLS) {
    log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
    log(`${colors.bold}Testing: ${backendUrl}${colors.reset}`);
    
    const preflightResult = await testCorsPreflight(backendUrl);
    const actualResult = await testCorsActualRequest(backendUrl);
    const localResult = await testLocalOrigin(backendUrl);
    const blockedResult = await testBlockedOrigin(backendUrl);
    
    results[backendUrl] = {
      preflight: preflightResult,
      actual: actualResult,
      local: localResult,
      blocked: blockedResult,
      overall: preflightResult && actualResult && localResult && blockedResult
    };
    
    log(`\n${colors.bold}Summary for ${backendUrl}:${colors.reset}`);
    log(`  Preflight: ${preflightResult ? '✅' : '❌'}`, preflightResult ? 'green' : 'red');
    log(`  Actual Request: ${actualResult ? '✅' : '❌'}`, actualResult ? 'green' : 'red');
    log(`  Local Origin: ${localResult ? '✅' : '❌'}`, localResult ? 'green' : 'red');
    log(`  Blocked Origin: ${blockedResult ? '✅' : '❌'}`, blockedResult ? 'green' : 'red');
    log(`  Overall: ${results[backendUrl].overall ? '✅ PASS' : '❌ FAIL'}`, results[backendUrl].overall ? 'green' : 'red');
  }
  
  // Final summary
  log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bold}📊 FINAL RESULTS${colors.reset}`);
  
  const workingBackends = Object.entries(results).filter(([url, result]) => result.overall);
  const failingBackends = Object.entries(results).filter(([url, result]) => !result.overall);
  
  log(`\n✅ Working Backends (${workingBackends.length}):`, 'green');
  workingBackends.forEach(([url, result]) => {
    log(`  ${url}`, 'green');
  });
  
  if (failingBackends.length > 0) {
    log(`\n❌ Failing Backends (${failingBackends.length}):`, 'red');
    failingBackends.forEach(([url, result]) => {
      log(`  ${url}`, 'red');
      log(`    Preflight: ${result.preflight ? '✅' : '❌'}`, result.preflight ? 'green' : 'red');
      log(`    Actual: ${result.actual ? '✅' : '❌'}`, result.actual ? 'green' : 'red');
      log(`    Local: ${result.local ? '✅' : '❌'}`, result.local ? 'green' : 'red');
      log(`    Blocked: ${result.blocked ? '✅' : '❌'}`, result.blocked ? 'green' : 'red');
    });
  }
  
  log(`\n${colors.bold}🎯 Recommendation:${colors.reset}`);
  if (workingBackends.length > 0) {
    log(`Use: ${workingBackends[0][0]}`, 'green');
  } else {
    log(`All backends are failing CORS tests. Check deployment.`, 'red');
  }
}

// Run the tests
runTests().catch(console.error);
