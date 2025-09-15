import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import ErrorBoundary from '../../components/ErrorBoundary';

const MessagesPage = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize activeTab from URL parameter or default to 'inbox'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'inbox');
  
  // Handle service inquiry parameters from URL
  const toUserId = searchParams.get('to');
  const subjectParam = searchParams.get('subject');
  const serviceId = searchParams.get('serviceId');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeMode, setComposeMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [messageStatuses, setMessageStatuses] = useState({});
  const [userStatuses, setUserStatuses] = useState({});
  // Note: Real-time messaging disabled - using REST API only
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    today: 0
  });
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    receiverId: '',
    receiverName: '',
    subject: '',
    content: '',
    messageType: 'general',
    priority: 'normal',
    tags: []
  });

  const messageTemplates = [
    {
      name: 'استفسار عام',
      subject: 'استفسار',
      content: 'أود الاستفسار عن...',
      type: 'inquiry',
      priority: 'normal'
    },
    {
      name: 'طلب دعم',
      subject: 'طلب دعم فني',
      content: 'أحتاج إلى مساعدة في...',
      type: 'support',
      priority: 'high'
    },
    {
      name: 'شكوى',
      subject: 'شكوى',
      content: 'أود تقديم شكوى بخصوص...',
      type: 'general',
      priority: 'high'
    }
  ];
  
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    read: undefined,
    type: '',
    priority: '',
    search: ''
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0
  });

  // Initialize pagination state
  useEffect(() => {
    setPagination(prev => {
      if (!prev || typeof prev.currentPage === 'undefined') {
        return {
          currentPage: 1,
          totalPages: 1,
          totalMessages: 0
        };
      }
      return prev;
    });
  }, []);

  // Handle URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && (tabFromUrl === 'inbox' || tabFromUrl === 'sent')) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Handle service inquiry parameters from URL
  useEffect(() => {
    if (toUserId || subjectParam || serviceId) {
      setComposeMode(true);
      setActiveTab('compose');
      
      // Auto-populate compose form for service inquiries
      if (toUserId || subjectParam || serviceId) {
        setComposeForm(prev => ({
          ...prev,
          receiverId: toUserId || '',
          subject: subjectParam || 'Service Inquiry',
          messageType: 'inquiry',
          priority: 'normal'
        }));
        
        // If we have a serviceId, we can fetch service details to enhance the message
        if (serviceId) {
          fetchServiceDetails(serviceId);
        }
      }
    }
  }, [toUserId, subjectParam, serviceId]);

  useEffect(() => {
    console.log('🔄 MessagesPage useEffect triggered:', {
      activeTab,
      user: user ? { id: user._id, name: user.name } : null,
      token: token ? 'present' : 'missing',
      filters
    });
    
    if (user && token) {
      loadMessages();
      loadUnreadCount();
      loadMessageStats();
    } else {
      console.warn('⚠️ User or token missing, skipping message loading');
    }
  }, [activeTab, filters]);

  // Handle pagination changes
  useEffect(() => {
    if (user && token && pagination?.currentPage && pagination.currentPage > 0) {
      console.log('🔄 Pagination changed, reloading messages:', pagination.currentPage);
      loadMessages();
    }
  }, [pagination?.currentPage, user, token]);

  // Debug compose mode changes
  useEffect(() => {
    console.log('📝 Compose mode changed:', composeMode);
  }, [composeMode]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Note: Real-time messaging disabled - using REST API only

  // Auto-refresh messages every 2 minutes instead of 30 seconds to reduce load
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        try {
          loadUnreadCount();
          loadMessageStats();
          // Only refresh messages if not composing and not viewing a specific message
          if (!composeMode && !selectedMessage) {
            loadMessages();
          }
        } catch (error) {
          console.error('Error in auto-refresh:', error);
        }
      }, 120000); // 2 minutes instead of 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [token, composeMode, selectedMessage]);

  // Handle browser notifications - removed global click listener that was causing navigation issues
  // useEffect(() => {
  //   if ('Notification' in window && Notification.permission === 'granted') {
  //     // Set up notification click handler
  //     const handleNotificationClick = (event) => {
  //       try {
  //         // Only handle clicks on notification elements, not all clicks
  //         if (event.target.closest('.notification') || event.target.closest('[data-notification]')) {
  //           window.focus();
  //           // Navigate to messages if not already there
  //           if (window.location.pathname !== '/messages') {
  //             navigate('/messages');
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Error handling notification click:', error);
  //       }
  //     };

  //     // Add notification click listener
  //     document.addEventListener('click', handleNotificationClick);
      
  //     return () => {
  //       document.removeEventListener('click', handleNotificationClick);
  //     };
  //   }
  // }, [navigate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      try {
        // Ctrl/Cmd + N for new message
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          e.preventDefault();
          setComposeMode(true);
        }
        
        // Ctrl/Cmd + F for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder="البحث في الرسائل..."]');
          if (searchInput) {
            searchInput.focus();
          }
        }
        
        // Escape to close compose mode
        if (e.key === 'Escape') {
          if (composeMode) {
            setComposeMode(false);
          } else if (selectedMessage) {
            setSelectedMessage(null);
          }
        }
      } catch (error) {
        console.error('Error handling keyboard shortcut:', error);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [composeMode, selectedMessage]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      try {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
      } catch (error) {
        console.error('Error cleaning up search timeout:', error);
      }
    };
  }, [searchTimeout]);

  const loadMessages = async () => {
    try {
      console.log('🚀 Starting loadMessages...', {
        activeTab,
        user: user ? { id: user._id, name: user.name } : null,
        token: token ? 'present' : 'missing'
      });
      
      setLoading(true);
      
      let endpoint;
      const currentPage = pagination?.currentPage || 1;
      let params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      // Handle search vs regular messages
      if (filters.search) {
        endpoint = '/messages/search';
        params.append('q', filters.search);
        if (filters.type) params.append('type', filters.type);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
      } else {
        endpoint = activeTab === 'inbox' ? '/messages/inbox' : '/messages/sent';
        if (filters.read !== undefined) params.append('read', filters.read);
        if (filters.type) params.append('type', filters.type);
        if (filters.priority) params.append('priority', filters.priority);
      }
      
      console.log(`📋 Loading messages from: ${endpoint}`);
      console.log(`📋 Active tab: ${activeTab}`);
      console.log(`📋 Current user: ${user._id}`);
      console.log(`📋 Params: ${params.toString()}`);
      
      const response = await api.get(`${endpoint}?${params}`);
      console.log(`📋 Response:`, response.data);
      console.log(`📋 Response structure:`, {
        hasData: !!response.data.data,
        hasMessages: !!response.data.data?.messages,
        messagesCount: response.data.data?.messages?.length || 0,
        hasPagination: !!response.data.data?.pagination
      });
      
      // Handle both response structures
      const messages = response.data.data?.messages || response.data.messages || [];
      const paginationData = response.data.data?.pagination || response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalMessages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };
      
      console.log(`📋 Final messages:`, messages);
      console.log(`📋 Final pagination:`, paginationData);
      
      setMessages(messages);
      setPagination(paginationData);
      
      console.log('✅ Messages loaded successfully');
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Set empty state on error
      setMessages([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalMessages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversationThread = async (threadId) => {
    try {
      if (!threadId) {
        console.warn('No threadId provided to loadConversationThread');
        return [];
      }
      
      const response = await api.get(`/messages/thread/${threadId}`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Error loading conversation thread:', error);
      return [];
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      console.log('📊 Unread count response:', response.data);
      
      // Handle both response structures
      const unreadCount = response.data.data?.unreadCount || response.data.unreadCount || 0;
      console.log('📊 Final unread count:', unreadCount);
      
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
      // Set to 0 on error to prevent UI issues
      setUnreadCount(0);
    }
  };

  const loadMessageStats = async () => {
    try {
      // Load inbox stats
      const inboxResponse = await api.get('/messages/inbox?limit=1');
      const inboxTotal = inboxResponse.data.data?.pagination?.totalMessages || inboxResponse.data.pagination?.totalMessages || 0;
      
      // Load urgent messages count
      const urgentResponse = await api.get('/messages/inbox?priority=urgent&limit=1');
      const urgentCount = urgentResponse.data.data?.pagination?.totalMessages || urgentResponse.data.pagination?.totalMessages || 0;
      
      // Calculate today's messages
      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await api.get(`/messages/inbox?dateFrom=${today}&limit=1`);
      const todayCount = todayResponse.data.data?.pagination?.totalMessages || todayResponse.data.pagination?.totalMessages || 0;
      
      setMessageStats({
        total: inboxTotal,
        unread: unreadCount,
        urgent: urgentCount,
        today: todayCount
      });
    } catch (error) {
      console.error('Error loading message stats:', error);
      // Set default values on error
      setMessageStats(prev => ({
        total: 0,
        unread: unreadCount,
        urgent: 0,
        today: 0
      }));
    }
  };

  const fetchServiceDetails = async (serviceId) => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      if (response.data.success) {
        const service = response.data.data;
        // Enhance the compose form with service details
        setComposeForm(prev => ({
          ...prev,
          subject: `Service Inquiry: ${service.name}`,
          content: `Hi, I'm interested in your service "${service.name}". Could you please provide more information about:\n\n- Availability\n- Pricing details\n- Any special requirements\n\nThank you!`
        }));
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  const searchUsers = async (query) => {
    try {
      // Validate input
      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        setUserSearchResults([]);
        return;
      }
      
      setIsSearchingUsers(true);
      console.log('🔍 Searching for users by name:', query);
      
      // Check authentication
      const authStorage = localStorage.getItem('auth-storage');
      console.log('🔑 Auth storage exists:', !!authStorage);
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;
          console.log('🔑 Token exists:', !!token);
          if (token) {
            console.log('🔑 Token preview:', token.substring(0, 20) + '...');
          }
        } catch (e) {
          console.error('❌ Error parsing auth storage:', e);
        }
      } else {
        console.warn('⚠️ No authentication token found');
      }
      
      // Make API request with timeout
      const response = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('📋 Search response:', response.data);
      
      // Handle response
      if (response.data && response.data.success) {
        const users = response.data.users || response.data.data?.users || [];
        console.log('👥 Users found:', users.length);
        setUserSearchResults(users);
      } else {
        console.log('⚠️ Invalid response format:', response.data);
        setUserSearchResults([]);
      }
      
    } catch (error) {
      console.error('❌ Error searching users:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        
        if (error.response.status === 401) {
          console.error('🔒 Authentication failed - user may need to login again');
        } else if (error.response.status === 500) {
          console.error('🔥 Server error - check backend logs');
        } else if (error.response.status === 503) {
          console.error('🔌 Database connection error - backend may be starting up');
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('❌ No response received - check if backend is running');
        console.error('❌ Request details:', error.request);
      } else {
        // Something else happened
        console.error('❌ Request setup error:', error.message);
      }
      
      // Always set empty results on error
      setUserSearchResults([]);
      
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleSearchChange = (value) => {
    try {
      setFilters({ ...filters, search: value });
      
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Set new timeout for debounced search
      const newTimeout = setTimeout(() => {
        try {
          if (value.trim()) {
            setPagination(prev => {
              if (prev) {
                return { ...prev, currentPage: 1 };
              }
              return {
                currentPage: 1,
                totalPages: 1,
                totalMessages: 0
              };
            });
          }
        } catch (error) {
          console.error('Error in search timeout handler:', error);
        }
      }, 500);
      
      setSearchTimeout(newTimeout);
    } catch (error) {
      console.error('Error handling search change:', error);
    }
  };

  const getSearchSuggestions = () => {
    try {
      const suggestions = [];
      if (filters.search && filters.search.length > 0) {
        // Add common search terms
        suggestions.push(
          { text: 'رسائل عاجلة', query: 'priority:urgent' },
          { text: 'رسائل غير مقروءة', query: 'isRead:false' },
          { text: 'رسائل اليوم', query: `dateFrom:${new Date().toISOString().split('T')[0]}` },
          { text: 'رسائل الأسبوع', query: `dateFrom:${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}` },
          { text: 'رسائل الاستفسارات', query: 'type:inquiry' },
          { text: 'رسائل الدعم', query: 'type:support' },
          { text: 'رسائل الحجز', query: 'type:booking_related' }
        );
      }
      return suggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  };

  const handleSearchSuggestion = (suggestion) => {
    try {
      const [key, value] = suggestion.query.split(':');
      if (key === 'priority') {
        setFilters({ ...filters, priority: value });
      } else if (key === 'isRead') {
        setFilters({ ...filters, read: value === 'false' ? false : true });
      } else if (key === 'dateFrom') {
        setFilters({ ...filters, dateFrom: value });
      } else if (key === 'type') {
        setFilters({ ...filters, type: value });
      }
      
      // Clear search text after applying suggestion
      setFilters(prev => ({ ...prev, search: '' }));
    } catch (error) {
      console.error('Error handling search suggestion:', error);
    }
  };

  const handleUserSelect = (user) => {
    try {
      if (!user || !user._id || !user.name) {
        console.warn('Invalid user data provided to handleUserSelect:', user);
        return;
      }
      
      setComposeForm({
        ...composeForm,
        receiverId: user._id,
        receiverName: user.name
      });
      setUserSearchQuery(user.name);
      setUserSearchResults([]);
    } catch (error) {
      console.error('Error handling user selection:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate form
      if (!composeForm.receiverId) {
        alert('يرجى اختيار المستلم');
        return;
      }
      
      if (!composeForm.subject.trim()) {
        alert('يرجى كتابة موضوع الرسالة');
        return;
      }
      
      if (!composeForm.content.trim()) {
        alert('يرجى كتابة محتوى الرسالة');
        return;
      }
      
      console.log('📤 Sending message:', composeForm);
      console.log('📤 Current user ID:', user._id);
      console.log('📤 Receiver ID:', composeForm.receiverId);
      
      // Prepare message data
      const messageData = {
        ...composeForm,
        // Add threadId if this is a reply
        ...(selectedMessage && { 
          replyTo: selectedMessage._id,
          threadId: selectedMessage.threadId || selectedMessage._id 
        }),
        // Add relatedServiceId if this is a service inquiry
        ...(serviceId && { relatedServiceId: serviceId })
      };
      
      console.log('📤 Final message data:', messageData);
      
      const response = await api.post('/messages', messageData);
      const newMessage = response.data.data?.message || response.data.message;
      console.log('✅ Message sent successfully:', newMessage);
      console.log('✅ Response data:', response.data);
      
      // Note: Real-time messaging disabled - using REST API only
      
      // Add message to sent messages if we're viewing sent tab
      if (activeTab === 'sent') {
        setMessages(prev => [newMessage, ...prev]);
      }
      
      // If this is a reply, update the selected message thread
      if (selectedMessage && (selectedMessage.threadId || selectedMessage._id)) {
        setSelectedMessage(prev => ({
          ...prev,
          threadMessages: prev.threadMessages 
            ? [...prev.threadMessages, newMessage]
            : [prev, newMessage]
        }));
      }
      
      // Reset form and close compose mode
      setComposeForm({
        receiverId: '',
        receiverName: '',
        subject: '',
        content: '',
        messageType: 'general',
        priority: 'normal',
        tags: []
      });
      setUserSearchQuery('');
      setUserSearchResults([]);
      setComposeMode(false);
      
      // Reload messages and unread count
      loadMessages();
      loadUnreadCount();
      
      // Show success message
      console.log('✅ Message sent successfully');
      alert('تم إرسال الرسالة بنجاح!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      console.log('📖 Marking message as read:', messageId);
      await api.put(`/messages/${messageId}/read`);
      
      // Update message in the list
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      // Update selected message if it's the same one
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(prev => ({ ...prev, isRead: true }));
      }
      
      // Update unread count
      await loadUnreadCount();
      console.log('✅ Message marked as read successfully');
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      if (!messageId) {
        console.warn('No messageId provided to handleDeleteMessage');
        return;
      }
      
      if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        await api.delete(`/messages/${messageId}`);
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('خطأ في حذف الرسالة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleBulkMarkAsRead = async (messageIds) => {
    try {
      console.log('📖 Bulk marking messages as read:', messageIds);
      await api.put('/messages/read-multiple', { messageIds });
      
      // Update messages in the list
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
      ));
      
      // Update selected message if it's in the bulk selection
      if (selectedMessage && messageIds.includes(selectedMessage._id)) {
        setSelectedMessage(prev => ({ ...prev, isRead: true }));
      }
      
      // Update unread count
      await loadUnreadCount();
      
      // Clear selection
      setSelectedMessages([]);
      setSelectAll(false);
      console.log('✅ Messages marked as read successfully');
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  const handleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMessages([]);
      setSelectAll(false);
    } else {
      setSelectedMessages(messages.map(msg => msg._id));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`هل أنت متأكد من حذف ${selectedMessages.length} رسالة؟`)) {
      try {
        const deletePromises = selectedMessages.map(id => api.delete(`/messages/${id}`));
        await Promise.all(deletePromises);
        
        // Remove deleted messages from the list
        setMessages(messages.filter(msg => !selectedMessages.includes(msg._id)));
        
        // Clear selection if selected message was deleted
        if (selectedMessage && selectedMessages.includes(selectedMessage._id)) {
          setSelectedMessage(null);
        }
        
        // Clear selection
        setSelectedMessages([]);
        setSelectAll(false);
        
        // Reload unread count
        loadUnreadCount();
      } catch (error) {
        console.error('Error deleting messages:', error);
        alert('خطأ في حذف بعض الرسائل. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleMessageStatusUpdate = async (messageId, updates) => {
    try {
      // Update message in the list
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, ...updates } : msg
      ));
      
      // Update selected message if it's the same one
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(prev => ({ ...prev, ...updates }));
      }
      
      // Update unread count if marking as read
      if (updates.isRead) {
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handlePriorityChange = async (messageId, newPriority) => {
    try {
      // Update message priority in the list
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, priority: newPriority } : msg
      ));
      
      // Update selected message if it's the same one
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(prev => ({ ...prev, priority: newPriority }));
      }
      
      console.log(`✅ Message priority updated to ${newPriority}`);
    } catch (error) {
      console.error('Error updating message priority:', error);
    }
  };

  const exportMessages = () => {
    try {
      if (!messages || messages.length === 0) {
        alert('لا توجد رسائل للتصدير');
        return;
      }
      
      const exportData = messages.map(msg => ({
        الموضوع: msg.subject || 'بدون موضوع',
        المرسل: activeTab === 'inbox' ? (msg.senderId?.name || 'غير معروف') : 'أنت',
        المستلم: activeTab === 'inbox' ? 'أنت' : (msg.receiverId?.name || 'غير معروف'),
        المحتوى: msg.content || 'بدون محتوى',
        النوع: msg.messageType || 'عام',
        الأولوية: msg.priority || 'عادية',
        التاريخ: msg.createdAt ? new Date(msg.createdAt).toLocaleString('ar-SA') : 'غير محدد',
        الحالة: msg.isRead ? 'مقروءة' : 'غير مقروءة'
      }));
      
      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `messages_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Messages exported successfully');
    } catch (error) {
      console.error('Error exporting messages:', error);
      alert('خطأ في تصدير الرسائل. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleMessageArchive = async (messageId) => {
    try {
      if (!messageId) {
        console.warn('No messageId provided to handleMessageArchive');
        return;
      }
      
      // Mark message as archived (soft delete)
      await api.delete(`/messages/${messageId}`);
      
      // Remove from current view
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Clear selection if archived message was selected
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
      
      console.log('✅ Message archived successfully');
    } catch (error) {
      console.error('Error archiving message:', error);
      alert('خطأ في أرشفة الرسالة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleQuickReply = (message) => {
    try {
      if (!message) {
        console.warn('No message provided to handleQuickReply');
        return;
      }
      
      setComposeForm({
        receiverId: activeTab === 'inbox' ? message.senderId?._id : message.receiverId?._id,
        receiverName: activeTab === 'inbox' ? message.senderId?.name : message.receiverId?.name,
        subject: `رد: ${message.subject || 'بدون موضوع'}`,
        content: '',
        messageType: message.messageType || 'general',
        priority: message.priority || 'normal',
        tags: [...(message.tags || []), 'رد']
      });
      setComposeMode(true);
    } catch (error) {
      console.error('Error handling quick reply:', error);
    }
  };

  const handleMessageForward = (message) => {
    try {
      if (!message) {
        console.warn('No message provided to handleMessageForward');
        return;
      }
      
      setComposeForm({
        receiverId: '',
        receiverName: '',
        subject: `إعادة توجيه: ${message.subject || 'بدون موضوع'}`,
        content: `\n\n--- رسالة أصلية ---\n${message.content || 'بدون محتوى'}`,
        messageType: message.messageType || 'general',
        priority: message.priority || 'normal',
        tags: [...(message.tags || []), 'إعادة توجيه']
      });
      setComposeMode(true);
    } catch (error) {
      console.error('Error handling message forward:', error);
    }
  };

  const getPriorityColor = (priority) => {
    try {
      if (!priority) return 'text-gray-600 bg-gray-50';
      
      switch (priority) {
        case 'urgent': return 'text-red-600 bg-red-50';
        case 'high': return 'text-orange-600 bg-orange-50';
        case 'normal': return 'text-blue-600 bg-blue-50';
        case 'low': return 'text-gray-600 bg-gray-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    } catch (error) {
      console.error('Error getting priority color:', error);
      return 'text-gray-600 bg-gray-50';
    }
  };

  const getMessageTypeIcon = (type) => {
    try {
      if (!type) return '💬';
      
      switch (type) {
        case 'inquiry': return '❓';
        case 'booking_related': return '📅';
        case 'support': return '🆘';
        default: return '💬';
      }
    } catch (error) {
      console.error('Error getting message type icon:', error);
      return '💬';
    }
  };

  const getUserStatus = (userId) => {
    try {
      if (!userId || !userStatuses[userId]) return 'offline';
      return userStatuses[userId].status;
    } catch (error) {
      console.error('Error getting user status:', error);
      return 'offline';
    }
  };

  const getMessageStatus = (messageId) => {
    try {
      if (!messageId || !messageStatuses[messageId]) return 'pending';
      return messageStatuses[messageId];
    } catch (error) {
      console.error('Error getting message status:', error);
      return 'pending';
    }
  };

  const getStatusIcon = (status) => {
    try {
      switch (status) {
        case 'online': return '🟢';
        case 'away': return '🟡';
        case 'offline': return '🔴';
        default: return '⚪';
      }
    } catch (error) {
      console.error('Error getting status icon:', error);
      return '⚪';
    }
  };

  const getMessageStatusIcon = (status) => {
    try {
      switch (status) {
        case 'sent': return '✓';
        case 'delivered': return '✓✓';
        case 'read': return '✓✓';
        default: return '';
      }
    } catch (error) {
      console.error('Error getting message status icon:', error);
      return '';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'غير محدد';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'تاريخ غير صحيح';
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'أمس';
      if (diffDays < 7) return `${diffDays} أيام`;
      return date.toLocaleDateString('ar-SA');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صحيح';
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Test Button - Isolated */}
        <div className="fixed top-4 right-4 z-50">
          <button
            type="button"
            onClick={() => {
              console.log('🧪 Test button clicked!');
              alert('Test button works!');
              setComposeMode(true);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
          >
            TEST COMPOSE
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الرسائل</h1>
              <p className="mt-2 text-gray-600">إدارة رسائلك الواردة والمرسلة</p>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* Debug Info */}
              <div className="text-xs text-gray-500">
                ComposeMode: {composeMode ? 'true' : 'false'}
              </div>
              
              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500">
                  {connectionStatus === 'connected' ? 'متصل' : 'غير متصل'}
                </span>
              </div>
              
              <button
                type="button"
                onClick={exportMessages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MagnifyingGlassIcon className="h-5 w-5 ml-2" />
                تصدير
              </button>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('📝 Div clicked! Current composeMode:', composeMode);
                  console.log('📝 Setting composeMode to true...');
                  setComposeMode(true);
                  console.log('📝 ComposeMode should now be true');
                  // Clear any selected message to ensure compose form shows
                  setSelectedMessage(null);
                  // Show alert to confirm button click
                  alert('تم النقر على زر إنشاء رسالة جديدة!');
                }}
                onMouseDown={(e) => {
                  console.log('📝 Mouse down on div');
                  e.preventDefault();
                }}
                onMouseUp={(e) => {
                  console.log('📝 Mouse up on div');
                  e.preventDefault();
                }}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  composeMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <PaperAirplaneIcon className="h-5 w-5 ml-2" />
                {composeMode ? 'إغلاق النموذج' : 'رسالة جديدة'}
              </div>
              
              {/* Debug Toggle Button */}
              <button
                onClick={() => {
                  console.log('🔧 Debug toggle clicked! Current composeMode:', composeMode);
                  setComposeMode(!composeMode);
                  console.log('🔧 ComposeMode toggled to:', !composeMode);
                }}
                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-yellow-100 hover:bg-yellow-200"
              >
                Toggle
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Message List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
                  <button
                    onClick={() => {
                      setActiveTab('inbox');
                      navigate('/dashboard/messages?tab=inbox', { replace: true });
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'inbox'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <EnvelopeIcon className="h-5 w-5 inline ml-2" />
                    الوارد
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('sent');
                      navigate('/dashboard/messages?tab=sent', { replace: true });
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'sent'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <PaperAirplaneIcon className="h-5 w-5 inline ml-2" />
                    المرسل
                  </button>
                </nav>
              </div>

              {/* Message Statistics */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      {loading ? '...' : messageStats.total}
                    </div>
                    <div className="text-xs text-gray-600">إجمالي الرسائل</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-red-600">
                      {loading ? '...' : messageStats.unread}
                    </div>
                    <div className="text-xs text-gray-600">غير مقروءة</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">
                      {loading ? '...' : messageStats.urgent}
                    </div>
                    <div className="text-xs text-gray-600">عاجلة</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      {loading ? '...' : messageStats.today}
                    </div>
                    <div className="text-xs text-gray-600">اليوم</div>
                  </div>
                </div>
                
                {/* Keyboard Shortcuts Help */}
                <div className="mt-3 text-center">
                  <div className="text-xs text-gray-500">
                    اختصارات: Ctrl+N (رسالة جديدة) • Ctrl+F (بحث) • Esc (إغلاق)
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث في الرسائل..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    {/* Search Suggestions */}
                    {filters.search && filters.search.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {getSearchSuggestions().map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchSuggestion(suggestion)}
                            className="block w-full text-right text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded"
                          >
                            {suggestion.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">جميع الأنواع</option>
                      <option value="inquiry">استفسار</option>
                      <option value="booking_related">متعلق بالحجز</option>
                      <option value="general">عام</option>
                      <option value="support">دعم</option>
                    </select>
                    
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">جميع الأولويات</option>
                      <option value="low">منخفضة</option>
                      <option value="normal">عادية</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>
                  
                  {/* Date Range Filters */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="من تاريخ"
                    />
                    
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="إلى تاريخ"
                    />
                  </div>
                  
                  {/* Read Status Filter for Inbox */}
                  {activeTab === 'inbox' && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.read === true}
                          onChange={(e) => setFilters({ ...filters, read: e.target.checked ? true : undefined })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="mr-2 text-sm text-gray-700">مقروءة فقط</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.read === false}
                          onChange={(e) => setFilters({ ...filters, read: e.target.checked ? false : undefined })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="mr-2 text-sm text-gray-700">غير مقروءة فقط</span>
                      </label>
                    </div>
                  )}
                  
                  {/* Clear Filters Button */}
                  {(filters.search || filters.type || filters.priority || filters.dateFrom || filters.dateTo || filters.read !== undefined) && (
                    <button
                      onClick={() => setFilters({
                        read: undefined,
                        type: '',
                        priority: '',
                        search: '',
                        dateFrom: '',
                        dateTo: ''
                      })}
                      className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      مسح الفلاتر
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedMessages.length > 0 && (
                <div className="p-3 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      تم تحديد {selectedMessages.length} رسالة
                    </span>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleBulkMarkAsRead(selectedMessages)}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                      >
                        تحديد كمقروءة
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mark All as Read Button for Inbox */}
              {activeTab === 'inbox' && unreadCount > 0 && selectedMessages.length === 0 && (
                <div className="p-3 bg-green-50 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">
                      لديك {unreadCount} رسالة غير مقروءة
                    </span>
                    <button
                      onClick={() => {
                        const unreadMessageIds = messages
                          .filter(msg => !msg.isRead)
                          .map(msg => msg._id);
                        if (unreadMessageIds.length > 0) {
                          handleBulkMarkAsRead(unreadMessageIds);
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                    >
                      تحديد الكل كمقروء
                    </button>
                  </div>
                </div>
              )}

              {/* Message List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
                ) : messages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    لا توجد رسائل {activeTab === 'inbox' ? 'واردة' : 'مرسلة'}
                    <div className="text-xs text-gray-400 mt-2">
                      Debug: messages.length = {messages.length}, loading = {loading.toString()}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {/* Select All Checkbox */}
                    <div className="p-3 bg-gray-50">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="mr-2 text-sm text-gray-700">تحديد الكل</span>
                      </label>
                    </div>
                    
                    {messages.map((message) => (
                                              <div
                          key={message._id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            selectedMessage?._id === message._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                          } ${!message.isRead && activeTab === 'inbox' ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <input
                                type="checkbox"
                                checked={selectedMessages.includes(message._id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleMessageSelection(message._id);
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <span className="text-lg">{getMessageTypeIcon(message.messageType)}</span>
                                  <p className={`text-sm font-medium truncate ${
                                    !message.isRead && activeTab === 'inbox' ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {activeTab === 'inbox' ? message.senderId?.name : message.receiverId?.name}
                                  </p>
                                  <span className="text-xs" title={`${getUserStatus(activeTab === 'inbox' ? message.senderId?._id : message.receiverId?._id)}`}>
                                    {getStatusIcon(getUserStatus(activeTab === 'inbox' ? message.senderId?._id : message.receiverId?._id))}
                                  </span>
                                </div>
                                <p className={`text-sm truncate mt-1 ${
                                  !message.isRead && activeTab === 'inbox' ? 'text-blue-700' : 'text-gray-600'
                                }`}>
                                  {message.subject}
                                </p>
                                <div className="flex items-center mt-2 space-x-2 rtl:space-x-reverse">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                                    {message.priority === 'urgent' ? 'عاجلة' : 
                                     message.priority === 'high' ? 'عالية' : 
                                     message.priority === 'low' ? 'منخفضة' : 'عادية'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(message.createdAt)}
                                  </span>
                                  {activeTab === 'sent' && (
                                    <span className="text-xs text-gray-400" title={getMessageStatus(message._id)}>
                                      {getMessageStatusIcon(getMessageStatus(message._id))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              {!message.isRead && activeTab === 'inbox' && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                              
                              {/* Quick Actions */}
                              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                {activeTab === 'inbox' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMessageStatusUpdate(message._id, { 
                                        isRead: !message.isRead 
                                      });
                                    }}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    title={message.isRead ? 'تحديد كغير مقروءة' : 'تحديد كمقروءة'}
                                  >
                                    {message.isRead ? (
                                      <EyeSlashIcon className="h-4 w-4" />
                                    ) : (
                                      <EyeIcon className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMessage(message._id);
                                  }}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                  title="حذف الرسالة"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                                                     {/* Message Preview */}
                           <div className="mt-2">
                             <div 
                               className="cursor-pointer mb-2"
                               onClick={async () => {
                                 try {
                                   console.log('📧 Message clicked:', message._id);
                                   setSelectedMessage(message);
                                   
                                   if (!message.isRead && activeTab === 'inbox') {
                                     console.log('📧 Marking message as read:', message._id);
                                     await handleMarkAsRead(message._id);
                                   }
                                   
                                   // Load conversation thread if available
                                   if (message.threadId || message.replyTo) {
                                     const threadId = message.threadId || message._id;
                                     console.log('📧 Loading conversation thread:', threadId);
                                     const threadMessages = await loadConversationThread(threadId);
                                     if (threadMessages.length > 0) {
                                       console.log('📧 Thread messages loaded:', threadMessages.length);
                                       // Update the selected message with thread information
                                       setSelectedMessage(prev => ({
                                         ...prev,
                                         threadMessages: threadMessages
                                       }));
                                     }
                                   }
                                 } catch (error) {
                                   console.error('❌ Error handling message click:', error);
                                 }
                               }}
                             >
                               <p className="text-xs text-gray-500 line-clamp-2">
                                 {message.content.substring(0, 100)}
                                 {message.content.length > 100 && '...'}
                               </p>
                             </div>
                             
                             {/* Quick Action Buttons */}
                             <div className="flex items-center space-x-2 rtl:space-x-reverse">
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleQuickReply(message);
                                 }}
                                 className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded"
                                 title="رد سريع"
                               >
                                 رد
                               </button>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleMessageForward(message);
                                 }}
                                 className="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded"
                                 title="إعادة توجيه"
                               >
                                 إعادة توجيه
                               </button>
                             </div>
                           </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination?.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (pagination) {
                          setPagination({ ...pagination, currentPage: Math.max(1, pagination.currentPage - 1) });
                        }
                      }}
                      disabled={!pagination?.hasPrevPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      السابق
                    </button>
                    <span className="text-sm text-gray-700">
                      صفحة {pagination?.currentPage || 1} من {pagination?.totalPages || 1}
                    </span>
                    <button
                      onClick={() => {
                        if (pagination) {
                          setPagination({ ...pagination, currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1) });
                        }
                      }}
                      disabled={!pagination?.hasNextPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Message View */}
          <div className="lg:col-span-2">
            {console.log('🔍 Rendering main content. composeMode:', composeMode, 'selectedMessage:', selectedMessage) || composeMode ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">رسالة جديدة</h3>
                  <button
                    onClick={() => {
                      console.log('❌ Closing compose mode...');
                      setComposeMode(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendMessage(e);
                  }} 
                  className="space-y-4"
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      إلى
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث عن المستخدم بالاسم..."
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                        }}
                        onFocus={(e) => {
                          e.stopPropagation();
                        }}
                        onBlur={(e) => {
                          e.stopPropagation();
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      {isSearchingUsers && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      {userSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {userSearchResults.map((user) => (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => handleUserSelect(user)}
                              className="w-full text-right px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">{user.role === 'merchant' ? 'تاجر' : 'عميل'}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {userSearchQuery.length >= 2 && userSearchResults.length === 0 && !isSearchingUsers && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                          <div className="text-sm text-gray-500 text-center">
                            لم يتم العثور على مستخدمين
                          </div>
                        </div>
                      )}
                    </div>
                    {composeForm.receiverName && (
                      <div className="mt-2 text-sm text-green-600">
                        تم اختيار: {composeForm.receiverName}
                      </div>
                    )}
                    {!composeForm.receiverId && userSearchQuery.length < 2 && (
                      <div className="mt-1 text-xs text-gray-500">
                        اكتب اسم المستخدم للبحث (على الأقل حرفين)
                      </div>
                    )}
                    
                    {/* Debug info */}
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div><strong>Debug Info:</strong></div>
                      <div>Query: "{userSearchQuery}" (length: {userSearchQuery.length})</div>
                      <div>Results: {userSearchResults.length}</div>
                      <div>Searching: {isSearchingUsers ? 'Yes' : 'No'}</div>
                      <div>API URL: {api.defaults.baseURL}/users/search</div>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🧪 Manual test search triggered');
                          searchUsers('test');
                        }}
                        className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Test Search
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          console.log('🧪 Testing database connection...');
                          try {
                            const response = await api.get('/users/test-db');
                            console.log('✅ Database test success:', response.data);
                          } catch (error) {
                            console.error('❌ Database test error:', error);
                          }
                        }}
                        className="mt-1 ml-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Test DB
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          console.log('🧪 Creating test users...');
                          try {
                            const response = await api.post('/users/create-test-users');
                            console.log('✅ Create test users success:', response.data);
                          } catch (error) {
                            console.error('❌ Create test users error:', error);
                          }
                        }}
                        className="mt-1 ml-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                      >
                        Create Users
                      </button>
                    </div>
                    
                    {/* Fallback: Manual user ID input */}
                    {!composeForm.receiverId && userSearchQuery.length >= 2 && userSearchResults.length === 0 && !isSearchingUsers && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="text-sm text-yellow-800 mb-2">
                          لم يتم العثور على مستخدمين. يمكنك إدخال معرف المستخدم يدوياً:
                        </div>
                        <input
                          type="text"
                          placeholder="أدخل معرف المستخدم (User ID)"
                          className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                          onChange={(e) => {
                            if (e.target.value.trim()) {
                              setComposeForm(prev => ({
                                ...prev,
                                receiverId: e.target.value.trim(),
                                receiverName: `مستخدم (${e.target.value.trim()})`
                              }));
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموضوع
                    </label>
                    <input
                      type="text"
                      placeholder="موضوع الرسالة"
                      value={composeForm.subject}
                      onChange={(e) => {
                        setComposeForm({ ...composeForm, subject: e.target.value });
                      }}
                      onMouseEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                      }}
                      onBlur={(e) => {
                        e.stopPropagation();
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الرسالة
                      </label>
                      <select
                        value={composeForm.messageType}
                        onChange={(e) => {
                          setComposeForm({ ...composeForm, messageType: e.target.value });
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                        }}
                        onFocus={(e) => {
                          e.stopPropagation();
                        }}
                        onBlur={(e) => {
                          e.stopPropagation();
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="general">عام</option>
                        <option value="inquiry">استفسار</option>
                        <option value="booking_related">متعلق بالحجز</option>
                        <option value="support">دعم</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الأولوية
                      </label>
                      <select
                        value={composeForm.priority}
                        onChange={(e) => {
                          setComposeForm({ ...composeForm, priority: e.target.value });
                        }}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                        }}
                        onFocus={(e) => {
                          e.stopPropagation();
                        }}
                        onBlur={(e) => {
                          e.stopPropagation();
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="normal">عادية</option>
                        <option value="low">منخفضة</option>
                        <option value="high">عالية</option>
                        <option value="urgent">عاجلة</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Tags Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوسوم (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="أضف وسوم مفصولة بفواصل..."
                      value={composeForm.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        setComposeForm({ ...composeForm, tags });
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Message Templates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      قوالب الرسائل
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {messageTemplates.map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setComposeForm({
                              ...composeForm,
                              subject: template.subject,
                              content: template.content,
                              messageType: template.type,
                              priority: template.priority
                            });
                          }}
                          className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المحتوى
                    </label>
                    <textarea
                      rows={6}
                      placeholder="اكتب رسالتك هنا..."
                      value={composeForm.content}
                      onChange={(e) => {
                        setComposeForm({ ...composeForm, content: e.target.value });
                        
                        // Note: Real-time typing indicators disabled
                      }}
                      onMouseEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                      }}
                      onBlur={(e) => {
                        e.stopPropagation();
                        // Note: Real-time typing indicators disabled
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {isTyping && typingUser && (
                      <div className="mt-2 text-sm text-blue-600">
                        {typingUser} يكتب...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setComposeMode(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendMessage(e);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'جاري الإرسال...' : 'إرسال'}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedMessage && !composeMode ? (
              <div className="bg-white rounded-lg shadow">
                {/* Message Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedMessage.subject}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                        <span>
                          من: {activeTab === 'inbox' ? selectedMessage.senderId?.name : 'أنت'}
                        </span>
                        <span>
                          إلى: {activeTab === 'inbox' ? 'أنت' : selectedMessage.receiverId?.name}
                        </span>
                        <span>{formatDate(selectedMessage.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <select
                        value={selectedMessage.priority}
                        onChange={(e) => handlePriorityChange(selectedMessage._id, e.target.value)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-0 ${getPriorityColor(selectedMessage.priority)}`}
                      >
                        <option value="low">منخفضة</option>
                        <option value="normal">عادية</option>
                        <option value="high">عالية</option>
                        <option value="urgent">عاجلة</option>
                      </select>
                      <span className="text-lg">{getMessageTypeIcon(selectedMessage.messageType)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="px-6 py-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                  
                  {/* Conversation Thread */}
                  {selectedMessage.threadMessages && selectedMessage.threadMessages.length > 1 && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">المحادثة</h4>
                      <div className="space-y-4">
                        {selectedMessage.threadMessages
                          .filter(msg => msg._id !== selectedMessage._id)
                          .map((threadMessage) => (
                            <div key={threadMessage._id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {threadMessage.senderId._id === user._id ? 'أنت' : threadMessage.senderId.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(threadMessage.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{threadMessage.content}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Message Actions */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <button
                        onClick={() => {
                          setComposeForm({
                            receiverId: activeTab === 'inbox' ? selectedMessage.senderId?._id : selectedMessage.receiverId?._id,
                            subject: `رد: ${selectedMessage.subject}`,
                            content: '',
                            messageType: 'general',
                            priority: 'normal',
                            tags: []
                          });
                          setComposeMode(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 ml-2" />
                        رد
                      </button>
                      
                      {/* Forward Message Button */}
                      <button
                        onClick={() => {
                          setComposeForm({
                            receiverId: '',
                            receiverName: '',
                            subject: `إعادة توجيه: ${selectedMessage.subject}`,
                            content: `\n\n--- رسالة أصلية ---\n${selectedMessage.content}`,
                            messageType: selectedMessage.messageType,
                            priority: selectedMessage.priority,
                            tags: [...selectedMessage.tags, 'إعادة توجيه']
                          });
                          setComposeMode(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PaperAirplaneIcon className="h-4 w-4 ml-2" />
                        إعادة توجيه
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {/* Mark as Read/Unread Toggle */}
                      {activeTab === 'inbox' && (
                        <button
                          onClick={() => handleMessageStatusUpdate(selectedMessage._id, { 
                            isRead: !selectedMessage.isRead 
                          })}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {selectedMessage.isRead ? (
                            <>
                              <EyeSlashIcon className="h-4 w-4 ml-2" />
                              تحديد كغير مقروءة
                            </>
                          ) : (
                            <>
                              <EyeIcon className="h-4 w-4 ml-2" />
                              تحديد كمقروءة
                            </>
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 ml-2" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد رسالة محددة</h3>
                <p className="mt-1 text-sm text-gray-500">
                  اختر رسالة من القائمة لعرض محتواها
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default MessagesPage;
