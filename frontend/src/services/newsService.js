// News service for fetching external financial news from Saudi Arabia
import axios from 'axios';

class NewsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Get cached data or fetch new data
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: now
      });
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      // Return cached data if available, even if expired
      return cached ? cached.data : [];
    }
  }

  // Fetch news from RSS feeds with robust error handling and multiple proxy options
  async fetchRSSFeed(url, maxItems = 10) {
    const proxyOptions = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`
    ];
    
    let lastError;
    
    // Try each proxy option until one works
    for (const proxyUrl of proxyOptions) {
      try {
        const response = await axios.get(proxyUrl, {
          timeout: 8000, // 8 second timeout
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Booking4U-App/1.0'
          }
        });
        
        if (response.data && response.data.contents) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response.data.contents, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');
          
          // Check for XML parsing errors
          const parseError = xmlDoc.querySelector('parsererror');
          if (parseError) {
            throw new Error('Invalid XML response from RSS feed');
          }
          
          const news = Array.from(items).slice(0, maxItems).map(item => {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            return {
              title: this.cleanText(title),
              description: this.cleanText(description),
              link,
              pubDate: new Date(pubDate),
              source: this.extractSourceFromUrl(url)
            };
          });
          
          return news;
        }
      } catch (error) {
        lastError = error;
        console.warn(`Proxy ${proxyUrl} failed:`, error.message);
        // Continue to next proxy option
        continue;
      }
    }
    
    // All proxies failed
    console.warn('All RSS proxies failed for URL:', url, 'Error:', lastError?.message);
    return [];
  }

  // Clean HTML tags and extra whitespace from text
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Extract source name from URL
  extractSourceFromUrl(url) {
    try {
      const domain = new URL(url).hostname;
      if (domain.includes('alkhaleej')) return 'الخليج 24';
      if (domain.includes('maal')) return 'مال الاقتصادية';
      if (domain.includes('alriyadh')) return 'الرياض';
      if (domain.includes('alwatan')) return 'الوطن';
      return domain;
    } catch {
      return 'مصدر غير معروف';
    }
  }

  // Get financial news from multiple sources
  async getFinancialNews() {
    const newsSources = [
      {
        name: 'الخليج 24 - الاقتصاد',
        url: 'https://alkhaleej.ae/ar/rss/economy',
        category: 'اقتصاد'
      },
      {
        name: 'مال الاقتصادية',
        url: 'https://maal.com/feed',
        category: 'اقتصاد'
      },
      {
        name: 'الرياض - الاقتصاد',
        url: 'https://www.alriyadh.com/rss/economy.xml',
        category: 'اقتصاد'
      }
    ];

    const allNews = [];

    for (const source of newsSources) {
      try {
        const news = await this.fetchRSSFeed(source.url, 5);
        const newsWithSource = news.map(item => ({
          ...item,
          sourceName: source.name,
          category: source.category
        }));
        allNews.push(...newsWithSource);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    // Sort by publication date (newest first)
    return allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  }

  // Get cached financial news
  async getCachedFinancialNews() {
    return this.getCachedData('financial-news', () => this.getFinancialNews());
  }

  // Get mock news data for development/fallback
  getMockNews() {
    return [
      {
        title: 'ارتفاع أسعار النفط في الأسواق العالمية',
        description: 'شهدت أسعار النفط ارتفاعاً ملحوظاً في التداولات العالمية اليوم، مما يؤثر على الاقتصاد السعودي',
        link: '#',
        pubDate: new Date(),
        source: 'مال الاقتصادية',
        sourceName: 'مال الاقتصادية',
        category: 'اقتصاد'
      },
      {
        title: 'رؤية 2030 تحقق تقدم في القطاع المالي',
        description: 'أعلنت الهيئة العامة للاستثمار عن تحقيق تقدم كبير في تطوير القطاع المالي ضمن رؤية 2030',
        link: '#',
        pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: 'الخليج 24',
        sourceName: 'الخليج 24 - الاقتصاد',
        category: 'اقتصاد'
      },
      {
        title: 'زيادة الاستثمارات الأجنبية في المملكة',
        description: 'سجلت المملكة العربية السعودية زيادة في الاستثمارات الأجنبية المباشرة خلال الربع الأخير',
        link: '#',
        pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        source: 'الرياض',
        sourceName: 'الرياض - الاقتصاد',
        category: 'اقتصاد'
      },
      {
        title: 'تطوير البنية التحتية الرقمية',
        description: 'أطلقت الحكومة السعودية مبادرات جديدة لتطوير البنية التحتية الرقمية في المملكة',
        link: '#',
        pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        source: 'مال الاقتصادية',
        sourceName: 'مال الاقتصادية',
        category: 'اقتصاد'
      },
      {
        title: 'نمو القطاع المصرفي السعودي',
        description: 'أظهرت التقارير المالية نمواً إيجابياً في القطاع المصرفي السعودي خلال الفترة الماضية',
        link: '#',
        pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
        source: 'الخليج 24',
        sourceName: 'الخليج 24 - الاقتصاد',
        category: 'اقتصاد'
      }
    ];
  }

  // Get news with fallback to mock data
  async getNews() {
    try {
      const realNews = await this.getCachedFinancialNews();
      if (realNews && realNews.length > 0) {
        return realNews;
      }
    } catch (error) {
      console.error('Error fetching real news, using mock data:', error);
    }
    
    // Fallback to mock data
    return this.getMockNews();
  }
}

export default new NewsService();
