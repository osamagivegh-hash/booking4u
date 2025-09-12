// Debug Logger for Auto-Refresh Investigation
// This file will help identify what's causing the auto-refresh issue

class DebugLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
    this.isEnabled = true;
    
    // Override console methods to capture all logs
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    
    this.setupConsoleOverrides();
    this.setupPageReloadDetection();
    this.setupIntervalDetection();
    this.setupTimeoutDetection();
    this.setupServiceWorkerDetection();
  }

  setupConsoleOverrides() {
    const self = this;
    
    console.log = function(...args) {
      self.originalConsole.log(...args);
      self.log('LOG', ...args);
    };
    
    console.warn = function(...args) {
      self.originalConsole.warn(...args);
      self.log('WARN', ...args);
    };
    
    console.error = function(...args) {
      self.originalConsole.error(...args);
      self.log('ERROR', ...args);
    };
    
    console.info = function(...args) {
      self.originalConsole.info(...args);
      self.log('INFO', ...args);
    };
  }

  setupPageReloadDetection() {
    const self = this;
    
    // Detect page reloads
    const originalReload = window.location.reload;
    window.location.reload = function() {
      self.log('CRITICAL', '🚨 PAGE RELOAD TRIGGERED', {
        stack: new Error().stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      return originalReload.call(this);
    };
    
    // Detect location changes
    const originalAssign = window.location.assign;
    window.location.assign = function(url) {
      self.log('CRITICAL', '🚨 LOCATION ASSIGN', {
        url,
        stack: new Error().stack,
        timestamp: new Date().toISOString()
      });
      return originalAssign.call(this, url);
    };
    
    const originalReplace = window.location.replace;
    window.location.replace = function(url) {
      self.log('CRITICAL', '🚨 LOCATION REPLACE', {
        url,
        stack: new Error().stack,
        timestamp: new Date().toISOString()
      });
      return originalReplace.call(this, url);
    };
    
    // Detect href changes
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
    }, 100);
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

  log(level, message, data = {}) {
    if (!this.isEnabled) return;
    
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      elapsed: Date.now() - this.startTime
    };
    
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Log critical events immediately
    if (level === 'CRITICAL') {
      this.originalConsole.error('🚨 CRITICAL EVENT:', logEntry);
    }
  }

  getLogs() {
    return this.logs;
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
    return {
      summary: {
        totalLogs: this.logs.length,
        criticalEvents: this.getCriticalEvents().length,
        intervals: this.getIntervals().length,
        timeouts: this.getTimeouts().length,
        duration: Date.now() - this.startTime
      },
      logs: this.logs,
      criticalEvents: this.getCriticalEvents(),
      intervals: this.getIntervals(),
      timeouts: this.getTimeouts()
    };
  }

  clearLogs() {
    this.logs = [];
    this.startTime = Date.now();
  }

  disable() {
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }
}

// Create global instance
window.debugLogger = new DebugLogger();

// Export for use in components
export default window.debugLogger;
