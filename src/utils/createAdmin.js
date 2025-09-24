const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model'ini import et
const User = require('../models/User');

// MongoDB bağlantısı
const connectDB = require('../config/database');

const createAdmin = async () => {
  try {
    // MongoDB'ye bağlan
    await connectDB();
    
    console.log('🔐 Admin kullanıcısı oluşturuluyor...\n');
    
    // Admin bilgileri
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'admin',
      bio: 'Sistem yöneticisi'
    };
    
    // E-posta zaten var mı kontrol et
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Bu e-posta adresi zaten kullanılıyor!');
      console.log('   Mevcut kullanıcıyı admin yapmak için:');
      console.log('   npm run make-admin -- --email=admin@example.com');
      return;
    }
    
    // Admin kullanıcısını oluştur
    const admin = await User.create(adminData);
    
    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('\n📋 Admin Bilgileri:');
    console.log(`   • İsim: ${admin.name}`);
    console.log(`   • E-posta: ${admin.email}`);
    console.log(`   • Şifre: ${adminData.password}`);
    console.log(`   • Rol: ${admin.role}`);
    console.log(`   • ID: ${admin._id}`);
    
    console.log('\n🔑 Giriş yapmak için:');
    console.log('   POST /api/auth/login');
    console.log(`   { "email": "${admin.email}", "password": "${adminData.password}" }`);
    
  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error.message);
  } finally {
    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('\n🔄 MongoDB bağlantısı kapatıldı');
  }
};

// Mevcut kullanıcıyı admin yapma fonksiyonu
const makeUserAdmin = async (email) => {
  try {
    await connectDB();
    
    console.log(`🔐 ${email} kullanıcısı admin yapılıyor...\n`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı!');
      return;
    }
    
    if (user.role === 'admin') {
      console.log('⚠️  Bu kullanıcı zaten admin!');
      return;
    }
    
    user.role = 'admin';
    await user.save();
    
    console.log('✅ Kullanıcı başarıyla admin yapıldı!');
    console.log(`   • İsim: ${user.name}`);
    console.log(`   • E-posta: ${user.email}`);
    console.log(`   • Yeni Rol: ${user.role}`);
    
  } catch (error) {
    console.error('❌ Admin yapma hatası:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

// CLI argument'larını kontrol et
const args = process.argv.slice(2);
const emailArg = args.find(arg => arg.startsWith('--email='));
const email = emailArg ? emailArg.split('=')[1] : null;

if (email) {
  makeUserAdmin(email);
} else {
  createAdmin();
}
