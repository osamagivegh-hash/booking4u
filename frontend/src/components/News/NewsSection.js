import React, { useState, useEffect } from 'react';
import { 
  NewspaperIcon, 
  ArrowRightIcon, 
  ClockIcon,
  ExternalLinkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import newsService from '../../services/newsService';

const NewsSection = ({ className = '', maxItems = 6 }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await newsService.getNews();
      setNews(newsData.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${Math.floor(diffInHours / 24)} يوم`;
  };

  const handleNewsClick = (newsItem) => {
    if (newsItem.link && newsItem.link !== '#') {
      window.open(newsItem.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <NewspaperIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">الأخبار الاقتصادية</h2>
              <p className="text-gray-600">آخر الأخبار المالية والاقتصادية من المملكة</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex items-center justify-between mt-4">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <NewspaperIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">الأخبار الاقتصادية</h2>
              <p className="text-gray-600">آخر الأخبار المالية والاقتصادية من المملكة</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أخبار متاحة حالياً</h3>
          <p className="text-gray-600 mb-6">تحقق مرة أخرى لاحقاً لرؤية آخر الأخبار</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            تحديث
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <NewspaperIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">الأخبار الاقتصادية</h2>
            <p className="text-gray-600">آخر الأخبار المالية والاقتصادية من المملكة</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'جاري التحديث...' : 'تحديث'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((newsItem, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
            onClick={() => handleNewsClick(newsItem)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                  {newsItem.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {newsItem.description}
                </p>
              </div>
              <ExternalLinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {newsItem.source}
                </span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {newsItem.category}
                </span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <ClockIcon className="h-3 w-3" />
                <span>{formatDate(newsItem.pubDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          تحديث الأخبار
        </button>
      </div>
    </div>
  );
};

export default NewsSection;
