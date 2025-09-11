import axios from 'axios';
import { getApiUrl, testApiConnectivity } from '../config/apiConfig';

// Create axios instance with comprehensive CORS configuration
const api = axios.create({
  baseURL: getApiUrl(),
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

// Request interceptor with enhanced CORS handling
api.interceptors.request.use(
  (config) => {
    console.log('🔍 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🌐 Origin:', window.location.origin);
    console.log('🔗 Base URL:', config.baseURL);
    
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

// Response interceptor with enhanced CORS error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    console.log('📋 Response headers:', response.headers);
    
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
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      config: error.config,
      request: error.request
    });
    
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
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized, clearing auth data');
      // Clear auth data and redirect to login
      try {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      } catch (e) {
        console.log('❌ Error clearing auth storage:', e.message);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
