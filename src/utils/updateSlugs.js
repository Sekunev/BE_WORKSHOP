const mongoose = require('mongoose');
require('dotenv').config();

const Blog = require('../models/Blog');
const connectDB = require('../config/database');

const updateSlugs = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Slug\'lar güncelleniyor...\n');
    
    // Tüm blogları getir
    const blogs = await Blog.find({});
    console.log(`📋 ${blogs.length} blog bulundu`);
    
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      
      // Türkçe karakterleri dönüştür
      const turkishChars = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
      };
      
      let slug = blog.title;
      
      // Türkçe karakterleri değiştir
      for (const [turkish, english] of Object.entries(turkishChars)) {
        slug = slug.replace(new RegExp(turkish, 'g'), english);
      }
      
      // Slug oluştur
      slug = slug
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Özel karakterleri kaldır
        .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
        .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
        .replace(/^-|-$/g, ''); // Başta ve sonda tire varsa kaldır
      
      // Eğer slug boşsa, ID kullan
      if (!slug) {
        slug = blog._id.toString();
      }
      
      // Blog'u güncelle
      blog.slug = slug;
      await blog.save();
      
      console.log(`${i + 1}. ${blog.title}`);
      console.log(`   Slug: ${slug}`);
    }
    
    console.log('\n✅ Tüm slug\'lar güncellendi!');
    
  } catch (error) {
    console.error('❌ Slug güncelleme hatası:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔄 MongoDB bağlantısı kapatıldı');
  }
};

updateSlugs();
