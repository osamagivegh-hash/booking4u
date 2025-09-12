import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ServiceWorkerUpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const handleUpdateAvailable = (event) => {
      console.log('Service Worker update available:', event.detail);
      setUpdateAvailable(true);
      setRegistration(event.detail.registration);
      
      // Show toast notification
      toast.success('تحديث جديد متاح! يمكنك تحديث الصفحة للحصول على أحدث الميزات.', {
        duration: 8000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to get the new version
      window.location.reload();
    } else {
      // Fallback: just reload the page
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    setRegistration(null);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ArrowPathIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              تحديث جديد متاح
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              تم العثور على إصدار جديد من التطبيق. يرجى التحديث للحصول على أحدث الميزات.
            </p>
            <div className="mt-3 flex space-x-2 rtl:space-x-reverse">
              <button
                onClick={handleUpdate}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                تحديث الآن
              </button>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                لاحقاً
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerUpdateNotification;
