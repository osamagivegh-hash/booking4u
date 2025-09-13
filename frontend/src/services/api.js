import axios from 'axios';
import { getApiUrl, testApiConnectivity } from '../config/apiConfig';

// Create axios instance with comprehensive CORS configuration
const api = axios.create({
  baseURL: '', // Will be set dynamically
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // Include credentials for CORS
  // CORS configuration
  crossDomain: true,
  // Additional axios configuration for CORS
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  }
});

// Set the base URL dynamically - this will be called when requests are made
const getDynamicApiUrl = () => {
  const url = getApiUrl();
  console.log('🔧 Dynamic API URL resolved:', url);
  return url;
};

// Request interceptor with enhanced CORS handling
api.interceptors.request.use(
  (config) => {
    // Set the base URL dynamically for each request
    config.baseURL = getDynamicApiUrl();
    
    // Fix for image uploads: Don't override Content-Type for multipart/form-data
    // This prevents console errors when uploading images
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      // Remove the default Content-Type to let axios set it automatically with boundary
      delete config.headers['Content-Type'];
    }
    
    console.log('🔍 API REQUEST INTERCEPTOR:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      origin: window.location.origin,
      baseURL: config.baseURL,
      contentType: config.headers['Content-Type'],
      timestamp: new Date().toISOString()
    });
    
    // Add CORS headers
    config.headers['Origin'] = window.location.origin;
    config.headers['Referer'] = window.location.href;
    
    // Add token to headers if available
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to request');
        }
      }
    } catch (error) {
      console.log('❌ Error parsing auth storage:', error.message);
    }
    
    // Log request configuration for debugging
    console.log('📋 Request config:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      withCredentials: config.withCredentials
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Refresh token flow variables
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to recursively convert localhost URLs in response data
const convertLocalhostUrlsInResponse = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Convert localhost:5001 URLs to relative paths
    if (data.includes('localhost:5001')) {
      const converted = data.replace('http://localhost:5001', '');
      console.log('🔧 Converting localhost URL in response:', data, '→', converted);
      return converted;
    }
    // Convert bare service image filenames to full paths
    if (data.includes('serviceImages-') && !data.startsWith('/') && !data.startsWith('http')) {
      const converted = `/uploads/services/${data}`;
      console.log('🔧 Converting bare service image filename in response:', data, '→', converted);
      return converted;
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertLocalhostUrlsInResponse(item));
  }
  
  if (typeof data === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert URLs in image-related fields
      if (key === 'url' || key === 'image' || key === 'images' || 
          key.includes('image') || key.includes('Image') || 
          key.includes('photo') || key.includes('Photo') ||
          key.includes('avatar') || key.includes('Avatar')) {
        converted[key] = convertLocalhostUrlsInResponse(value);
      } else {
        converted[key] = convertLocalhostUrlsInResponse(value);
      }
    }
    return converted;
  }
  
  return data;
};

// Response interceptor with refresh token flow and URL conversion
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE INTERCEPTOR:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method,
      timestamp: new Date().toISOString()
    });
    
    // Log CORS headers if present
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods']
    };
    
    if (Object.values(corsHeaders).some(header => header)) {
      console.log('🔒 CORS Headers received:', corsHeaders);
    }
    
    // Backend now always returns relative paths, so no conversion needed
    // This interceptor is kept for backward compatibility but should not be needed
    if (response.data && (window.location.hostname.includes('render.com') || 
                         window.location.hostname.includes('netlify.app') || 
                         window.location.hostname.includes('vercel.app') ||
                         window.location.hostname.includes('github.io'))) {
      console.log('🔧 Backend should now return relative paths - no conversion needed');
    }
    
    return response;
  },
  async (error) => {
    console.error('❌ API RESPONSE INTERCEPTOR ERROR:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    const originalRequest = error.config;
    
    // Handle 401 errors with refresh token flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔒 401 Unauthorized - Attempting refresh token flow');
      
      if (isRefreshing) {
        console.log('🔒 Already refreshing, queuing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔒 Attempting to refresh token...');
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data.data;
        
        console.log('🔒 Token refreshed successfully');
        
        // Update the token in localStorage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          parsed.state.token = token;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }
        
        // Update the default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        processQueue(null, token);
        
        // Retry the original request
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('🔒 Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // Clear auth data and navigate to login (NO PAGE RELOAD)
        try {
          localStorage.removeItem('auth-storage');
          delete api.defaults.headers.common['Authorization'];
          
          // Use React Router navigation instead of window.location
          console.log('🔒 Redirecting to login via React Router');
          // This will be handled by the auth store or App component
          window.dispatchEvent(new CustomEvent('auth:logout'));
          
        } catch (e) {
          console.error('❌ Error clearing auth storage:', e.message);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle CORS errors specifically
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      console.error('🚫 CORS Error detected:', error.message);
      // DISABLED: API connectivity testing to prevent backend components on homepage
      console.log('🛡️ API connectivity testing disabled to prevent backend components on homepage');
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('🌐 Network Error - checking connectivity...');
      
      // Log to auto-refresh prevention system
      if (window.autoRefreshPrevention) {
        window.autoRefreshPrevention.networkErrors.push({
          timestamp: new Date().toISOString(),
          type: 'axios',
          url: originalRequest?.url,
          method: originalRequest?.method,
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    // Handle connection refused errors (like localhost:5001)
    if (error.message.includes('ERR_CONNECTION_REFUSED') || 
        error.message.includes('Connection refused') ||
        error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection Refused Error:', error.message);
      
      // Log to auto-refresh prevention system
      if (window.autoRefreshPrevention) {
        window.autoRefreshPrevention.networkErrors.push({
          timestamp: new Date().toISOString(),
          type: 'connection_refused',
          url: originalRequest?.url,
          method: originalRequest?.method,
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
