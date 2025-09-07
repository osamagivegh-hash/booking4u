import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            الصفحة غير موجودة
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary btn-lg w-full"
          >
            <HomeIcon className="h-5 w-5 ml-2" />
            العودة للرئيسية
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline btn-lg w-full"
          >
            <ArrowLeftIcon className="h-5 w-5 ml-2" />
            العودة للصفحة السابقة
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            إذا كنت تعتقد أن هذا خطأ، يرجى{' '}
            <a href="/contact" className="text-primary-600 hover:text-primary-500">
              الاتصال بنا
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
