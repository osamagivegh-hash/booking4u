import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/apiConfig';
import { 
  getOptimalSocketConfig, 
  handleSocketConflicts, 
  monitorSocketHealth,
  createExponentialBackoff 
} from '../utils/socketUtils';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.connectionTimeout = null;
    this.isConnecting = false;
    this.shouldReconnect = true;
    this.healthMonitor = null;
    this.conflictCleanup = null;
    this.backoff = createExponentialBackoff(1000, 30000, 2);
  }

  connect(token) {
    if (!token) {
      console.warn('📱 No token provided for socket connection');
      return null;
    }

    if (this.socket && this.isConnected) {
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('📱 Connection already in progress, skipping...');
      return null;
    }

    // Use the configured socket URL
    const socketUrl = getSocketUrl();
    
    // For Blueprint Integrated deployment, use relative URL for Socket.IO
    if (socketUrl === '/' && window.location.hostname.includes('render.com')) {
      console.log('📱 Blueprint Integrated deployment detected - using relative Socket.IO URL');
      // Keep the relative URL for same-origin requests
    }
    
    this.isConnecting = true;
    this.shouldReconnect = true;
    
    // Get optimal configuration based on environment
    const baseConfig = {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: this.maxReconnectDelay,
      randomizationFactor: 0.5
    };
    
    const optimalConfig = getOptimalSocketConfig(baseConfig);
    
    this.socket = io(socketUrl, optimalConfig);

    this.socket.on('connect', () => {
      console.log('📱 Connected to messaging server');
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
      this.backoff.reset(); // Reset exponential backoff
      
      // Clear any existing connection timeout
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      
      // Setup conflict handling and health monitoring
      this.conflictCleanup = handleSocketConflicts(this.socket);
      this.healthMonitor = monitorSocketHealth(this.socket, {
        onHealthCheck: (health) => {
          console.log('📱 Socket health check:', health);
        },
        onUnhealthy: (reason) => {
          console.warn('📱 Socket unhealthy:', reason);
          if (this.shouldReconnect) {
            this.handleReconnection(token);
          }
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📱 Disconnected from messaging server:', reason);
      this.isConnected = false;
      this.isConnecting = false;
      
      // Don't reconnect if it's a manual disconnect or server shutdown
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        this.shouldReconnect = false;
        console.log('📱 Manual disconnect detected, stopping reconnection attempts');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('📱 Connection error:', error.message);
      this.isConnected = false;
      this.isConnecting = false;
      
      // Handle Render WebSocket restrictions
      if (error.message.includes('websocket') || error.message.includes('WebSocket')) {
        console.log('📱 WebSocket blocked on Render, falling back to polling only');
        this.socket.io.opts.transports = ['polling'];
        this.socket.io.opts.upgrade = false;
        this.socket.connect();
        return;
      }
      
      // Handle timeout errors
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        console.log('📱 Connection timeout, will retry with exponential backoff');
        this.handleReconnection(token);
        return;
      }
      
      // Handle authentication errors
      if (error.message.includes('Invalid authentication token') || error.message.includes('Authentication token required')) {
        console.log('📱 Authentication error, will retry connection...');
        this.handleReconnection(token);
        return;
      }
      
      // Handle network errors
      if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
        console.log('📱 Network error, will retry connection...');
        this.handleReconnection(token);
        return;
      }
      
      // For other errors, try reconnection with backoff
      this.handleReconnection(token);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`📱 Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`📱 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('📱 Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('📱 Reconnection failed after maximum attempts');
      this.shouldReconnect = false;
      this.isConnecting = false;
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    this.shouldReconnect = false;
    this.isConnecting = false;
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // Cleanup health monitoring
    if (this.healthMonitor) {
      this.healthMonitor();
      this.healthMonitor = null;
    }
    
    // Cleanup conflict handling
    if (this.conflictCleanup) {
      this.conflictCleanup();
      this.conflictCleanup = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Handle reconnection with exponential backoff
  handleReconnection(token) {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('📱 Max reconnection attempts reached or reconnection disabled');
      this.isConnecting = false;
      return;
    }

    this.reconnectAttempts++;
    const delay = this.backoff.getDelay();
    
    console.log(`📱 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.connectionTimeout = setTimeout(() => {
      if (this.shouldReconnect && token) {
        console.log(`📱 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect(token);
      }
    }, delay);
  }

  // Reset connection state
  resetConnection() {
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
    this.shouldReconnect = true;
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
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
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      shouldReconnect: this.shouldReconnect,
      socketId: this.socket?.id || null
    };
  }

  // Reconnect method with better error handling
  reconnect(token) {
    console.log('📱 Manual reconnect requested');
    this.resetConnection();
    this.disconnect();
    
    // Small delay to ensure clean disconnect
    setTimeout(() => {
      if (token) {
        this.connect(token);
      }
    }, 500);
  }

  // Force reconnection (useful for debugging)
  forceReconnect(token) {
    console.log('📱 Force reconnect requested');
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.reconnect(token);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

