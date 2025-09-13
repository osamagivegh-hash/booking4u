/**
 * COMPLETE AUTO-REFRESH ELIMINATION UTILITY
 * This utility completely eliminates ANY automatic API calls that could cause 30-second refreshes
 */

class CompleteAutoRefreshElimination {
  constructor() {
    this.originalFetch = window.fetch;
    this.originalXHR = window.XMLHttpRequest;
    this.blockedRequests = new Set();
    this.isEnabled = true;
    
    this.initialize();
  }

  initialize() {
    console.log('🛡️ COMPLETE AUTO-REFRESH ELIMINATION: Initializing...');
    
    // Override fetch to block health check requests
    window.fetch = (url, options = {}) => {
      const requestUrl = typeof url === 'string' ? url : url.toString();
      
      if (this.isHealthCheckRequest(requestUrl)) {
        console.warn('🛡️ BLOCKED FETCH REQUEST:', requestUrl);
        this.blockedRequests.add(requestUrl);
        
        // Return a fake successful response
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ status: 'blocked', message: 'Health check blocked' }),
          text: () => Promise.resolve('Health check blocked')
        });
      }
      
      return this.originalFetch(url, options);
    };

    // Override XMLHttpRequest to block health check requests
    const self = this;
    window.XMLHttpRequest = function() {
      const xhr = new self.originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      
      xhr.open = function(method, url, ...args) {
        if (self.isHealthCheckRequest(url)) {
          console.warn('🛡️ BLOCKED XHR REQUEST:', url);
          self.blockedRequests.add(url);
          
          // Simulate successful response
          setTimeout(() => {
            Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
            Object.defineProperty(xhr, 'status', { value: 200, writable: false });
            Object.defineProperty(xhr, 'responseText', { value: '{"status":"blocked"}', writable: false });
            if (xhr.onreadystatechange) xhr.onreadystatechange();
          }, 10);
          
          return;
        }
        
        return originalOpen.apply(this, [method, url, ...args]);
      };
      
      xhr.send = function(data) {
        if (self.isHealthCheckRequest(xhr._url)) {
          return; // Don't send the request
        }
        return originalSend.apply(this, [data]);
      };
      
      return xhr;
    };

    // Block all setInterval calls that might be health checks
    const originalSetInterval = window.setInterval;
    window.setInterval = (callback, delay, ...args) => {
      const callbackStr = callback.toString();
      
      if (this.isHealthCheckInterval(callbackStr, delay)) {
        console.warn('🛡️ BLOCKED setInterval:', { delay, callback: callbackStr.substring(0, 100) });
        return Math.random(); // Return fake ID
      }
      
      return originalSetInterval(callback, delay, ...args);
    };

    // Block all setTimeout calls that might be health checks
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = (callback, delay, ...args) => {
      const callbackStr = callback.toString();
      
      if (this.isHealthCheckTimeout(callbackStr, delay)) {
        console.warn('🛡️ BLOCKED setTimeout:', { delay, callback: callbackStr.substring(0, 100) });
        return Math.random(); // Return fake ID
      }
      
      return originalSetTimeout(callback, delay, ...args);
    };

    console.log('🛡️ COMPLETE AUTO-REFRESH ELIMINATION: Active');
  }

  isHealthCheckRequest(url) {
    const healthCheckPatterns = [
      /\/health/i,
      /\/api\/health/i,
      /health/i,
      /checkHealth/i,
      /backend.*health/i,
      /api.*health/i,
      /checkBackend/i,
      /backend.*check/i
    ];

    return healthCheckPatterns.some(pattern => pattern.test(url));
  }

  isHealthCheckInterval(callbackStr, delay) {
    const healthCheckPatterns = [
      /health/i,
      /checkHealth/i,
      /backend.*health/i,
      /api.*health/i,
      /\/health/i,
      /checkBackend/i,
      /backend.*check/i
    ];

    // Block any 30-second intervals
    if (delay === 30000) {
      console.warn('🛡️ Blocking 30-second interval:', callbackStr.substring(0, 100));
      return true;
    }

    return healthCheckPatterns.some(pattern => pattern.test(callbackStr));
  }

  isHealthCheckTimeout(callbackStr, delay) {
    const healthCheckPatterns = [
      /health/i,
      /checkHealth/i,
      /backend.*health/i,
      /api.*health/i,
      /\/health/i,
      /checkBackend/i,
      /backend.*check/i
    ];

    return healthCheckPatterns.some(pattern => pattern.test(callbackStr));
  }

  getStatus() {
    return {
      isEnabled: this.isEnabled,
      blockedRequests: Array.from(this.blockedRequests),
      blockedCount: this.blockedRequests.size
    };
  }

  disable() {
    this.isEnabled = false;
    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXHR;
    console.log('🛡️ COMPLETE AUTO-REFRESH ELIMINATION: Disabled');
  }
}

// Create and export singleton instance
const completeAutoRefreshElimination = new CompleteAutoRefreshElimination();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.completeAutoRefreshElimination = completeAutoRefreshElimination;
}

export default completeAutoRefreshElimination;
