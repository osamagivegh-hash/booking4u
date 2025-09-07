# 📱 Booking4U Real-Time Messaging System

## Overview

The Booking4U messaging system provides real-time communication between clients and merchants with advanced features like typing indicators, read receipts, message status tracking, and user presence indicators.

## 🚀 Features

### Core Messaging Features
- ✅ **Real-time message delivery** using Socket.IO
- ✅ **Message threading** for organized conversations
- ✅ **Message types**: General, Inquiry, Booking-related, Support
- ✅ **Priority levels**: Low, Normal, High, Urgent
- ✅ **Message templates** for quick responses
- ✅ **Search and filtering** capabilities
- ✅ **Message archiving** (soft delete)
- ✅ **Bulk operations** (mark as read, delete)

### Real-Time Features
- ✅ **Typing indicators** - See when someone is typing
- ✅ **Read receipts** - Know when messages are read
- ✅ **Delivery confirmations** - Track message delivery status
- ✅ **User presence** - Online/Away/Offline status indicators
- ✅ **Connection status** - Visual indicator of real-time connection
- ✅ **Browser notifications** - Desktop notifications for new messages

### Advanced Features
- ✅ **Message forwarding** and **quick replies**
- ✅ **Message export** to CSV format
- ✅ **Keyboard shortcuts** (Ctrl+N for new message, Ctrl+F for search)
- ✅ **Auto-refresh** every 30 seconds
- ✅ **Error handling** and **reconnection** logic
- ✅ **Message statistics** dashboard

## 🏗️ Architecture

### Backend Components

#### 1. Message Model (`backend/models/Message.js`)
```javascript
{
  senderId: ObjectId,           // User who sent the message
  receiverId: ObjectId,         // User who receives the message
  subject: String,              // Message subject (max 200 chars)
  content: String,              // Message content (max 2000 chars)
  messageType: String,          // inquiry, booking_related, general, support
  relatedBookingId: ObjectId,   // Optional: related booking
  relatedServiceId: ObjectId,   // Optional: related service
  isRead: Boolean,              // Read status
  readAt: Date,                 // When message was read
  priority: String,             // low, normal, high, urgent
  threadId: ObjectId,           // For message threading
  replyTo: ObjectId,            // Original message being replied to
  tags: [String],               // Message tags
  attachments: [Object],        // File attachments
  isDeleted: Boolean,           // Soft delete flag
  deletedAt: Date,              // When deleted
  deletedBy: ObjectId           // Who deleted it
}
```

#### 2. Message Routes (`backend/routes/messages.js`)
- `POST /api/messages` - Send new message
- `GET /api/messages/inbox` - Get received messages
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/thread/:threadId` - Get conversation thread
- `PUT /api/messages/:id/read` - Mark message as read
- `PUT /api/messages/read-multiple` - Mark multiple messages as read
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/unread-count` - Get unread count
- `GET /api/messages/search` - Search messages

#### 3. Socket.IO Server (`backend/server.js`)
```javascript
// Real-time events handled:
- message_received     // New message notification
- message_sent         // Send confirmation
- message_read         // Read receipt
- message_delivery_confirmed // Delivery confirmation
- user_typing          // Typing indicator start
- user_stopped_typing  // Typing indicator stop
- user_status_changed  // Online/Away/Offline status
- join_conversation    // Join conversation room
- leave_conversation   // Leave conversation room
```

### Frontend Components

#### 1. Socket Service (`frontend/src/services/socket.js`)
- Handles Socket.IO connection management
- Provides event listeners for real-time updates
- Manages connection status and reconnection
- Emits typing indicators and status updates

#### 2. Messages Page (`frontend/src/pages/Messages/MessagesPage.js`)
- Complete messaging interface
- Real-time message updates
- User status indicators
- Message status tracking
- Connection status monitoring

## 🔧 Setup and Configuration

### 1. Backend Setup
```bash
cd backend
npm install socket.io  # Already installed
```

### 2. Frontend Setup
```bash
cd frontend
npm install socket.io-client  # Already installed
```

