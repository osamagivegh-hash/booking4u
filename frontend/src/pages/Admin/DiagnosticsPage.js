import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import backendHealthService from '../../services/backendHealthService';
import { getApiUrl } from '../../config/apiConfig';

const DiagnosticsPage = () => {
  const [healthStatus, setHealthStatus] = useState({
    status: 'unknown',
    lastChecked: null,
    details: null,
    error: null
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [enableLogging, setEnableLogging] = useState(false);

  useEffect(() => {
    // Subscribe to health status updates
    const unsubscribe = backendHealthService.subscribe((status) => {
      setHealthStatus(status);
    });

    // Get initial status
    setHealthStatus(backendHealthService.getHealthStatus());

    return unsubscribe;
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      await backendHealthService.checkHealth();
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggleLogging = () => {
    const newLoggingState = !enableLogging;
    setEnableLogging(newLoggingState);
    backendHealthService.setLogging(newLoggingState);
  };

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case 'connected':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      case 'checking':
        return <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />;
      default:
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'connected':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'checking':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    }
  };

  const getStatusText = () => {
    switch (healthStatus.status) {
      case 'connected':
        return 'Backend is connected';
      case 'error':
        return 'Backend connection failed';
      case 'checking':
        return 'Checking backend connection...';
      default:
        return 'Backend status unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">🔧 System Diagnostics</h1>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={handleToggleLogging}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  enableLogging 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {enableLogging ? <EyeIcon className="h-4 w-4 mr-2" /> : <EyeSlashIcon className="h-4 w-4 mr-2" />}
                {enableLogging ? 'Logging On' : 'Logging Off'}
              </button>
              <button
                onClick={handleManualCheck}
                disabled={isChecking}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check Now'}
              </button>
            </div>
          </div>

          {/* Backend Health Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Backend Health Status</h2>
            <div className={`border-2 rounded-lg p-6 ${getStatusColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  {getStatusIcon()}
                  <div>
                    <h3 className="text-lg font-medium">{getStatusText()}</h3>
                    {healthStatus.lastChecked && (
                      <p className="text-sm opacity-75">
                        Last checked: {new Date(healthStatus.lastChecked).toLocaleString()}
                      </p>
                    )}
                    {healthStatus.error && (
                      <p className="text-sm opacity-75">
                        Error: {healthStatus.error}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-3 py-1 text-sm bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && healthStatus.details && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <h4 className="font-medium mb-2">Health Check Details:</h4>
                  <pre className="text-xs bg-white bg-opacity-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(healthStatus.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">API Configuration</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>API URL:</strong> {getApiUrl()}</p>
                    <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                    <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Browser Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Current URL:</strong> {window.location.href}</p>
                    <p><strong>Screen Size:</strong> {window.screen.width}x{window.screen.height}</p>
                    <p><strong>Viewport:</strong> {window.innerWidth}x{window.innerHeight}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Backend Health Service</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Status:</strong> {window.backendHealthService ? 'Active' : 'Inactive'}</p>
                  <p><strong>Initialized:</strong> {window.backendHealthServiceInitialized ? 'Yes' : 'No'}</p>
                  <p><strong>Subscribers:</strong> {backendHealthService.subscribers.size}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Global Flags</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>App Initialized:</strong> {window.appInitialized ? 'Yes' : 'No'}</p>
                  <p><strong>Backend Health Checked:</strong> {window.backendHealthChecked ? 'Yes' : 'No'}</p>
                  <p><strong>HomePage Services Loaded:</strong> {window.homePageServicesLoaded ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
