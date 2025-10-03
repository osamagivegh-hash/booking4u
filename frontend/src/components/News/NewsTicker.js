import React, { useState, useEffect, useRef } from 'react';
import { NewspaperIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import newsService from '../../services/newsService';

const NewsTicker = ({ className = '', showTitle = true, maxItems = 5 }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tickerRef = useRef(null);

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

  // Auto-scroll effect
  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [news.length]);

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
      <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 ${className}`}>
        <div className="container-responsive">
          <div className="flex items-center space-x-4 space-x-reverse">
            {showTitle && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <NewspaperIcon className="h-5 w-5" />
                <span className="font-semibold text-sm">أخبار اقتصادية</span>
              </div>
            )}
            <div className="flex-1">
              <div className="h-4 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 ${className}`}>
        <div className="container-responsive">
          <div className="flex items-center space-x-4 space-x-reverse">
            {showTitle && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <NewspaperIcon className="h-5 w-5" />
                <span className="font-semibold text-sm">أخبار اقتصادية</span>
              </div>
            )}
            <div className="flex-1 text-center">
              <span className="text-sm opacity-90">لا توجد أخبار متاحة حالياً</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 overflow-hidden ${className}`}>
      <div className="container-responsive">
        <div className="flex items-center space-x-4 space-x-reverse">
          {showTitle && (
            <div className="flex items-center space-x-2 space-x-reverse flex-shrink-0">
              <NewspaperIcon className="h-5 w-5" />
              <span className="font-semibold text-sm">أخبار اقتصادية</span>
            </div>
          )}
          
          <div className="flex-1 relative overflow-hidden">
            <div 
              ref={tickerRef}
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {news.map((newsItem, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full flex items-center space-x-4 space-x-reverse cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleNewsClick(newsItem)}
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium line-clamp-1">
                      {newsItem.title}
                    </h4>
                    <div className="flex items-center space-x-2 space-x-reverse text-xs opacity-90 mt-1">
                      <span>{newsItem.source}</span>
                      <span>•</span>
                      <span>{formatDate(newsItem.pubDate)}</span>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 flex-shrink-0 opacity-70" />
                </div>
              ))}
            </div>
          </div>

          {/* News indicators */}
          <div className="flex space-x-1 flex-shrink-0">
            {news.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;