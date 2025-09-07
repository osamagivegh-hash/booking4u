import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  connect(token) {
    if (!token) {
      console.warn('📱 No token provided for socket connection');
      return null;
    }

    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Use the same port as the API service
    this.socket = io('http://localhost:5001', {
      auth: {
        token: token
      },
      autoConnect: false,
      transports: ['websocket', 'polling'],
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('📱 Connected to messaging server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('📱 Disconnected from messaging server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('📱 Connection error:', error.message);
      this.isConnected = false;
      
      // If it's an authentication error, try to reconnect after a delay
      if (error.message.includes('Invalid authentication token') || error.message.includes('Authentication token required')) {
        console.log('📱 Authentication error, will retry connection...');
        setTimeout(() => {
          if (token) {
            this.reconnect(token);
          }
        }, 5000);
      }
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message event handlers
  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.off('message_received'); // Remove previous listeners
      this.socket.on('message_received', callback);
      this.eventListeners.set('message_received', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.off('message_sent'); // Remove previous listeners
      this.socket.on('message_sent', callback);
      this.eventListeners.set('message_sent', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.off('message_read'); // Remove previous listeners
      this.socket.on('message_read', callback);
      this.eventListeners.set('message_read', callback);
    }
  }

  onMessageDeliveryConfirmed(callback) {
    if (this.socket) {
      this.socket.off('message_delivery_confirmed'); // Remove previous listeners
      this.socket.on('message_delivery_confirmed', callback);
      this.eventListeners.set('message_delivery_confirmed', callback);
    }
  }

  onUserStatusChanged(callback) {
    if (this.socket) {
      this.socket.off('user_status_changed'); // Remove previous listeners
      this.socket.on('user_status_changed', callback);
      this.eventListeners.set('user_status_changed', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.off('user_typing'); // Remove previous listeners
      this.socket.on('user_typing', callback);
      this.eventListeners.set('user_typing', callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.off('user_stopped_typing'); // Remove previous listeners
      this.socket.on('user_stopped_typing', callback);
      this.eventListeners.set('user_stopped_typing', callback);
    }
  }

  // Emit events
  emitNewMessage(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('new_message', data);
    }
  }

  emitTypingStart(receiverId, conversationId = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { receiverId, conversationId });
    }
  }

  emitTypingStop(receiverId, conversationId = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { receiverId, conversationId });
    }
  }

  emitMessageDelivered(messageId, senderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message_delivered', { messageId, senderId });
    }
  }

  emitUserOnline() {
    if (this.socket && this.isConnected) {
      this.socket.emit('user_online');
    }
  }

  emitUserAway() {
    if (this.socket && this.isConnected) {
      this.socket.emit('user_away');
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Remove all event listeners
  removeAllListeners() {
    if (this.socket) {
      // Remove specific event listeners
      this.eventListeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.eventListeners.clear();
      
      // Remove all other listeners
      this.socket.removeAllListeners();
    }
  }

  // Check connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Reconnect method
  reconnect(token) {
    this.disconnect();
    setTimeout(() => {
      this.connect(token);
    }, 1000);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

