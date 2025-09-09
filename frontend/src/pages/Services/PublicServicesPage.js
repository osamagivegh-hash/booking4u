import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import ServiceCard from '../../components/Services/ServiceCard';
import api from '../../services/api';

const PublicServicesPage = () => {
  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);
  
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Categories for filtering
  const categories = [
    { value: 'haircut', label: 'قص شعر' },
    { value: 'hair_styling', label: 'تصفيف شعر' },
    { value: 'hair_coloring', label: 'صبغ شعر' },
    { value: 'manicure', label: 'منيكير' },
    { value: 'pedicure', label: 'بديكير' },
    { value: 'facial', label: 'تنظيف بشرة' },
    { value: 'massage', label: 'مساج' },
    { value: 'consultation', label: 'استشارة' },
    { value: 'treatment', label: 'علاج' },
    { value: 'training', label: 'تدريب' },
    { value: 'other', label: 'أخرى' }
  ];

  useEffect(() => {
    fetchServices();
    fetchBusinesses();
  }, [currentPage, selectedCategory, selectedBusiness, priceRange, sortBy, searchTerm]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedBusiness && { businessId: selectedBusiness }),
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max })
      });

      const response = await api.get(`/services?${params}`);
      const data = response.data;

      if (data.success) {
        setServices(data.data?.services || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError('Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses');
      const data = response.data;

      if (data.success) {
        setBusinesses(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchServices();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBusiness('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setCurrentPage(1);
  };

  const handleBookService = (serviceId) => {
    if (!user) {
      navigate('/auth/login', { state: { from: `/services/book/${serviceId}` } });
      return;
    }
    navigate(`/services/book/${serviceId}`);
  };

  const handleInquireService = (service) => {
    if (!user) {
      navigate('/auth/login', { state: { from: `/messages?to=${service.businessId}&subject=Service Inquiry: ${service.name}&serviceId=${service._id}` } });
      return;
    }
    navigate(`/messages?to=${service.businessId}&subject=Service Inquiry: ${service.name}&serviceId=${service._id}`);
  };

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              اكتشف الخدمات المميزة
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ابحث واحجز الخدمات من الشركات المحلية في منطقتك. 
              من علاجات التجميل إلى الخدمات المهنية، لدينا كل ما تحتاجه.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الفلاتر</h3>
              
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث في الخدمات
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث بالاسم أو الوصف..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    بحث
                  </button>
                </div>
              </form>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع الفئات</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النشاط التجاري
                </label>
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع الأنشطة</option>
                  {businesses.map((business) => (
                    <option key={business._id} value={business._id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق السعر
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="الحد الأدنى"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="الحد الأقصى"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ترتيب حسب
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">الاسم (أ-ي)</option>
                  <option value="-name">الاسم (ي-أ)</option>
                  <option value="price">السعر (من الأقل للأعلى)</option>
                  <option value="-price">السعر (من الأعلى للأقل)</option>
                  <option value="-createdAt">الأحدث أولاً</option>
                  <option value="createdAt">الأقدم أولاً</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                مسح جميع الفلاتر
              </button>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {services.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على خدمات</h3>
                <p className="text-gray-600 mb-4">
                  جرب تعديل معايير البحث أو امسح الفلاتر لرؤية جميع الخدمات.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      تم العثور على {services.length} خدمة
                    </h2>
                    {(searchTerm || selectedCategory || selectedBusiness || priceRange.min || priceRange.max) && (
                      <p className="text-sm text-gray-600 mt-1">
                        نتائج مفلترة
                      </p>
                    )}
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {services.map((service) => (
                    <div key={service._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <ServiceCard 
                        service={service} 
                        onBook={() => handleBookService(service._id)}
                        onInquire={() => handleInquireService(service)}
                        showActions={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>
                      
                      {/* Show page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </nav>
                    
                    {/* Page info */}
                    <div className="mt-4 text-center text-sm text-gray-600">
                      صفحة {currentPage} من {totalPages} - إجمالي {services.length} خدمة
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicServicesPage;

