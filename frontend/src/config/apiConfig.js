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
  console.log('🔍 getApiUrl called - Debug info:', {
    'window.REACT_APP_API_URL': window.REACT_APP_API_URL,
    'process.env.REACT_APP_API_URL': process.env.REACT_APP_API_URL,
    'process.env.NODE_ENV': process.env.NODE_ENV,
    'window.location.hostname': window.location.hostname,
    'window.location.origin': window.location.origin
  });
  
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
  
  // For Blueprint Integrated Deployment (same origin), use relative URL
  if (window.location.hostname.includes('render.com')) {
    console.log('🔧 Blueprint Integrated deployment detected - using relative API URL');
    return '/api';
  }
  
  // For other integrated deployments (same origin), use relative URL
  if (window.location.hostname.includes('netlify.app') || 
      window.location.hostname.includes('vercel.app')) {
    console.log('🔧 Integrated deployment detected - using relative API URL');
    return '/api';
  }
  
  // In development, try multiple localhost ports
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode - using localhost API');
    return `${API_CONFIG.DEVELOPMENT}/api`;
  }
  
  // For GitHub Pages deployment, use absolute URL to backend
  if (window.location.hostname.includes('github.io')) {
    console.log('🔧 GitHub Pages deployment detected - using absolute API URL');
    return `${API_CONFIG.PRIMARY}/api`;
  }
  
  // Default fallback to relative URL for integrated deployment
  console.log('🔧 Using default relative API URL for integrated deployment');
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
  
  // For integrated deployment, use relative URL
  if (window.location.hostname.includes('render.com') || 
      window.location.hostname.includes('netlify.app') || 
      window.location.hostname.includes('vercel.app')) {
    return '/';
  }
  
  return API_CONFIG.PRIMARY;
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
