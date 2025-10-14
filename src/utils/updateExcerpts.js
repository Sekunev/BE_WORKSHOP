const mongoose = require('mongoose');
const Blog = require('../models/Blog');
require('dotenv').config();

/**
 * Markdown karakterlerini temizle
 */
const cleanMarkdown = (text) => {
  if (!text) return '';
  
  // JSON formatındaki content'i extract et
  let content = text;
  
  // Eğer JSON formatındaysa, content alanını çıkar
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      // Kontrol karakterlerini temizle
      let cleanedJson = jsonMatch[0]
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Kontrol karakterlerini kaldır
        .replace(/\n/g, '\\n') // Newline'ları escape et
        .replace(/\r/g, '\\r') // Carriage return'leri escape et
        .replace(/\t/g, '\\t'); // Tab'ları escape et
      
      const jsonData = JSON.parse(cleanedJson);
      if (jsonData.content) {
        content = jsonData.content;
      }
    }
  } catch (e) {
    // JSON parse edilemezse, orijinal text'i kullan
    console.log('JSON parse edilemedi, orijinal text kullanılıyor');
  }
  
  return content
    .replace(/#{1,6}\s+/g, '') // Başlık işaretlerini kaldır
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold işaretlerini kaldır
    .replace(/\*(.*?)\*/g, '$1') // Italic işaretlerini kaldır
    .replace(/`(.*?)`/g, '$1') // Inline kod işaretlerini kaldır
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Link metnini al
    .replace(/^[-*+]\s+/gm, '') // Liste işaretlerini kaldır
    .replace(/^\d+\.\s+/gm, '') // Numaralı liste işaretlerini kaldır
    .replace(/\n+/g, ' ') // Çoklu newline'ları tek space'e çevir
    .replace(/\s+/g, ' ') // Çoklu space'leri tek space'e çevir
    .trim();
};

/**
 * İçerikten temiz excerpt oluştur
 */
const createCleanExcerpt = (content, maxLength = 150) => {
  if (!content) return 'Blog özeti mevcut değil...';
  
  const cleaned = cleanMarkdown(content);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength).replace(/\s+\w*$/, '') + '...';
};

/**
 * Mevcut blogların excerpt'lerini güncelle
 */
const updateBlogExcerpts = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-api');
    console.log('✅ MongoDB bağlantısı başarılı');

    // Tüm blogları getir
    const blogs = await Blog.find({});
    console.log(`📝 ${blogs.length} blog bulundu`);

    let updatedCount = 0;

    for (const blog of blogs) {
      // Mevcut excerpt'i kontrol et
      const currentExcerpt = blog.excerpt || '';
      
      // Eğer excerpt Markdown karakterleri içeriyorsa, JSON formatında ise, çok uzunsa veya eksikse güncelle
      if (!currentExcerpt || 
          currentExcerpt.trim() === '' ||
          currentExcerpt.includes('#') || 
          currentExcerpt.includes('**') || 
          currentExcerpt.includes('`') ||
          currentExcerpt.includes('{') ||
          currentExcerpt.includes('"title"') ||
          currentExcerpt.includes('"content"') ||
          currentExcerpt.length > 200) {
        
        const newExcerpt = createCleanExcerpt(blog.content);
        
        await Blog.findByIdAndUpdate(blog._id, {
          excerpt: newExcerpt
        });
        
        console.log(`✅ Güncellendi: ${blog.title.substring(0, 50)}...`);
        console.log(`   Eski: ${currentExcerpt.substring(0, 100)}...`);
        console.log(`   Yeni: ${newExcerpt.substring(0, 100)}...`);
        console.log('');
        
        updatedCount++;
      }
    }

    console.log(`🎉 Toplam ${updatedCount} blog excerpt'i güncellendi`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
};

// Script çalıştır
if (require.main === module) {
  updateBlogExcerpts();
}

module.exports = { updateBlogExcerpts, cleanMarkdown, createCleanExcerpt };
