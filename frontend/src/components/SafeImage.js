import React, { useState, useCallback } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ImageErrorBoundary from './ErrorBoundary/ImageErrorBoundary';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const SafeImage = ({ 
  src, 
  alt = 'Image', 
  className = '', 
  fallbackSrc = '/default-service-image.svg',
  loading = 'lazy',
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => getImageUrl(src));

  const handleLoad = useCallback((e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    console.log('SafeImage: Image failed to load:', e.target.src);
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback image
    if (e.target.src !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      e.target.onerror = null; // Prevent infinite loop
    } else {
      // If fallback also fails, show placeholder
      setHasError(true);
    }
    
    if (onError) onError(e);
  }, [fallbackSrc, onError]);

  // If image has error and fallback also failed, show placeholder
  if (hasError && imageSrc === fallbackSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
        <span className="text-xs text-gray-500 text-center">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <ImageErrorBoundary fallbackSrc={fallbackSrc}>
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          {...props}
        />
      </div>
    </ImageErrorBoundary>
  );
};

export default SafeImage;
