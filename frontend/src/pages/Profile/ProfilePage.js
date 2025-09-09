import React from 'react';
import useAuthStore from '../../stores/authStore';

const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          الملف الشخصي
        </h1>
        
        <div className="max-w-2xl">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">المعلومات الشخصية</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">الاسم</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name || 'غير محدد'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email || 'غير محدد'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                <p className="mt-1 text-sm text-gray-900">{user?.phone || 'غير محدد'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">نوع الحساب</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.role === 'business' ? 'صاحب نشاط تجاري' : 'عميل'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 py-8">
            <p>قريباً - ستتمكن من تعديل معلوماتك الشخصية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
