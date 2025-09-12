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
    if (typeof url === 'string') {
      console.log('🔧 ImageUrlInterceptor: Processing URL:', url);
      
      // Handle legacy localhost:5001 URLs (should not happen with new backend)
      if (url.includes('localhost:5001')) {
        const convertedUrl = url.replace('http://localhost:5001', '');
        console.log('🔧 ImageUrlInterceptor: Legacy localhost URL converted:', url, '→', convertedUrl);
        return convertedUrl;
      }
      // Handle any other localhost URLs (should not happen with new backend)
      else if (url.includes('localhost:') && !url.startsWith('/')) {
        const convertedUrl = url.replace(/https?:\/\/localhost:\d+/, '');
        console.log('🔧 ImageUrlInterceptor: Legacy localhost URL converted:', url, '→', convertedUrl);
        return convertedUrl;
      }
      // Handle bare filenames (like serviceImages-xxx.webp) - for legacy data
      else if (url.includes('serviceImages-') && !url.startsWith('/') && !url.startsWith('http')) {
        const convertedUrl = '/uploads/services/' + url;
        console.log('🔧 ImageUrlInterceptor: Bare filename converted:', url, '→', convertedUrl);
        return convertedUrl;
      }
      // Handle any bare webp filename - for legacy data
      else if (url.includes('.webp') && !url.startsWith('/') && !url.startsWith('http')) {
        const convertedUrl = '/uploads/services/' + url;
        console.log('🔧 ImageUrlInterceptor: Bare webp filename converted:', url, '→', convertedUrl);
        return convertedUrl;
      }
    }
    return url;
  }

  setupInterceptors() {
    console.log('🔧 Setting up image URL interceptors for integrated deployment');
    
    // Skip HTMLImageElement.src interceptor to avoid conflicts with env-config.js
    // this.interceptImageSrc();
    
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
    
    // Override global getImageUrl function with simplified logic
    window.getImageUrl = function(imagePath) {
      if (!imagePath) {
        return '/default-service-image.svg';
      }
      
      // Handle legacy localhost URLs (should not happen with new backend)
      if (imagePath.includes('localhost:5001')) {
        const convertedPath = imagePath.replace('http://localhost:5001', '');
        console.log('🔧 ImageUrlInterceptor: Legacy localhost URL converted:', imagePath, '→', convertedPath);
        return convertedPath;
      }
      
      // Handle any other localhost URLs (should not happen with new backend)
      if (imagePath.includes('localhost:') && !imagePath.startsWith('/')) {
        const convertedPath = imagePath.replace(/https?:\/\/localhost:\d+/, '');
        console.log('🔧 ImageUrlInterceptor: Legacy localhost URL converted:', imagePath, '→', convertedPath);
        return convertedPath;
      }
      
      // If it's already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      // Backend now always returns relative paths, so we can use them directly
      // If it's already a relative path starting with /uploads/, return as is
      if (imagePath.startsWith('/uploads/')) {
        return imagePath;
      }
      
      // Handle bare filenames that look like service images
      if (imagePath.includes('serviceImages-') && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
        console.log('🔧 ImageUrlInterceptor: Bare service image filename converted:', imagePath);
        return `/uploads/services/${imagePath}`;
      }
      
      // If it's just a filename, assume it's in uploads/services
      if (!imagePath.includes('/')) {
        return `/uploads/services/${imagePath}`;
      }
      
      // Default case - prepend /uploads/
      return `/uploads/${imagePath}`;
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
