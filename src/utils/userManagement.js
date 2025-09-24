const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const connectDB = require('../config/database');

class UserManager {
  async connect() {
    await connectDB();
  }

  async disconnect() {
    await mongoose.connection.close();
  }

  // Tüm kullanıcıları listele
  async listUsers() {
    try {
      await this.connect();
      
      const users = await User.find().select('-password');
      
      console.log('👥 Tüm Kullanıcılar:');
      console.log('='.repeat(80));
      
      if (users.length === 0) {
        console.log('   Henüz kullanıcı bulunmuyor.');
        return;
      }
      
      users.forEach((user, index) => {
        const roleEmoji = user.role === 'admin' ? '👑' : '👤';
        const statusEmoji = user.isActive ? '✅' : '❌';
        
        console.log(`${index + 1}. ${roleEmoji} ${user.name}`);
        console.log(`   • E-posta: ${user.email}`);
        console.log(`   • Rol: ${user.role}`);
        console.log(`   • Durum: ${statusEmoji} ${user.isActive ? 'Aktif' : 'Pasif'}`);
        console.log(`   • Kayıt: ${user.createdAt.toLocaleDateString('tr-TR')}`);
        console.log(`   • Son Giriş: ${user.lastLogin ? user.lastLogin.toLocaleDateString('tr-TR') : 'Hiç giriş yapmamış'}`);
        console.log(`   • ID: ${user._id}`);
        console.log('');
      });
      
      console.log(`📊 Toplam: ${users.length} kullanıcı`);
      
    } catch (error) {
      console.error('❌ Kullanıcı listeleme hatası:', error.message);
    } finally {
      await this.disconnect();
    }
  }

  // Kullanıcı detayları
  async getUserDetails(email) {
    try {
      await this.connect();
      
      const user = await User.findOne({ email }).select('-password');
      
      if (!user) {
        console.log('❌ Kullanıcı bulunamadı!');
        return;
      }
      
      const roleEmoji = user.role === 'admin' ? '👑' : '👤';
      const statusEmoji = user.isActive ? '✅' : '❌';
      
      console.log(`${roleEmoji} Kullanıcı Detayları:`);
      console.log('='.repeat(50));
      console.log(`   • İsim: ${user.name}`);
      console.log(`   • E-posta: ${user.email}`);
      console.log(`   • Rol: ${user.role}`);
      console.log(`   • Bio: ${user.bio || 'Belirtilmemiş'}`);
      console.log(`   • Avatar: ${user.avatar || 'Yok'}`);
      console.log(`   • Durum: ${statusEmoji} ${user.isActive ? 'Aktif' : 'Pasif'}`);
      console.log(`   • Kayıt Tarihi: ${user.createdAt.toLocaleString('tr-TR')}`);
      console.log(`   • Son Güncelleme: ${user.updatedAt.toLocaleString('tr-TR')}`);
      console.log(`   • Son Giriş: ${user.lastLogin ? user.lastLogin.toLocaleString('tr-TR') : 'Hiç giriş yapmamış'}`);
      console.log(`   • ID: ${user._id}`);
      
    } catch (error) {
      console.error('❌ Kullanıcı detay hatası:', error.message);
    } finally {
      await this.disconnect();
    }
  }

  // Kullanıcıyı admin yap
  async makeAdmin(email) {
    try {
      await this.connect();
      
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
      await this.disconnect();
    }
  }

  // Kullanıcıyı user yap
  async makeUser(email) {
    try {
      await this.connect();
      
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('❌ Kullanıcı bulunamadı!');
        return;
      }
      
      if (user.role === 'user') {
        console.log('⚠️  Bu kullanıcı zaten user!');
        return;
      }
      
      user.role = 'user';
      await user.save();
      
      console.log('✅ Kullanıcı başarıyla user yapıldı!');
      console.log(`   • İsim: ${user.name}`);
      console.log(`   • E-posta: ${user.email}`);
      console.log(`   • Yeni Rol: ${user.role}`);
      
    } catch (error) {
      console.error('❌ User yapma hatası:', error.message);
    } finally {
      await this.disconnect();
    }
  }

  // Kullanıcıyı aktif/pasif yap
  async toggleUserStatus(email) {
    try {
      await this.connect();
      
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('❌ Kullanıcı bulunamadı!');
        return;
      }
      
      user.isActive = !user.isActive;
      await user.save();
      
      const status = user.isActive ? 'aktif' : 'pasif';
      console.log(`✅ Kullanıcı ${status} yapıldı!`);
      console.log(`   • İsim: ${user.name}`);
      console.log(`   • E-posta: ${user.email}`);
      console.log(`   • Yeni Durum: ${user.isActive ? 'Aktif' : 'Pasif'}`);
      
    } catch (error) {
      console.error('❌ Durum değiştirme hatası:', error.message);
    } finally {
      await this.disconnect();
    }
  }

  // Kullanıcı sil
  async deleteUser(email) {
    try {
      await this.connect();
      
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('❌ Kullanıcı bulunamadı!');
        return;
      }
      
      await User.findByIdAndDelete(user._id);
      
      console.log('✅ Kullanıcı başarıyla silindi!');
      console.log(`   • İsim: ${user.name}`);
      console.log(`   • E-posta: ${user.email}`);
      
    } catch (error) {
      console.error('❌ Kullanıcı silme hatası:', error.message);
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = UserManager;
