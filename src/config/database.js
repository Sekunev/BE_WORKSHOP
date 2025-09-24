const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-api', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB bağlandı: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

// MongoDB bağlantı event'leri
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose MongoDB\'ye bağlandı');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose MongoDB bağlantısı kesildi');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔄 MongoDB bağlantısı kapatıldı');
  process.exit(0);
});

module.exports = connectDB;
