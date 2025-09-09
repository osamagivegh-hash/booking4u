// API Configuration - Single Backend URL
const API_CONFIG = {
  // Primary backend URL - Use only ONE backend domain
  PRIMARY: 'https://booking4u-backend.onrender.com',
  
  // Development URL
  DEVELOPMENT: 'http://localhost:5001'
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  // Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return `${API_CONFIG.DEVELOPMENT}/api`;
  }
  
  // In production, use primary URL
  return `${API_CONFIG.PRIMARY}/api`;
};

// Get the base URL for images and static files
export const getBaseUrl = () => {
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
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return API_CONFIG.DEVELOPMENT;
  }
  
  return API_CONFIG.PRIMARY;
};

// Test API connectivity
export const testApiConnectivity = async () => {
  const apiUrl = getApiUrl();
  const baseUrl = getBaseUrl();
  
  // Try primary URL only
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include' // Include credentials for CORS
    });
    if (response.ok) {
      console.log(`✅ Primary API working: ${baseUrl}`);
      return { success: true, url: baseUrl };
    }
  } catch (error) {
    console.warn('Primary API not available:', error.message);
  }
  
  console.error('❌ Backend API not available');
  return { success: false, url: null };
};

export default API_CONFIG;
