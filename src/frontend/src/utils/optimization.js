// Additional performance optimization utilities

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Lazy load images
export const lazyLoadImage = (imgElement, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        imgElement.src = src;
        observer.unobserve(imgElement);
      }
    });
  });
  
  observer.observe(imgElement);
};

// Optimize scroll events
export const optimizeScroll = (callback, delay = 16) => {
  let ticking = false;
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

// Optimize resize events
export const optimizeResize = (callback, delay = 250) => {
  let timeout;
  
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  };
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.href = '/fonts/cairo.woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
  
  // Preload critical images
  const imageLink = document.createElement('link');
  imageLink.rel = 'preload';
  imageLink.as = 'image';
  imageLink.href = '/logo.svg';
  document.head.appendChild(imageLink);
};

// Optimize API calls
export const optimizeApiCall = (apiCall, delay = 300) => {
  let timeout;
  
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        apiCall(...args).then(resolve).catch(reject);
      }, delay);
    });
  };
};

// Optimize component rendering
export const optimizeRender = (Component, props) => {
  return React.memo(Component, (prevProps, nextProps) => {
    // Custom comparison logic
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// Optimize localStorage operations
export const optimizeStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Optimize DOM operations
export const optimizeDOM = {
  // Batch DOM updates
  batchUpdate: (updates) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },
  
  // Optimize class changes
  updateClasses: (element, classes) => {
    if (element) {
      Object.entries(classes).forEach(([className, shouldAdd]) => {
        if (shouldAdd) {
          element.classList.add(className);
        } else {
          element.classList.remove(className);
        }
      });
    }
  }
};

// Optimize event listeners
export const optimizeEventListeners = {
  // Add event listener with passive option for better performance
  addPassiveListener: (element, event, handler) => {
    element.addEventListener(event, handler, { passive: true });
  },
  
  // Remove event listener
  removeListener: (element, event, handler) => {
    element.removeEventListener(event, handler);
  }
};

// Optimize animations
export const optimizeAnimations = {
  // Use transform instead of changing layout properties
  animateTransform: (element, transform) => {
    if (element) {
      element.style.transform = transform;
    }
  },
  
  // Use opacity for fade animations
  animateOpacity: (element, opacity) => {
    if (element) {
      element.style.opacity = opacity;
    }
  }
};


