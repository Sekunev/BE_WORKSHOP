const axios = require('axios');

async function testAIBlog() {
  try {
    console.log('🔐 1. Login yapılıyor...\n');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@user.com',
      password: '123456'
    });
    
    const token = loginResponse.data.data.accessToken.token;
    console.log('✅ Login başarılı!');
    console.log('🎫 Token alındı\n');
    
    // AI Blog oluştur
    console.log('🤖 2. AI ile blog oluşturuluyor...');
    console.log('⏳ Bu işlem 10-30 saniye sürebilir...\n');
    
    const startTime = Date.now();
    
    const aiResponse = await axios.post('http://localhost:5000/api/blogs/ai/generate', {
      konu: 'Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?',
      tarz: 'profesyonel',
      kelimeSayisi: 1200,
      hedefKitle: 'profesyoneller',
      autoPublish: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('✅ AI Blog başarıyla oluşturuldu!');
    console.log(`⏱️  Süre: ${duration} saniye\n`);
    
    console.log('📄 Blog Detayları:');
    console.log('━'.repeat(50));
    console.log(`📌 Başlık: ${aiResponse.data.data.blog.title}`);
    console.log(`📁 Kategori: ${aiResponse.data.data.blog.category}`);
    console.log(`🏷️  Etiketler: ${aiResponse.data.data.blog.tags.join(', ')}`);
    console.log(`🆔 Blog ID: ${aiResponse.data.data.blog._id}`);
    console.log(`🔗 Slug: ${aiResponse.data.data.blog.slug}`);
    console.log(`📊 Yayın Durumu: ${aiResponse.data.data.blog.isPublished ? '✅ Yayında' : '❌ Taslak'}`);
    console.log('━'.repeat(50));
    
    if (aiResponse.data.data.blog.aiMetadata) {
      console.log('\n🤖 AI Metadata:');
      console.log(`   Model: ${aiResponse.data.data.blog.aiMetadata.model}`);
      console.log(`   Tarz: ${aiResponse.data.data.blog.aiMetadata.tarz}`);
      console.log(`   Kelime Sayısı: ${aiResponse.data.data.blog.aiMetadata.kelimeSayisi}`);
      console.log(`   Hedef Kitle: ${aiResponse.data.data.blog.aiMetadata.hedefKitle}`);
    }
    
    console.log('\n✨ Test başarıyla tamamlandı!');
    
  } catch (error) {
    console.error('\n❌ Hata!');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Hata:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Hata:', error.message);
    }
  }
}

testAIBlog();

