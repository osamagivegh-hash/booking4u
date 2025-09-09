import React, { useState } from 'react';
import { 
  FunnelIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  MapPinIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const AdvancedFilters = ({ 
  onFiltersChange, 
  filters = {}, 
  showDateRange = true,
  showPriceRange = true,
  showLocation = true,
  showStatus = true,
  showCategory = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
    priceMin: filters.priceMin || '',
    priceMax: filters.priceMax || '',
    location: filters.location || '',
    status: filters.status || '',
    category: filters.category || '',
    sortBy: filters.sortBy || 'date',
    sortOrder: filters.sortOrder || 'desc'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      location: '',
      status: '',
      category: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value && value !== 'date' && value !== 'desc'
  );

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'pending', label: 'معلقة' },
    { value: 'confirmed', label: 'مؤكدة' },
    { value: 'completed', label: 'مكتملة' },
    { value: 'cancelled', label: 'ملغاة' }
  ];

  const categoryOptions = [
    { value: '', label: 'جميع الفئات' },
    { value: 'haircut', label: 'قص شعر' },
    { value: 'hair_styling', label: 'تصفيف شعر' },
    { value: 'hair_coloring', label: 'صبغ شعر' },
    { value: 'manicure', label: 'منيكير' },
    { value: 'pedicure', label: 'بديكير' },
    { value: 'facial', label: 'تنظيف بشرة' },
    { value: 'massage', label: 'مساج' },
    { value: 'consultation', label: 'استشارة' },
    { value: 'treatment', label: 'علاج' },
    { value: 'training', label: 'تدريب' },
    { value: 'other', label: 'أخرى' }
  ];

  const sortOptions = [
    { value: 'date', label: 'التاريخ' },
    { value: 'price', label: 'السعر' },
    { value: 'status', label: 'الحالة' },
    { value: 'customer', label: 'العميل' },
    { value: 'service', label: 'الخدمة' }
  ];

  const locationOptions = [
    { value: '', label: 'جميع المواقع' },
    { value: 'الرياض', label: 'الرياض' },
    { value: 'جدة', label: 'جدة' },
    { value: 'الدمام', label: 'الدمام' },
    { value: 'مكة', label: 'مكة' },
    { value: 'المدينة', label: 'المدينة' },
    { value: 'الخبر', label: 'الخبر' },
    { value: 'الطائف', label: 'الطائف' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 space-x-reverse">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">الفلاتر المتقدمة</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              نشط
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 space-x-reverse"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>مسح الكل</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isOpen ? 'إخفاء' : 'عرض الفلاتر'}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isOpen && (
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Range */}
            {showDateRange && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <CalendarIcon className="h-4 w-4 inline ml-1" />
                  نطاق التاريخ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="من تاريخ"
                  />
                  <input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="إلى تاريخ"
                  />
                </div>
              </div>
            )}

            {/* Price Range */}
            {showPriceRange && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <CurrencyDollarIcon className="h-4 w-4 inline ml-1" />
                  نطاق السعر
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={localFilters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الحد الأدنى"
                  />
                  <input
                    type="number"
                    value={localFilters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الحد الأقصى"
                  />
                </div>
              </div>
            )}

            {/* Location */}
            {showLocation && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPinIcon className="h-4 w-4 inline ml-1" />
                  الموقع
                </label>
                <select
                  value={localFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status */}
            {showStatus && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">الحالة</label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category */}
            {showCategory && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">الفئة</label>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ترتيب حسب</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={localFilters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">تنازلي</option>
                  <option value="asc">تصاعدي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600 self-center">فلتر سريع:</span>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                handleFilterChange('dateFrom', today);
                handleFilterChange('dateTo', today);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              اليوم
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                handleFilterChange('dateFrom', weekAgo.toISOString().split('T')[0]);
                handleFilterChange('dateTo', today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              آخر أسبوع
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                handleFilterChange('dateFrom', monthAgo.toISOString().split('T')[0]);
                handleFilterChange('dateTo', today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              آخر شهر
            </button>
            <button
              onClick={() => {
                handleFilterChange('status', 'pending');
              }}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            >
              معلقة فقط
            </button>
            <button
              onClick={() => {
                handleFilterChange('status', 'completed');
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              مكتملة فقط
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;




