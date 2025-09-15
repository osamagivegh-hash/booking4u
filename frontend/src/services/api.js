import axios from 'axios';

// Create axios instance for Blueprint Integrated Deployment
// Uses relative paths for same-origin requests (no CORS issues)
const api = axios.create({
  baseURL: '/api', // Relative path for same-origin requests
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // Include credentials for authentication
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  }
});

// Request interceptor for Blueprint Integrated Deployment
api.interceptors.request.use(
  (config) => {
    // Fix for image uploads: Don't override Content-Type for multipart/form-data
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }
    
    console.log('🔍 API REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      timestamp: new Date().toISOString()
    });
    
    // Add authentication token if available
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

// Response interceptor for Blueprint Integrated Deployment
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method,
      timestamp: new Date().toISOString()
    });
    
    return response;
  },
  async (error) => {
    console.error('❌ API ERROR:', {
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
        
        // Clear auth data and navigate to login
        try {
          localStorage.removeItem('auth-storage');
          delete api.defaults.headers.common['Authorization'];
          window.dispatchEvent(new CustomEvent('auth:logout'));
        } catch (e) {
          console.error('❌ Error clearing auth storage:', e.message);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
