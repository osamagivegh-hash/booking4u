import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🔍 API Request:', config.method?.toUpperCase(), config.url);
    
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
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    
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
