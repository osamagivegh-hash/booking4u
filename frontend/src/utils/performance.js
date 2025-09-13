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

// COMPLETELY DISABLED: Service Worker registration to prevent cached files
export const registerServiceWorker = async () => {
  console.log('🛡️ Service Worker registration completely disabled to prevent cached files and 30-second refresh');
  
  // Unregister any existing service workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('🛡️ Unregistered existing service worker:', registration.scope);
      }
    } catch (error) {
      console.log('🛡️ Error unregistering service workers:', error);
    }
  }
  
  return; // Exit early, no service worker registration
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
