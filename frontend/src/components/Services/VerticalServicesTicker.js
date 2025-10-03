import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { getServiceImages, handleImageError, getImageUrl } from '../../utils/imageUtils';

const VerticalServicesTicker = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadLatestServices();
  }, []);

  // Apply global image URL conversion when services are loaded
  useEffect(() => {
    if (services.length > 0 && window.convertAllLocalhostImageUrls) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        window.convertAllLocalhostImageUrls();
      }, 100);
    }
  }, [services]);

  const loadLatestServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services/newest?limit=8');
      const servicesData = response.data.data?.services || response.data.services || [];
      
      // Debug: Log image URLs to see what we're getting
      console.log('🔧 VerticalTicker: Loaded services:', servicesData.length);
      servicesData.forEach((service, index) => {
        console.log(`🔧 VerticalTicker: Service ${index + 1} images:`, service.images || service.image);
      });
      
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading latest services for ticker:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (services.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % services.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [services.length]);

  const getCategoryLabel = (category) => {
    const labels = {
      haircut: 'قص شعر',
      hair_styling: 'تصفيف شعر',
      hair_coloring: 'صبغ شعر',
      manicure: 'منيكير',
      pedicure: 'بديكير',
      facial: 'تنظيف بشرة',
      massage: 'مساج',
      consultation: 'استشارة',
      treatment: 'علاج',
      training: 'تدريب',
      other: 'أخرى'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">أحدث الخدمات</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex space-x-3 space-x-reverse animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">أحدث الخدمات</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🔍</div>
          <p className="text-gray-500 text-sm">لا توجد خدمات متاحة حالياً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">أحدث الخدمات</h3>
        <div className="flex space-x-1">
          {services.slice(0, 4).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentIndex % 4 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateY(-${currentIndex * 96}px)` }}
        >
          {services.map((service, index) => {
            const serviceImages = getServiceImages(service);
            const mainImage = serviceImages[0] || { url: '/default-service-image.svg', alt: service.name };
            
            // Apply proper image URL conversion using the utility function
            const convertedImageUrl = getImageUrl(mainImage.url);
            
            return (
              <div key={service._id} className="h-24 mb-4">
                <Link
                  to={`/services/${service.businessId?._id || service.businessId}/${service._id}`}
                  className="flex space-x-3 space-x-reverse p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={convertedImageUrl}
                      alt={mainImage.alt}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        console.log('🔧 VerticalTicker: Image failed to load:', convertedImageUrl);
                        handleImageError(e, '/default-service-image.svg');
                        
                        // Try alternative URL formats
                        const originalUrl = mainImage.url;
                        if (originalUrl && !originalUrl.startsWith('/') && !originalUrl.startsWith('http')) {
                          // Try different path formats
                          const alternatives = [
                            '/uploads/services/' + originalUrl,
                            '/uploads/' + originalUrl,
                            originalUrl
                          ];
                          
                          let currentIndex = 0;
                          const tryNextUrl = () => {
                            if (currentIndex < alternatives.length) {
                              const nextUrl = alternatives[currentIndex];
                              console.log('🔧 VerticalTicker: Trying alternative URL:', nextUrl);
                              e.target.src = nextUrl;
                              currentIndex++;
                            }
                          };
                          
                          e.target.onerror = tryNextUrl;
                          tryNextUrl();
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h4>
                    <div className="flex items-center space-x-2 space-x-reverse mb-1">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                        {getCategoryLabel(service.category)}
                      </span>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <StarSolidIcon className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-gray-500">{service.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        <span>{service.duration} دقيقة</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse text-xs font-semibold text-green-600">
                        <CurrencyDollarIcon className="h-3 w-3" />
                        <span>{service.price} {service.currency}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          to="/services"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          عرض جميع الخدمات →
        </Link>
      </div>
    </div>
  );
};

export default VerticalServicesTicker;
