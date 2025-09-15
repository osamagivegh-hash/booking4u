import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

const QuickMessage = () => {
  const { token } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [showQuickCompose, setShowQuickCompose] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    loadRecentMessages();
    
    // Note: Real-time messaging disabled - using REST API polling
    // Set up polling for updates
    const interval = setInterval(() => {
      loadUnreadCount();
      loadRecentMessages();
    }, 60000); // Poll every minute
    
    return () => clearInterval(interval);
  }, [token]);

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadRecentMessages = async () => {
    try {
      const response = await api.get('/messages/inbox?limit=3');
      setRecentMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading recent messages:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 ml-2" />
          الرسائل السريعة
        </h3>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} جديدة
            </span>
          )}
          <Link
            to="/dashboard/messages"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            عرض الكل
          </Link>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="space-y-3 mb-4">
        {recentMessages.length > 0 ? (
          recentMessages.map((message) => (
            <Link
              key={message._id}
              to="/dashboard/messages"
              className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.senderId?.name}
                    </p>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {message.subject}
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTimeAgo(message.createdAt)}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm">لا توجد رسائل حديثة</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 rtl:space-x-reverse">
        <Link
          to="/dashboard/messages"
          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 ml-1" />
          فتح الرسائل
        </Link>
        <button
          onClick={() => setShowQuickCompose(!showQuickCompose)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Compose (if enabled) */}
      {showQuickCompose && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">
            للوصول الكامل لميزات المراسلة، انتقل إلى صفحة الرسائل الرئيسية
          </p>
          <Link
            to="/dashboard/messages"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PaperAirplaneIcon className="h-4 w-4 ml-1" />
            إنشاء رسالة جديدة
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuickMessage;
