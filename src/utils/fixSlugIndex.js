const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');

const fixSlugIndex = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Slug index düzeltiliyor...\n');
    
    // Mevcut index'leri listele
    const indexes = await mongoose.connection.db.collection('blogs').indexes();
    console.log('Mevcut index\'ler:', indexes.map(i => i.name));
    
    // Slug index'ini kaldır
    try {
      await mongoose.connection.db.collection('blogs').dropIndex('slug_1');
      console.log('✅ Eski slug index kaldırıldı');
    } catch (error) {
      console.log('⚠️  Slug index zaten yok veya kaldırılamadı');
    }
    
    // Yeni sparse index oluştur
    await mongoose.connection.db.collection('blogs').createIndex(
      { slug: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('✅ Yeni slug index oluşturuldu (sparse: true)');
    
    // Index'leri tekrar listele
    const newIndexes = await mongoose.connection.db.collection('blogs').indexes();
    console.log('\nYeni index\'ler:', newIndexes.map(i => i.name));
    
  } catch (error) {
    console.error('❌ Index düzeltme hatası:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔄 MongoDB bağlantısı kapatıldı');
  }
};

fixSlugIndex();
