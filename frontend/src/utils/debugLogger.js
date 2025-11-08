// Debug Logger for Auto-Refresh Investigation
// This file will help identify what's causing the auto-refresh issue

class DebugLogger {
  constructor() {
    this.logs = [];
    this.originalConsole = { ...console };
    this.MAX_LOGS = 100; // Limit log storage
    this.logLevel = process.env.NODE_ENV === 'production' ? 'ERROR' : 'DEBUG';

    this.setupCustomLogging();
    this.setupPageReloadDetection();
  }

  setupCustomLogging() {
    const self = this;

    // Custom log method with environment-aware logging
    console.log = function(...args) {
      self.log('DEBUG', ...args);
      if (self.logLevel !== 'DEBUG') return;
      self.originalConsole.log(...args);
    };

    console.warn = function(...args) {
      self.log('WARN', ...args);
      if (self.logLevel === 'ERROR') return;
      self.originalConsole.warn(...args);
    };

    console.error = function(...args) {
      self.log('ERROR', ...args);
      self.originalConsole.error(...args);
    };

    console.info = function(...args) {
      self.log('INFO', ...args);
      if (self.logLevel !== 'DEBUG') return;
      self.originalConsole.info(...args);
    };
  }

  setupPageReloadDetection() {
    const self = this;
    
    // Detect page reloads using beforeunload event instead of overriding read-only properties
    window.addEventListener('beforeunload', (event) => {
      self.log('CRITICAL', '🚨 PAGE RELOAD TRIGGERED', {
        stack: new Error().stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    });
    
    // Detect page visibility changes (which can indicate reloads)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        self.log('CRITICAL', '🚨 PAGE BECAME VISIBLE (possible reload)', {
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }
    });
    
    // Detect location changes using popstate event
    window.addEventListener('popstate', (event) => {
      self.log('CRITICAL', '🚨 POPSTATE EVENT (navigation)', {
        state: event.state,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    });
    
    // Detect href changes (reduced frequency to prevent performance issues)
    let currentHref = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentHref) {
        self.log('CRITICAL', '🚨 HREF CHANGED', {
          from: currentHref,
          to: window.location.href,
          timestamp: new Date().toISOString()
        });
        currentHref = window.location.href;
      }
    }, 1000); // Changed from 100ms to 1000ms (1 second)
  }

  setupIntervalDetection() {
    const self = this;
    const originalSetInterval = window.setInterval;
    
    window.setInterval = function(callback, delay, ...args) {
      const id = originalSetInterval.call(this, callback, delay, ...args);
      
      self.log('INTERVAL', '⏰ setInterval created', {
        id,
        delay,
        callback: callback.toString().substring(0, 100),
        stack: new Error().stack,
        timestamp: new Date().toISOString()
      });
      
      return id;
    };
    
    const originalClearInterval = window.clearInterval;
    window.clearInterval = function(id) {
      self.log('INTERVAL', '⏰ setInterval cleared', {
        id,
        timestamp: new Date().toISOString()
      });
      return originalClearInterval.call(this, id);
    };
  }

  setupTimeoutDetection() {
    const self = this;
    const originalSetTimeout = window.setTimeout;
    
    window.setTimeout = function(callback, delay, ...args) {
      const id = originalSetTimeout.call(this, callback, delay, ...args);
      
      // Only log timeouts that might cause reloads (long delays or specific patterns)
      if (delay > 1000 || callback.toString().includes('reload') || callback.toString().includes('location')) {
        self.log('TIMEOUT', '⏱️ setTimeout created (potential reload trigger)', {
          id,
          delay,
          callback: callback.toString().substring(0, 100),
          stack: new Error().stack,
          timestamp: new Date().toISOString()
        });
      }
      
      return id;
    };
  }

  setupServiceWorkerDetection() {
    const self = this;
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        self.log('SERVICE_WORKER', '🔄 Service Worker controller changed', {
          timestamp: new Date().toISOString(),
          stack: new Error().stack
        });
      });
      
      navigator.serviceWorker.addEventListener('message', (event) => {
        self.log('SERVICE_WORKER', '📨 Service Worker message', {
          data: event.data,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  log(level, ...args) {
    const logEntry = {
      level,
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' '),
      timestamp: new Date().toISOString()
    };

    // Store logs with a maximum limit
    this.logs.push(logEntry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift(); // Remove oldest log
    }

    // Log critical events immediately
    if (level === 'CRITICAL') {
      this.originalConsole.error('🚨 CRITICAL EVENT:', logEntry);
    }
  }

  // Additional methods to manage logs
  getLogs(level = null) {
    return level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;
  }

  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  getCriticalEvents() {
    return this.getLogsByLevel('CRITICAL');
  }

  getIntervals() {
    return this.getLogsByLevel('INTERVAL');
  }

  getTimeouts() {
    return this.getLogsByLevel('TIMEOUT');
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
  }

  disable() {
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }
}

export default new DebugLogger();
