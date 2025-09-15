// Aggressive Image URL Fix for Service Images
// This utility provides comprehensive image URL conversion to fix connection refused errors

class AggressiveImageFix {
  constructor() {
    this.isInitialized = false;
    this.conversionCount = 0;
    this.setupComplete = false;
  }

  // Initialize the aggressive image fix
  initialize() {
    if (this.isInitialized) return;
    
    console.log('🔧 Initializing aggressive image fix...');
    
    // Set up multiple layers of image URL conversion
    this.setupImageSrcOverride();
    this.setupFetchInterceptor();
    this.setupXHRInterceptor();
    this.setupDOMObserver();
    this.setupPeriodicConversion();
    
    // Convert existing images immediately
    this.convertAllImages();
    
    this.isInitialized = true;
    this.setupComplete = true;
    console.log('🔧 Aggressive image fix initialized successfully');
  }

  // Override HTMLImageElement.src property
  setupImageSrcOverride() {
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    
    if (!originalDescriptor || originalDescriptor.configurable) {
      const self = this;
      
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        get: function() {
          return this._src || '';
        },
        set: function(value) {
          try {
            const convertedValue = self.convertImageUrl(value);
            this._src = convertedValue;
            
            // Add error handler
            this.onerror = function(e) {
              console.warn('🔧 Image failed to load, using fallback:', this._src);
              e.preventDefault();
              e.stopPropagation();
              
              if (this._src !== '/default-service-image.svg') {
                this._src = '/default-service-image.svg';
              }
              
              return false;
            };
          } catch (error) {
            console.warn('🔧 Error in aggressive image src override:', error);
            this._src = value;
          }
        },
        configurable: true
      });
    }
  }

  // Intercept fetch requests for images
  setupFetchInterceptor() {
    const self = this;
    const originalFetch = window.fetch;
    
    if (originalFetch === window.fetch) {
      window.fetch = function(url, options) {
        try {
          const convertedUrl = self.convertImageUrl(url);
          return originalFetch.call(this, convertedUrl, options).catch(error => {
            console.warn('🔧 Fetch error handled gracefully:', error);
            return Promise.reject(error);
          });
        } catch (error) {
          console.warn('🔧 Error in aggressive fetch interceptor:', error);
          return originalFetch.call(this, url, options);
        }
      };
    }
  }

  // Intercept XMLHttpRequest for images
  setupXHRInterceptor() {
    const self = this;
    const originalOpen = XMLHttpRequest.prototype.open;
    
    if (originalOpen === XMLHttpRequest.prototype.open) {
      XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        try {
          const convertedUrl = self.convertImageUrl(url);
          return originalOpen.call(this, method, convertedUrl, async, user, password);
        } catch (error) {
          console.warn('🔧 Error in aggressive XHR interceptor:', error);
          return originalOpen.call(this, method, url, async, user, password);
        }
      };
    }
  }

  // Set up DOM observer to catch new images
  setupDOMObserver() {
    const self = this;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'IMG') {
              self.convertImageUrl(node.src);
            }
            const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
            images.forEach(img => self.convertImageUrl(img.src));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Set up periodic conversion to catch any missed images
  setupPeriodicConversion() {
    const self = this;
    
    // Convert images every 2 seconds for the first 30 seconds
    let attempts = 0;
    const maxAttempts = 15;
    
    const interval = setInterval(() => {
      attempts++;
      const converted = self.convertAllImages();
      
      if (converted === 0 || attempts >= maxAttempts) {
        clearInterval(interval);
        console.log('🔧 Periodic image conversion completed');
      }
    }, 2000);
  }

  // Convert a single image URL
  convertImageUrl(url) {
    if (!url || typeof url !== 'string') return url;
    
    let convertedUrl = url;
    
    // Handle localhost:5001 URLs
    if (url.includes('localhost:5001')) {
      convertedUrl = url.replace('http://localhost:5001', '');
      console.log('🔧 Aggressive fix: Converting localhost:5001 URL:', url, '→', convertedUrl);
      this.conversionCount++;
    }
    // Handle bare service image filenames - PRIORITY
    else if (url.includes('serviceImages-') && !url.startsWith('/') && !url.startsWith('http')) {
      convertedUrl = '/uploads/services/' + url;
      console.log('🔧 Aggressive fix: Converting bare service image filename:', url, '→', convertedUrl);
      this.conversionCount++;
    }
    // Handle any other localhost URLs
    else if (url.includes('localhost:') && !url.startsWith('/')) {
      convertedUrl = url.replace(/https?:\/\/localhost:\d+/, '');
      console.log('🔧 Aggressive fix: Converting localhost URL:', url, '→', convertedUrl);
      this.conversionCount++;
    }
    // Handle any bare image filename - ENHANCED
    else if ((url.includes('.webp') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) && !url.startsWith('/') && !url.startsWith('http')) {
      convertedUrl = '/uploads/services/' + url;
      console.log('🔧 Aggressive fix: Converting bare image filename:', url, '→', convertedUrl);
      this.conversionCount++;
    }
    // Handle bare filenames without extension that look like service images
    else if (url.match(/^[a-zA-Z0-9-_]+$/) && !url.startsWith('/') && !url.startsWith('http') && url.length > 10) {
      convertedUrl = '/uploads/services/' + url;
      console.log('🔧 Aggressive fix: Converting bare filename without extension:', url, '→', convertedUrl);
      this.conversionCount++;
    }
    
    return convertedUrl;
  }

  // Convert all images in the DOM
  convertAllImages() {
    const images = document.querySelectorAll('img');
    let convertedCount = 0;
    
    images.forEach(img => {
      if (img.src) {
        const newSrc = this.convertImageUrl(img.src);
        if (newSrc !== img.src) {
          img.src = newSrc;
          convertedCount++;
        }
      }
    });
    
    if (convertedCount > 0) {
      console.log(`🔧 Aggressive fix: Converted ${convertedCount} image URLs in DOM`);
    }
    
    return convertedCount;
  }

  // Get conversion statistics
  getStats() {
    return {
      isInitialized: this.isInitialized,
      setupComplete: this.setupComplete,
      conversionCount: this.conversionCount,
      totalImages: document.querySelectorAll('img').length
    };
  }

  // Force conversion of all images
  forceConvertAll() {
    console.log('🔧 Forcing conversion of all images...');
    this.convertAllImages();
    console.log('🔧 Force conversion completed');
  }
}

// Create global instance
const aggressiveImageFix = new AggressiveImageFix();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    aggressiveImageFix.initialize();
  });
} else {
  aggressiveImageFix.initialize();
}

// Make available globally
if (typeof window !== 'undefined') {
  window.aggressiveImageFix = aggressiveImageFix;
}

export default aggressiveImageFix;
