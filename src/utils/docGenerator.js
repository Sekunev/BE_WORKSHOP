const fs = require('fs');
const path = require('path');
const ProjectAnalyzer = require('./projectAnalyzer');

class DocGenerator {
  constructor() {
    this.projectRoot = path.join(__dirname, '../..');
    this.analyzer = new ProjectAnalyzer();
  }

  // Proje durumu dokümantasyonu oluşturur
  generateProjectStatusDoc() {
    const analysis = this.analyzer.analyzeProject();
    
    const doc = this.createProjectStatusMarkdown(analysis);
    
    const docPath = path.join(this.projectRoot, 'PROJECT_STATUS.md');
    fs.writeFileSync(docPath, doc, 'utf8');
    
    console.log('✅ Proje durumu dokümantasyonu güncellendi: PROJECT_STATUS.md');
    return docPath;
  }

  // Markdown formatında proje durumu oluşturur
  createProjectStatusMarkdown(analysis) {
    const { endpoints, models, middlewares, stats, timestamp } = analysis;
    
    let markdown = `# 📊 Proje Durumu Raporu

> Son güncelleme: ${new Date(timestamp).toLocaleString('tr-TR')}

## 📈 Genel İstatistikler

| Metrik | Değer |
|--------|-------|
| **Toplam Endpoint** | ${stats.totalEndpoints} |
| **Toplam Model** | ${stats.totalModels} |
| **Toplam Middleware** | ${stats.totalMiddlewares} |

## 🔄 Endpoint Dağılımı

### HTTP Method'lara Göre
${this.createMethodStatsTable(stats.endpointsByMethod)}

### Erişim Yetkisine Göre
${this.createAccessStatsTable(stats.endpointsByAccess)}

### Route'lara Göre
${this.createRouteStatsTable(stats.endpointsByRoute)}

## 🛠️ API Endpoints

${this.createEndpointsTable(endpoints)}

## 📋 Veritabanı Modelleri

${this.createModelsTable(models)}

## 🔧 Middleware'ler

${this.createMiddlewaresTable(middlewares)}

## 📝 Son Değişiklikler

Bu dokümantasyon otomatik olarak oluşturulmuştur. Yeni endpoint eklediğinizde:

1. Route dosyasına Swagger dokümantasyonu ekleyin
2. \`npm run docs:update\` komutunu çalıştırın
3. Bu dokümantasyon otomatik güncellenecektir

## 🔍 Endpoint Detayları

${this.createDetailedEndpoints(endpoints)}

---

*Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde otomatik oluşturulmuştur.*
`;

    return markdown;
  }

  // Method istatistikleri tablosu
  createMethodStatsTable(methodStats) {
    let table = '| Method | Sayı |\n|--------|------|\n';
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    methods.forEach(method => {
      const count = methodStats[method] || 0;
      table += `| ${method} | ${count} |\n`;
    });
    
    return table;
  }

  // Erişim istatistikleri tablosu
  createAccessStatsTable(accessStats) {
    let table = '| Erişim | Sayı |\n|--------|------|\n';
    
    Object.entries(accessStats).forEach(([access, count]) => {
      const emoji = access === 'Private' ? '🔒' : access === 'Private/Admin' ? '👑' : '🌐';
      table += `| ${emoji} ${access} | ${count} |\n`;
    });
    
    return table;
  }

  // Route istatistikleri tablosu
  createRouteStatsTable(routeStats) {
    let table = '| Route | Endpoint Sayısı |\n|-------|-----------------|\n';
    
    Object.entries(routeStats).forEach(([route, count]) => {
      table += `| /api/${route.toLowerCase()} | ${count} |\n`;
    });
    
    return table;
  }

  // Endpoint'ler tablosu
  createEndpointsTable(endpoints) {
    let table = '| Method | Endpoint | Açıklama | Erişim | Route |\n';
    table += '|--------|----------|----------|--------|-------|\n';
    
    endpoints.forEach(endpoint => {
      const methodEmoji = this.getMethodEmoji(endpoint.method);
      const accessEmoji = this.getAccessEmoji(endpoint.access);
      
      table += `| ${methodEmoji} ${endpoint.method} | \`${endpoint.path}\` | ${endpoint.summary} | ${accessEmoji} ${endpoint.access} | ${endpoint.routeName} |\n`;
    });
    
    return table;
  }

