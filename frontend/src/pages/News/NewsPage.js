import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import NewsCard from '../../components/News/NewsCard';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'publishedAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [showFeatured, setShowFeatured] = useState(searchParams.get('featured') === 'true');
  const [showBreaking, setShowBreaking] = useState(searchParams.get('breaking') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    fetchNews();
    fetchCategories();
    fetchFeaturedNews();
  }, [currentPage, selectedCategory, sortBy, sortOrder, showFeatured, showBreaking, searchQuery]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(showFeatured && { featured: 'true' }),
        ...(showBreaking && { breaking: 'true' }),
        sortBy,
        sortOrder
      });

      const response = await api.get(`/news?${params.toString()}`);
      if (response.data && response.data.success) {
        setNews(response.data.data.news || []);
        setPagination(response.data.data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('حدث خطأ في جلب الأخبار');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/news/categories');
      if (response.data && response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeaturedNews = async () => {
    try {
      const response = await api.get('/news/featured?limit=3');
      if (response.data && response.data.success) {
        setFeaturedNews(response.data.data.news || []);
      }
    } catch (error) {
      console.error('Error fetching featured news:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    updateURL();
  };

  const handleFilterChange = (filter, value) => {
    setCurrentPage(1);
    switch (filter) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'sortOrder':
        setSortOrder(value);
        break;
      case 'featured':
        setShowFeatured(value);
        break;
      case 'breaking':
        setShowBreaking(value);
        break;
    }
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'publishedAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (showFeatured) params.set('featured', 'true');
    if (showBreaking) params.set('breaking', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('publishedAt');
    setSortOrder('desc');
    setShowFeatured(false);
    setShowBreaking(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">الأخبار</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            اطلع على آخر الأخبار والتحديثات في عالم الحجوزات والخدمات
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الأخبار..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">جميع الفئات</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', newSortBy);
                  handleFilterChange('sortOrder', newSortOrder);
                }}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="publishedAt-desc">الأحدث أولاً</option>
                <option value="publishedAt-asc">الأقدم أولاً</option>
                <option value="views-desc">الأكثر مشاهدة</option>
                <option value="likes-desc">الأكثر إعجاباً</option>
                <option value="title-asc">أ-ي</option>
                <option value="title-desc">ي-أ</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="featured"
                checked={showFeatured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="flex items-center space-x-1 space-x-reverse text-sm text-gray-700">
                <StarIcon className="h-4 w-4 text-yellow-500" />
                <span>مميز فقط</span>
              </label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="breaking"
                checked={showBreaking}
                onChange={(e) => handleFilterChange('breaking', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="breaking" className="flex items-center space-x-1 space-x-reverse text-sm text-gray-700">
                <FireIcon className="h-4 w-4 text-red-500" />
                <span>عاجل فقط</span>
              </label>
            </div>

            {(searchQuery || selectedCategory || showFeatured || showBreaking || sortBy !== 'publishedAt' || sortOrder !== 'desc') && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                مسح الفلاتر
              </button>
            )}

            <button
              onClick={handleSearch}
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              بحث
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                ))}
              </div>
            ) : news.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {news.map((article) => (
                    <NewsCard key={article._id} news={article} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد أخبار</h3>
                <p className="text-gray-500">لم يتم العثور على أخبار تطابق معايير البحث</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Featured News */}
            {featuredNews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-500 ml-2" />
                  أخبار مميزة
                </h3>
                <div className="space-y-4">
                  {featuredNews.map((article) => (
                    <NewsCard key={article._id} news={article} compact />
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">الفئات</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  جميع الفئات
                </button>
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleFilterChange('category', category.value)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      selectedCategory === category.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center space-x-2 space-x-reverse">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </span>
                    <span className="text-xs text-gray-500">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;




