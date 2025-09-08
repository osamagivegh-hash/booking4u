// API Configuration with fallback URLs
const API_CONFIG = {
  // Primary backend URL
  PRIMARY: 'https://booking4u-1.onrender.com',
  
  // Fallback URLs (you can add more if needed)
  FALLBACKS: [
    'https://booking4u-backend.onrender.com',
    'https://booking4u-backend-1.onrender.com',
    'https://booking4u-backend-2.onrender.com',
    'https://booking4u-backend-3.onrender.com'
  ],
  
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
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      return { success: true, url: baseUrl };
    }
  } catch (error) {
    console.warn('Primary API not available, trying fallbacks...');
  }
  
  // Try fallback URLs
  for (const fallback of API_CONFIG.FALLBACKS) {
    try {
      const response = await fetch(`${fallback}/api/health`);
      if (response.ok) {
        console.log(`✅ Using fallback API: ${fallback}`);
        return { success: true, url: fallback };
      }
    } catch (error) {
      console.warn(`Fallback ${fallback} not available`);
    }
  }
  
  return { success: false, url: null };
};

export default API_CONFIG;
