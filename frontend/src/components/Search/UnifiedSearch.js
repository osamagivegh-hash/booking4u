import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  NewspaperIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UnifiedSearch = ({ placeholder, showFilters = true, size = 'md' }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    services: [],
    news: [],
    businesses: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    dateRange: '',
    type: 'all'
  });
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setResults({ services: [], news: [], businesses: [], users: [] });
      setIsOpen(false);
    }
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setIsOpen(true);

      const searchParams = new URLSearchParams({
        q: query,
        language,
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.type !== 'all' && { type: filters.type })
      });

      // COMPLETELY DISABLED: No search API calls to prevent backend components
      console.log('🛡️ UnifiedSearch: Search API calls completely disabled to prevent backend components');
      
      const [servicesResponse, newsResponse, businessesResponse] = [
        { status: 'fulfilled', value: { data: { data: [] } } },
        { status: 'fulfilled', value: { data: { data: [] } } },
        { status: 'fulfilled', value: { data: { data: [] } } }
      ];

      // Log the data structure for debugging
      if (servicesResponse.status === 'fulfilled' && servicesResponse.value.data?.data?.length > 0) {
        console.log('Services search result structure:', servicesResponse.value.data.data[0]);
      }
      if (businessesResponse.status === 'fulfilled' && businessesResponse.value.data?.data?.length > 0) {
        console.log('Businesses search result structure:', businessesResponse.value.data.data[0]);
      }

      setResults({
        services: servicesResponse.status === 'fulfilled' ? (servicesResponse.value.data?.data || []) : [],
        news: newsResponse.status === 'fulfilled' ? (newsResponse.value.data?.data?.news || []) : [],
        businesses: businessesResponse.status === 'fulfilled' ? (businessesResponse.value.data?.data || []) : [],
        users: [] // Users search can be added later if needed
      });
    } catch (error) {
      console.error('Search error:', error);
      // Don't show error toast for search failures - just log and continue
      // The Promise.allSettled above handles individual endpoint failures gracefully
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&type=${filters.type}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (type, item) => {
    console.log('handleResultClick called with:', { type, item });
    
    // Validate that we have the required IDs
    if (!item || !item._id) {
      console.error('Invalid item data:', item);
      toast.error('خطأ في بيانات العنصر المحدد');
      return;
    }

    // Ensure _id is a string
    const itemId = String(item._id);
    if (!itemId || itemId === 'undefined' || itemId === 'null') {
      console.error('Invalid item ID:', item._id);
      toast.error('خطأ في معرف العنصر');
      return;
    }

    let path = '';
    switch (type) {
      case 'service':
        // Handle both populated and unpopulated businessId
        const businessId = item.businessId?._id || item.businessId;
        if (!businessId) {
          console.error('Missing businessId for service:', item);
          toast.error('خطأ في بيانات النشاط التجاري');
          return;
        }
        
        // Ensure businessId is a string
        const businessIdStr = String(businessId);
        if (!businessIdStr || businessIdStr === 'undefined' || businessIdStr === 'null') {
          console.error('Invalid businessId:', businessId);
          toast.error('خطأ في معرف النشاط التجاري');
          return;
        }
        
        path = `/services/${businessIdStr}/${itemId}`;
        break;
      case 'news':
        path = `/news/${itemId}`;
        break;
      case 'business':
        path = `/services/${itemId}`;
        break;
      default:
        console.error('Unknown result type:', type);
        return;
    }
    
    console.log('Navigating to:', path);
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ services: [], news: [], businesses: [], users: [] });
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getCategoryLabel = (category) => {
    return t(category) || category;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderServiceResult = (service) => (
    <div
      key={service._id}
      onClick={() => handleResultClick('service', service)}
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{service.name}</h4>
          <p className="text-xs text-gray-500 truncate">{service.description}</p>
          <div className="flex items-center space-x-2 space-x-reverse mt-1">
            <span className="text-xs text-blue-600">{getCategoryLabel(service.category)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-green-600">{service.price} {service.currency}</span>
            {service.averageRating > 0 && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <StarIcon className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-gray-600">{service.averageRating.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsResult = (news) => (
    <div
      key={news._id}
      onClick={() => handleResultClick('news', news)}
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <NewspaperIcon className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{news.title}</h4>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{news.summary || news.content}</p>
          <div className="flex items-center space-x-2 space-x-reverse mt-1">
            <span className="text-xs text-green-600">{getCategoryLabel(news.category)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{formatDate(news.publishedAt)}</span>
            {news.views > 0 && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{news.views} {t('views')}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessResult = (business) => (
    <div
      key={business._id}
      onClick={() => handleResultClick('business', business)}
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{business.name}</h4>
          <p className="text-xs text-gray-500 truncate">{business.description}</p>
          <div className="flex items-center space-x-2 space-x-reverse mt-1">
            <span className="text-xs text-purple-600">{getCategoryLabel(business.category)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{business.address?.city}</span>
            {business.rating > 0 && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <StarIcon className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-gray-600">{business.rating.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'all', label: t('all'), count: results.services.length + results.news.length + results.businesses.length },
    { id: 'services', label: t('services'), count: results.services.length },
    { id: 'news', label: t('news'), count: results.news.length },
    { id: 'businesses', label: t('businesses'), count: results.businesses.length }
  ];

  const hasResults = results.services.length > 0 || results.news.length > 0 || results.businesses.length > 0;

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSizes[size]}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || t('search')}
            className={`block w-full pl-10 pr-10 ${sizeClasses[size]} border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className={iconSizes[size]} />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">{t('loading')}</p>
            </div>
          ) : hasResults ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto">
                {activeTab === 'all' && (
                  <>
                    {results.services.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {t('services')}
                          </h3>
                        </div>
                        {results.services.map(renderServiceResult)}
                      </div>
                    )}
                    {results.news.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {t('news')}
                          </h3>
                        </div>
                        {results.news.map(renderNewsResult)}
                      </div>
                    )}
                    {results.businesses.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {t('businesses')}
                          </h3>
                        </div>
                        {results.businesses.map(renderBusinessResult)}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'services' && results.services.map(renderServiceResult)}
                {activeTab === 'news' && results.news.map(renderNewsResult)}
                {activeTab === 'businesses' && results.businesses.map(renderBusinessResult)}
              </div>

              {/* View All Results */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleSearch}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('viewAllResults')} "{query}"
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('noResultsFound')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('tryDifferentKeywords')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;



