import { getApiUrl } from '../config/apiConfig';

/**
 * Background Backend Health Service
 * Monitors backend health silently without affecting UI
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
   * Check backend health
   */
  async checkHealth() {
    if (this.isChecking) return; // Prevent concurrent checks
    
    this.isChecking = true;
    
    try {
      if (this.enableLogging) {
        console.log('🔍 Background health check starting...');
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.healthStatus = {
          status: 'connected',
          lastChecked: new Date().toISOString(),
          details: data,
          error: null
        };
        
        if (this.enableLogging) {
          console.log('✅ Background health check successful');
        }
      } else {
        this.healthStatus = {
          status: 'error',
          lastChecked: new Date().toISOString(),
          details: { status: response.status, statusText: response.statusText },
          error: `HTTP ${response.status}`
        };
        
        if (this.enableLogging) {
          console.log('❌ Background health check failed:', response.status);
        }
      }
    } catch (error) {
      this.healthStatus = {
        status: 'error',
        lastChecked: new Date().toISOString(),
        details: null,
        error: error.message
      };
      
      if (this.enableLogging) {
        console.log('❌ Background health check error:', error.message);
      }
    } finally {
      this.isChecking = false;
      this.notifySubscribers();
    }
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(intervalMs = 300000) { // Default 5 minutes
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, intervalMs);
    
    if (this.enableLogging) {
      console.log(`🔄 Started periodic health checks every ${intervalMs}ms`);
    }
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
   */
  async initialize() {
    if (!window.backendHealthServiceInitialized) {
      await this.checkHealth();
      window.backendHealthServiceInitialized = true;
      
      if (this.enableLogging) {
        console.log('🚀 Backend health service initialized');
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
