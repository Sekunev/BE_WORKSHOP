#!/usr/bin/env node

const ProjectAnalyzer = require('./projectAnalyzer');

console.log('🔍 Proje analizi yapılıyor...\n');

try {
  const analyzer = new ProjectAnalyzer();
  const analysis = analyzer.analyzeProject();
  
  console.log('📊 PROJE ANALİZ RAPORU');
  console.log('='.repeat(50));
  
  // Genel bilgiler
  console.log('\n📈 GENEL İSTATİSTİKLER');
  console.log(`   • Toplam Endpoint: ${analysis.stats.totalEndpoints}`);
  console.log(`   • Toplam Model: ${analysis.stats.totalModels}`);
  console.log(`   • Toplam Middleware: ${analysis.stats.totalMiddlewares}`);
  console.log(`   • Analiz Tarihi: ${new Date(analysis.timestamp).toLocaleString('tr-TR')}`);
  
  // Method dağılımı
  console.log('\n🔄 HTTP METHOD DAĞILIMI');
  Object.entries(analysis.stats.endpointsByMethod).forEach(([method, count]) => {
    const percentage = ((count / analysis.stats.totalEndpoints) * 100).toFixed(1);
    console.log(`   • ${method}: ${count} (${percentage}%)`);
  });
  
  // Erişim dağılımı
  console.log('\n🔐 ERİŞİM DAĞILIMI');
  Object.entries(analysis.stats.endpointsByAccess).forEach(([access, count]) => {
    const percentage = ((count / analysis.stats.totalEndpoints) * 100).toFixed(1);
    console.log(`   • ${access}: ${count} (${percentage}%)`);
  });
  
  // Route dağılımı
  console.log('\n🛣️ ROUTE DAĞILIMI');
  Object.entries(analysis.stats.endpointsByRoute).forEach(([route, count]) => {
    console.log(`   • /api/${route.toLowerCase()}: ${count} endpoint`);
  });
  
  // Endpoint detayları
  console.log('\n📋 ENDPOINT DETAYLARI');
  analysis.endpoints.forEach((endpoint, index) => {
    const methodEmoji = {
      'GET': '🔍',
      'POST': '➕',
      'PUT': '✏️',
      'DELETE': '🗑️',
      'PATCH': '🔧'
    }[endpoint.method] || '📡';
    
    const accessEmoji = endpoint.access.includes('Admin') ? '👑' : 
                       endpoint.access.includes('Private') ? '🔒' : '🌐';
    
    console.log(`   ${index + 1}. ${methodEmoji} ${endpoint.method} ${endpoint.path}`);
    console.log(`      ${accessEmoji} ${endpoint.access} | ${endpoint.summary}`);
  });
  
  // Model detayları
  console.log('\n📋 MODEL DETAYLARI');
  analysis.models.forEach(model => {
    console.log(`   • ${model.name}: ${model.fields.length} field`);
    model.fields.forEach(field => {
      const required = field.required ? ' (required)' : '';
      console.log(`     - ${field.name}: ${field.type}${required}`);
    });
  });
  
  // Middleware detayları
  console.log('\n🔧 MIDDLEWARE DETAYLARI');
  analysis.middlewares.forEach(middleware => {
    console.log(`   • ${middleware.name}`);
  });
  
  // Öneriler
  console.log('\n💡 ÖNERİLER');
  
  if (analysis.stats.endpointsByMethod.POST < 3) {
    console.log('   • POST endpoint sayısı düşük, daha fazla oluşturma endpoint\'i ekleyebilirsiniz');
  }
  
  if (analysis.stats.endpointsByAccess.Private < analysis.stats.totalEndpoints * 0.5) {
    console.log('   • Güvenlik için daha fazla private endpoint ekleyebilirsiniz');
  }
  
  if (analysis.stats.totalModels < 3) {
    console.log('   • Daha fazla veri modeli ekleyerek projeyi genişletebilirsiniz');
  }
  
  console.log('\n✅ Analiz tamamlandı!');
  console.log('📝 Detaylı rapor için: npm run docs:update');
  
} catch (error) {
  console.error('❌ Analiz hatası:', error.message);
  process.exit(1);
}
