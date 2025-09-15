#!/usr/bin/env node

/**
 * Socket.IO Connection Test Script
 * Tests the Socket.IO server and client configuration
 */

import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:10000';
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // Mock user ID for testing
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Create a test JWT token
const testToken = jwt.sign(
  { id: TEST_USER_ID, email: 'test@example.com' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('🧪 Starting Socket.IO Connection Test...');
console.log(`📡 Server URL: ${SERVER_URL}`);
console.log(`🔑 Test Token: ${testToken.substring(0, 20)}...`);

// Test Socket.IO connection
const socket = io(SERVER_URL, {
  auth: {
    token: testToken
  },
  transports: ['polling', 'websocket'],
  timeout: 10000,
  reconnection: false // Disable auto-reconnection for testing
});

let testResults = {
  connection: false,
  authentication: false,
  events: {
    connect: false,
    disconnect: false,
    error: false
  },
  timing: {
    connectionTime: 0,
    startTime: Date.now()
  }
};

// Connection timeout
const connectionTimeout = setTimeout(() => {
  console.log('❌ Connection timeout after 10 seconds');
  socket.disconnect();
  process.exit(1);
}, 10000);

socket.on('connect', () => {
  testResults.connection = true;
  testResults.events.connect = true;
  testResults.timing.connectionTime = Date.now() - testResults.timing.startTime;
  
  console.log('✅ Connected to Socket.IO server');
  console.log(`📊 Connection time: ${testResults.timing.connectionTime}ms`);
  console.log(`🆔 Socket ID: ${socket.id}`);
  
  // Test authentication
  if (socket.userId) {
    testResults.authentication = true;
    console.log('✅ Authentication successful');
    console.log(`👤 User ID: ${socket.userId}`);
  } else {
    console.log('❌ Authentication failed - no user ID');
  }
  
  // Test ping/pong
  console.log('🏓 Testing ping/pong...');
  socket.emit('ping');
  
  // Test message sending
  console.log('📤 Testing message sending...');
  socket.emit('new_message', {
    receiverId: '507f1f77bcf86cd799439012',
    messageId: 'test-message-123',
    content: 'Test message',
    conversationId: 'test-conversation'
  });
  
  // Disconnect after 3 seconds
  setTimeout(() => {
    console.log('🔌 Disconnecting...');
    socket.disconnect();
  }, 3000);
});

socket.on('disconnect', (reason) => {
  testResults.events.disconnect = true;
  console.log(`✅ Disconnected: ${reason}`);
  
  // Print test results
  console.log('\n📊 Test Results:');
  console.log(`Connection: ${testResults.connection ? '✅' : '❌'}`);
  console.log(`Authentication: ${testResults.authentication ? '✅' : '❌'}`);
  console.log(`Events - Connect: ${testResults.events.connect ? '✅' : '❌'}`);
  console.log(`Events - Disconnect: ${testResults.events.disconnect ? '✅' : '❌'}`);
  console.log(`Events - Error: ${testResults.events.error ? '❌' : '✅'}`);
  console.log(`Connection Time: ${testResults.timing.connectionTime}ms`);
  
  const allPassed = testResults.connection && 
                   testResults.authentication && 
                   testResults.events.connect && 
                   testResults.events.disconnect && 
                   !testResults.events.error;
  
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  clearTimeout(connectionTimeout);
  process.exit(allPassed ? 0 : 1);
});

socket.on('connect_error', (error) => {
  testResults.events.error = true;
  console.error('❌ Connection error:', error.message);
  
  clearTimeout(connectionTimeout);
  process.exit(1);
});

socket.on('error', (error) => {
  testResults.events.error = true;
  console.error('❌ Socket error:', error);
});

socket.on('pong', (data) => {
  console.log('🏓 Pong received:', data);
});

socket.on('message_sent', (data) => {
  console.log('📤 Message sent confirmation:', data);
});

socket.on('message_received', (data) => {
  console.log('📥 Message received:', data);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  socket.disconnect();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  socket.disconnect();
  process.exit(1);
});
