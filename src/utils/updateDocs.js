#!/usr/bin/env node

const DocGenerator = require('./docGenerator');
const ProjectAnalyzer = require('./projectAnalyzer');

console.log('🚀 Proje dokümantasyonu güncelleniyor...\n');

try {
  const docGenerator = new DocGenerator();
  const analyzer = new ProjectAnalyzer();
  
  // Proje analizi yap
  console.log('📊 Proje analizi yapılıyor...');
  const analysis = analyzer.analyzeProject();
  
  // İstatistikleri göster
  console.log('\n📈 Mevcut Durum:');
  console.log(`   • Toplam Endpoint: ${analysis.stats.totalEndpoints}`);
  console.log(`   • Toplam Model: ${analysis.stats.totalModels}`);
  console.log(`   • Toplam Middleware: ${analysis.stats.totalMiddlewares}`);
  
  // Method dağılımı
  console.log('\n🔄 Method Dağılımı:');
  Object.entries(analysis.stats.endpointsByMethod).forEach(([method, count]) => {
    console.log(`   • ${method}: ${count}`);
  });
  
  // Erişim dağılımı
  console.log('\n🔐 Erişim Dağılımı:');
  Object.entries(analysis.stats.endpointsByAccess).forEach(([access, count]) => {
    console.log(`   • ${access}: ${count}`);
  });
  
  // Dokümantasyon oluştur
  console.log('\n📝 Dokümantasyon oluşturuluyor...');
  const docPath = docGenerator.generateProjectStatusDoc();
  
  // JSON export
  console.log('📤 JSON export yapılıyor...');
  const jsonPath = docGenerator.exportEndpointsToJson();
  
  console.log('\n✅ Dokümantasyon başarıyla güncellendi!');
  console.log(`   • Markdown: ${docPath}`);
  console.log(`   • JSON: ${jsonPath}`);
  
  // Yeni endpoint'ler var mı kontrol et
  const newEndpoints = analysis.endpoints.filter(endpoint => 
    endpoint.summary.includes('Yeni') || endpoint.summary.includes('Eklenen')
  );
  
  if (newEndpoints.length > 0) {
    console.log('\n🆕 Yeni endpoint\'ler tespit edildi:');
    newEndpoints.forEach(endpoint => {
      console.log(`   • ${endpoint.method} ${endpoint.path} - ${endpoint.summary}`);
    });
  }
  
} catch (error) {
  console.error('❌ Hata:', error.message);
  process.exit(1);
}
