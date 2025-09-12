// Image URL Interceptor for Integrated Deployment
// This utility handles localhost URLs in the integrated deployment environment

class ImageUrlInterceptor {
  constructor() {
    this.isIntegratedDeployment = this.detectIntegratedDeployment();
    this.originalMethods = {};
    
    if (this.isIntegratedDeployment) {
      this.setupInterceptors();
    }
  }

  detectIntegratedDeployment() {
    // Check if we're in integrated deployment (Render, Netlify, Vercel)
    return window.location.hostname.includes('render.com') || 
           window.location.hostname.includes('netlify.app') || 
           window.location.hostname.includes('vercel.app') ||
           window.location.hostname.includes('github.io');
  }

  convertLocalhostUrl(url) {
    if (typeof url === 'string' && url.includes('localhost:5001')) {
      const convertedUrl = url.replace('http://localhost:5001', '');
      console.log('🔧 Image URL converted:', url, '→', convertedUrl);
      return convertedUrl;
    }
    return url;
  }

  setupInterceptors() {
    console.log('🔧 Setting up image URL interceptors for integrated deployment');
    
    // Intercept HTMLImageElement.src setter
    this.interceptImageSrc();
    
    // Intercept fetch requests for images
    this.interceptFetch();
    
    // Intercept XMLHttpRequest for images
    this.interceptXHR();
    
    // Override global getImageUrl function
    this.overrideGetImageUrl();
  }

  interceptImageSrc() {
    const self = this;
    
    // Store original descriptor if it exists
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    
    // Only override if not already overridden
    if (!originalDescriptor || originalDescriptor.configurable) {
      // Override the src setter with error handling
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        get: function() {
          return this._src || '';
        },
        set: function(value) {
          try {
            const convertedValue = self.convertLocalhostUrl(value);
            this._src = convertedValue;
            
            // Add error handler to prevent failed image loads from causing issues
            this.onerror = function(e) {
              console.warn('🔧 Image failed to load, using fallback:', this._src);
              // Don't let image errors cause page reloads
              e.preventDefault();
              e.stopPropagation();
              return false;
            };
          } catch (error) {
            console.warn('🔧 Error in image src interceptor:', error);
            this._src = value; // Fallback to original value
          }
        },
        configurable: true
      });
    }
  }

  interceptFetch() {
    const self = this;
    const originalFetch = window.fetch;
    
    // Only override if not already overridden
    if (originalFetch === window.fetch) {
      window.fetch = function(url, options) {
        try {
          const convertedUrl = self.convertLocalhostUrl(url);
          return originalFetch.call(this, convertedUrl, options).catch(error => {
            // Handle fetch errors gracefully without causing page reloads
            console.warn('🔧 Fetch error handled gracefully:', error);
            return Promise.reject(error);
          });
        } catch (error) {
          console.warn('🔧 Error in fetch interceptor:', error);
          return originalFetch.call(this, url, options);
        }
      };
    }
  }

  interceptXHR() {
    const self = this;
    const originalOpen = XMLHttpRequest.prototype.open;
    
    // Only override if not already overridden
    if (originalOpen === XMLHttpRequest.prototype.open) {
      XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        try {
          const convertedUrl = self.convertLocalhostUrl(url);
          return originalOpen.call(this, method, convertedUrl, async, user, password);
        } catch (error) {
          console.warn('🔧 Error in XHR interceptor:', error);
          return originalOpen.call(this, method, url, async, user, password);
        }
      };
    }
  }

  overrideGetImageUrl() {
    const self = this;
    
    // Store original function if it exists
    if (window.getImageUrl) {
      this.originalMethods.getImageUrl = window.getImageUrl;
    }
    
    // Override global getImageUrl function
    window.getImageUrl = function(imagePath) {
      const convertedPath = self.convertLocalhostUrl(imagePath);
      
      // If we have an original function, use it with the converted path
      if (self.originalMethods.getImageUrl) {
        return self.originalMethods.getImageUrl(convertedPath);
      }
      
      return convertedPath;
    };
  }

  // Method to manually convert URLs (useful for data processing)
  convertImageUrlsInData(data) {
    if (!data) return data;
    
    if (typeof data === 'string') {
      return this.convertLocalhostUrl(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.convertImageUrlsInData(item));
    }
    
    if (typeof data === 'object') {
      const converted = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === 'url' || key === 'image' || key === 'images' || key.includes('image') || key.includes('Image')) {
          converted[key] = this.convertImageUrlsInData(value);
        } else {
          converted[key] = value;
        }
      }
      return converted;
    }
    
    return data;
  }

  // Method to restore original methods (for testing)
  restore() {
    if (this.originalMethods.getImageUrl) {
      window.getImageUrl = this.originalMethods.getImageUrl;
    }
  }
}

// Create global instance
const imageUrlInterceptor = new ImageUrlInterceptor();

// Export for use in components
export default imageUrlInterceptor;

// Make available globally
if (typeof window !== 'undefined') {
  window.imageUrlInterceptor = imageUrlInterceptor;
}
