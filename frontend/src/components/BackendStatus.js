import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/apiConfig';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking backend connection...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      setStatus('checking');
      setMessage('Checking backend connection...');
      
      // Wait a bit for env-config.js to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const apiUrl = getApiUrl();
      console.log('🔍 Checking backend health at:', apiUrl);
      
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
        setStatus('connected');
        setMessage('Backend is connected ✅');
        setDetails(data);
        console.log('✅ Backend health check successful:', data);
      } else {
        setStatus('error');
        setMessage(`Backend connection failed (${response.status})`);
        setDetails({ status: response.status, statusText: response.statusText });
        console.error('❌ Backend health check failed:', response.status, response.statusText);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Backend connection error');
      setDetails({ error: error.message });
      console.error('❌ Backend health check error:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 mb-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={checkBackendHealth}
          className="px-3 py-1 text-sm bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
        >
          Retry
        </button>
      </div>
      
      {details && (
        <div className="mt-3 text-sm">
          <details className="cursor-pointer">
            <summary className="font-medium">View Details</summary>
            <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      <div className="mt-2 text-xs opacity-75">
        API URL: {getApiUrl()}
      </div>
    </div>
  );
};

export default BackendStatus;
