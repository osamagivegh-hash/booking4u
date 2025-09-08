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
    checkApiStatus();
    
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (apiStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking API connectivity...</p>
        </div>
      </div>
    );
  }

  if (!apiStatus.isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            API Server Unavailable
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're having trouble connecting to our servers. This might be a temporary issue.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={checkApiStatus}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry Connection
            </button>
            
            <p className="text-xs text-gray-500">
              Last checked: {apiStatus.lastChecked?.toLocaleTimeString() || 'Never'}
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Troubleshooting Tips:
            </h3>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• The backend server might be starting up</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ApiErrorBoundary;
