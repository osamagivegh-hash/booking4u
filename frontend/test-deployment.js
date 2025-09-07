// Test script to verify deployment configuration
import { getApiUrl, getBaseUrl, testApiConnectivity } from './src/config/apiConfig';

const testDeployment = async () => {
  console.log('🚀 Testing Deployment Configuration...\n');
  
  // Test 1: Environment Variables
  console.log('1. Environment Variables:');
  console.log(`   REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'Not set'}`);
  console.log(`   REACT_APP_BASE_URL: ${process.env.REACT_APP_BASE_URL || 'Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
  
  // Test 2: API URL Generation
  console.log('\n2. API URL Generation:');
  const apiUrl = getApiUrl();
  const baseUrl = getBaseUrl();
  console.log(`   Generated API URL: ${apiUrl}`);
  console.log(`   Generated Base URL: ${baseUrl}`);
  
  // Test 3: API Connectivity
  console.log('\n3. API Connectivity Test:');
  try {
    const connectivity = await testApiConnectivity();
    if (connectivity.success) {
      console.log(`   ✅ API is reachable at: ${connectivity.url}`);
    } else {
      console.log('   ❌ API is not reachable');
    }
  } catch (error) {
    console.log(`   ❌ Connectivity test failed: ${error.message}`);
  }
  
  // Test 4: Health Check
  console.log('\n4. Health Check:');
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      const healthData = await response.json();
      console.log('   ✅ Health check passed:', healthData);
    } else {
      console.log(`   ❌ Health check failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Health check error: ${error.message}`);
  }
  
  // Test 5: Configuration Summary
  console.log('\n5. Configuration Summary:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API URL: ${apiUrl}`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Using Environment Variable: ${!!process.env.REACT_APP_API_URL}`);
  
  console.log('\n🎉 Deployment test completed!');
};

// Run the test
testDeployment().catch(console.error);
