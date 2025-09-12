// Image utility functions for handling service images
import { getBaseUrl } from '../config/apiConfig';

// Get the backend base URL from environment or default
const getBackendUrl = () => {
  return getBaseUrl();
};

// Convert relative image path to full URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/default-service-image.svg';
  }
  
  // Handle localhost URLs in integrated deployment
  if (imagePath.includes('localhost:5001')) {
    console.log('🔧 Converting localhost image URL to relative:', imagePath);
    const relativePath = imagePath.replace('http://localhost:5001', '');
    console.log('🔧 Converted to relative path:', relativePath);
    return relativePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Check if we're in integrated deployment (same origin)
  const isIntegratedDeployment = window.location.hostname.includes('render.com') || 
                                 window.location.hostname.includes('netlify.app') || 
                                 window.location.hostname.includes('vercel.app') ||
                                 window.location.hostname.includes('github.io');
  
  if (isIntegratedDeployment) {
    // In integrated deployment, use relative URLs
    if (imagePath.startsWith('/uploads/')) {
      return imagePath; // Already relative
    }
    
    // If it's just a filename, assume it's in uploads/services
    if (!imagePath.includes('/')) {
      return `/uploads/services/${imagePath}`;
    }
    
    // Default case - prepend /uploads/
    return `/uploads/${imagePath}`;
  }
  
  // Development or other environments - use full backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${getBackendUrl()}${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads/services
  if (!imagePath.includes('/')) {
    return `${getBackendUrl()}/uploads/services/${imagePath}`;
  }
  
  // Default case - prepend backend URL
  return `${getBackendUrl()}/uploads/${imagePath}`;
};

// Get service image with fallback
export const getServiceImage = (service) => {
  // Check if service has images array
  if (service?.images && service.images.length > 0) {
    const primaryImage = service.images.find(img => img.isPrimary) || service.images[0];
    return getImageUrl(primaryImage.url);
  }
  
  // Check if service has single image
  if (service?.image) {
    return getImageUrl(service.image);
  }
  
  // Return default image
  return '/default-service-image.svg';
};

// Get all service images with fallbacks
export const getServiceImages = (service) => {
  if (service?.images && service.images.length > 0) {
    return service.images.map(img => ({
      ...img,
      url: getImageUrl(img.url)
    }));
  }
  
  if (service?.image) {
    return [{ 
      url: getImageUrl(service.image), 
      alt: service.name || 'Service Image', 
      isPrimary: true 
    }];
  }
  
  return [{ 
    url: '/default-service-image.svg', 
    alt: service?.name || 'Default Service Image', 
    isPrimary: true 
  }];
};

// Handle image load error
export const handleImageError = (e, fallbackSrc = '/default-service-image.svg') => {
  console.log('Image failed to load:', e.target.src);
  e.target.src = fallbackSrc;
  e.target.onerror = null; // Prevent infinite loop
};

// Preload image
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Check if image URL is valid
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // If it's not a full URL, check if it's a valid path
    return url.startsWith('/') || url.includes('.');
  }
};

const imageUtils = {
  getImageUrl,
  getServiceImage,
  getServiceImages,
  handleImageError,
  preloadImage,
  isValidImageUrl
};

// Function to convert all localhost URLs in data
export const convertLocalhostUrlsInData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    if (data.includes('localhost:5001')) {
      return data.replace('http://localhost:5001', '');
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertLocalhostUrlsInData(item));
  }
  
  if (typeof data === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'url' || key === 'image' || key === 'images' || key.includes('image') || key.includes('Image')) {
        converted[key] = convertLocalhostUrlsInData(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }
  
  return data;
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.getImageUrl = getImageUrl;
  window.convertLocalhostUrlsInData = convertLocalhostUrlsInData;
}

export default imageUtils;

