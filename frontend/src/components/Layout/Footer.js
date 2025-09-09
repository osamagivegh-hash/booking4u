import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200/50 relative">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
        aria-label="العودة للأعلى"
      >
        <ArrowUpIcon className="h-6 w-6" />
      </button>

      <div className="container-responsive">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center space-x-3 space-x-reverse mb-6 group">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
                <span className="text-2xl font-bold text-gradient-primary group-hover:scale-105 transition-transform duration-300">
                  Booking4U
                </span>
              </div>
              <p className="text-gray-600 mb-6 max-w-lg leading-relaxed text-lg">
                نظام حجز المواعيد الذكي الذي يساعدك في إدارة حجوزاتك بسهولة وكفاءة. 
                احجز مواعيدك مع أفضل الخدمات في المملكة العربية السعودية.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 space-x-reverse text-gray-600 hover:text-primary-600 transition-colors duration-200">
                  <PhoneIcon className="h-5 w-5 text-primary-500" />
                  <span>+966 50 123 4567</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse text-gray-600 hover:text-primary-600 transition-colors duration-200">
                  <EnvelopeIcon className="h-5 w-5 text-primary-500" />
                  <span>info@booking4u.sa</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse text-gray-600 hover:text-primary-600 transition-colors duration-200">
                  <MapPinIcon className="h-5 w-5 text-primary-500" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4 space-x-reverse">
                <button 
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="فيسبوك"
                  onClick={() => window.open('https://facebook.com', '_blank')}
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956-.925-1.956-1.874v-3.23h3.906l-.447 3.47h-3.46v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button 
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="تويتر"
                  onClick={() => window.open('https://twitter.com', '_blank')}
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button 
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="إنستغرام"
                  onClick={() => window.open('https://instagram.com', '_blank')}
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                  </svg>
                </button>
                <button 
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-primary-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="لينكد إن"
                  onClick={() => window.open('https://linkedin.com', '_blank')}
                >
                  <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 relative">
                روابط سريعة
                <div className="absolute bottom-0 right-0 w-12 h-1 bg-gradient-primary rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">الرئيسية</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/services" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">الخدمات</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">من نحن</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">اتصل بنا</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blog" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">المدونة</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 relative">
                الدعم
                <div className="absolute bottom-0 right-0 w-12 h-1 bg-gradient-primary rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/help" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">مركز المساعدة</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/faq" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">الأسئلة الشائعة</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacy" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">سياسة الخصوصية</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terms" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">شروط الاستخدام</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/support" 
                    className="text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-300 inline-block group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">الدعم الفني</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200/50 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2024 Booking4U. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-red-500 text-lg animate-pulse">❤️</span>
              <p className="text-gray-500 text-sm">
                مصمم ومطور في المملكة العربية السعودية
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
