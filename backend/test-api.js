const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: '123456',
  phone: '+966501234567',
  role: 'customer'
};

const businessUser = {
  name: 'Business Owner',
  email: 'business@example.com',
  password: '123456',
  phone: '+966501234568',
  role: 'business'
};

async function testAPI() {
  console.log('🧪 Testing Booking4U API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Register Customer
    console.log('2. Testing Customer Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Customer Registration:', registerResponse.data.message);
    const customerToken = registerResponse.data.data.token;
    console.log('');

    // Test 3: Register Business Owner
    console.log('3. Testing Business Owner Registration...');
    const businessRegisterResponse = await axios.post(`${API_BASE}/auth/register`, businessUser);
    console.log('✅ Business Registration:', businessRegisterResponse.data.message);
    const businessToken = businessRegisterResponse.data.data.token;
    console.log('');

    // Test 4: Login Customer
    console.log('4. Testing Customer Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Customer Login:', loginResponse.data.message);
    console.log('');

    // Test 5: Get User Profile
    console.log('5. Testing Get User Profile...');
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ User Profile:', profileResponse.data.data.user.name);
    console.log('');

    // Test 6: Business Owner Access to Users (Admin Feature)
    console.log('6. Testing Business Owner Admin Access...');
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    console.log('✅ Business Owner can access users:', usersResponse.data.count, 'users found');
    console.log('');

    // Test 7: User Statistics (Admin Feature)
    console.log('7. Testing User Statistics...');
    const statsResponse = await axios.get(`${API_BASE}/users/stats`, {
      headers: { Authorization: `Bearer ${businessToken}` }
    });
    console.log('✅ User Statistics:', statsResponse.data.data);
    console.log('');

    console.log('🎉 All tests passed! The API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testAPI();


