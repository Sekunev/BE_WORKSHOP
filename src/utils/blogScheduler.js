const cron = require('node-cron');
const { generateRandomBlog } = require('../services/groqService');
const Blog = require('../models/Blog');
const User = require('../models/User');

/**
 * Otomatik blog oluşturma scheduler'ı
 * Cron formatı: saniye dakika saat gün ay haftanın_günü
 */
class BlogScheduler {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
  }

  /**
   * Scheduler'ı başlat
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Blog scheduler zaten çalışıyor');
      return;
    }

    console.log('🤖 Blog scheduler başlatılıyor...');

    // Her gün saat 14:30'te blog oluştur
    const dailyTask = cron.schedule('30 14 * * *', async () => {
      console.log('📝 Günlük otomatik blog oluşturuluyor...');
      await this.createScheduledBlog();
    }, {
      scheduled: false,
      timezone: "Europe/Istanbul"
    });

    // Her Pazartesi ve Perşembe saat 14:00'de blog oluştur
    const twiceWeeklyTask = cron.schedule('0 14 * * 1,4', async () => {
      console.log('📝 Haftalık otomatik blog oluşturuluyor...');
      await this.createScheduledBlog();
    }, {
      scheduled: false,
      timezone: "Europe/Istanbul"
    });

    // Test için: Her 2 saatte bir (geliştirme ortamında)
    let testTask = null;
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_TEST_SCHEDULER === 'true') {
      // testTask = cron.schedule('*/10 * * * *', async () => {  // test ortamında 10 dakikada bir blog oluşturuluyor }
      testTask = cron.schedule('0 */2 * * *', async () => {
        console.log('🧪 Test: 2 saatlik otomatik blog oluşturuluyor...');
        await this.createScheduledBlog();
      }, {
        scheduled: false,
        timezone: "Europe/Istanbul"
      });
    }

    // Task'ları başlat
    dailyTask.start();
    twiceWeeklyTask.start();
    if (testTask) {
      testTask.start();
      this.tasks.push(testTask);
    }

    this.tasks.push(dailyTask, twiceWeeklyTask);
    this.isRunning = true;

    console.log('✅ Blog scheduler başarıyla başlatıldı');
    console.log('📅 Günlük blog: Her gün 14:30');
    console.log('📅 Haftalık blog: Pazartesi ve Perşembe 14:00');
    if (testTask) {
      console.log('🧪 Test modu: Her 2 saatte bir');
    }
  }

  /**
   * Scheduler'ı durdur
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Blog scheduler zaten durmuş');
      return;
    }

    this.tasks.forEach(task => {
      task.stop();
    });

    this.tasks = [];
    this.isRunning = false;

    console.log('🛑 Blog scheduler durduruldu');
  }

  /**
   * Zamanlanmış blog oluştur
   */
  async createScheduledBlog() {
    try {
      // GROQ_API_KEY kontrolü
      if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY bulunamadı. Blog oluşturulamadı.');
        console.log('💡 .env dosyasında GROQ_API_KEY tanımlayın.');
        return;
      }

      // Admin kullanıcı bul
      const adminUser = await User.findOne({ role: 'admin' });

      if (!adminUser) {
        console.error('❌ Admin kullanıcı bulunamadı. Blog oluşturulamadı.');
        console.log('💡 npm run create-admin komutuyla admin kullanıcı oluşturun.');
        return;
      }

      // Rastgele AI blog oluştur
      console.log('🤖 AI ile blog içeriği oluşturuluyor...');
      const aiContent = await generateRandomBlog();

      // Blog oluştur
      const blogData = {
        title: aiContent.title,
        content: aiContent.content,
        excerpt: aiContent.excerpt,
        category: aiContent.category || 'Teknoloji',
        tags: aiContent.tags || [],
        author: adminUser._id,
        isPublished: true,
        publishedAt: new Date(),
        aiGenerated: true,
        aiMetadata: aiContent.metadata
      };

      const blog = await Blog.create(blogData);

      console.log('✅ Otomatik blog başarıyla oluşturuldu:');
      console.log(`   📌 Başlık: ${blog.title}`);
      console.log(`   👤 Yazar: ${adminUser.name}`);
      console.log(`   📁 Kategori: ${blog.category}`);
      console.log(`   🏷️  Etiketler: ${blog.tags.join(', ')}`);

      return blog;
    } catch (error) {
      console.error('❌ Otomatik blog oluşturma hatası:', error.message);
      
      // Hata detaylarını logla
      if (error.message.includes('GROQ_API_KEY')) {
        console.log('💡 .env dosyasında GROQ_API_KEY=your_key_here şeklinde tanımlayın.');
      } else if (error.message.includes('Admin kullanıcı')) {
        console.log('💡 npm run create-admin komutuyla admin kullanıcı oluşturun.');
      } else {
        console.error('📋 Hata detayı:', error);
      }
      
      // Scheduler'ı durdurmadan devam et
      return null;
    }
  }

  /**
   * Manual blog oluşturma (test için)
   */
  async triggerManualBlog(userId) {
    try {
      console.log('🤖 Manual AI blog oluşturuluyor...');
      
      const aiContent = await generateRandomBlog();

      const blogData = {
        title: aiContent.title,
        content: aiContent.content,
        excerpt: aiContent.excerpt,
        category: aiContent.category || 'Teknoloji',
        tags: aiContent.tags || [],
        author: userId,
        isPublished: true,
        publishedAt: new Date(),
        aiGenerated: true,
        aiMetadata: aiContent.metadata
      };

      const blog = await Blog.create(blogData);

      console.log('✅ Manual AI blog başarıyla oluşturuldu:', blog.title);
      return blog;
    } catch (error) {
      console.error('❌ Manual blog oluşturma hatası:', error.message);
      throw error;
    }
  }

  /**
   * Scheduler durumunu getir
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.length,
      schedules: [
        { name: 'Günlük Blog', cron: '30 14 * * *', description: 'Her gün saat 14:30' },
        { name: 'Haftalık Blog', cron: '0 14 * * 1,4', description: 'Pazartesi ve Perşembe 14:00' }
      ]
    };
  }
}

// Singleton instance
const schedulerInstance = new BlogScheduler();

module.exports = schedulerInstance;

