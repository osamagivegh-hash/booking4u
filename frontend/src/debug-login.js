// Debug script to test frontend login
import api from './services/api';

const testFrontendLogin = async () => {
  console.log('🔍 Debugging Frontend Login...');
  
  try {
    // Test API connection using relative paths
    console.log('1. Testing API connection...');
    const response = await api.get('/health');
    const healthData = response.data;
    console.log('✅ API Health Check:', healthData);
    
    // Test login API directly
    console.log('2. Testing Login API...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: '123456'
    });
    
    const loginData = loginResponse.data;
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


