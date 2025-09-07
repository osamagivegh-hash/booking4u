# 🧪 Testing the Messaging System

## Quick Test Guide

### 1. Start the Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2) 
cd frontend
npm start
```

### 2. Test the Compose Form

1. **Open the Messages page** in your browser
2. **Click "رسالة جديدة" (New Message)** button
3. **Verify the compose form appears** (should show a form with fields for recipient, subject, content)
4. **Check browser console** for debug messages:
   - Should see: `📝 Opening compose mode...`
   - Should see: `📝 Compose mode changed: true`

### 3. Test User Search

1. **In the recipient field**, type at least 2 characters
2. **Check browser console** for search debug messages:
   - Should see: `🔍 Searching for users with query: [your search]`
   - Should see: `📋 Search response: [response data]`

### 4. Test Message Sending

1. **Select a recipient** from search results or enter user ID manually
2. **Fill in subject and content**
3. **Click send**
4. **Check console** for:
   - `📤 Sending message: [message data]`
   - `✅ Message sent successfully: [response]`

### 5. Test Real-Time Features

1. **Open two browser windows/tabs**
2. **Login as different users**
3. **Send messages between users**
4. **Verify real-time delivery**

## Troubleshooting

### If Compose Form Doesn't Appear
- Check browser console for errors
- Verify `composeMode` state is changing
- Check if there are any JavaScript errors

### If User Search Doesn't Work
- Check network tab for API calls to `/users/search`
- Verify backend is running on port 5001
- Check if user search endpoint is working

### If Messages Don't Send
- Check form validation (recipient, subject, content required)
- Verify API calls to `/messages` endpoint
- Check for authentication errors

## Debug Console Messages

When working correctly, you should see these console messages:

```
📝 Opening compose mode...
📝 Compose mode changed: true
🔍 Searching for users with query: [search term]
📋 Search response: {users: [...]}
📤 Sending message: {receiverId: "...", subject: "...", content: "..."}
✅ Message sent successfully: {_id: "...", ...}
```

## Expected Behavior

1. ✅ **Compose form opens** when clicking "رسالة جديدة"
2. ✅ **User search works** when typing in recipient field
3. ✅ **Form validation** prevents sending incomplete messages
4. ✅ **Messages send successfully** and appear in conversation list
5. ✅ **Real-time updates** work between users
6. ✅ **Success message** appears after sending

## Manual Testing Steps

1. **Test with two users:**
   - User A (Client) sends message to User B (Merchant)
   - User B receives message in real-time
   - User B replies to User A
   - User A receives reply in real-time

2. **Test message features:**
   - Different message types (general, inquiry, support)
   - Different priorities (low, normal, high, urgent)
   - Message threading and replies
   - Read receipts and delivery status

3. **Test UI features:**
   - Typing indicators
   - User presence (online/offline)
   - Connection status indicator
   - Message search and filtering

---

**Note**: If you encounter any issues, check the browser console for error messages and debug logs.



