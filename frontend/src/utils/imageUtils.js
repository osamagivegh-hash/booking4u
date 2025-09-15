// Image utility functions for handling service images
import { getBaseUrl } from '../config/apiConfig';

// Get the backend base URL from environment or default
const getBackendUrl = () => {
  return getBaseUrl();
};

// Get the asset URL for images and static files - use absolute API paths
const getAssetUrl = () => {
  // Use absolute API URL for images to ensure proper loading
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  return '/';
};

// Convert image path to proper URL - use absolute API paths for images
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/default-service-image.svg';
  }
  
  // Handle legacy localhost URLs (should not happen with new backend)
  if (imagePath.includes('localhost:5001')) {
    console.log('🔧 Converting legacy localhost:5001 image URL to absolute:', imagePath);
    const baseUrl = getAssetUrl();
    const relativePath = imagePath.replace('http://localhost:5001', '');
    const absolutePath = `${baseUrl}${relativePath}`;
    console.log('🔧 Converted to absolute path:', absolutePath);
    return absolutePath;
  }
  
  // Handle any other localhost URLs (should not happen with new backend)
  if (imagePath.includes('localhost:') && !imagePath.startsWith('/')) {
    console.log('🔧 Converting legacy localhost image URL to absolute:', imagePath);
    const baseUrl = getAssetUrl();
    const relativePath = imagePath.replace(/https?:\/\/localhost:\d+/, '');
    const absolutePath = `${baseUrl}${relativePath}`;
    console.log('🔧 Converted to absolute path:', absolutePath);
    return absolutePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Convert relative paths to absolute API paths
  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = getAssetUrl();
    return `${baseUrl}${imagePath}`;
  }
  
  // Handle bare filenames that look like service images - ENHANCED
  if (imagePath.includes('serviceImages-') && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    console.log('🔧 Converting bare service image filename to absolute path:', imagePath);
    const baseUrl = getAssetUrl();
    return `${baseUrl}/uploads/services/${imagePath}`;
  }
  
  // Handle any bare image filename - ENHANCED
  if ((imagePath.includes('.webp') || imagePath.includes('.jpg') || imagePath.includes('.jpeg') || imagePath.includes('.png')) && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    console.log('🔧 Converting bare image filename to absolute path:', imagePath);
    const baseUrl = getAssetUrl();
    return `${baseUrl}/uploads/services/${imagePath}`;
  }
  
  // Handle bare filenames without extension that look like service images
  if (imagePath.match(/^[a-zA-Z0-9-_]+$/) && !imagePath.startsWith('/') && !imagePath.startsWith('http') && imagePath.length > 10) {
    console.log('🔧 Converting bare filename without extension to absolute path:', imagePath);
    const baseUrl = getAssetUrl();
    return `${baseUrl}/uploads/services/${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads/services
  if (!imagePath.includes('/')) {
    const baseUrl = getAssetUrl();
    return `${baseUrl}/uploads/services/${imagePath}`;
  }
  
  // Default case - prepend /uploads/ and make absolute
  const baseUrl = getAssetUrl();
  return `${baseUrl}/uploads/${imagePath}`;
};

// Get service image with fallback - use URLs directly from backend
export const getServiceImage = (service) => {
  // Check if service has images array
  if (service?.images && service.images.length > 0) {
    const primaryImage = service.images.find(img => img.isPrimary) || service.images[0];
    // Use URL directly from backend - it should already be a relative path
    return primaryImage.url || '/default-service-image.svg';
  }
  
  // Check if service has single image
  if (service?.image) {
    // Use URL directly from backend - it should already be a relative path
    return service.image || '/default-service-image.svg';
  }
  
  // Return default image
  return '/default-service-image.svg';
};

// Get all service images with fallbacks - use URLs directly from backend
export const getServiceImages = (service) => {
  if (service?.images && service.images.length > 0) {
    return service.images.map(img => ({
      ...img,
      // Use URL directly from backend - it should already be a relative path
      url: img.url || '/default-service-image.svg'
    }));
  }
  
  if (service?.image) {
    return [{ 
      // Use URL directly from backend - it should already be a relative path
      url: service.image || '/default-service-image.svg', 
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
      // Convert bare service image filenames - ENHANCED
      else if (img.src.includes('serviceImages-') && !img.src.startsWith('/') && !img.src.startsWith('http')) {
        newSrc = `/uploads/services/${img.src}`;
        console.log('🔧 Global converter: Converting bare filename:', img.src, '→', newSrc);
        convertedCount++;
      }
      // Convert any bare image filename - ENHANCED
      else if ((img.src.includes('.webp') || img.src.includes('.jpg') || img.src.includes('.jpeg') || img.src.includes('.png')) && !img.src.startsWith('/') && !img.src.startsWith('http')) {
        newSrc = `/uploads/services/${img.src}`;
        console.log('🔧 Global converter: Converting bare image filename:', img.src, '→', newSrc);
        convertedCount++;
      }
      // Convert bare filenames without extension that look like service images
      else if (img.src.match(/^[a-zA-Z0-9-_]+$/) && !img.src.startsWith('/') && !img.src.startsWith('http') && img.src.length > 10) {
        newSrc = `/uploads/services/${img.src}`;
        console.log('🔧 Global converter: Converting bare filename without extension:', img.src, '→', newSrc);
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
    // Handle any bare image filename - ENHANCED
    if ((data.includes('.webp') || data.includes('.jpg') || data.includes('.jpeg') || data.includes('.png')) && !data.startsWith('/') && !data.startsWith('http')) {
      return `/uploads/services/${data}`;
    }
    // Handle bare filenames without extension that look like service images
    if (data.match(/^[a-zA-Z0-9-_]+$/) && !data.startsWith('/') && !data.startsWith('http') && data.length > 10) {
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

// Function to get the correct asset URL for images - use absolute API paths
window.getAssetUrl = function() {
  // Use absolute API URL for images to ensure proper loading
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  return '/';
};

// Make functions available globally
if (typeof window !== 'undefined') {
  window.getImageUrl = getImageUrl;
  window.convertLocalhostUrlsInData = convertLocalhostUrlsInData;
  window.convertAllLocalhostImageUrls = window.convertAllLocalhostImageUrls;
}

export default imageUtils;

