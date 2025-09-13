import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { testApiConnectivity } from '../../config/apiConfig';

const ApiErrorBoundary = ({ children }) => {
  const [apiStatus, setApiStatus] = useState({ 
    isOnline: true, 
    isLoading: true, 
    lastChecked: null 
  });

  const checkApiStatus = async () => {
    setApiStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await testApiConnectivity();
      setApiStatus({
        isOnline: result.success,
        isLoading: false,
        lastChecked: new Date()
      });
    } catch (error) {
      setApiStatus({
        isOnline: false,
        isLoading: false,
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    // Only check API status once when component mounts
    // No periodic checks to prevent unnecessary API calls and potential auto-refresh issues
    // This ensures the "Checking API connectivity" message only appears once on initial load
    checkApiStatus();
  }, []); // Empty dependency array ensures this runs only once

  if (apiStatus.isLoading) {
    // Don't show loading state - just render children normally
    // This prevents backend loading messages from showing on the homepage
    return children;
  }

  if (!apiStatus.isOnline) {
    // Don't show backend error on homepage - just render children normally
    // This prevents backend components from showing on the homepage
    console.warn('API Server Unavailable - rendering children normally to avoid showing backend info on homepage');
    return children;
  }

  return children;
};

export default ApiErrorBoundary;
