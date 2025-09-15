// Socket.IO utility functions to prevent conflicts with auto-refresh prevention

/**
 * Check if auto-refresh prevention is active
 * This helps prevent conflicts between Socket.IO reconnection and auto-refresh prevention
 */
export const isAutoRefreshPreventionActive = () => {
  // Check for common auto-refresh prevention patterns
  const hasAutoRefreshScript = document.querySelector('script[src*="auto-refresh"]') !== null;
  const hasServiceWorker = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
  const hasRefreshPrevention = window.preventAutoRefresh === true;
  
  return hasAutoRefreshScript || hasServiceWorker || hasRefreshPrevention;
};

/**
 * Get optimal Socket.IO configuration based on environment and auto-refresh settings
 */
export const getOptimalSocketConfig = (baseConfig = {}) => {
  const isAutoRefreshActive = isAutoRefreshPreventionActive();
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = window.location.hostname.includes('render.com');
  
  const config = {
    // Base configuration
    autoConnect: false,
    forceNew: true,
    withCredentials: true,
    extraHeaders: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    ...baseConfig
  };
  
  // Environment-specific optimizations
  if (isRender) {
    // Render-specific optimizations
    config.transports = ['polling', 'websocket'];
    config.upgrade = true;
    config.rememberUpgrade = false;
    config.timeout = 30000;
    config.pingTimeout = 60000;
    config.pingInterval = 25000;
    config.upgradeTimeout = 10000;
  }
  
  if (isAutoRefreshActive) {
    // Adjust for auto-refresh prevention
    config.reconnection = true;
    config.reconnectionAttempts = 3; // Reduced attempts to prevent conflicts
    config.reconnectionDelay = 2000; // Longer initial delay
    config.reconnectionDelayMax = 10000; // Shorter max delay
    config.randomizationFactor = 0.3; // Less randomization
  }
  
  if (isProduction) {
    // Production optimizations
    config.allowEIO3 = true;
    config.perMessageDeflate = {
      threshold: 1024,
      concurrencyLimit: 10,
      memLevel: 7
    };
  }
  
  return config;
};

/**
 * Handle Socket.IO connection conflicts with auto-refresh prevention
 */
export const handleSocketConflicts = (socket) => {
  if (!socket) return;
  
  // Listen for auto-refresh prevention events
  const handleBeforeUnload = () => {
    if (socket.connected) {
      console.log('📱 Page unloading, gracefully disconnecting socket');
      socket.disconnect();
    }
  };
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Page is hidden, reduce socket activity
      if (socket.connected) {
        socket.emit('user_away');
      }
    } else {
      // Page is visible, resume socket activity
      if (socket.connected) {
        socket.emit('user_online');
      }
    }
  };
  
  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Create a Socket.IO connection with conflict prevention
 */
export const createStableSocketConnection = (io, url, options = {}) => {
  const config = getOptimalSocketConfig(options);
  const socket = io(url, config);
  
  // Handle conflicts
  const cleanup = handleSocketConflicts(socket);
  
  // Add cleanup to socket for easy access
  socket._cleanupConflicts = cleanup;
  
  return socket;
};

/**
 * Monitor Socket.IO connection health
 */
export const monitorSocketHealth = (socket, options = {}) => {
  const {
    healthCheckInterval = 30000, // 30 seconds
    maxMissedPings = 3,
    onHealthCheck = () => {},
    onUnhealthy = () => {}
  } = options;
  
  let missedPings = 0;
  let lastPingTime = Date.now();
  
  const healthCheck = () => {
    if (!socket || !socket.connected) {
      missedPings++;
      if (missedPings >= maxMissedPings) {
        onUnhealthy('Socket disconnected');
        return;
      }
    } else {
      missedPings = 0;
      lastPingTime = Date.now();
    }
    
    onHealthCheck({
      isConnected: socket?.connected || false,
      missedPings,
      lastPingTime,
      uptime: Date.now() - lastPingTime
    });
  };
  
  // Start health monitoring
  const interval = setInterval(healthCheck, healthCheckInterval);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
};

/**
 * Debounce Socket.IO reconnection attempts
 */
export const debounceReconnection = (reconnectFn, delay = 1000) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      reconnectFn(...args);
    }, delay);
  };
};

/**
 * Exponential backoff for Socket.IO reconnection
 */
export const createExponentialBackoff = (baseDelay = 1000, maxDelay = 30000, factor = 2) => {
  let currentDelay = baseDelay;
  let attempt = 0;
  
  return {
    getDelay: () => {
      const delay = Math.min(currentDelay, maxDelay);
      currentDelay = Math.min(currentDelay * factor, maxDelay);
      attempt++;
      return delay;
    },
    reset: () => {
      currentDelay = baseDelay;
      attempt = 0;
    },
    getAttempt: () => attempt
  };
};

export default {
  isAutoRefreshPreventionActive,
  getOptimalSocketConfig,
  handleSocketConflicts,
  createStableSocketConnection,
  monitorSocketHealth,
  debounceReconnection,
  createExponentialBackoff
};
