import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, FireIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

// Global news cache to prevent multiple API calls
let globalNewsCache = {
  data: [],
  timestamp: 0,
  isFetching: false
};

const NewsTicker = () => {
  const [breakingNews, setBreakingNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    // COMPLETELY DISABLED: No news fetching to prevent backend components
    console.log('🛡️ NewsTicker: News fetching completely disabled to prevent backend components');
    setBreakingNews([]);
    setLoading(false);
    globalNewsCache.isFetching = false;
  }, []);

  const fetchBreakingNews = async () => {
    if (globalNewsCache.isFetching) {
      console.log('🔧 NewsTicker: Already fetching, skipping...');
      return;
    }
    
    globalNewsCache.isFetching = true;
    
    try {
      console.log('🔧 NewsTicker: Fetching breaking news...');
      const response = await api.get('/news/breaking?limit=5');
      if (response.data && response.data.success) {
        const newsData = response.data.data.news || [];
        setBreakingNews(newsData);
        setLastFetchTime(Date.now());
        
        // Update global cache
        globalNewsCache.data = newsData;
        globalNewsCache.timestamp = Date.now();
        
        console.log('🔧 NewsTicker: Breaking news fetched successfully');
      }
    } catch (error) {
      console.error('🔧 NewsTicker: Error fetching breaking news:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
      globalNewsCache.isFetching = false;
    }
  };

  // Auto-rotate news
  useEffect(() => {
    if (breakingNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === breakingNews.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [breakingNews.length]);

  if (loading) {
    return (
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="flex items-center justify-center">
          <div className="animate-pulse">جاري تحميل الأخبار العاجلة...</div>
        </div>
      </div>
    );
  }

  if (breakingNews.length === 0) {
    return null;
  }

  const currentNews = breakingNews[currentIndex];

  return (
    <div className="bg-red-600 text-white py-2 px-4 relative overflow-hidden">
      <div className="flex items-center">
        <div className="flex items-center space-x-2 space-x-reverse bg-red-700 px-3 py-1 rounded-full mr-4 flex-shrink-0">
          <FireIcon className="h-4 w-4" />
          <span className="text-sm font-bold">عاجل</span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {breakingNews.map((news, index) => (
              <div key={news._id} className="w-full flex-shrink-0">
                <Link
                  to={`/news/${news._id}`}
                  className="block hover:text-red-200 transition-colors"
                >
                  <span className="font-medium">{news.title}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {breakingNews.length > 1 && (
          <div className="flex items-center space-x-1 space-x-reverse ml-4 flex-shrink-0">
            {breakingNews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        <Link
          to="/news"
          className="flex items-center space-x-1 space-x-reverse ml-4 text-sm hover:text-red-200 transition-colors flex-shrink-0"
        >
          <span>المزيد</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default NewsTicker;




