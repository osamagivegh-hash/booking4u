#!/usr/bin/env node

/**
 * CRACO Deep Fix Verification Script
 * This script tests all aspects of the CRACO installation and configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 CRACO Deep Fix Verification Script');
console.log('=====================================\n');

// Test 1: Check if CRACO is installed
console.log('1. Checking CRACO installation...');
try {
  const result = execSync('npm list @craco/craco', { encoding: 'utf8' });
  if (result.includes('@craco/craco')) {
    console.log('✅ CRACO is installed');
    const version = result.match(/@craco\/craco@([^\s]+)/);
    if (version) {
      console.log(`   Version: ${version[1]}`);
    }
  } else {
    console.log('❌ CRACO not found');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error checking CRACO installation:', error.message);
  process.exit(1);
}

// Test 2: Check package.json scripts
console.log('\n2. Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts;
  
  const requiredScripts = ['start', 'build', 'test', 'serve'];
  let allScriptsPresent = true;
  
  requiredScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ ${script}: ${scripts[script]}`);
    } else {
      console.log(`❌ Missing script: ${script}`);
      allScriptsPresent = false;
    }
  });
  
  if (allScriptsPresent) {
    console.log('✅ All required scripts present');
  } else {
    console.log('❌ Some scripts are missing');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Test 3: Check CRACO configuration file
console.log('\n3. Checking CRACO configuration...');
try {
  if (fs.existsSync('craco.config.js')) {
    console.log('✅ craco.config.js exists');
    const config = fs.readFileSync('craco.config.js', 'utf8');
    if (config.includes('webpack') && config.includes('configure')) {
      console.log('✅ CRACO configuration looks valid');
    } else {
      console.log('⚠️  CRACO configuration may be incomplete');
    }
  } else {
    console.log('❌ craco.config.js not found');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error checking CRACO config:', error.message);
  process.exit(1);
}

// Test 4: Check Node version
console.log('\n4. Checking Node version...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion >= 18) {
    console.log('✅ Node version is compatible (18.x or higher)');
  } else {
    console.log('⚠️  Node version may be too old (recommend 18.x)');
  }
} catch (error) {
  console.log('❌ Error checking Node version:', error.message);
  process.exit(1);
}

// Test 5: Check if build directory exists (from previous build)
console.log('\n5. Checking build directory...');
try {
  if (fs.existsSync('build')) {
    console.log('✅ Build directory exists');
    const buildFiles = fs.readdirSync('build');
    if (buildFiles.includes('index.html')) {
      console.log('✅ Build appears to be complete');
    } else {
      console.log('⚠️  Build directory exists but may be incomplete');
    }
  } else {
    console.log('ℹ️  Build directory not found (will be created on build)');
  }
} catch (error) {
  console.log('❌ Error checking build directory:', error.message);
}

// Test 6: Check _redirects file for SPA routing
console.log('\n6. Checking SPA routing configuration...');
try {
  if (fs.existsSync('public/_redirects')) {
    console.log('✅ _redirects file exists');
    const redirects = fs.readFileSync('public/_redirects', 'utf8');
    if (redirects.includes('/*') && redirects.includes('/index.html')) {
      console.log('✅ SPA routing configured correctly');
    } else {
      console.log('⚠️  _redirects file may be misconfigured');
    }
  } else {
    console.log('❌ _redirects file not found');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error checking _redirects file:', error.message);
  process.exit(1);
}

// Test 7: Check environment configuration
console.log('\n7. Checking environment configuration...');
try {
  const envFiles = ['.env', '.env.production', 'env.example.txt', 'env.production.txt'];
  let envFilesFound = 0;
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
      envFilesFound++;
    }
  });
  
  if (envFilesFound > 0) {
    console.log('✅ Environment configuration files found');
  } else {
    console.log('⚠️  No environment configuration files found');
  }
} catch (error) {
  console.log('❌ Error checking environment files:', error.message);
}

console.log('\n🎯 CRACO Deep Fix Verification Complete!');
console.log('=====================================');
console.log('✅ All critical components verified');
console.log('🚀 Project is ready for Render deployment');
console.log('\nNext steps:');
console.log('1. Push changes to GitHub');
console.log('2. Connect repository to Render');
console.log('3. Set environment variables in Render dashboard');
console.log('4. Deploy and monitor build logs');