  // Modeller tablosu
  createModelsTable(models) {
    let table = '| Model | Field Sayısı | Field\'lar |\n';
    table += '|-------|--------------|----------|\n';
    
    models.forEach(model => {
      const fieldCount = model.fields.length;
      const fields = model.fields.map(field => 
        `${field.name} (${field.type}${field.required ? ', **required**' : ''})`
      ).join(', ');
      
      table += `| ${model.name} | ${fieldCount} | ${fields} |\n`;
    });
    
    return table;
  }

  // Middleware'ler tablosu
  createMiddlewaresTable(middlewares) {
    let table = '| Middleware | Açıklama |\n';
    table += '|------------|----------|\n';
    
    const middlewareDescriptions = {
      'auth': 'JWT token doğrulama ve yetkilendirme',
      'errorHandler': 'Merkezi hata yakalama sistemi',
      'validation': 'Input validation kontrolü'
    };
    
    middlewares.forEach(middleware => {
      const description = middlewareDescriptions[middleware.name] || 'Middleware açıklaması';
      table += `| ${middleware.name} | ${description} |\n`;
    });
    
    return table;
  }

  // Detaylı endpoint listesi
  createDetailedEndpoints(endpoints) {
    let details = '';
    
    // Route'lara göre grupla
    const groupedEndpoints = endpoints.reduce((acc, endpoint) => {
      if (!acc[endpoint.routeName]) {
        acc[endpoint.routeName] = [];
      }
      acc[endpoint.routeName].push(endpoint);
      return acc;
    }, {});
    
    Object.entries(groupedEndpoints).forEach(([routeName, routeEndpoints]) => {
      details += `### ${routeName.toUpperCase()} Routes\n\n`;
      
      routeEndpoints.forEach(endpoint => {
        const methodEmoji = this.getMethodEmoji(endpoint.method);
        const accessEmoji = this.getAccessEmoji(endpoint.access);
        
        details += `**${methodEmoji} ${endpoint.method} ${endpoint.path}**\n`;
        details += `- **Açıklama**: ${endpoint.summary}\n`;
        details += `- **Erişim**: ${accessEmoji} ${endpoint.access}\n`;
        if (endpoint.tags.length > 0) {
          details += `- **Etiketler**: ${endpoint.tags.join(', ')}\n`;
        }
        details += '\n';
      });
    });
    
    return details;
  }

  // Method emoji'si
  getMethodEmoji(method) {
    const emojis = {
      'GET': '🔍',
      'POST': '➕',
      'PUT': '✏️',
      'DELETE': '🗑️',
      'PATCH': '🔧'
    };
    return emojis[method] || '📡';
  }

  // Erişim emoji'si
  getAccessEmoji(access) {
    if (access.includes('Admin')) return '👑';
    if (access.includes('Private')) return '🔒';
    return '🌐';
  }

  // API endpoint'leri JSON formatında export eder
  exportEndpointsToJson() {
    const analysis = this.analyzer.analyzeProject();
    
    const exportData = {
      timestamp: analysis.timestamp,
      endpoints: analysis.endpoints,
      models: analysis.models,
      stats: analysis.stats
    };
    
    const jsonPath = path.join(this.projectRoot, 'api-endpoints.json');
    fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log('✅ API endpoint\'leri JSON formatında export edildi: api-endpoints.json');
    return jsonPath;
  }

  // Swagger dokümantasyonunu günceller
  updateSwaggerDocs() {
    console.log('🔄 Swagger dokümantasyonu güncelleniyor...');
    
    // Swagger dokümantasyonu zaten otomatik oluşturuluyor
    // Bu fonksiyon gelecekteki geliştirmeler için hazır
    console.log('✅ Swagger dokümantasyonu güncel');
  }

