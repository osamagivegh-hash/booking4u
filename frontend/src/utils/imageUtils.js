// Image utility functions for handling service images
import { getBaseUrl } from '../config/apiConfig';

// Get the backend base URL from environment or default
const getBackendUrl = () => {
  return getBaseUrl();
};

// Get the asset URL for images and static files
const getAssetUrl = () => {
  // Use window environment variable if available (PRIORITY)
  if (window.REACT_APP_ASSET_URL) {
    console.log('🔧 Using window REACT_APP_ASSET_URL:', window.REACT_APP_ASSET_URL);
    return window.REACT_APP_ASSET_URL;
  }
  
  // Use process environment variable if available
  if (process.env.REACT_APP_ASSET_URL) {
    console.log('🔧 Using process REACT_APP_ASSET_URL:', process.env.REACT_APP_ASSET_URL);
    return process.env.REACT_APP_ASSET_URL;
  }
  
  // Fallback to base URL
  return getBaseUrl();
};

// Convert relative image path to full URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/default-service-image.svg';
  }
  
  // Handle localhost URLs in integrated deployment - More comprehensive
  if (imagePath.includes('localhost:5001')) {
    console.log('🔧 Converting localhost:5001 image URL to relative:', imagePath);
    const relativePath = imagePath.replace('http://localhost:5001', '');
    console.log('🔧 Converted to relative path:', relativePath);
    return relativePath;
  }
  
  // Handle any other localhost URLs
  if (imagePath.includes('localhost:') && !imagePath.startsWith('/')) {
    console.log('🔧 Converting localhost image URL to relative:', imagePath);
    const relativePath = imagePath.replace(/https?:\/\/localhost:\d+/, '');
    console.log('🔧 Converted to relative path:', relativePath);
    return relativePath;
  }
  
  // Handle bare filenames that look like service images
  if (imagePath.includes('serviceImages-') && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    console.log('🔧 Converting bare service image filename to full path:', imagePath);
    return `/uploads/services/${imagePath}`;
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
  
  // Development or other environments - use asset URL
  const assetUrl = getAssetUrl();
  
  if (imagePath.startsWith('/uploads/')) {
    return `${assetUrl}${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads/services
  if (!imagePath.includes('/')) {
    return `${assetUrl}/uploads/services/${imagePath}`;
  }
  
  // Default case - prepend asset URL
  return `${assetUrl}/uploads/${imagePath}`;
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

// Global function to convert any localhost image URLs
window.convertAllLocalhostImageUrls = function() {
  const images = document.querySelectorAll('img');
  let convertedCount = 0;
  
  images.forEach(img => {
    if (img.src) {
      let newSrc = img.src;
      
      // Convert localhost:5001 URLs
      if (img.src.includes('localhost:5001')) {
        newSrc = img.src.replace('http://localhost:5001', '');
        console.log('🔧 Global converter: Converting localhost:5001 URL:', img.src, '→', newSrc);
        convertedCount++;
      }
      // Convert bare service image filenames
      else if (img.src.includes('serviceImages-') && !img.src.startsWith('/') && !img.src.startsWith('http')) {
        newSrc = `/uploads/services/${img.src}`;
        console.log('🔧 Global converter: Converting bare filename:', img.src, '→', newSrc);
        convertedCount++;
      }
      // Convert any other localhost URLs
      else if (img.src.includes('localhost:') && !img.src.startsWith('/')) {
        newSrc = img.src.replace(/https?:\/\/localhost:\d+/, '');
        console.log('🔧 Global converter: Converting localhost URL:', img.src, '→', newSrc);
        convertedCount++;
      }
      
      if (newSrc !== img.src) {
        img.src = newSrc;
      }
    }
  });
  
  console.log(`🔧 Global converter: Converted ${convertedCount} image URLs`);
  return convertedCount;
};

// Enhanced function to convert URLs in data objects
window.convertLocalhostUrlsInData = function(data) {
  if (!data) return data;
  
  if (typeof data === 'string') {
    if (data.includes('localhost:5001')) {
      return data.replace('http://localhost:5001', '');
    }
    if (data.includes('serviceImages-') && !data.startsWith('/') && !data.startsWith('http')) {
      return `/uploads/services/${data}`;
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => window.convertLocalhostUrlsInData(item));
  }
  
  if (typeof data === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'url' || key === 'image' || key === 'images' || 
          key.includes('image') || key.includes('Image') || 
          key.includes('photo') || key.includes('Photo') ||
          key.includes('avatar') || key.includes('Avatar')) {
        converted[key] = window.convertLocalhostUrlsInData(value);
      } else {
        converted[key] = window.convertLocalhostUrlsInData(value);
      }
    }
    return converted;
  }
  
  return data;
};

// Function to get the correct asset URL for images
window.getAssetUrl = function() {
  if (window.REACT_APP_ASSET_URL) {
    return window.REACT_APP_ASSET_URL;
  }
  if (process.env.REACT_APP_ASSET_URL) {
    return process.env.REACT_APP_ASSET_URL;
  }
  return window.location.origin;
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.getImageUrl = getImageUrl;
  window.convertLocalhostUrlsInData = convertLocalhostUrlsInData;
  window.convertAllLocalhostImageUrls = window.convertAllLocalhostImageUrls;
}

export default imageUtils;

