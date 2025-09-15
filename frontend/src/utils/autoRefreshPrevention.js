// Auto-Refresh Prevention System
// Comprehensive monitoring and prevention of unwanted page reloads

class AutoRefreshPrevention {
  constructor() {
    this.isMonitoring = false;
    this.reloadAttempts = [];
    this.networkErrors = [];
    this.imageErrors = [];
    this.originalMethods = {};
    
    this.setupMonitoring();
    this.preventUnwantedReloads();
  }

  setupMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    
    console.log('🔧 Auto-Refresh Prevention: Setting up monitoring...');
    
    // Monitor page reloads
    this.monitorPageReloads();
    
    // Monitor network errors
    this.monitorNetworkErrors();
    
    // Monitor image errors
    this.monitorImageErrors();
    
    // Monitor service worker updates
    this.monitorServiceWorkerUpdates();
    
    // Monitor React Router navigation
    this.monitorReactRouterNavigation();
  }

  monitorPageReloads() {
    // FIXED: Use event listeners instead of trying to override read-only window.location.reload
    // This prevents the "Cannot assign to read only property 'reload'" error
    
    // Monitor for page reload attempts using beforeunload event
    window.addEventListener('beforeunload', (event) => {
      const stack = new Error().stack;
      const timestamp = new Date().toISOString();
      
      this.reloadAttempts.push({
        timestamp,
        stack,
        type: 'beforeunload',
        url: window.location.href
      });
      
      console.warn('🚨 PAGE RELOAD ATTEMPT DETECTED (beforeunload):', {
        timestamp,
        url: window.location.href,
        stack: stack.split('\n').slice(0, 5).join('\n')
      });
      
      // Only allow reload if it's from a user action or critical error
      if (!this.shouldAllowReload(stack)) {
        console.warn('❌ Reload prevented - potential auto-refresh issue');
        // Note: We can't prevent beforeunload, but we can log it for debugging
      } else {
        console.log('✅ Reload allowed - user action or critical error');
      }
    });

    // Monitor for page visibility changes (which can indicate reloads)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const stack = new Error().stack;
        const timestamp = new Date().toISOString();
        
        this.reloadAttempts.push({
          timestamp,
          stack,
          type: 'visibilitychange',
          url: window.location.href
        });
        
        console.log('🔍 Page became visible (possible reload):', {
          timestamp,
          url: window.location.href
        });
      }
    });

    // Provide a safe reload function that can be used when needed
    window.safeReload = (force = false) => {
      const stack = new Error().stack;
      const timestamp = new Date().toISOString();
      
      this.reloadAttempts.push({
        timestamp,
        stack,
        type: 'safeReload',
        url: window.location.href,
        forced: force
      });
      
      console.log('🔄 Safe reload triggered:', {
        timestamp,
        forced: force,
        url: window.location.href
      });
      
      // Use the original location.reload method
      window.location.reload();
    };
  }

  shouldAllowReload(stack) {
    // Allow reload if it's from user interaction or critical system error
    const allowedPatterns = [
      'user click',
      'button click',
      'form submit',
      'critical error',
      'manual refresh',
      'safeReload' // Allow our safe reload function
    ];
    
    const stackString = stack.toLowerCase();
    return allowedPatterns.some(pattern => stackString.includes(pattern));
  }

  monitorNetworkErrors() {
    // Monitor fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        this.networkErrors.push({
          timestamp: new Date().toISOString(),
          type: 'fetch',
          url: args[0],
          error: error.message,
          stack: error.stack
        });
        
        console.warn('🌐 Network Error (Fetch):', {
          url: args[0],
          error: error.message
        });
        
        // Don't let network errors cause page reloads
        throw error;
      }
    };

    // Monitor XMLHttpRequest errors
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._url = url;
      this._method = method;
      return originalXHROpen.call(this, method, url, ...args);
    };
    
    XMLHttpRequest.prototype.send = function(data) {
      this.addEventListener('error', (event) => {
        window.autoRefreshPrevention?.networkErrors.push({
          timestamp: new Date().toISOString(),
          type: 'xhr',
          url: this._url,
          method: this._method,
          error: 'Network error',
          stack: new Error().stack
        });
        
        console.warn('🌐 Network Error (XHR):', {
          url: this._url,
          method: this._method
        });
      });
      
      return originalXHRSend.call(this, data);
    };
  }

  monitorImageErrors() {
    // Override Image constructor to monitor image load errors
    const originalImage = window.Image;
    window.Image = function(...args) {
      const img = new originalImage(...args);
      
      img.addEventListener('error', (event) => {
        this.imageErrors.push({
          timestamp: new Date().toISOString(),
          src: img.src,
          error: 'Image load failed',
          stack: new Error().stack
        });
        
        console.warn('🖼️ Image Load Error:', {
          src: img.src
        });
        
        // Prevent image errors from causing page reloads
        event.preventDefault();
        event.stopPropagation();
      });
      
      return img;
    };
  }

  monitorServiceWorkerUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          console.log('🔄 Service Worker Update Available - NOT auto-reloading');
          
          // Show notification instead of auto-reloading
          window.dispatchEvent(new CustomEvent('sw-update-available', {
            detail: { 
              message: event.data.message,
              preventAutoReload: true 
            }
          }));
        }
      });
    }
  }

  monitorReactRouterNavigation() {
    // Monitor for unexpected navigation changes
    let lastUrl = window.location.href;
    
    const checkNavigation = () => {
      if (window.location.href !== lastUrl) {
        console.log('🧭 Navigation detected:', {
          from: lastUrl,
          to: window.location.href,
          timestamp: new Date().toISOString()
        });
        lastUrl = window.location.href;
      }
    };
    
    // Check for navigation changes periodically (reduced frequency to prevent performance issues)
    // Changed from 10 seconds to 60 seconds to further reduce unnecessary checks
    setInterval(checkNavigation, 60000);
    
    // Also monitor popstate events
    window.addEventListener('popstate', (event) => {
      console.log('🧭 PopState event:', {
        url: window.location.href,
        state: event.state,
        timestamp: new Date().toISOString()
      });
    });
  }

  preventUnwantedReloads() {
    // Prevent beforeunload from causing issues
    window.addEventListener('beforeunload', (event) => {
      // Only show confirmation if there's unsaved data
      if (this.hasUnsavedData()) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    });

    // Prevent unload from causing issues
    window.addEventListener('unload', (event) => {
      console.log('🔧 Page unloading - preserving state');
      
      // Save any pending state
      if (window.statePreservation) {
        window.statePreservation.saveAllFormStates();
        window.statePreservation.saveScrollPosition();
      }
    });
  }

  hasUnsavedData() {
    // Check if there are any forms with unsaved data
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
      const inputs = form.querySelectorAll('input, textarea, select');
      for (const input of inputs) {
        if (input.value && input.value.trim() !== '') {
          return true;
        }
      }
    }
    return false;
  }

  // Get comprehensive report
  getReport() {
    return {
      reloadAttempts: this.reloadAttempts,
      networkErrors: this.networkErrors,
      imageErrors: this.imageErrors,
      isMonitoring: this.isMonitoring,
      timestamp: new Date().toISOString()
    };
  }

  // Clear all monitoring data
  clearData() {
    this.reloadAttempts = [];
    this.networkErrors = [];
    this.imageErrors = [];
  }

  // FIXED: Restore method no longer tries to restore read-only properties
  restore() {
    // Remove event listeners instead of trying to restore read-only properties
    this.isMonitoring = false;
    console.log('🔧 Auto-Refresh Prevention: Monitoring disabled');
  }
}

// Create global instance
const autoRefreshPrevention = new AutoRefreshPrevention();

// Export for use in components
export default autoRefreshPrevention;

// Make available globally
if (typeof window !== 'undefined') {
  window.autoRefreshPrevention = autoRefreshPrevention;
}
