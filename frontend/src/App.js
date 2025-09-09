import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { LanguageProvider } from './contexts/LanguageContext';
import ApiErrorBoundary from './components/ErrorBoundary/ApiErrorBoundary';

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

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();

  // Initialize authentication on app load
  useEffect(() => {
    // Only initialize once on mount
    const initializeOnce = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.log('Auth initialization error:', error.message);
      }
    };
    
    initializeOnce();
  }, [initializeAuth]); // Add initializeAuth back to dependencies

  return (
    <LanguageProvider>
      <ApiErrorBoundary>
        <div className="App">
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
      </ApiErrorBoundary>
    </LanguageProvider>
  );
}

export default App;
