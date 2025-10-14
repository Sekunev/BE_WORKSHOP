const axios = require('axios');

async function testFix() {
  try {
    console.log('🔐 Login yapılıyor...\n');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@user.com',
      password: '123456'
    });
    
    const token = loginResponse.data.data.accessToken.token;
    console.log('✅ Login başarılı!');
    console.log(`🎫 Token: ${token.substring(0, 40)}...\n`);
    
    console.log('🤖 Rastgele AI blog oluşturuluyor (JSON parse fix testi)...');
    console.log('⏳ Bekleyin...\n');
    
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:5000/api/blogs/ai/generate-random', {
      autoPublish: false  // İlk test için taslak olarak
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('✅ AI Blog başarıyla oluşturuldu!');
    console.log(`⏱️  Süre: ${duration}s\n`);
    
    console.log('📊 Test Sonuçları:');
    console.log('━'.repeat(50));
    console.log(`✅ JSON Parse: Başarılı`);
    console.log(`✅ Token Auth: Başarılı`);
    console.log(`✅ Blog Oluşturma: Başarılı`);
    console.log('━'.repeat(50));
    
    console.log('\n📄 Blog:');
    console.log(`   Başlık: ${response.data.data.blog.title}`);
    console.log(`   Konu: ${response.data.data.blog.aiMetadata?.konu || 'N/A'}`);
    console.log(`   Durum: ${response.data.data.blog.isPublished ? 'Yayında' : 'Taslak'}`);
    
    console.log('\n💡 Postman için token (7 gün geçerli):');
    console.log(token);
    
  } catch (error) {
    console.error('\n❌ Test Hatası!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mesaj:', error.response.data.message);
    } else {
      console.error(error.message);
    }
  }
}

testFix();

