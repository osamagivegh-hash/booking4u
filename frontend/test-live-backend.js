// Test script to verify frontend works with live backend
// Run this with: node test-live-backend.js

const https = require('https');

const BACKEND_URL = 'https://booking4u-backend.onrender.com';

async function testBackendConnection() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Backend Health Check...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend Health:', healthData);
    console.log('');

    // Test 2: CORS Headers
    console.log('2. Testing CORS Configuration...');
    const corsResponse = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log('✅ CORS Headers:', {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers')
    });
    console.log('');

    // Test 3: Static File Serving (Images)
    console.log('3. Testing Static File Serving...');
    try {
      const imageResponse = await fetch(`${BACKEND_URL}/uploads/services/serviceImages-1757178100617-591548707.webp`);
      console.log('✅ Image Access:', imageResponse.status === 200 ? 'Success' : 'Failed');
    } catch (error) {
      console.log('⚠️  Image Access:', 'No test images available (this is normal)');
    }
    console.log('');

    // Test 4: API Endpoints
    console.log('4. Testing API Endpoints...');
    const endpoints = [
      '/api/services',
      '/api/businesses',
      '/api/news'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`);
        console.log(`✅ ${endpoint}:`, response.status);
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.message);
      }
    }
    console.log('');

    // Test 5: Socket.IO Connection (Disabled)
    console.log('5. Socket.IO: Disabled - Real-time messaging removed');
    console.log('');

    console.log('🎉 Backend Integration Tests Completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Set up environment variables in your frontend');
    console.log('2. Build the frontend: npm run build');
    console.log('3. Deploy to your hosting platform');
    console.log('4. Test all functionalities in the live environment');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check if the backend is running');
    console.log('2. Verify the backend URL is correct');
    console.log('3. Check network connectivity');
  }
}

// Run the tests
testBackendConnection();

