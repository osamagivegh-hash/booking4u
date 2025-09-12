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
    
    console.log('🔍 API REQUEST INTERCEPTOR:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      origin: window.location.origin,
      baseURL: config.baseURL,
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

// Response interceptor with refresh token flow
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
      console.log('🔍 Attempting to test API connectivity...');
      
      // Test API connectivity when CORS error occurs
      testApiConnectivity().then(result => {
        if (result.success) {
          console.log('✅ Alternative API found:', result.url);
        } else {
          console.error('❌ No working API found');
        }
      });
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('🌐 Network Error - checking connectivity...');
    }
    
    return Promise.reject(error);
  }
);

export default api;