  // HTML formatında export eder
  exportToHtml() {
    const analysis = this.analyzer.analyzeProject();
    
    const html = this.createHtmlDocument(analysis);
    
    const htmlPath = path.join(this.projectRoot, 'PROJECT_STATUS.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    
    console.log('✅ HTML formatında export edildi: PROJECT_STATUS.html');
    return htmlPath;
  }

  // HTML dokümanı oluşturur
  createHtmlDocument(analysis) {
    const { endpoints, models, middlewares, stats, timestamp } = analysis;
    
    return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proje Durumu Raporu</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #3498db; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        tr:hover { background-color: #f5f5f5; }
        .method-get { color: #27ae60; font-weight: bold; }
        .method-post { color: #f39c12; font-weight: bold; }
        .method-put { color: #3498db; font-weight: bold; }
        .method-delete { color: #e74c3c; font-weight: bold; }
        .access-public { color: #27ae60; }
        .access-private { color: #e74c3c; }
        .access-admin { color: #8e44ad; }
        .timestamp { color: #7f8c8d; font-style: italic; text-align: center; margin-top: 30px; }
        .endpoint-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3498db; }
        .model-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Proje Durumu Raporu</h1>
        <p class="timestamp">Son güncelleme: ${new Date(timestamp).toLocaleString('tr-TR')}</p>
        
        <h2>📈 Genel İstatistikler</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.totalEndpoints}</div>
                <div class="stat-label">Toplam Endpoint</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalModels}</div>
                <div class="stat-label">Toplam Model</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalMiddlewares}</div>
                <div class="stat-label">Toplam Middleware</div>
            </div>
        </div>
        
        <h2>🔄 HTTP Method Dağılımı</h2>
        <table>
            <thead>
                <tr><th>Method</th><th>Sayı</th><th>Yüzde</th></tr>
            </thead>
            <tbody>
                ${Object.entries(stats.endpointsByMethod).map(([method, count]) => {
                  const percentage = ((count / stats.totalEndpoints) * 100).toFixed(1);
                  return `<tr><td class="method-${method.toLowerCase()}">${method}</td><td>${count}</td><td>${percentage}%</td></tr>`;
                }).join('')}
            </tbody>
        </table>
        
        <h2>🔐 Erişim Dağılımı</h2>
        <table>
            <thead>
                <tr><th>Erişim</th><th>Sayı</th><th>Yüzde</th></tr>
            </thead>
            <tbody>
                ${Object.entries(stats.endpointsByAccess).map(([access, count]) => {
                  const percentage = ((count / stats.totalEndpoints) * 100).toFixed(1);
                  const cssClass = access.includes('Admin') ? 'access-admin' : 
                                 access.includes('Private') ? 'access-private' : 'access-public';
                  return `<tr><td class="${cssClass}">${access}</td><td>${count}</td><td>${percentage}%</td></tr>`;
                }).join('')}
            </tbody>
        </table>
        
        <h2>🛠️ API Endpoints</h2>
        ${endpoints.map(endpoint => `
          <div class="endpoint-item">
            <strong>${endpoint.method} ${endpoint.path}</strong><br>
            <span style="color: #7f8c8d;">${endpoint.summary}</span><br>
            <small>Erişim: ${endpoint.access} | Route: ${endpoint.routeName}</small>
          </div>
        `).join('')}
        
        <h2>📋 Veritabanı Modelleri</h2>
        ${models.map(model => `
          <div class="model-item">
            <strong>${model.name}</strong> (${model.fields.length} field)<br>
            <small>${model.fields.map(field => `${field.name} (${field.type}${field.required ? ', required' : ''})`).join(', ')}</small>
          </div>
        `).join('')}
        
        <h2>🔧 Middleware'ler</h2>
        <table>
            <thead>
                <tr><th>Middleware</th><th>Açıklama</th></tr>
            </thead>
            <tbody>
                ${middlewares.map(middleware => {
                  const descriptions = {
                    'auth': 'JWT token doğrulama ve yetkilendirme',
                    'errorHandler': 'Merkezi hata yakalama sistemi',
                    'validation': 'Input validation kontrolü'
                  };
                  const description = descriptions[middleware.name] || 'Middleware açıklaması';
                  return `<tr><td>${middleware.name}</td><td>${description}</td></tr>`;
                }).join('')}
            </tbody>
        </table>
        
        <div class="timestamp">
            Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde otomatik oluşturulmuştur.
        </div>
    </div>
</body>
</html>`;
  }
}

module.exports = DocGenerator;
