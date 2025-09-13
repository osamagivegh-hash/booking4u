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
    console.log('🛡️ Backend health check DISABLED to prevent 30-second auto-refresh');
    return Promise.resolve();
  }, [isChecking, enableLogging]);

  // Initial check on mount - DISABLED to prevent automatic API calls
  useEffect(() => {
    // DISABLED: No automatic health checks to prevent 30-second refresh
    // if (checkOnMount && !window.backendHealthChecked) {
    //   checkBackendHealth();
    //   window.backendHealthChecked = true;
    // }
    window.backendHealthChecked = true; // Mark as checked without making API call
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
