import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';

const ReviewsPage = () => {
  const { user } = useAuthStore();
  const { businessId, serviceId } = useParams();
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    tags: [],
    anonymous: false
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    rating: '',
    verified: true
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0
  });

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [businessId, serviceId, filters, pagination.currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const endpoint = serviceId 
        ? `/reviews/service/${serviceId}` 
        : `/reviews/business/${businessId}`;
      
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });
      
      const response = await api.get(`${endpoint}?${params}`);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const endpoint = serviceId 
        ? `/reviews/service/${serviceId}` 
        : `/reviews/stats/business/${businessId}`;
      
      const response = await api.get(endpoint);
      if (serviceId) {
        setStats(response.data.stats);
      } else {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, reviewForm);
      } else {
        await api.post('/reviews', {
          ...reviewForm,
          businessId,
          serviceId,
          bookingId: 'temp-booking-id' // This should come from actual booking
        });
      }
      
      // Reset form and close
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
        tags: [],
        anonymous: false
      });
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Reload reviews and stats
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      tags: review.tags || [],
      anonymous: review.anonymous || false
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        setReviews(reviews.filter(review => review._id !== reviewId));
        loadStats();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, helpfulCount: response.data.helpfulCount }
          : review
      ));
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReportReview = async (reviewId, reason) => {
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason });
      alert('تم إرسال البلاغ بنجاح');
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'div'}
            onClick={interactive ? () => onChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'ممتاز';
      case 4: return 'جيد جداً';
      case 3: return 'جيد';
      case 2: return 'مقبول';
      case 1: return 'ضعيف';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">التقييمات والمراجعات</h1>
              <p className="mt-2 text-gray-600">آراء العملاء في الخدمات</p>
            </div>
            {user?.role === 'customer' && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 ml-2" />
                كتابة تقييم
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Stats and Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Overall Rating */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(stats.averageRating)}
                <div className="text-sm text-gray-600 mt-2">
                  {stats.totalReviews} تقييم
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-900">توزيع التقييمات</h4>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm text-gray-600 w-8">{rating}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {stats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">الفلاتر</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التقييم
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">جميع التقييمات</option>
                    <option value="5">5 نجوم</option>
                    <option value="4">4 نجوم</option>
                    <option value="3">3 نجوم</option>
                    <option value="2">2 نجوم</option>
                    <option value="1">1 نجمة</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={filters.verified}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="verified" className="mr-2 block text-sm text-gray-900">
                    تقييمات موثقة فقط
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Reviews */}
          <div className="lg:col-span-3">
            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingReview ? 'تعديل التقييم' : 'كتابة تقييم جديد'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                      setReviewForm({
                        rating: 5,
                        title: '',
                        comment: '',
                        tags: [],
                        anonymous: false
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التقييم
                    </label>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      {renderStars(reviewForm.rating, true, (rating) => 
                        setReviewForm({ ...reviewForm, rating })
                      )}
                      <span className="text-sm text-gray-600">
                        {getRatingText(reviewForm.rating)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان التقييم (اختياري)
                    </label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="عنوان مختصر للتقييم"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التعليق
                    </label>
                    <textarea
                      rows={4}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="اكتب تجربتك مع الخدمة..."
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={reviewForm.anonymous}
                      onChange={(e) => setReviewForm({ ...reviewForm, anonymous: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="mr-2 block text-sm text-gray-900">
                      تقييم مجهول
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setEditingReview(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'جاري الحفظ...' : (editingReview ? 'تحديث' : 'إرسال')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  التقييمات ({pagination.totalReviews})
                </h3>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
              ) : reviews.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  لا توجد تقييمات بعد
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                            <div className="flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={review.customerId?.avatar || '/default-avatar.svg'}
                                alt={review.customerId?.name}
                                onError={(e) => {
                                  e.target.src = '/default-avatar.svg';
                                }}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {review.anonymous ? 'مستخدم مجهول' : review.customerId?.name}
                              </p>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </span>
                                {review.isVerified && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    موثق
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {review.title && (
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              {review.title}
                            </h4>
                          )}

                          <p className="text-gray-700 mb-4">{review.comment}</p>

                          {review.tags && review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {review.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Review Actions */}
                          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                            <button
                              onClick={() => handleHelpful(review._id)}
                              className="flex items-center space-x-1 rtl:space-x-reverse hover:text-blue-600"
                            >
                              <HandThumbUpIcon className="h-4 w-4" />
                              <span>مفيد ({review.helpfulCount || 0})</span>
                            </button>

                            <button
                              onClick={() => handleReportReview(review._id, 'محتوى غير مناسب')}
                              className="flex items-center space-x-1 rtl:space-x-reverse hover:text-red-600"
                            >
                              <FlagIcon className="h-4 w-4" />
                              <span>إبلاغ</span>
                            </button>

                            {user?._id === review.customerId?._id && (
                              <>
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="flex items-center space-x-1 rtl:space-x-reverse hover:text-blue-600"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                  <span>تعديل</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="flex items-center space-x-1 rtl:space-x-reverse hover:text-red-600"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span>حذف</span>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Business Response */}
                          {review.response?.businessResponse && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                                <ChatBubbleLeftIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900">رد النشاط التجاري</span>
                              </div>
                              <p className="text-gray-700 text-sm">{review.response.businessResponse}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(review.response.businessResponseAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      السابق
                    </button>
                    <span className="text-sm text-gray-700">
                      صفحة {pagination.currentPage} من {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
