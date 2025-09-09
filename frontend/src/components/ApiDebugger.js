import React, { useState, useEffect } from 'react';
import { getApiUrl, getBaseUrl, testApiConnectivity } from '../config/apiConfig';
import api from '../services/api';

const ApiDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Get current configuration
    const apiUrl = getApiUrl();
    const baseUrl = getBaseUrl();
    
    setDebugInfo({
      apiUrl,
      baseUrl,
      nodeEnv: process.env.NODE_ENV,
      reactAppApiUrl: process.env.REACT_APP_API_URL,
      reactAppBaseUrl: process.env.REACT_APP_BASE_URL,
      reactAppSocketUrl: process.env.REACT_APP_SOCKET_URL,
      currentOrigin: window.location.origin,
      userAgent: navigator.userAgent
    });
  }, []);

  const testApiConnection = async () => {
    setIsLoading(true);
    const results = {};

    try {
      // Test 1: API connectivity
      console.log('🔍 Testing API connectivity...');
      const connectivityResult = await testApiConnectivity();
      results.connectivity = connectivityResult;

      // Test 2: Health endpoint
      console.log('🔍 Testing health endpoint...');
      try {
        const healthResponse = await api.get('/health');
        results.health = {
          success: true,
          status: healthResponse.status,
          data: healthResponse.data
        };
      } catch (error) {
        results.health = {
          success: false,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
      }

      // Test 3: Auth endpoints
      console.log('🔍 Testing auth endpoints...');
      try {
        // Test register endpoint (should return validation error, not connection error)
        const registerResponse = await api.post('/auth/register', {});
        results.auth = {
          success: true,
          status: registerResponse.status,
          data: registerResponse.data
        };
      } catch (error) {
        if (error.response?.status === 400) {
          // This is expected - validation error
          results.auth = {
            success: true,
            status: error.response.status,
            message: 'Auth endpoint accessible (validation error expected)',
            data: error.response.data
          };
        } else {
          results.auth = {
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
          };
        }
      }

      // Test 4: Services endpoint
      console.log('🔍 Testing services endpoint...');
      try {
        const servicesResponse = await api.get('/services');
        results.services = {
          success: true,
          status: servicesResponse.status,
          data: servicesResponse.data
        };
      } catch (error) {
        results.services = {
          success: false,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
      }

    } catch (error) {
      results.general = {
        success: false,
        error: error.message
      };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const clearAuthData = () => {
    localStorage.removeItem('auth-storage');
    console.log('🧹 Auth data cleared');
    alert('Auth data cleared!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔧 API Debugger</h2>
      
      {/* Configuration Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Configuration</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-600 overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">API Tests</h3>
        <div className="flex gap-4">
          <button
            onClick={testApiConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </button>
          <button
            onClick={clearAuthData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear Auth Data
          </button>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Test Results</h3>
          <div className="space-y-4">
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 capitalize mb-2">{test}</h4>
                <div className={`p-3 rounded ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Console Debugging</h3>
        <p className="text-yellow-700 mb-2">
          Open your browser's Developer Tools (F12) and check the Console tab for detailed API request/response logs.
        </p>
        <p className="text-yellow-700">
          Look for messages starting with 🔍, ✅, or ❌ to see API call details.
        </p>
      </div>
    </div>
  );
};

export default ApiDebugger;
