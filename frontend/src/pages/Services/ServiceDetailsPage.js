import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  StarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PhotoIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import imageUrlInterceptor from '../../utils/imageUrlInterceptor';

const ServiceDetailsPage = () => {
  const { businessId, serviceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [service, setService] = useState(null);
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchServiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Ensure businessId and serviceId are strings
      const businessIdStr = String(businessId || '');
      const serviceIdStr = String(serviceId || '');
      
      // Validate that we have valid IDs
      if (!businessIdStr || businessIdStr === 'undefined' || businessIdStr === 'null') {
        throw new Error('Invalid business ID');
      }
      if (!serviceIdStr || serviceIdStr === 'undefined' || serviceIdStr === 'null') {
        throw new Error('Invalid service ID');
      }
      
      console.log('Fetching service details:', { businessId: businessIdStr, serviceId: serviceIdStr });
      
      const [serviceResponse, businessResponse, reviewsResponse, relatedResponse] = await Promise.all([
        api.get(`/services/${businessIdStr}/${serviceIdStr}`),
        api.get(`/businesses/${businessIdStr}`),
        api.get(`/reviews/service/${serviceIdStr}`),
        api.get(`/services/${businessIdStr}?limit=4&exclude=${serviceIdStr}`)
      ]);

      if (serviceResponse.data?.success) {
        setService(serviceResponse.data.data);
      }
      
      if (businessResponse.data?.success) {
        setBusiness(businessResponse.data.data);
      }
      
      if (reviewsResponse.data?.success) {
        setReviews(reviewsResponse.data.data);
      }
      
      if (relatedResponse.data?.success) {
        setRelatedServices(relatedResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      toast.error('حدث خطأ في جلب تفاصيل الخدمة');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  }, [serviceId, businessId, navigate]);

  useEffect(() => {
    if (serviceId && businessId) {
      fetchServiceDetails();
    }
  }, [serviceId, businessId, fetchServiceDetails]);

  const handleBookService = () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    setShowMessageModal(true);
  };

  const handleSubmitMessage = async () => {
    if (!messageText.trim()) {
      toast.error('يرجى كتابة رسالة');
      return;
    }

    try {
      await api.post('/messages', {
        receiverId: business.ownerId,
        content: messageText,
        type: 'service_inquiry',
        relatedServiceId: serviceId
      });
      
      toast.success('تم إرسال الرسالة بنجاح');
      setShowMessageModal(false);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('حدث خطأ في إرسال الرسالة');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      if (isLiked) {
        setIsLiked(false);
        toast.success('تم إلغاء الإعجاب');
      } else {
        setIsLiked(true);
        toast.success('تم تسجيل الإعجاب');
      }
    } catch (error) {
      console.error('Error liking service:', error);
      toast.error('حدث خطأ في تسجيل الإعجاب');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service?.name,
          text: service?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Get service images with error handling
  const getServiceImages = () => {
    // Process service data to convert localhost URLs
    const processedService = imageUrlInterceptor.convertImageUrlsInData(service);
    
    if (processedService?.images && processedService.images.length > 0) {
      return processedService.images.map(img => ({
        ...img,
        url: img.url || '/default-service-image.svg'
      }));
    }
    if (processedService?.image) {
      return [{ url: processedService.image, alt: processedService.name, isPrimary: true }];
    }
    return [{ url: '/default-service-image.svg', alt: processedService?.name || 'Service', isPrimary: true }];
  };

  const serviceImages = getServiceImages();

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!service || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الخدمة غير موجودة</h2>
          <p className="text-gray-600 mb-4">الخدمة المطلوبة غير متاحة أو تم حذفها</p>
          <Link
            to="/services"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 ml-2" />
            العودة للخدمات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 space-x-reverse mb-8">
          <Link to="/services" className="text-blue-600 hover:text-blue-700">
            الخدمات
          </Link>
          <span className="text-gray-400">/</span>
          <Link to={`/services/${String(businessId || '')}`} className="text-blue-600 hover:text-blue-700">
            {business.name}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{service.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {getCategoryLabel(service.category)}
                    </span>
                    {service.isPopular && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        شعبي
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  <p className="text-gray-600 text-lg">{service.description}</p>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {isLiked ? <HeartSolidIcon className="h-6 w-6" /> : <HeartIcon className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <ShareIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Service Images */}
              <div className="relative mb-6">
                <img
                  src={serviceImages[currentImageIndex].url}
                  alt={serviceImages[currentImageIndex].alt}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    console.log('Image failed to load:', serviceImages[currentImageIndex].url);
                    e.target.src = '/default-service-image.svg';
                  }}
                />
                
                {/* Image Navigation */}
                {serviceImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {serviceImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold">{service.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-sm text-gray-600">({service.totalReviews})</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">المدة</p>
                    <p className="font-semibold text-gray-900">{service.duration} دقيقة</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">السعر</p>
                    <p className="font-semibold text-gray-900">{service.price} {service.currency}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الحجوزات</p>
                    <p className="font-semibold text-gray-900">{service.totalBookings}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBookService}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <CalendarIcon className="h-5 w-5" />
                  <span>احجز الآن</span>
                </button>
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>اسأل عن الخدمة</span>
                </button>
              </div>
            </div>

            {/* Service Requirements */}
            {service.requirements && service.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">متطلبات الخدمة</h3>
                <ul className="space-y-2">
                  {service.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-center space-x-2 space-x-reverse">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">التقييمات والمراجعات</h3>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                  <span className="text-2xl font-bold">{service.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-600">({service.totalReviews} تقييم)</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-3 space-x-reverse mb-3">
                        <img
                          src={review.user?.avatar || '/default-avatar.svg'}
                          alt={review.user?.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-avatar.svg';
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 space-x-reverse mb-1">
                            <h4 className="font-semibold text-gray-900">{review.user?.name}</h4>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              {[...Array(5)].map((_, i) => (
                                <StarSolidIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                  
                  {reviews.length > 5 && (
                    <div className="text-center">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        عرض جميع التقييمات ({reviews.length})
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد تقييمات بعد</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Profile */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">مقدم الخدمة</h3>
              
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <img
                  src={business.logo || '/default-business-logo.svg'}
                  alt={business.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-business-logo.svg';
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{business.name}</h4>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {business.rating?.toFixed(1) || '0.0'} ({business.totalReviews} تقييم)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{business.description}</p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{business.address?.city}, {business.address?.country}</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{business.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>{business.email}</span>
                </div>
                
                {business.website && (
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                    <GlobeAltIcon className="h-4 w-4" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      الموقع الإلكتروني
                    </a>
                  </div>
                )}
              </div>

              <button
                onClick={handleSendMessage}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>تواصل معنا</span>
              </button>
            </div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">خدمات مشابهة</h3>
                <div className="space-y-4">
                  {relatedServices.map((relatedService) => (
                    <Link
                      key={relatedService._id}
                      to={`/services/${String(businessId || '')}/${relatedService._id}`}
                      className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <img
                          src={relatedService.image || '/default-service-image.svg'}
                          alt={relatedService.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = '/default-service-image.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{relatedService.name}</h4>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                            <span>{relatedService.price} {relatedService.currency}</span>
                            <span>•</span>
                            <span>{relatedService.duration} دقيقة</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">حجز الخدمة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوقت</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر الوقت</option>
                  {service.availableTimeSlots?.map((slot, index) => (
                    <option key={index} value={`${slot.startTime}-${slot.endTime}`}>
                      {slot.startTime} - {slot.endTime}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  toast.success('تم الحجز بنجاح');
                  setShowBookingModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                تأكيد الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إرسال رسالة</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitMessage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إرسال
              </button>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsPage;


