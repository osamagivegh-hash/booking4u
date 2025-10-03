import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import ServiceCard from '../components/Services/ServiceCard';
import VerticalServicesTicker from '../components/Services/VerticalServicesTicker';
import UnifiedSearch from '../components/Search/UnifiedSearch';
import NewsTicker from '../components/News/NewsTicker';
import NewsSection from '../components/News/NewsSection';
import api from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [latestServices, setLatestServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // COMPLETELY DISABLED: No API calls on homepage to prevent backend components
  useEffect(() => {
    // DISABLED: No services loading to prevent backend components from showing
    console.log('🛡️ HomePage: Services loading completely disabled to prevent backend components');
    setLatestServices([]);
    setLoading(false);
    window.homePageServicesLoaded = true; // Mark as loaded without making API calls
  }, []);

  const loadLatestServices = async () => {
    try {
      setLoading(true);
      
      // Load latest 6 services
      const response = await api.get('/services/newest?limit=6');
      const services = response.data.data?.services || response.data.services || [];
      setLatestServices(services);
      
      // Cache the services data globally to prevent re-fetching
      window.cachedLatestServices = services;
      
    } catch (error) {
      console.error('Error loading latest services:', error);
      setLatestServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedLocation && { location: selectedLocation })
      });
      navigate(`/services?${params}`);
    }
  };

  const renderServiceCard = (service) => (
    <ServiceCard key={service._id} service={service} showProvider={true} />
  );

  const features = [
    {
      icon: CalendarIcon,
      title: 'حجز سريع وسهل',
      description: 'احجز موعدك في دقائق معدودة مع واجهة سهلة الاستخدام',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ClockIcon,
      title: 'إدارة الوقت بكفاءة',
      description: 'نظام ذكي لإدارة المواعيد وتجنب التداخل',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: UserGroupIcon,
      title: 'خدمة عملاء متميزة',
      description: 'فريق دعم متخصص لمساعدتك في أي وقت',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'أمان وخصوصية',
      description: 'حماية كاملة لبياناتك ومعلوماتك الشخصية',
      color: 'from-red-500 to-red-600'
    }
  ];

  const categories = [
    { name: 'عيادات طبية', icon: '🏥', count: '150+ عيادة', color: 'from-blue-500 to-blue-600' },
    { name: 'صالونات تجميل', icon: '💇‍♀️', count: '200+ صالون', color: 'from-pink-500 to-pink-600' },
    { name: 'مراكز رياضية', icon: '💪', count: '80+ مركز', color: 'from-green-500 to-green-600' },
    { name: 'مطاعم', icon: '🍽️', count: '300+ مطعم', color: 'from-orange-500 to-orange-600' },
    { name: 'استشارات', icon: '📋', count: '100+ مستشار', color: 'from-purple-500 to-purple-600' },
    { name: 'خدمات أخرى', icon: '🔧', count: '500+ خدمة', color: 'from-gray-500 to-gray-600' }
  ];

  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'عميل',
      content: 'خدمة ممتازة وسهلة الاستخدام. أنصح الجميع بتجربتها.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'فاطمة علي',
      role: 'صاحبة صالون',
      content: 'ساعدني النظام في تنظيم عملي وزيادة الإنتاجية بشكل كبير.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'محمد حسن',
      role: 'عميل',
      content: 'واجهة جميلة وسهلة الاستخدام. الحجز أصبح أسرع بكثير.',
      rating: 5,
      avatar: '👨‍💻'
    }
  ];

  const stats = [
    { number: '50K+', label: 'عميل نشط', icon: '👥' },
    { number: '1000+', label: 'خدمة متاحة', icon: '🎯' },
    { number: '99%', label: 'رضا العملاء', icon: '⭐' },
    { number: '24/7', label: 'دعم متواصل', icon: '🕒' }
  ];

  return (
    <div className="min-h-screen">
      {/* News Ticker */}
      <NewsTicker className="sticky top-0 z-50" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary text-white py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-responsive relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <SparklesIcon className="h-4 w-4 text-yellow-300" />
                <span>أفضل نظام حجز في المملكة</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                احجز خدماتك
                <span className="block text-blue-200">بسهولة وأمان</span>
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed">
                اكتشف أفضل الخدمات واحجز موعدك في دقائق معدودة. نظام حجز ذكي ومتطور لجميع احتياجاتك.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  استكشف الخدمات
                  <ArrowRightIcon className="h-6 w-6 mr-2" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-blue-600 transition-colors"
                >
                  ابدأ الآن
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">البحث عن الخدمات</h3>
                
                <div className="space-y-4">
                  <UnifiedSearch 
                    placeholder="ابحث عن الخدمات والأخبار..."
                    showFilters={true}
                    size="lg"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">جميع الفئات</option>
                      <option value="haircut">قص شعر</option>
                      <option value="hair_styling">تصفيف شعر</option>
                      <option value="facial">تنظيف بشرة</option>
                      <option value="massage">مساج</option>
                      <option value="manicure">منيكير</option>
                      <option value="pedicure">بديكير</option>
                    </select>
                    
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">جميع المواقع</option>
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="مكة">مكة</option>
                      <option value="المدينة">المدينة</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    بحث
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 animate-fade-in-up">
                <div className="text-center space-y-6">
                  <div className="text-8xl animate-bounce-gentle">📅</div>
                  <h3 className="text-3xl font-bold">حجز فوري</h3>
                  <p className="text-gray-200 text-lg">اختر الخدمة والوقت المناسب لك</p>
                  <div className="flex justify-center space-x-2 space-x-reverse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gradient-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              لماذا تختار Booking4U؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نقدم لك أفضل تجربة حجز مواعيد مع مميزات فريدة تجعل حياتك أسهل
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`bg-gradient-to-br ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              فئات الخدمات
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              اكتشف مجموعة واسعة من الخدمات المميزة في مختلف المجالات
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to="/services"
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 group-hover:scale-105 text-white`}>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm opacity-90">
                    {category.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ماذا يقول عملاؤنا
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              استمع إلى تجارب عملائنا المميزة مع Booking4U
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed text-lg">
                  "{testimonial.content}"
                </p>
                
                <div className="mt-6 flex items-center text-primary-600 font-medium">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span>عميل موثق</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-responsive">
          <NewsSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-responsive text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            ابدأ رحلتك مع Booking4U اليوم
          </h2>
          <p className="text-xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            انضم إلى آلاف العملاء الذين يثقون بنا في إدارة حجوزاتهم
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              ابدأ الآن مجاناً
            </Link>
            <Link
              to="/services"
              className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              استكشف الخدمات
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Services Section */}
      <section className="py-24 bg-white">
        <div className="container-responsive">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <ClockIconSolid className="h-8 w-8 text-blue-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">أحدث الخدمات</h2>
                <p className="text-gray-600">اكتشف أحدث الخدمات المضافة إلى منصتنا</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  window.homePageServicesLoaded = false;
                  loadLatestServices();
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                تحديث
              </button>
              <Link
                to="/services"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                عرض جميع الخدمات
                <ArrowRightIcon className="h-5 w-5 mr-2" />
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Services Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : latestServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestServices.map(renderServiceCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات متاحة حالياً</h3>
                  <p className="text-gray-600 mb-6">تحقق مرة أخرى لاحقاً لرؤية الخدمات الجديدة</p>
                  <Link
                    to="/services"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    تصفح جميع الخدمات
                    <ArrowRightIcon className="h-5 w-5 mr-2" />
                  </Link>
                </div>
              )}
            </div>
            
            {/* Vertical Services Ticker */}
            <div className="lg:col-span-1">
              <VerticalServicesTicker />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
