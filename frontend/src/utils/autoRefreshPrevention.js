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
    // Override window.location.reload to log and potentially prevent
    this.originalMethods.reload = window.location.reload;
    window.location.reload = (...args) => {
      const stack = new Error().stack;
      const timestamp = new Date().toISOString();
      
      this.reloadAttempts.push({
        timestamp,
        stack,
        args,
        url: window.location.href
      });
      
      console.warn('🚨 PAGE RELOAD ATTEMPT DETECTED:', {
        timestamp,
        url: window.location.href,
        stack: stack.split('\n').slice(0, 5).join('\n')
      });
      
      // Only allow reload if it's from a user action or critical error
      if (this.shouldAllowReload(stack)) {
        console.log('✅ Reload allowed - user action or critical error');
        return this.originalMethods.reload.apply(window.location, args);
      } else {
        console.warn('❌ Reload prevented - potential auto-refresh issue');
        return false;
      }
    };
  }

  shouldAllowReload(stack) {
    // Allow reload if it's from user interaction or critical system error
    const allowedPatterns = [
      'user click',
      'button click',
      'form submit',
      'critical error',
      'manual refresh'
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
    // Changed from 1 second to 10 seconds to reduce unnecessary checks
    setInterval(checkNavigation, 10000);
    
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

  // Restore original methods
  restore() {
    if (this.originalMethods.reload) {
      window.location.reload = this.originalMethods.reload;
    }
    this.isMonitoring = false;
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
