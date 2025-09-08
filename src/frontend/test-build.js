// Test script to verify build configuration
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testBuild = () => {
  console.log('🔨 Testing Build Configuration...\n');
  
  try {
    // Test 1: Check if build directory exists
    console.log('1. Checking build directory...');
    if (fs.existsSync('build')) {
      console.log('   ✅ Build directory exists');
    } else {
      console.log('   ⚠️  Build directory does not exist (run npm run build first)');
    }
    
    // Test 2: Check for _redirects file in build
    console.log('\n2. Checking _redirects file...');
    const redirectsPath = path.join('build', '_redirects');
    if (fs.existsSync(redirectsPath)) {
      const content = fs.readFileSync(redirectsPath, 'utf8');
      console.log('   ✅ _redirects file exists in build directory');
      console.log(`   Content: ${content.trim()}`);
    } else {
      console.log('   ❌ _redirects file missing from build directory');
    }
    
    // Test 3: Check for _headers file in build
    console.log('\n3. Checking _headers file...');
    const headersPath = path.join('build', '_headers');
    if (fs.existsSync(headersPath)) {
      console.log('   ✅ _headers file exists in build directory');
    } else {
      console.log('   ❌ _headers file missing from build directory');
    }
    
    // Test 4: Check index.html
    console.log('\n4. Checking index.html...');
    const indexPath = path.join('build', 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('   ✅ index.html exists in build directory');
    } else {
      console.log('   ❌ index.html missing from build directory');
    }
    
    // Test 5: Check static assets
    console.log('\n5. Checking static assets...');
    const staticPath = path.join('build', 'static');
    if (fs.existsSync(staticPath)) {
      console.log('   ✅ Static assets directory exists');
    } else {
      console.log('   ❌ Static assets directory missing');
    }
    
    console.log('\n🎉 Build test completed!');
    
  } catch (error) {
    console.error('❌ Build test failed:', error.message);
  }
};

// Run the test
testBuild();
