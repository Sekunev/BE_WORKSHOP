/**
 * AI Blog Test Script
 * 
 * Bu script AI blog oluşturma sistemini test etmek için kullanılır.
 * 
 * Kullanım:
 *   node src/utils/testAIBlog.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { generateRandomBlog, getRandomTopic } = require('../services/groqService');
const Blog = require('../models/Blog');
const User = require('../models/User');

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

// Test fonksiyonu
const testAIBlog = async () => {
  console.log('\n🤖 AI Blog Test Başlıyor...\n');

  try {
    // 1. Admin kullanıcı kontrol et
    console.log('1️⃣ Admin kullanıcı kontrol ediliyor...');
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ Admin kullanıcı bulunamadı!');
      console.log('💡 Önce admin kullanıcı oluşturun: npm run create-admin');
      process.exit(1);
    }
    
    console.log(`✅ Admin kullanıcı bulundu: ${adminUser.name} (${adminUser.email})`);

    // 2. Groq API Key kontrol et
    console.log('\n2️⃣ Groq API Key kontrol ediliyor...');
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY environment variable bulunamadı!');
      console.log('💡 .env dosyasına GROQ_API_KEY ekleyin');
      process.exit(1);
    }
    console.log('✅ Groq API Key bulundu');

    // 3. Rastgele konu seç
    console.log('\n3️⃣ Rastgele blog konusu seçiliyor...');
    const randomTopic = getRandomTopic();
    console.log(`📌 Seçilen konu: "${randomTopic}"`);

    // 4. AI ile blog içeriği oluştur
    console.log('\n4️⃣ AI ile blog içeriği oluşturuluyor...');
    console.log('⏳ Bu işlem 10-30 saniye sürebilir...\n');
    
    const startTime = Date.now();
    const aiContent = await generateRandomBlog();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Blog içeriği oluşturuldu (${duration}s)`);
    console.log('\n📄 Blog Detayları:');
    console.log(`   📌 Başlık: ${aiContent.title}`);
    console.log(`   📁 Kategori: ${aiContent.category}`);
    console.log(`   🏷️  Etiketler: ${aiContent.tags?.join(', ') || 'Yok'}`);
    console.log(`   📝 Özet: ${aiContent.excerpt?.substring(0, 100)}...`);
    console.log(`   📊 İçerik uzunluğu: ${aiContent.content?.length || 0} karakter`);
    
    if (aiContent.metadata) {
      console.log('\n🤖 AI Metadata:');
      console.log(`   🎯 Konu: ${aiContent.metadata.konu}`);
      console.log(`   🎨 Tarz: ${aiContent.metadata.tarz}`);
      console.log(`   📏 Kelime Sayısı: ${aiContent.metadata.kelimeSayisi}`);
      console.log(`   👥 Hedef Kitle: ${aiContent.metadata.hedefKitle}`);
      console.log(`   🔧 Model: ${aiContent.metadata.model}`);
    }

    // 5. Blog'u veritabanına kaydet
    console.log('\n5️⃣ Blog veritabanına kaydediliyor...');
    
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
    await blog.populate('author', 'name email');
    
    console.log('✅ Blog başarıyla kaydedildi!');
    console.log(`   🆔 Blog ID: ${blog._id}`);
    console.log(`   🔗 Slug: ${blog.slug}`);
    console.log(`   ⏱️  Okuma süresi: ${blog.readingTime} dakika`);
    console.log(`   👤 Yazar: ${blog.author.name}`);

    // 6. Özet rapor
    console.log('\n📊 Test Raporu:');
    console.log('━'.repeat(50));
    console.log(`✅ Test Başarılı`);
    console.log(`⏱️  Toplam Süre: ${duration}s`);
    console.log(`📝 Oluşturulan Blog: ${blog.title}`);
    console.log(`🆔 Blog ID: ${blog._id}`);
    console.log('━'.repeat(50));
    
    console.log('\n💡 Blog\'u görüntülemek için:');
    console.log(`   GET http://localhost:5000/api/blogs/${blog.slug}`);
    
  } catch (error) {
    console.error('\n❌ Test Hatası:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // MongoDB bağlantısını kapat
    await mongoose.connection.close();
    console.log('\n👋 MongoDB bağlantısı kapatıldı');
  }
};

// Script'i çalıştır
(async () => {
  await connectDB();
  await testAIBlog();
})();

