#!/usr/bin/env node

const DocGenerator = require('./docGenerator');
const fs = require('fs');
const path = require('path');

console.log('📤 Dokümantasyon export işlemi başlatılıyor...\n');

try {
  const docGenerator = new DocGenerator();
  
  // JSON export
  console.log('📋 JSON formatında export yapılıyor...');
  const jsonPath = docGenerator.exportEndpointsToJson();
  
  // Markdown export
  console.log('📝 Markdown formatında export yapılıyor...');
  const mdPath = docGenerator.generateProjectStatusDoc();
  
  // HTML export (basit)
  console.log('🌐 HTML formatında export yapılıyor...');
  const htmlPath = docGenerator.exportToHtml();
  
  console.log('\n✅ Export işlemi tamamlandı!');
  console.log(`   • JSON: ${jsonPath}`);
  console.log(`   • Markdown: ${mdPath}`);
  console.log(`   • HTML: ${htmlPath}`);
  
  // Dosya boyutları
  const jsonSize = fs.statSync(jsonPath).size;
  const mdSize = fs.statSync(mdPath).size;
  const htmlSize = fs.statSync(htmlPath).size;
  
  console.log('\n📊 Dosya Boyutları:');
  console.log(`   • JSON: ${(jsonSize / 1024).toFixed(2)} KB`);
  console.log(`   • Markdown: ${(mdSize / 1024).toFixed(2)} KB`);
  console.log(`   • HTML: ${(htmlSize / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Export hatası:', error.message);
  process.exit(1);
}
