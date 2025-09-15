import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { LanguageProvider } from './contexts/LanguageContext';
import ApiErrorBoundary from './components/ErrorBoundary/ApiErrorBoundary';
import ResourceErrorBoundary from './components/ErrorBoundary/ResourceErrorBoundary';
import ImageErrorBoundary from './components/ErrorBoundary/ImageErrorBoundary';
import debugLogger from './utils/debugLogger';
import autoRefreshTest from './utils/autoRefreshTest';
import statePreservation from './utils/statePreservation';
import autoRefreshTestSuite from './utils/autoRefreshTestSuite';
import autoRefreshPrevention from './utils/autoRefreshPrevention';
import disableAutoRefresh from './utils/disableAutoRefresh';
import completeAutoRefreshElimination from './utils/completeAutoRefreshElimination';
import './utils/aggressiveImageFix'; // Import aggressive image fix
// DISABLED: import backendHealthService from './services/backendHealthService';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import BusinessDashboardPage from './pages/Dashboard/BusinessDashboardPage';
import CustomerDashboardPage from './pages/Dashboard/CustomerDashboardPage';
import AdminPanelPage from './pages/Dashboard/AdminPanelPage';
import CreateBusinessPage from './pages/Dashboard/CreateBusinessPage';
import EditBusinessPage from './pages/Dashboard/EditBusinessPage';
import ServicesPage from './pages/Services/ServicesPage';
import PublicServicesPage from './pages/Services/PublicServicesPage';
import ServiceDetailsPage from './pages/Services/ServiceDetailsPage';
import AddServicePage from './pages/Services/AddServicePage';
import BookingPage from './pages/Booking/BookingPage';
import MyBookingsPage from './pages/Booking/MyBookingsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import MessagesPage from './pages/Messages/MessagesPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import NewsPage from './pages/News/NewsPage';
import NotFoundPage from './pages/NotFoundPage';
import ApiDebugger from './components/ApiDebugger';
import ServiceWorkerUpdateNotification from './components/ServiceWorkerUpdateNotification';
import DiagnosticsPage from './pages/Admin/DiagnosticsPage';

function App() {
  const { isAuthenticated, initializeAuth, logout } = useAuthStore();

  // Initialize debug logging and auto-refresh prevention
  useEffect(() => {
    // Initialize comprehensive auto-refresh prevention
    console.log('🛡️ Initializing comprehensive auto-refresh prevention...');
    
    debugLogger.log('APP', '🚀 App component mounted', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Log debug info to console for immediate visibility
    console.log('🔍 DEBUG: App mounted, debug logger active');
    console.log('🔍 DEBUG: Use window.debugLogger.getLogs() to see all logs');
    console.log('🔍 DEBUG: Use window.debugLogger.exportLogs() to export logs');
    console.log('🔍 DEBUG: Use window.autoRefreshTest.logStatus() to check auto-refresh status');
    console.log('🔍 DEBUG: Use window.autoRefreshTest.runTest() to run auto-refresh test');
    console.log('🔍 DEBUG: Image URL handling simplified - using relative paths directly');
    console.log('🔍 DEBUG: State preservation active:', window.statePreservation ? 'Yes' : 'No');
    console.log('🔍 DEBUG: Auto-refresh prevention active:', window.autoRefreshPrevention ? 'Yes' : 'No');
    console.log('🔍 DEBUG: Use window.autoRefreshTestSuite.runAllTests() to run comprehensive tests');
    console.log('🔍 DEBUG: Use window.autoRefreshPrevention.getReport() to see auto-refresh monitoring data');
    console.log('🔍 DEBUG: Image URLs now use relative paths directly from backend');
  }, []);

  // Initialize authentication on app load
  useEffect(() => {
    console.log('🔍 App: Component mounted, initializing auth');
    debugLogger.log('AUTH', '🔐 Initializing authentication');
    
    // Set global flag to prevent multiple API calls
    window.appInitialized = true;
    
    // Only initialize once on mount
    const initializeOnce = async () => {
      try {
        await initializeAuth();
        console.log('🔍 App: Auth initialization completed');
        debugLogger.log('AUTH', '✅ Auth initialization completed');
        
        // COMPLETELY DISABLED: Backend health service removed to prevent any automatic API calls
        console.log('🔍 App: Backend health service completely disabled to prevent 30-second refresh');
      } catch (error) {
        console.log('🔍 App: Auth initialization error:', error.message);
        debugLogger.log('AUTH', '❌ Auth initialization error', { error: error.message });
      }
    };
    
    initializeOnce();
  }, [initializeAuth]);

  // Listen for auth:logout events from API interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log('🔍 App: Received auth:logout event, logging out user');
      logout();
      // Navigate to login page using React Router (no page reload)
      window.history.pushState(null, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [logout]);

  return (
    <LanguageProvider>
      <ApiErrorBoundary>
        <ResourceErrorBoundary>
          <ImageErrorBoundary>
            <div className="App">
            <ServiceWorkerUpdateNotification />
            <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          } />
          <Route path="services" element={<PublicServicesPage />} />
          <Route path="services/browse" element={<PublicServicesPage />} />
          <Route path="services/:businessId" element={<ServicesPage />} />
          <Route path="services/:businessId/:serviceId" element={<ServiceDetailsPage />} />
          <Route path="services/book/:serviceId" element={<BookingPage />} />
          <Route path="services/add" element={<AddServicePage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="debug" element={<ApiDebugger />} />
          <Route path="admin/diagnostics" element={<DiagnosticsPage />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="business" element={<BusinessDashboardPage />} />
          <Route path="business/create" element={<CreateBusinessPage />} />
          <Route path="business/edit" element={<EditBusinessPage />} />
          <Route path="customer" element={<CustomerDashboardPage />} />
          <Route path="admin" element={<AdminPanelPage />} />
          <Route path="admin/services/add" element={<AddServicePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/add" element={<AddServicePage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="reviews/:businessId" element={<ReviewsPage />} />
          <Route path="reviews/:businessId/:serviceId" element={<ReviewsPage />} />
        </Route>

        {/* Direct My Bookings Route */}
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<MyBookingsPage />} />
        </Route>

        {/* Booking Routes */}
        <Route path="/booking" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path=":businessId/:serviceId" element={<BookingPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </div>
          </ImageErrorBoundary>
        </ResourceErrorBoundary>
      </ApiErrorBoundary>
    </LanguageProvider>
  );
}

export default App;
