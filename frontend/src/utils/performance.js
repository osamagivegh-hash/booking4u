// Performance optimization utilities

// Debounce function to limit API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy load component
export const lazyLoad = (importFunc) => {
  return React.lazy(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(importFunc());
      }, 100);
    });
  });
};

// Preload critical resources
export const preloadResources = () => {
  // Preload critical CSS
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = '/static/css/main.css';
  document.head.appendChild(link);
};

// Optimize images
export const optimizeImage = (src, width = 400) => {
  if (!src) return '';
  // Add image optimization parameters
  return `${src}?w=${width}&q=80&auto=format`;
};

// Cache management
export const cacheManager = {
  set: (key, value, ttl = 3600000) => { // Default 1 hour
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get: (key) => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { value, timestamp, ttl } = JSON.parse(item);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return value;
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

// Service Worker registration with update handling
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available, but don't auto-reload
              console.log('New service worker available. User can refresh to update.');
              
              // Show notification to user instead of auto-reloading
              if (window.debugLogger) {
                window.debugLogger.log('SERVICE_WORKER', '🔄 New service worker available', {
                  timestamp: new Date().toISOString()
                });
              }
              
              // Dispatch custom event for UI to show update notification
              window.dispatchEvent(new CustomEvent('sw-update-available', {
                detail: { registration }
              }));
            }
          });
        }
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          console.log('Service Worker update available:', event.data.message);
          
          // Show user notification instead of auto-reloading
          window.dispatchEvent(new CustomEvent('sw-update-available', {
            detail: { message: event.data.message }
          }));
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Memory management
export const memoryManager = {
  cleanup: () => {
    // Clear unused event listeners
    if (window.gc) {
      window.gc();
    }
  },
  
  monitor: () => {
    if ('memory' in performance) {
      const memory = performance.memory;
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  }
};
