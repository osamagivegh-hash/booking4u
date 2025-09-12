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
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      get: function() {
        return this._src || '';
      },
      set: function(value) {
        if (typeof value === 'string' && value.includes('localhost:5001')) {
          console.log('🔧 Intercepting image URL with localhost:', value);
          const newUrl = value.replace('http://localhost:5001', '');
          console.log('🔧 Redirecting image to relative URL:', newUrl);
          this._src = newUrl;
        } else {
          this._src = value;
        }
      }
    });
    
    // Override getImageUrl function if it exists
    if (window.getImageUrl) {
      const originalGetImageUrl = window.getImageUrl;
      window.getImageUrl = function(imagePath) {
        if (typeof imagePath === 'string' && imagePath.includes('localhost:5001')) {
          console.log('🔧 Intercepting getImageUrl with localhost:', imagePath);
          const newUrl = imagePath.replace('http://localhost:5001', '');
          console.log('🔧 Redirecting getImageUrl to relative URL:', newUrl);
          return newUrl;
        }
        return originalGetImageUrl(imagePath);
      };
    }
    
    console.log('🔧 API and image configuration overridden for integrated deployment');
  }
})();

