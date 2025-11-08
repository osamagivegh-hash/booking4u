import axios from 'axios';
import debugLogger from '../utils/debugLogger';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor for logging and adding auth headers
api.interceptors.request.use(
  config => {
    // Log request details in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      debugLogger.log('DEBUG', '📡 API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
    }

    // Add authentication token if available
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      debugLogger.log('ERROR', '❌ Error parsing auth storage:', error.message);
    }

    return config;
  },
  error => {
    debugLogger.log('ERROR', '❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  response => {
    // Log response details in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      debugLogger.log('DEBUG', '📥 API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) errors with refresh token flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      debugLogger.log('CRITICAL', '🔒 401 Unauthorized - Attempting refresh token flow');

      try {
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data.data;

        // Update token in localStorage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          parsed.state.token = token;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }

        // Update default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Force logout if refresh fails
        debugLogger.log('CRITICAL', '🚨 Token refresh failed, logging out');
        localStorage.removeItem('auth-storage');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    // Log other errors
    debugLogger.log('ERROR', '❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });

    return Promise.reject(error);
  }
);

export default api;
