import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const NotificationBell = () => {
  const { user, token } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      loadUnreadCount();
      
      // Note: Real-time notifications disabled - using REST API polling
      // Set up polling for unread count updates
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      const unreadCount = response.data.data?.unreadCount || response.data.unreadCount || 0;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/inbox?limit=5&read=false');
      const messages = response.data.data?.messages || response.data.messages || [];
      setNotifications(messages);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.filter(n => n._id !== messageId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (notifications.length > 0) {
        const messageIds = notifications.map(n => n._id);
        await api.put('/messages/read-multiple', { messageIds });
        setUnreadCount(0);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffMinutes < 1440) return `منذ ${Math.floor(diffMinutes / 60)} ساعة`;
    return date.toLocaleDateString('ar-SA');
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'inquiry': return '❓';
      case 'booking_related': return '📅';
      case 'support': return '🆘';
      default: return '💬';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            loadNotifications();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {unreadCount > 0 ? 'لا توجد إشعارات جديدة' : 'لا توجد إشعارات'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <span className="text-lg">{getMessageTypeIcon(notification.messageType)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.subject}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            من: {notification.senderId?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <a
                  href="/dashboard/messages"
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  عرض جميع الرسائل
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
