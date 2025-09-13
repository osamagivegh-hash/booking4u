/**
 * Comprehensive Auto-Refresh Prevention Utility
 * This utility completely disables any automatic API calls that could cause 30-second refreshes
 */

class AutoRefreshPrevention {
  constructor() {
    this.originalSetInterval = window.setInterval;
    this.originalSetTimeout = window.setTimeout;
    this.blockedIntervals = new Set();
    this.blockedTimeouts = new Set();
    this.isEnabled = true;
    
    this.initialize();
  }

  initialize() {
    console.log('🛡️ Auto-Refresh Prevention: Initializing...');
    
    // Override setInterval to block health check intervals
    window.setInterval = (callback, delay, ...args) => {
      const callbackStr = callback.toString();
      
      // Block any intervals that might be health checks or API calls
      if (this.isHealthCheckInterval(callbackStr, delay)) {
        console.warn('🛡️ BLOCKED setInterval:', { delay, callback: callbackStr.substring(0, 100) });
        const fakeId = Math.random();
        this.blockedIntervals.add(fakeId);
        return fakeId;
      }
      
      return this.originalSetInterval(callback, delay, ...args);
    };

    // Override setTimeout to block health check timeouts
    window.setTimeout = (callback, delay, ...args) => {
      const callbackStr = callback.toString();
      
      // Block any timeouts that might be health checks
      if (this.isHealthCheckTimeout(callbackStr, delay)) {
        console.warn('🛡️ BLOCKED setTimeout:', { delay, callback: callbackStr.substring(0, 100) });
        const fakeId = Math.random();
        this.blockedTimeouts.add(fakeId);
        return fakeId;
      }
      
      return this.originalSetTimeout(callback, delay, ...args);
    };

    // Override clearInterval to handle blocked intervals
    const originalClearInterval = window.clearInterval;
    window.clearInterval = (id) => {
      if (this.blockedIntervals.has(id)) {
        console.log('🛡️ Ignoring clearInterval for blocked interval:', id);
        return;
      }
      return originalClearInterval(id);
    };

    // Override clearTimeout to handle blocked timeouts
    const originalClearTimeout = window.clearTimeout;
    window.clearTimeout = (id) => {
      if (this.blockedTimeouts.has(id)) {
        console.log('🛡️ Ignoring clearTimeout for blocked timeout:', id);
        return;
      }
      return originalClearTimeout(id);
    };

    console.log('🛡️ Auto-Refresh Prevention: Active');
  }

  isHealthCheckInterval(callbackStr, delay) {
    // Block intervals that look like health checks
    const healthCheckPatterns = [
      /health/i,
      /checkHealth/i,
      /backend.*health/i,
      /api.*health/i,
      /\/health/i,
      /checkBackend/i,
      /backend.*check/i
    ];

    // Block intervals with 30-second timing (30000ms)
    if (delay === 30000) {
      console.warn('🛡️ Blocking 30-second interval:', callbackStr.substring(0, 100));
      return true;
    }

    // Block intervals with health check patterns
    return healthCheckPatterns.some(pattern => pattern.test(callbackStr));
  }

  isHealthCheckTimeout(callbackStr, delay) {
    // Block timeouts that look like health checks
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

  disable() {
    this.isEnabled = false;
    window.setInterval = this.originalSetInterval;
    window.setTimeout = this.originalSetTimeout;
    console.log('🛡️ Auto-Refresh Prevention: Disabled');
  }

  getStatus() {
    return {
      isEnabled: this.isEnabled,
      blockedIntervals: this.blockedIntervals.size,
      blockedTimeouts: this.blockedTimeouts.size
    };
  }
}

// Create and export singleton instance
const autoRefreshPrevention = new AutoRefreshPrevention();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.autoRefreshPrevention = autoRefreshPrevention;
}

export default autoRefreshPrevention;
