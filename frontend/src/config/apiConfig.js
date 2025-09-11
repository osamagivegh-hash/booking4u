// API Configuration - Comprehensive Backend URLs
const API_CONFIG = {
  // Primary backend URL - Render
  PRIMARY: 'https://booking4u-backend.onrender.com',
  
  // Alternative backend URLs
  ALTERNATIVE: 'https://booking4u-backend-1.onrender.com',
  BACKUP: 'https://booking4u-1.onrender.com',
  
  // GitHub Pages URL
  GITHUB_PAGES: 'https://booking4u-backend.onrender.com',
  
  // Development URLs
  DEVELOPMENT: 'http://localhost:10000',
  DEVELOPMENT_ALT: 'http://localhost:5001',
  
  // Local development with different ports
  LOCAL_3000: 'http://localhost:3000',
  LOCAL_5000: 'http://localhost:5000'
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  // Use window environment variable if available (PRIORITY)
  if (window.REACT_APP_API_URL) {
    console.log('🔧 Using window environment variable API URL:', window.REACT_APP_API_URL);
    return window.REACT_APP_API_URL;
  }
  
  // Use process environment variable if available
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using process environment variable API URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // In development, try multiple localhost ports
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode - using localhost API');
    return `${API_CONFIG.DEVELOPMENT}/api`;
  }
  
  // For integrated deployment (same origin), use relative URL - PRIORITY
  if (window.location.hostname.includes('render.com') || 
      window.location.hostname.includes('netlify.app') || 
      window.location.hostname.includes('vercel.app')) {
    console.log('🔧 Integrated deployment detected - using relative API URL');
    return '/api';
  }
  
  // For GitHub Pages deployment, use absolute URL to backend
  if (window.location.hostname.includes('github.io')) {
    console.log('🔧 GitHub Pages deployment detected - using absolute API URL');
    return `${API_CONFIG.PRIMARY}/api`;
  }
  
  // Default fallback to primary URL
  console.log('🔧 Using default primary API URL');
  return `${API_CONFIG.PRIMARY}/api`;
};

// Get the base URL for images and static files
export const getBaseUrl = () => {
  if (window.REACT_APP_BASE_URL) {
    return window.REACT_APP_BASE_URL;
  }
  
  if (process.env.REACT_APP_BASE_URL) {
    return process.env.REACT_APP_BASE_URL;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return API_CONFIG.DEVELOPMENT;
  }
  
  return API_CONFIG.PRIMARY;
};

// Get socket URL
export const getSocketUrl = () => {
  if (window.REACT_APP_SOCKET_URL) {
    return window.REACT_APP_SOCKET_URL;
  }
  
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return API_CONFIG.DEVELOPMENT;
  }
  
  return API_CONFIG.PRIMARY;
};

// Test API connectivity with multiple fallbacks
export const testApiConnectivity = async () => {
  const apiUrl = getApiUrl();
  const baseUrl = getBaseUrl();
  
  // List of URLs to try in order
  const urlsToTry = [
    baseUrl,
    API_CONFIG.PRIMARY,
    API_CONFIG.ALTERNATIVE,
    API_CONFIG.BACKUP,
    API_CONFIG.GITHUB_PAGES
  ];
  
  console.log('🔍 Testing API connectivity...');
  console.log('📋 URLs to try:', urlsToTry);
  
  for (const url of urlsToTry) {
    try {
      console.log(`🔄 Trying: ${url}/api/health`);
      
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'include',
        timeout: 10000 // 10 second timeout
      });
      
      if (response.ok) {
        const healthData = await response.json();
        console.log(`✅ API working: ${url}`, healthData);
        return { 
          success: true, 
          url: url,
          health: healthData,
          cors: healthData.cors
        };
      } else {
        console.warn(`⚠️ API responded with status ${response.status}: ${url}`);
      }
    } catch (error) {
      console.warn(`❌ API not available: ${url}`, error.message);
    }
  }
  
  console.error('❌ No backend API available from any URL');
  return { 
    success: false, 
    url: null,
    error: 'No backend API available',
    triedUrls: urlsToTry
  };
};

// Test CORS specifically
export const testCorsConnectivity = async () => {
  const baseUrl = getBaseUrl();
  
  try {
    console.log('🔍 Testing CORS connectivity...');
    
    const response = await fetch(`${baseUrl}/api/debug/cors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'include'
    });
    
    if (response.ok) {
      const corsData = await response.json();
      console.log('✅ CORS test successful:', corsData);
      return { success: true, data: corsData };
    } else {
      console.warn('⚠️ CORS test failed with status:', response.status);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ CORS test error:', error.message);
    return { success: false, error: error.message };
  }
};

export default API_CONFIG;
