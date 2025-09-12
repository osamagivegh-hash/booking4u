import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/apiConfig';

/**
 * Custom hook for backend health monitoring
 * Runs silently in the background without affecting UI
 */
const useBackendHealth = (options = {}) => {
  const {
    checkOnMount = true,
    checkInterval = null, // null = no periodic checks
    enableLogging = false
  } = options;

  const [healthStatus, setHealthStatus] = useState({
    status: 'unknown',
    lastChecked: null,
    details: null,
    error: null
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkBackendHealth = useCallback(async () => {
    if (isChecking) return; // Prevent concurrent checks
    
    setIsChecking(true);
    
    try {
      if (enableLogging) {
        console.log('🔍 Background health check starting...');
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setHealthStatus({
          status: 'connected',
          lastChecked: new Date().toISOString(),
          details: data,
          error: null
        });
        
        if (enableLogging) {
          console.log('✅ Background health check successful');
        }
      } else {
        setHealthStatus({
          status: 'error',
          lastChecked: new Date().toISOString(),
          details: { status: response.status, statusText: response.statusText },
          error: `HTTP ${response.status}`
        });
        
        if (enableLogging) {
          console.log('❌ Background health check failed:', response.status);
        }
      }
    } catch (error) {
      setHealthStatus({
        status: 'error',
        lastChecked: new Date().toISOString(),
        details: null,
        error: error.message
      });
      
      if (enableLogging) {
        console.log('❌ Background health check error:', error.message);
      }
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, enableLogging]);

  // Initial check on mount
  useEffect(() => {
    if (checkOnMount && !window.backendHealthChecked) {
      checkBackendHealth();
      window.backendHealthChecked = true;
    }
  }, [checkOnMount, checkBackendHealth]);

  // Periodic checks (if enabled)
  useEffect(() => {
    if (checkInterval && checkInterval > 0) {
      const interval = setInterval(checkBackendHealth, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkInterval, checkBackendHealth]);

  return {
    healthStatus,
    isChecking,
    checkHealth: checkBackendHealth
  };
};

export default useBackendHealth;
