import React from 'react';
import { Link } from 'react-router-dom';
import SocialShare from '../Social/SocialShare';
import { 
  CalendarIcon, 
  EyeIcon, 
  HeartIcon, 
  ShareIcon,
  UserIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const NewsCard = ({ news, featured = false, compact = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📰',
      business: '💼',
      health: '🏥',
      beauty: '💄',
      technology: '💻',
      lifestyle: '🌟',
      promotions: '🎉',
      announcements: '📢'
    };
    return icons[category] || '📰';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      general: 'عام',
      business: 'أعمال',
      health: 'صحة',
      beauty: 'جمال',
      technology: 'تكنولوجيا',
      lifestyle: 'نمط حياة',
      promotions: 'عروض',
      announcements: 'إعلانات'
    };
    return labels[category] || 'عام';
  };

  if (compact) {
    return (
      <Link
        to={`/news/${news._id}`}
        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-gray-100"
      >
        <div className="flex space-x-3 space-x-reverse">
          <div className="flex-shrink-0">
            <img
              src={news.image || '/default-news-image.svg'}
              alt={news.title}
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = '/default-news-image.svg';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {news.title}
            </h3>
            <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
              <span>{formatDate(news.publishedAt)}</span>
              <span>•</span>
              <span>{news.views} مشاهدة</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${featured ? 'border-2 border-blue-200' : 'border border-gray-100'}`}>
      <div className="relative">
        <Link to={`/news/${news._id}`}>
          <img
            src={news.image || '/default-news-image.svg'}
            alt={news.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/default-news-image.svg';
            }}
          />
        </Link>
        
        {news.isBreaking && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <span className="w-2 h-2 bg-white rounded-full ml-1 animate-pulse"></span>
            عاجل
          </div>
        )}
        
        {news.isFeatured && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            مميز
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
          <span className="ml-1">{getCategoryIcon(news.category)}</span>
          {getCategoryLabel(news.category)}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1 space-x-reverse">
            <UserIcon className="h-4 w-4" />
            <span>{news.author?.name || 'محرر'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1 space-x-reverse">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(news.publishedAt)}</span>
          </div>
        </div>

        <Link to={`/news/${news._id}`}>
          <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {news.title}
          </h2>
        </Link>

        {news.summary && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {news.summary}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
            <div className="flex items-center space-x-1 space-x-reverse">
              <EyeIcon className="h-4 w-4" />
              <span>{news.views}</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <HeartIcon className="h-4 w-4" />
              <span>{news.likes}</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <ShareIcon className="h-4 w-4" />
              <span>{news.shares}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <SocialShare
              url={`${window.location.origin}/news/${news._id}`}
              title={news.title}
              description={news.summary || news.content}
              size="sm"
              showLabel={false}
              platforms={['whatsapp', 'twitter', 'facebook', 'copy']}
            />
            <Link
              to={`/news/${news._id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 space-x-reverse"
            >
              <span>اقرأ المزيد</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
