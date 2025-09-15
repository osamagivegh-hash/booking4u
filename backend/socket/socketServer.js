import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*", // Allow all origins for Blueprint Integrated deployment
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['polling', 'websocket'], // Support both transports
      pingTimeout: 60000, // 60 seconds
      pingInterval: 25000, // 25 seconds
      upgradeTimeout: 10000, // 10 seconds
      allowEIO3: true, // Allow Engine.IO v3 compatibility
      maxHttpBufferSize: 1e6, // 1MB
      serveClient: false, // Don't serve client files
      allowUpgrades: true,
      perMessageDeflate: {
        threshold: 1024,
        concurrencyLimit: 10,
        memLevel: 7
      }
    });

    this.connectedUsers = new Map(); // Store connected users
    this.userSockets = new Map(); // Map user IDs to socket IDs
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          console.log('📱 Socket connection rejected: No token provided');
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          console.log('📱 Socket connection rejected: User not found');
          return next(new Error('User not found'));
        }

        if (!user.isActive) {
          console.log('📱 Socket connection rejected: User inactive');
          return next(new Error('User account is inactive'));
        }

        // Attach user to socket
        socket.userId = user._id.toString();
        socket.user = user;
        
        console.log(`📱 Socket authentication successful for user: ${user.name} (${user._id})`);
        next();
      } catch (error) {
        console.error('📱 Socket authentication error:', error.message);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📱 User connected: ${socket.user.name} (${socket.userId})`);
      
      // Store user connection
      this.connectedUsers.set(socket.id, {
        userId: socket.userId,
        user: socket.user,
        connectedAt: new Date(),
        lastSeen: new Date()
      });
      
      this.userSockets.set(socket.userId, socket.id);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Handle user online status
      socket.emit('user_online', {
        userId: socket.userId,
        status: 'online',
        timestamp: new Date()
      });

      // Broadcast user online status to relevant users
      this.broadcastUserStatus(socket.userId, 'online');

      // Handle new message
      socket.on('new_message', (data) => {
        this.handleNewMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle message delivery confirmation
      socket.on('message_delivered', (data) => {
        this.handleMessageDelivered(socket, data);
      });

      // Handle conversation joining
      socket.on('join_conversation', (conversationId) => {
        this.handleJoinConversation(socket, conversationId);
      });

      socket.on('leave_conversation', (conversationId) => {
        this.handleLeaveConversation(socket, conversationId);
      });

      // Handle user status updates
      socket.on('user_online', () => {
        this.handleUserStatusUpdate(socket, 'online');
      });

      socket.on('user_away', () => {
        this.handleUserStatusUpdate(socket, 'away');
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() });
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`📱 Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  handleNewMessage(socket, data) {
    try {
      const { receiverId, messageId, content, conversationId } = data;
      
      console.log(`📱 New message from ${socket.userId} to ${receiverId}`);
      
      // Emit to receiver
      socket.to(`user_${receiverId}`).emit('message_received', {
        messageId,
        senderId: socket.userId,
        sender: socket.user,
        content,
        conversationId,
        timestamp: new Date()
      });

      // Emit confirmation to sender
      socket.emit('message_sent', {
        messageId,
        receiverId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('📱 Error handling new message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTypingStart(socket, data) {
    try {
      const { receiverId, conversationId } = data;
      
      socket.to(`user_${receiverId}`).emit('user_typing', {
        senderId: socket.userId,
        sender: socket.user,
        conversationId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('📱 Error handling typing start:', error);
    }
  }

  handleTypingStop(socket, data) {
    try {
      const { receiverId, conversationId } = data;
      
      socket.to(`user_${receiverId}`).emit('user_stopped_typing', {
        senderId: socket.userId,
        conversationId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('📱 Error handling typing stop:', error);
    }
  }

  handleMessageDelivered(socket, data) {
    try {
      const { messageId, senderId } = data;
      
      socket.to(`user_${senderId}`).emit('message_delivery_confirmed', {
        messageId,
        receiverId: socket.userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('📱 Error handling message delivery:', error);
    }
  }

  handleJoinConversation(socket, conversationId) {
    try {
      socket.join(`conversation_${conversationId}`);
      console.log(`📱 User ${socket.userId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error('📱 Error joining conversation:', error);
    }
  }

  handleLeaveConversation(socket, conversationId) {
    try {
      socket.leave(`conversation_${conversationId}`);
      console.log(`📱 User ${socket.userId} left conversation ${conversationId}`);
    } catch (error) {
      console.error('📱 Error leaving conversation:', error);
    }
  }

  handleUserStatusUpdate(socket, status) {
    try {
      this.broadcastUserStatus(socket.userId, status);
      
      // Update last seen
      const userConnection = this.connectedUsers.get(socket.id);
      if (userConnection) {
        userConnection.lastSeen = new Date();
        userConnection.status = status;
      }
    } catch (error) {
      console.error('📱 Error handling user status update:', error);
    }
  }

  handleDisconnect(socket, reason) {
    console.log(`📱 User disconnected: ${socket.user.name} (${socket.userId}) - Reason: ${reason}`);
    
    // Remove from connected users
    this.connectedUsers.delete(socket.id);
    this.userSockets.delete(socket.userId);
    
    // Broadcast user offline status
    this.broadcastUserStatus(socket.userId, 'offline');
  }

  broadcastUserStatus(userId, status) {
    try {
      const statusUpdate = {
        userId,
        status,
        timestamp: new Date()
      };
      
      // Broadcast to all connected clients
      this.io.emit('user_status_changed', statusUpdate);
    } catch (error) {
      console.error('📱 Error broadcasting user status:', error);
    }
  }

  // Utility methods
  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  getUserSocket(userId) {
    const socketId = this.userSockets.get(userId);
    return socketId ? this.io.sockets.sockets.get(socketId) : null;
  }

  sendToUser(userId, event, data) {
    const socket = this.getUserSocket(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  broadcastToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      connectedUsers: this.getConnectedUsers().map(user => ({
        userId: user.userId,
        name: user.user.name,
        connectedAt: user.connectedAt,
        lastSeen: user.lastSeen
      }))
    };
  }
}

export default SocketServer;
