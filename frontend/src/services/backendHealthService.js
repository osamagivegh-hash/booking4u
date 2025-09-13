import { getApiUrl } from '../config/apiConfig';

/**
 * DISABLED: Background Backend Health Service
 * COMPLETELY DISABLED to prevent 30-second auto-refresh
 */
class BackendHealthService {
  constructor() {
    this.healthStatus = {
      status: 'unknown',
      lastChecked: null,
      details: null,
      error: null
    };
    this.isChecking = false;
    this.checkInterval = null;
    this.subscribers = new Set();
    this.enableLogging = false;
  }

  /**
   * Subscribe to health status updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    // Immediately call with current status
    callback(this.healthStatus);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of status changes
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.healthStatus);
      } catch (error) {
        console.error('Error notifying health status subscriber:', error);
      }
    });
  }

  /**
   * DISABLED: Check backend health
   * COMPLETELY DISABLED to prevent 30-second auto-refresh
   */
  async checkHealth() {
    console.log('🛡️ Backend health check DISABLED to prevent 30-second auto-refresh');
    return Promise.resolve();
  }

  /**
   * DISABLED: Start periodic health checks
   * COMPLETELY DISABLED to prevent 30-second auto-refresh
   */
  startPeriodicChecks(intervalMs = 300000) {
    console.log('🛡️ Periodic health checks DISABLED to prevent 30-second auto-refresh');
    return;
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      
      if (this.enableLogging) {
        console.log('⏹️ Stopped periodic health checks');
      }
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return { ...this.healthStatus };
  }

  /**
   * Enable/disable logging
   */
  setLogging(enabled) {
    this.enableLogging = enabled;
  }

  /**
   * Initialize the service (run once on app start)
   * DISABLED: No automatic health checks to prevent 30-second refresh
   */
  async initialize() {
    if (!window.backendHealthServiceInitialized) {
      // DISABLED: await this.checkHealth();
      window.backendHealthServiceInitialized = true;
      
      if (this.enableLogging) {
        console.log('🚀 Backend health service initialized (automatic checks disabled)');
      }
    }
  }
}

// Create singleton instance
const backendHealthService = new BackendHealthService();

// Make available globally
if (typeof window !== 'undefined') {
  window.backendHealthService = backendHealthService;
}

export default backendHealthService;
