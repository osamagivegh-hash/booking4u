import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import useAuthStore from '../../stores/authStore';
import SocialShare from '../Social/SocialShare';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getServiceImages, handleImageError } from '../../utils/imageUtils';

const ServiceCard = ({ service, showProvider = true, compact = false, showActions = false, onBook, onInquire }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setIsLoading(true);
      if (isLiked) {
        // Unlike logic here
        setIsLiked(false);
        toast.success('تم إلغاء الإعجاب');
      } else {
        // Like logic here
        setIsLiked(true);
        toast.success('تم تسجيل الإعجاب');
      }
    } catch (error) {
      console.error('Error liking service:', error);
      toast.error('حدث خطأ في تسجيل الإعجاب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.name,
          text: service.description,
          url: `${window.location.origin}/services/${service.businessId?._id || service.businessId}/${service._id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/services/${service.businessId?._id || service.businessId}/${service._id}`);
      toast.success('تم نسخ الرابط');
    }
  };

  const handleMessage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    // Navigate to messages or open message modal
    navigate(`/dashboard/messages?contact=${service.businessId?.ownerId}`);
  };

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

  // Get service images - use URLs directly from backend
  const serviceImages = getServiceImages(service);

  // Image navigation functions
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
  };

  if (compact) {
    return (
      <Link
        to={`/services/${service.businessId?._id || service.businessId}/${service._id}`}
        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
      >
        <div className="flex space-x-3 space-x-reverse p-4">
          <div className="flex-shrink-0">
            <img
              src={serviceImages[currentImageIndex].url}
              alt={serviceImages[currentImageIndex].alt}
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                console.log('🔧 ServiceCard (compact): Image failed to load:', serviceImages[currentImageIndex].url);
                handleImageError(e, '/default-service-image.svg');
                
                // Try to convert the URL and reload
                const originalUrl = serviceImages[currentImageIndex].url;
                if (originalUrl && !originalUrl.startsWith('/') && !originalUrl.startsWith('http')) {
                  const convertedUrl = '/uploads/services/' + originalUrl;
                  console.log('🔧 ServiceCard (compact): Trying converted URL:', convertedUrl);
                  e.target.src = convertedUrl;
                }
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
              {service.name}
            </h3>
            <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 mb-1">
              <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                {getCategoryLabel(service.category)}
              </span>
              <span>{service.duration} دقيقة</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-600">{service.price} {service.currency}</span>
              <div className="flex items-center space-x-1 space-x-reverse">
                <StarSolidIcon className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-gray-500">{service.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <Link to={`/services/${service.businessId?._id || service.businessId}/${service._id}`}>
        <div className="relative">
          <img
            src={serviceImages[currentImageIndex].url}
            alt={serviceImages[currentImageIndex].alt}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log('🔧 ServiceCard: Image failed to load:', serviceImages[currentImageIndex].url);
              handleImageError(e, '/default-service-image.svg');
              setImageError(true);
              
              // Try to convert the URL and reload
              const originalUrl = serviceImages[currentImageIndex].url;
              if (originalUrl && !originalUrl.startsWith('/') && !originalUrl.startsWith('http')) {
                const convertedUrl = '/uploads/services/' + originalUrl;
                console.log('🔧 ServiceCard: Trying converted URL:', convertedUrl);
                e.target.src = convertedUrl;
              }
            }}
            onLoad={() => setImageError(false)}
          />
          
          {/* Image Navigation */}
          {serviceImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {serviceImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            {service.isPopular && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                شعبي
              </span>
            )}
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {getCategoryLabel(service.category)}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <div className="flex items-center space-x-1 space-x-reverse">
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-semibold">{service.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-3 right-3 flex space-x-2 space-x-reverse">
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              {isLiked ? <HeartSolidIcon className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
            </button>
            <SocialShare
              url={`${window.location.origin}/services/${service.businessId?._id || service.businessId}/${service._id}`}
              title={service.name}
              description={service.description}
              size="sm"
              showLabel={false}
              platforms={['whatsapp', 'twitter', 'facebook', 'copy']}
            />
            <button
              onClick={handleMessage}
              className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-green-500 hover:text-white backdrop-blur-sm transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        {/* Service Info */}
        <div className="mb-3">
          <Link to={`/services/${service.businessId?._id || service.businessId}/${service._id}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {service.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{service.description}</p>
        </div>

        {/* Provider Info */}
        {showProvider && service.businessId && (
          <div className="flex items-center space-x-2 space-x-reverse mb-3 p-2 bg-gray-50 rounded-lg">
            <img
              src={service.businessId.logo || '/default-business-logo.svg'}
              alt={service.businessId.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/default-business-logo.svg';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{service.businessId.name}</p>
              <div className="flex items-center space-x-1 space-x-reverse">
                <MapPinIcon className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 truncate">{service.businessId.address?.city}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <StarSolidIcon className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-gray-600">{service.businessId.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        )}

        {/* Service Details */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1 space-x-reverse">
            <ClockIcon className="h-4 w-4" />
            <span>{service.duration} دقيقة</span>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <EyeIcon className="h-4 w-4" />
            <span>{service.totalBookings} حجز</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-green-600">
            {service.price} {service.currency}
          </div>
          {showActions ? (
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onInquire && onInquire();
                }}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Inquire
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBook && onBook();
                }}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          ) : (
            <Link
              to={`/services/${service.businessId?._id || service.businessId}/${service._id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              عرض التفاصيل
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
