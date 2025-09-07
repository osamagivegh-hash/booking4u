#!/usr/bin/env node

/**
 * Simple test script to verify the messaging system is working
 * This script tests the basic functionality of the messaging API
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test configuration
const testConfig = {
  user1: {
    email: 'test1@example.com',
    password: 'password123',
    name: 'Test User 1'
  },
  user2: {
    email: 'test2@example.com',
    password: 'password123',
    name: 'Test User 2'
  }
};

let user1Token = null;
let user2Token = null;
let user1Id = null;
let user2Id = null;

async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Request failed: ${method} ${url}`);
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function createTestUser(userData) {
  try {
    console.log(`👤 Creating test user: ${userData.email}`);
    
    // Try to register the user
    const registerResponse = await makeRequest('POST', '/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'customer'
    });

    console.log(`✅ User registered: ${userData.email}`);
    return registerResponse.data.token;
  } catch (error) {
    if (error.response?.status === 409) {
      // User already exists, try to login
      console.log(`👤 User already exists, logging in: ${userData.email}`);
      const loginResponse = await makeRequest('POST', '/auth/login', {
        email: userData.email,
        password: userData.password
      });
      return loginResponse.data.token;
    }
    throw error;
  }
}

async function getCurrentUser(token) {
  try {
    const response = await makeRequest('GET', '/auth/me', null, token);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get current user');
    throw error;
  }
}

async function testMessageSending() {
  try {
    console.log('\n📤 Testing message sending...');
    
    const messageData = {
      receiverId: user2Id,
      subject: 'Test Message',
      content: 'This is a test message to verify the messaging system is working correctly.',
      messageType: 'general',
      priority: 'normal'
    };

    const response = await makeRequest('POST', '/messages', messageData, user1Token);
    console.log('✅ Message sent successfully');
    console.log('Message ID:', response.data.message._id);
    return response.data.message._id;
  } catch (error) {
    console.error('❌ Failed to send message');
    throw error;
  }
}

async function testMessageRetrieval() {
  try {
    console.log('\n📥 Testing message retrieval...');
    
    // Test inbox
    const inboxResponse = await makeRequest('GET', '/messages/inbox', null, user2Token);
    console.log('✅ Inbox retrieved successfully');
    console.log('Messages count:', inboxResponse.data.messages.length);
    
    // Test sent messages
    const sentResponse = await makeRequest('GET', '/messages/sent', null, user1Token);
    console.log('✅ Sent messages retrieved successfully');
    console.log('Sent messages count:', sentResponse.data.messages.length);
    
    return {
      inbox: inboxResponse.data.messages,
      sent: sentResponse.data.messages
    };
  } catch (error) {
    console.error('❌ Failed to retrieve messages');
    throw error;
  }
}

async function testUnreadCount() {
  try {
    console.log('\n📊 Testing unread count...');
    
    const response = await makeRequest('GET', '/messages/unread-count', null, user2Token);
    console.log('✅ Unread count retrieved successfully');
    console.log('Unread count:', response.data.unreadCount);
    
    return response.data.unreadCount;
  } catch (error) {
    console.error('❌ Failed to get unread count');
    throw error;
  }
}

async function testUserSearch() {
  try {
    console.log('\n🔍 Testing user search...');
    
    const response = await makeRequest('GET', '/users/search?q=Test', null, user1Token);
    console.log('✅ User search successful');
    console.log('Found users:', response.users.length);
    
    return response.users;
  } catch (error) {
    console.error('❌ Failed to search users');
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting messaging system tests...\n');
    
    // Step 1: Create test users
    console.log('Step 1: Creating test users...');
    user1Token = await createTestUser(testConfig.user1);
    user2Token = await createTestUser(testConfig.user2);
    
    // Get user IDs
    const user1 = await getCurrentUser(user1Token);
    const user2 = await getCurrentUser(user2Token);
    user1Id = user1._id;
    user2Id = user2._id;
    
    console.log(`✅ User 1 ID: ${user1Id}`);
    console.log(`✅ User 2 ID: ${user2Id}`);
    
    // Step 2: Test user search
    await testUserSearch();
    
    // Step 3: Test message sending
    const messageId = await testMessageSending();
    
    // Step 4: Test message retrieval
    const messages = await testMessageRetrieval();
    
    // Step 5: Test unread count
    const unreadCount = await testUnreadCount();
    
    // Step 6: Test marking message as read
    if (messages.inbox.length > 0) {
      console.log('\n📖 Testing mark as read...');
      const firstMessage = messages.inbox[0];
      await makeRequest('PUT', `/messages/${firstMessage._id}/read`, null, user2Token);
      console.log('✅ Message marked as read');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\nSummary:');
    console.log(`- Users created: 2`);
    console.log(`- Messages sent: 1`);
    console.log(`- Messages in inbox: ${messages.inbox.length}`);
    console.log(`- Messages in sent: ${messages.sent.length}`);
    console.log(`- Unread count: ${unreadCount}`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if the API server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ API server is running');
    return true;
  } catch (error) {
    console.error('❌ API server is not running. Please start the backend server first.');
    console.error('Run: cd backend && npm start');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🧪 Messaging System Test Script');
  console.log('================================\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

// Run the tests
main().catch(console.error);




