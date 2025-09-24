const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Blog = require('../models/Blog');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Test verileri oluşturuluyor...\n');
    
    // Admin kullanıcısını bul
    const adminUser = await User.findOne({ email: 'admin@user.com' });
    
    if (!adminUser) {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      return;
    }
    
    console.log(`✅ Admin kullanıcısı bulundu: ${adminUser.name}`);
    
    // Mevcut blogları temizle
    await Blog.deleteMany({});
    console.log('🗑️  Eski bloglar temizlendi');
    
    // Test blogları oluştur
    const blogs = [
      {
        title: 'Node.js ile Modern Backend Geliştirme',
        content: `Node.js kullanarak modern bir backend API nasıl geliştirilir konusunu ele alacağız. Bu kapsamlı rehberde Express.js framework'ü ile RESTful API oluşturma, MongoDB veritabanı entegrasyonu, JWT authentication sistemi ve daha birçok konuyu detaylı bir şekilde inceleyeceğiz.

## Express.js ile API Geliştirme

Express.js, Node.js için minimalist ve esnek bir web framework'üdür. RESTful API'ler oluşturmak için mükemmel bir seçimdir.

### Temel Yapı
- Middleware kullanımı
- Route yönetimi
- Error handling
- Validation

## MongoDB Entegrasyonu

Mongoose ODM kullanarak MongoDB ile etkili bir şekilde çalışabilirsiniz.

### Özellikler
- Schema tanımlama
- Validation
- Middleware hooks
- Population

## JWT Authentication

Güvenli authentication sistemi için JWT token'larını kullanın.

### Avantajlar
- Stateless
- Scalable
- Secure
- Flexible

Bu rehber ile modern backend geliştirme konusunda kapsamlı bilgi sahibi olacaksınız.`,
        excerpt: 'Node.js kullanarak modern backend API geliştirme rehberi',
        category: 'Yazılım Geliştirme',
        tags: ['nodejs', 'express', 'mongodb', 'jwt', 'api'],
        author: adminUser._id,
        isPublished: true
      },
      {
        title: 'React ile Modern Frontend Geliştirme',
        content: `React kütüphanesi ile modern web uygulamaları geliştirmeyi öğrenin. Bu kapsamlı rehberde React'in temel kavramlarından ileri seviye tekniklere kadar her şeyi ele alacağız.

## React Temelleri

- Component yapısı
- Props ve State
- Event handling
- Lifecycle methods

## Hooks Kullanımı

Modern React uygulamalarında hooks'ları etkili bir şekilde kullanın.

### Temel Hooks
- useState
- useEffect
- useContext
- useReducer

## State Management

Redux ve Context API ile state yönetimi.

### Redux
- Actions
- Reducers
- Store
- Middleware

Bu rehber ile React konusunda uzman seviyesine ulaşacaksınız.`,
        excerpt: 'React ile modern frontend geliştirme rehberi',
        category: 'Web Tasarım',
        tags: ['react', 'javascript', 'frontend', 'hooks'],
        author: adminUser._id,
        isPublished: true
      },
      {
        title: 'MongoDB Veritabanı Tasarımı',
        content: `MongoDB ile etkili veritabanı tasarımı yapmayı öğrenin. NoSQL veritabanlarının avantajlarını keşfedin.

## NoSQL vs SQL

MongoDB'nin SQL veritabanlarına göre avantajlarını inceleyelim.

### Avantajlar
- Esnek schema
- Horizontal scaling
- JSON-like documents
- Fast queries

## Schema Tasarımı

MongoDB için optimal schema tasarımı.

### Prensipler
- Embedding vs Referencing
- Index optimization
- Data modeling
- Performance tuning

## Query Optimization

MongoDB sorgularını optimize etme teknikleri.

### Teknikler
- Index kullanımı
- Aggregation pipeline
- Query profiling
- Performance monitoring

Bu rehber ile MongoDB konusunda uzman olacaksınız.`,
        excerpt: 'MongoDB ile etkili veritabanı tasarımı',
        category: 'Veri Bilimi',
        tags: ['mongodb', 'database', 'nosql', 'optimization'],
        author: adminUser._id,
        isPublished: true
      },
      {
        title: 'Docker ile Containerization',
        content: `Docker kullanarak uygulamalarınızı containerize etmeyi öğrenin. Modern deployment stratejilerini keşfedin.

## Docker Temelleri

Docker'ın temel kavramlarını öğrenin.

### Kavramlar
- Images
- Containers
- Dockerfile
- Docker Compose

## Production Deployment

Docker ile production ortamında deployment.

### Stratejiler
- Multi-stage builds
- Security best practices
- Monitoring
- Scaling

## Kubernetes Entegrasyonu

Kubernetes ile container orchestration.

### Özellikler
- Pod management
- Service discovery
- Load balancing
- Auto-scaling

Bu rehber ile DevOps konusunda uzman seviyesine ulaşacaksınız.`,
        excerpt: 'Docker ile modern deployment stratejileri',
        category: 'Teknoloji',
        tags: ['docker', 'kubernetes', 'devops', 'deployment'],
        author: adminUser._id,
        isPublished: true
      },
      {
        title: 'JavaScript ES6+ Özellikleri',
        content: `Modern JavaScript'in ES6 ve sonrası özelliklerini öğrenin. Kod kalitesini artırın.

## ES6 Özellikleri

- Arrow functions
- Template literals
- Destructuring
- Spread operator

## ES2017+ Özellikleri

- Async/await
- Object.entries()
- String padding
- Shared memory

## Best Practices

Modern JavaScript geliştirme best practice'leri.

### Teknikler
- Code organization
- Error handling
- Performance optimization
- Testing strategies

Bu rehber ile JavaScript konusunda uzman olacaksınız.`,
        excerpt: 'Modern JavaScript özellikleri ve best practice\'leri',
        category: 'Yazılım Geliştirme',
        tags: ['javascript', 'es6', 'modern-js', 'best-practices'],
        author: adminUser._id,
        isPublished: true
      }
    ];
    
    // Blogları oluştur
    const createdBlogs = await Blog.insertMany(blogs);
    console.log(`✅ ${createdBlogs.length} test blogu oluşturuldu`);
    
    // Blog detaylarını göster
    createdBlogs.forEach((blog, index) => {
      console.log(`   ${index + 1}. ${blog.title}`);
      console.log(`      Slug: ${blog.slug}`);
      console.log(`      Kategori: ${blog.category}`);
      console.log(`      Etiketler: ${blog.tags.join(', ')}`);
    });
    
    console.log('\n🎉 Test verileri başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('❌ Test veri oluşturma hatası:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔄 MongoDB bağlantısı kapatıldı');
  }
};

// CLI argument kontrolü
if (require.main === module) {
  seedData();
}

module.exports = seedData;
