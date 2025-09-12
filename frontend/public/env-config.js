// Environment Configuration for GitHub Pages
// This file is loaded in public/index.html to set environment variables

(function() {
  // Detect if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Set environment variables based on deployment
  if (isDevelopment) {
    window.REACT_APP_API_URL = 'http://localhost:5001/api';
    window.REACT_APP_BASE_URL = 'http://localhost:5001';
    window.REACT_APP_SOCKET_URL = 'http://localhost:5001';
    console.log('🔧 Development environment detected');
  } else if (isGitHubPages) {
    // GitHub Pages deployment - use Render backend
    window.REACT_APP_API_URL = 'https://booking4u-backend.onrender.com/api';
    window.REACT_APP_BASE_URL = 'https://booking4u-backend.onrender.com';
    window.REACT_APP_SOCKET_URL = 'https://booking4u-backend.onrender.com';
    console.log('🔧 GitHub Pages environment detected');
  } else {
    // Integrated deployment (same origin) - use relative URLs
    window.REACT_APP_API_URL = '/api';
    window.REACT_APP_BASE_URL = '/';
    window.REACT_APP_SOCKET_URL = '/';
    console.log('🔧 Integrated deployment environment detected');
    
    // Force override any existing API configuration
    window.API_CONFIG = {
      PRIMARY: '/',
      DEVELOPMENT: '/',
      ALTERNATIVE: '/',
      BACKUP: '/',
      GITHUB_PAGES: '/'
    };
    
    // Override any existing getApiUrl function
    window.getApiUrl = function() {
      console.log('🔧 Override getApiUrl called - returning /api');
      return '/api';
    };
    
    // Override fetch to intercept API calls
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string' && url.includes('booking4u-backend.onrender.com')) {
        console.log('🔧 Intercepting fetch call to old backend URL:', url);
        const newUrl = url.replace('https://booking4u-backend.onrender.com', '');
        console.log('🔧 Redirecting to relative URL:', newUrl);
        return originalFetch(newUrl, options);
      }
      return originalFetch(url, options);
    };
    
    // Override XMLHttpRequest to intercept API calls
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      if (typeof url === 'string' && url.includes('booking4u-backend.onrender.com')) {
        console.log('🔧 Intercepting XHR call to old backend URL:', url);
        const newUrl = url.replace('https://booking4u-backend.onrender.com', '');
        console.log('🔧 Redirecting to relative URL:', newUrl);
        return originalXHROpen.call(this, method, newUrl, async, user, password);
      }
      return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    // Override image URL handling for localhost URLs
    const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (!originalImageSrc || originalImageSrc.configurable) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        get: function() {
          return this._src || '';
        },
        set: function(value) {
          try {
            let convertedValue = value;
            if (typeof value === 'string' && value.includes('localhost:5001')) {
              convertedValue = value.replace('http://localhost:5001', '');
              console.log('🔧 Image URL converted in env-config:', value, '→', convertedValue);
            }
            this._src = convertedValue;
            
            // Add error handler to prevent failed image loads
            this.onerror = function(e) {
              console.warn('🔧 Image failed to load, using fallback:', this._src);
              e.preventDefault();
              e.stopPropagation();
              return false;
            };
          } catch (error) {
            console.warn('🔧 Error in image src override:', error);
            this._src = value;
          }
        },
        configurable: true
      });
    }
    
    // Override global getImageUrl function if it exists
    if (window.getImageUrl) {
      const originalGetImageUrl = window.getImageUrl;
      window.getImageUrl = function(imagePath) {
        if (typeof imagePath === 'string' && imagePath.includes('localhost:5001')) {
          const convertedPath = imagePath.replace('http://localhost:5001', '');
          console.log('🔧 getImageUrl converted:', imagePath, '→', convertedPath);
          return originalGetImageUrl(convertedPath);
        }
        return originalGetImageUrl(imagePath);
      };
    }
    
    // Function to convert existing image URLs in the DOM
    window.convertExistingImageUrls = function() {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src && img.src.includes('localhost:5001')) {
          const newSrc = img.src.replace('http://localhost:5001', '');
          console.log('🔧 Converting existing image URL:', img.src, '→', newSrc);
          img.src = newSrc;
        }
      });
    };
    
    // Convert existing image URLs immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window.convertExistingImageUrls);
    } else {
      window.convertExistingImageUrls();
    }
    
    console.log('🔧 API and image configuration overridden for integrated deployment');
  }
})();

