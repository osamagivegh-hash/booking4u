#!/usr/bin/env node

/**
 * Test script for booking creation
 * This script tests the booking creation API with various scenarios
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// Test data
const testBookingData = {
  businessId: '507f1f77bcf86cd799439011', // Replace with actual business ID
  serviceId: '507f1f77bcf86cd799439012', // Replace with actual service ID
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  startTime: '10:00',
  notes: {
    customer: 'Test booking from script'
  }
};

async function testBookingCreation() {
  try {
    console.log('🧪 Testing Booking Creation API...\n');

    // Step 1: Login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test booking creation with valid data
    console.log('2. Testing booking creation with valid data...');
    console.log('Booking data:', testBookingData);

    const bookingResponse = await axios.post(`${API_BASE_URL}/bookings`, testBookingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (bookingResponse.data.success) {
      console.log('✅ Booking created successfully!');
      console.log('Booking ID:', bookingResponse.data.data._id);
    } else {
      console.log('❌ Booking creation failed:', bookingResponse.data.message);
    }

    // Step 3: Test booking creation with missing fields
    console.log('\n3. Testing booking creation with missing businessId...');
    
    const invalidBookingData = { ...testBookingData };
    delete invalidBookingData.businessId;

    try {
      await axios.post(`${API_BASE_URL}/bookings`, invalidBookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returned 400 Bad Request');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Step 4: Test booking creation with invalid date
    console.log('\n4. Testing booking creation with invalid date...');
    
    const invalidDateData = { ...testBookingData };
    invalidDateData.date = 'invalid-date';

    try {
      await axios.post(`${API_BASE_URL}/bookings`, invalidDateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returned 400 Bad Request');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Step 5: Test booking creation with past date
    console.log('\n5. Testing booking creation with past date...');
    
    const pastDateData = { ...testBookingData };
    pastDateData.date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Yesterday

    try {
      await axios.post(`${API_BASE_URL}/bookings`, pastDateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returned 400 Bad Request');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n🎉 Booking creation tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testBookingCreation();
}

module.exports = { testBookingCreation };
