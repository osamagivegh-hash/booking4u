// Debug script to test frontend login
import { getApiUrl, testApiConnectivity } from './config/apiConfig';

const testFrontendLogin = async () => {
  console.log('🔍 Debugging Frontend Login...');
  
  try {
    // Test API connection
    console.log('1. Testing API connection...');
    const connectivity = await testApiConnectivity();
    
    if (!connectivity.success) {
      console.error('❌ No API servers available');
      return;
    }
    
    const apiUrl = `${connectivity.url}/api`;
    const response = await fetch(`${apiUrl}/health`);
    const healthData = await response.json();
    console.log('✅ API Health Check:', healthData);
    
    // Test login API directly
    console.log('2. Testing Login API...');
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login Response:', loginData);
    
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log('User Role:', loginData.data.user.role);
      console.log('Token Present:', !!loginData.data.token);
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run the test
testFrontendLogin();


