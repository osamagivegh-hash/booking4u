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
    window.REACT_APP_ASSET_URL = 'http://localhost:5001';
    console.log('🔧 Development environment detected');
  } else if (isGitHubPages) {
    // GitHub Pages deployment - use Render backend
    window.REACT_APP_API_URL = 'https://booking4u-backend.onrender.com/api';
    window.REACT_APP_BASE_URL = 'https://booking4u-backend.onrender.com';
    window.REACT_APP_SOCKET_URL = 'https://booking4u-backend.onrender.com';
    window.REACT_APP_ASSET_URL = 'https://booking4u-backend.onrender.com';
    console.log('🔧 GitHub Pages environment detected');
  } else {
    // Integrated deployment (same origin) - use relative URLs
    window.REACT_APP_API_URL = '/api';
    window.REACT_APP_BASE_URL = '/';
    window.REACT_APP_SOCKET_URL = '/';
    window.REACT_APP_ASSET_URL = '/';
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
    
    // Override image URL handling for localhost URLs - More aggressive approach
    const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (!originalImageSrc || originalImageSrc.configurable) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        get: function() {
          return this._src || '';
        },
        set: function(value) {
          try {
            let convertedValue = value;
            if (typeof value === 'string') {
              console.log('🔧 Image src being set:', value);
              
              // Handle localhost:5001 URLs
              if (value.includes('localhost:5001')) {
                convertedValue = value.replace('http://localhost:5001', '');
                console.log('🔧 Image URL converted in env-config:', value, '→', convertedValue);
              }
              // Handle bare filenames (like serviceImages-xxx.webp) - PRIORITY
              else if (value.includes('serviceImages-') && !value.startsWith('/') && !value.startsWith('http')) {
                convertedValue = '/uploads/services/' + value;
                console.log('🔧 Bare filename converted to full path:', value, '→', convertedValue);
              }
              // Handle any other localhost URLs
              else if (value.includes('localhost:') && !value.startsWith('/')) {
                convertedValue = value.replace(/https?:\/\/localhost:\d+/, '');
                console.log('🔧 Localhost URL converted:', value, '→', convertedValue);
              }
              // Handle any bare filename that looks like an image
              else if (value.includes('.webp') && !value.startsWith('/') && !value.startsWith('http')) {
                convertedValue = '/uploads/services/' + value;
                console.log('🔧 Bare webp filename converted to full path:', value, '→', convertedValue);
              }
            }
            this._src = convertedValue;
            
            // Add comprehensive error handler
            this.onerror = function(e) {
              console.warn('🔧 Image failed to load, using fallback:', this._src);
              e.preventDefault();
              e.stopPropagation();
              
              // Try fallback image
              if (this._src !== '/default-service-image.svg') {
                this._src = '/default-service-image.svg';
              }
              
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
      let convertedCount = 0;
      
      images.forEach(img => {
        if (img.src) {
          let newSrc = img.src;
          
          // Handle localhost URLs
          if (img.src.includes('localhost:5001')) {
            newSrc = img.src.replace('http://localhost:5001', '');
            console.log('🔧 Converting localhost image URL:', img.src, '→', newSrc);
            convertedCount++;
          }
          // Handle bare filenames (like serviceImages-xxx.webp) - PRIORITY
          else if (img.src.includes('serviceImages-') && !img.src.startsWith('/') && !img.src.startsWith('http')) {
            newSrc = '/uploads/services/' + img.src;
            console.log('🔧 Converting bare filename to full path:', img.src, '→', newSrc);
            convertedCount++;
          }
          // Handle any other localhost URLs
          else if (img.src.includes('localhost:') && !img.src.startsWith('/')) {
            newSrc = img.src.replace(/https?:\/\/localhost:\d+/, '');
            console.log('🔧 Converting localhost URL:', img.src, '→', newSrc);
            convertedCount++;
          }
          // Handle any bare webp filename
          else if (img.src.includes('.webp') && !img.src.startsWith('/') && !img.src.startsWith('http')) {
            newSrc = '/uploads/services/' + img.src;
            console.log('🔧 Converting bare webp filename to full path:', img.src, '→', newSrc);
            convertedCount++;
          }
          
          if (newSrc !== img.src) {
            img.src = newSrc;
          }
        }
      });
      
      if (convertedCount > 0) {
        console.log(`🔧 convertExistingImageUrls: Converted ${convertedCount} image URLs`);
      }
    };

    // DOM Observer to catch new images as they're added
    window.setupImageObserver = function() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is an image
              if (node.tagName === 'IMG') {
                window.convertImageUrl(node);
              }
              // Check for images within the added node
              const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
              images.forEach(img => window.convertImageUrl(img));
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('🔧 Image observer set up to catch new images');
    };

    // Function to convert a single image URL
    window.convertImageUrl = function(img) {
      if (!img || !img.src) return;
      
      let newSrc = img.src;
      
      // Handle localhost:5001 URLs
      if (img.src.includes('localhost:5001')) {
        newSrc = img.src.replace('http://localhost:5001', '');
        console.log('🔧 Observer: Converting localhost image URL:', img.src, '→', newSrc);
      }
      // Handle bare filenames (like serviceImages-xxx.webp) - PRIORITY
      else if (img.src.includes('serviceImages-') && !img.src.startsWith('/') && !img.src.startsWith('http')) {
        newSrc = '/uploads/services/' + img.src;
        console.log('🔧 Observer: Converting bare filename:', img.src, '→', newSrc);
      }
      // Handle any other localhost URLs
      else if (img.src.includes('localhost:') && !img.src.startsWith('/')) {
        newSrc = img.src.replace(/https?:\/\/localhost:\d+/, '');
        console.log('🔧 Observer: Converting localhost URL:', img.src, '→', newSrc);
      }
      // Handle any bare webp filename
      else if (img.src.includes('.webp') && !img.src.startsWith('/') && !img.src.startsWith('http')) {
        newSrc = '/uploads/services/' + img.src;
        console.log('🔧 Observer: Converting bare webp filename:', img.src, '→', newSrc);
      }
      
      if (newSrc !== img.src) {
        img.src = newSrc;
      }
    };
    
    // Convert existing image URLs immediately and set up observer
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.convertExistingImageUrls();
        window.setupImageObserver();
      });
    } else {
      window.convertExistingImageUrls();
      window.setupImageObserver();
    }
    
    // Also convert images periodically to catch any missed ones
    setInterval(() => {
      window.convertExistingImageUrls();
      // Also run the global converter as a backup
      if (window.convertAllLocalhostImageUrls) {
        window.convertAllLocalhostImageUrls();
      }
    }, 1000); // Check every 1 second for more aggressive conversion
    
    // Manual conversion function that can be called immediately
    window.forceConvertAllImages = function() {
      console.log('🔧 Force converting all images...');
      window.convertExistingImageUrls();
      if (window.convertAllLocalhostImageUrls) {
        window.convertAllLocalhostImageUrls();
      }
      console.log('🔧 Force conversion completed');
    };
    
    // Run immediate conversion
    setTimeout(() => {
      window.forceConvertAllImages();
    }, 100);
    
    console.log('🔧 API and image configuration overridden for integrated deployment');
  }
})();

