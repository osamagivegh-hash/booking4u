const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');
require('dotenv').config();

const sampleNews = [
  {
    title: 'تطبيق حجز المواعيد الجديد يصل إلى المملكة العربية السعودية',
    content: 'نحن سعداء للإعلان عن إطلاق تطبيق حجز المواعيد الجديد في المملكة العربية السعودية. هذا التطبيق سيساعد أصحاب الأعمال والعملاء على إدارة المواعيد بسهولة وفعالية.',
    summary: 'إطلاق تطبيق حجز المواعيد الجديد في السعودية لتحسين تجربة إدارة المواعيد',
    category: 'announcements',
    tags: ['تطبيق', 'حجز المواعيد', 'السعودية', 'تقنية'],
    isPublished: true,
    isFeatured: true,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'نصائح مهمة لاختيار أفضل صالون تجميل',
    content: 'عند اختيار صالون التجميل، يجب أن تأخذي في الاعتبار عدة عوامل مهمة مثل خبرة الفريق، نظافة المكان، جودة المنتجات المستخدمة، والخدمات المقدمة. كما يجب التأكد من حصول الصالون على التراخيص اللازمة.',
    summary: 'دليل شامل لاختيار أفضل صالون تجميل مع التركيز على الجودة والسلامة',
    category: 'beauty',
    tags: ['صالون تجميل', 'نصائح', 'جمال', 'اختيار'],
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'أهمية الحجز المسبق في تحسين تجربة العملاء',
    content: 'الحجز المسبق يوفر للعملاء راحة البال وضمان الحصول على الخدمة في الوقت المطلوب. كما يساعد أصحاب الأعمال على تنظيم العمل وتقليل أوقات الانتظار.',
    summary: 'كيف يساعد الحجز المسبق في تحسين تجربة العملاء وتنظيم العمل',
    category: 'business',
    tags: ['حجز مسبق', 'تجربة العملاء', 'تنظيم العمل', 'خدمة'],
    isPublished: true,
    isFeatured: true,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'أحدث تقنيات العناية بالبشرة في 2024',
    content: 'تطورت تقنيات العناية بالبشرة بشكل كبير في عام 2024. من التقنيات الجديدة التي ظهرت: العلاج بالليزر المتقدم، التقشير الكيميائي المحسن، والعلاج بالبلازما الغنية بالصفائح الدموية.',
    summary: 'استعراض أحدث تقنيات العناية بالبشرة والتجميل في عام 2024',
    category: 'beauty',
    tags: ['عناية بالبشرة', 'تقنيات', '2024', 'تجميل'],
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'كيفية إدارة المواعيد بكفاءة في صالونات التجميل',
    content: 'إدارة المواعيد بكفاءة تتطلب استخدام نظام حجز متطور، تدريب الفريق على التعامل مع العملاء، وتنظيم أوقات الخدمات المختلفة. هذا يساعد في تقليل أوقات الانتظار وزيادة رضا العملاء.',
    summary: 'نصائح وإرشادات لإدارة المواعيد بكفاءة في صالونات التجميل',
    category: 'business',
    tags: ['إدارة المواعيد', 'صالونات', 'كفاءة', 'تنظيم'],
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'الصحة النفسية وأثرها على الجمال',
    content: 'الصحة النفسية لها تأثير كبير على مظهر الإنسان وجماله. التوتر والقلق يمكن أن يؤثرا على البشرة والشعر. لذلك من المهم العناية بالصحة النفسية جنباً إلى جنب مع العناية الخارجية.',
    summary: 'العلاقة بين الصحة النفسية والجمال وكيفية العناية بكليهما',
    category: 'health',
    tags: ['صحة نفسية', 'جمال', 'توتر', 'عناية'],
    isPublished: true,
    isFeatured: true,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'عروض خاصة لشهر رمضان المبارك',
    content: 'بمناسبة شهر رمضان المبارك، نقدم عروضاً خاصة على جميع خدماتنا. احصل على خصم 20% على جميع خدمات التجميل والعناية بالبشرة. العرض ساري حتى نهاية الشهر.',
    summary: 'عروض رمضانية خاصة بخصم 20% على جميع خدمات التجميل',
    category: 'promotions',
    tags: ['عروض', 'رمضان', 'خصم', 'تجميل'],
    isPublished: true,
    isFeatured: false,
    isBreaking: true,
    language: 'ar'
  },
  {
    title: 'التكنولوجيا الحديثة في صناعة التجميل',
    content: 'تساهم التكنولوجيا الحديثة في تطوير صناعة التجميل بشكل كبير. من الذكاء الاصطناعي في تحليل البشرة إلى الواقع المعزز في تجربة المكياج، التكنولوجيا تجعل تجربة التجميل أكثر دقة وفعالية.',
    summary: 'كيف تساهم التكنولوجيا الحديثة في تطوير صناعة التجميل',
    category: 'technology',
    tags: ['تكنولوجيا', 'تجميل', 'ذكاء اصطناعي', 'واقع معزز'],
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'نمط الحياة الصحي وأثره على الجمال',
    content: 'نمط الحياة الصحي له تأثير مباشر على جمال الإنسان. النظام الغذائي المتوازن، ممارسة الرياضة، النوم الكافي، وتجنب التدخين كلها عوامل مهمة للحفاظ على الجمال الطبيعي.',
    summary: 'كيف يؤثر نمط الحياة الصحي على الجمال الطبيعي للإنسان',
    category: 'lifestyle',
    tags: ['نمط حياة', 'صحة', 'جمال', 'رياضة'],
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    language: 'ar'
  },
  {
    title: 'إرشادات السلامة في صالونات التجميل',
    content: 'السلامة في صالونات التجميل أمر بالغ الأهمية. يجب التأكد من تعقيم الأدوات، استخدام منتجات آمنة، والحصول على التراخيص اللازمة. هذا يحمي كل من العملاء والفريق من المخاطر الصحية.',
    summary: 'أهمية السلامة في صالونات التجميل والإرشادات الواجب اتباعها',
    category: 'health',
    tags: ['سلامة', 'صالونات', 'تعقيم', 'صحة'],
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    language: 'ar'
  }
];

async function seedNews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booking4u');
    console.log('✅ Connected to MongoDB');

    // Find an admin user to be the author
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // Create a default admin user if none exists
      adminUser = await User.create({
        name: 'مدير النظام',
        email: 'admin@booking4u.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Created default admin user');
    }

    // Clear existing news
    await News.deleteMany({});
    console.log('✅ Cleared existing news');

    // Add author to each news item
    const newsWithAuthor = sampleNews.map(news => ({
      ...news,
      author: adminUser._id
    }));

    // Insert sample news
    const createdNews = await News.insertMany(newsWithAuthor);
    console.log(`✅ Created ${createdNews.length} news articles`);

    // Update some news with published dates
    const now = new Date();
    for (let i = 0; i < createdNews.length; i++) {
      const publishDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Each day earlier
      await News.findByIdAndUpdate(createdNews[i]._id, { 
        publishedAt: publishDate,
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50)
      });
    }

    console.log('✅ Updated news with publish dates and engagement metrics');
    console.log('🎉 News seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding news:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seeding function
seedNews();


