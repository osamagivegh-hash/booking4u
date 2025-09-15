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
  // For Blueprint Integrated Deployment, always use relative paths
  // This ensures same-origin requests with no CORS issues
  console.log('🔧 Blueprint Integrated deployment - using relative API URL');
  return '/api';
};

// Get the base URL for images and static files
export const getBaseUrl = () => {
  // For images, always use relative paths to avoid localhost issues
  if (window.REACT_APP_ASSET_URL) {
    return window.REACT_APP_ASSET_URL;
  }
  
  if (process.env.REACT_APP_ASSET_URL) {
    return process.env.REACT_APP_ASSET_URL;
  }
  
  // Always use relative path for images to avoid localhost issues
  return '/';
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
  
  // For Blueprint Integrated deployment, always use relative URL
  // This ensures same-origin requests with no CORS issues
  console.log('🔧 Blueprint Integrated deployment - using relative Socket URL');
  return '/';
};

// COMPLETELY DISABLED: Test API connectivity - No API calls to prevent auto-refresh
export const testApiConnectivity = async () => {
  // COMPLETELY DISABLED: No API connectivity testing to prevent auto-refresh and backend status display
  console.log('🛡️ testApiConnectivity: COMPLETELY DISABLED - No API calls to prevent auto-refresh and backend status display');
  
  // Return a fake success response without making any API calls
  return { 
    success: true, 
    url: 'disabled',
    health: { status: 'OK', message: 'API testing disabled' },
    cors: { allowed: true },
    disabled: true
  };
};

// COMPLETELY DISABLED: Test CORS connectivity - No API calls to prevent auto-refresh
export const testCorsConnectivity = async () => {
  // COMPLETELY DISABLED: No CORS testing to prevent auto-refresh and backend status display
  console.log('🛡️ testCorsConnectivity: COMPLETELY DISABLED - No API calls to prevent auto-refresh and backend status display');
  
  // Return a fake success response without making any API calls
  return { 
    success: true, 
    data: { cors: 'disabled' },
    disabled: true
  };
};

export default API_CONFIG;