### 3. Environment Variables
Make sure your backend has the following environment variables:
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
PORT=5001
NODE_ENV=development
```

## 📱 Usage Guide

### For Clients

#### Sending Messages
1. Navigate to the Messages section in your dashboard
2. Click "رسالة جديدة" (New Message)
3. Search for the merchant by name
4. Select message type and priority
5. Write your message and send

#### Managing Messages
- **Inbox**: View received messages
- **Sent**: View sent messages with delivery status
- **Search**: Use the search bar to find specific messages
- **Filters**: Filter by type, priority, read status, or date range
- **Bulk Actions**: Select multiple messages for bulk operations

#### Real-Time Features
- **Typing Indicators**: See when merchants are typing
- **Read Receipts**: Know when your messages are read
- **User Status**: See if merchants are online, away, or offline
- **Notifications**: Get desktop notifications for new messages

### For Merchants

#### Responding to Messages
1. Check your inbox for new messages
2. Click on a message to view the full conversation
3. Use quick reply or compose a new response
4. Messages are automatically threaded for easy conversation tracking

#### Message Management
- **Priority Handling**: Urgent messages are highlighted
- **Message Templates**: Use pre-defined templates for common responses
- **Forward Messages**: Forward important messages to other team members
- **Export Messages**: Export conversations for record keeping

## 🧪 Testing

### Manual Testing
1. **Start the servers**:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend  
   cd frontend && npm start
   ```

2. **Test with two users**:
   - Open two browser windows/tabs
   - Login as different users (client and merchant)
   - Navigate to Messages section
   - Send messages between users
   - Verify real-time features work

### Automated Testing
Use the provided test script:
```bash
cd backend
node test-messaging.js
```

**Note**: Update the test script with actual user IDs and JWT tokens before running.

## 🔍 Troubleshooting

### Common Issues

#### 1. Socket.IO Connection Failed
- **Check**: Backend server is running on port 5001
- **Check**: CORS settings allow frontend origin
- **Check**: JWT token is valid and not expired

#### 2. Messages Not Appearing in Real-Time
- **Check**: Socket.IO connection status indicator
- **Check**: Browser console for WebSocket errors
- **Check**: Network connectivity

#### 3. Typing Indicators Not Working
- **Check**: Socket.IO connection is established
- **Check**: Both users are in the same conversation room
- **Check**: Event listeners are properly set up

#### 4. Read Receipts Not Working
- **Check**: Message is marked as read via API
- **Check**: Socket.IO events are being emitted
- **Check**: Frontend is listening for read receipt events

### Debug Mode
Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'socket.io-client:*');
```

## 📊 Performance Considerations

### Backend
- **Message indexing**: Optimized database indexes for fast queries
- **Pagination**: Messages are paginated to handle large volumes
- **Rate limiting**: API endpoints are rate-limited to prevent abuse
- **Connection pooling**: MongoDB connection pooling for better performance

### Frontend
- **Lazy loading**: Messages are loaded on demand
- **Debounced search**: Search is debounced to reduce API calls
- **Connection monitoring**: Automatic reconnection on connection loss
- **Memory management**: Proper cleanup of event listeners

## 🔒 Security Features

- **Authentication**: All endpoints require valid JWT tokens
- **Authorization**: Users can only access their own messages
- **Input validation**: All message content is validated and sanitized
- **Rate limiting**: Prevents message spam and abuse
- **XSS protection**: Content is sanitized to prevent XSS attacks
- **CORS**: Properly configured CORS for secure cross-origin requests

## 🚀 Future Enhancements

### Planned Features
- [ ] **File attachments** support
- [ ] **Message encryption** for sensitive conversations
- [ ] **Message scheduling** for future delivery
- [ ] **Message reactions** (like, love, etc.)
- [ ] **Voice messages** support
- [ ] **Video calls** integration
- [ ] **Message translation** for multi-language support
- [ ] **Advanced search** with full-text search
- [ ] **Message analytics** and reporting
- [ ] **Bot integration** for automated responses

### Performance Improvements
- [ ] **Message caching** with Redis
- [ ] **WebSocket clustering** for horizontal scaling
- [ ] **Message compression** for large conversations
- [ ] **Offline message sync** when users come back online

## 📞 Support

If you encounter any issues with the messaging system:

1. **Check the logs**: Backend logs are in `backend/logs/`
2. **Browser console**: Check for JavaScript errors
3. **Network tab**: Verify API calls and WebSocket connections
4. **Test script**: Run the automated test to verify functionality

For additional support, please refer to the main project documentation or contact the development team.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready



