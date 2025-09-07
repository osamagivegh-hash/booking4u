// Image utility functions for handling service images

// Get the backend base URL from environment or default
const getBackendUrl = () => {
  // Use environment variable if available
  if (process.env.REACT_APP_BASE_URL) {
    return process.env.REACT_APP_BASE_URL;
  }
  
  // In development, use localhost:5001
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  
  // In production, use the actual backend URL
  return 'https://booking4u-backend.onrender.com';
};

// Convert relative image path to full URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/default-service-image.svg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend backend URL
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

export default {
  getImageUrl,
  getServiceImage,
  getServiceImages,
  handleImageError,
  preloadImage,
  isValidImageUrl
};

