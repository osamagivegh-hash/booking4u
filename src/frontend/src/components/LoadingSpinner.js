import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ message = 'جاري التحميل...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-16 w-16',
    large: 'h-24 w-24'
  };

  const messageSizes = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="text-center relative z-10 animate-fade-in-up">
        {/* Main Spinner */}
        <div className="relative">
          <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 mx-auto shadow-lg`}></div>
          
          {/* Inner decoration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${size === 'large' ? 'w-16 h-16' : size === 'medium' ? 'w-10 h-10' : 'w-6 h-6'} bg-gradient-primary rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
              <SparklesIcon className={`${size === 'large' ? 'h-8 w-8' : size === 'medium' ? 'h-5 w-5' : 'h-3 w-3'} text-white`} />
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className={`${messageSizes[size]} text-gray-700 font-medium bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/50`}>
              {message}
            </p>
          </div>
        )}

        {/* Loading dots */}
        <div className="mt-6 flex justify-center space-x-2 space-x-reverse">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-48 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

