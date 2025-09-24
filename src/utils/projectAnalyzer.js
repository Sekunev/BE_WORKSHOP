const fs = require('fs');
const path = require('path');

class ProjectAnalyzer {
  constructor() {
    this.projectRoot = path.join(__dirname, '../..');
    this.srcPath = path.join(__dirname, '..');
  }

  // Tüm route dosyalarını tarayarak endpoint'leri bulur
  analyzeRoutes() {
    const routesPath = path.join(this.srcPath, 'routes');
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));
    
    const endpoints = [];
    
    routeFiles.forEach(file => {
      const filePath = path.join(routesPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Route dosyasından endpoint'leri çıkar
      const routeName = file.replace('Routes.js', '');
      const extractedEndpoints = this.extractEndpoints(content, routeName);
      endpoints.push(...extractedEndpoints);
    });
    
    return endpoints;
  }

  // Route dosyasından endpoint bilgilerini çıkarır
  extractEndpoints(content, routeName) {
    const endpoints = [];
    
    // Swagger dokümantasyonundan endpoint bilgilerini çıkar
    const swaggerBlocks = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
    
    swaggerBlocks.forEach(block => {
      const endpoint = this.parseSwaggerBlock(block, routeName);
      if (endpoint) {
        endpoints.push(endpoint);
      }
    });
    
    // Swagger block bulunamazsa, router method'larından çıkar
    if (endpoints.length === 0) {
      const routerMethods = this.extractRouterMethods(content, routeName);
      endpoints.push(...routerMethods);
    }
    
    return endpoints;
  }

  // Swagger block'undan endpoint bilgilerini parse eder
  parseSwaggerBlock(block, routeName) {
    try {
      const lines = block.split('\n');
      let method = '';
      let path = '';
      let summary = '';
      let tags = [];
      let access = 'Public';
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('@route')) {
          const match = trimmedLine.match(/(GET|POST|PUT|DELETE|PATCH)\s+(.+)/);
          if (match) {
            method = match[1];
            path = match[2];
          }
        }
        
        if (trimmedLine.includes('@summary')) {
          summary = trimmedLine.replace('* @summary', '').trim();
        }
        
        if (trimmedLine.includes('@tags')) {
          const match = trimmedLine.match(/\[(.*?)\]/);
          if (match) {
            tags = match[1].split(',').map(tag => tag.trim());
          }
        }
        
        if (trimmedLine.includes('@access')) {
          access = trimmedLine.replace('* @access', '').trim();
        }
      });
      
      if (method && path && summary) {
        return {
          method,
          path,
          summary,
          tags,
          access,
          routeName
        };
      }
    } catch (error) {
      console.error('Swagger block parse hatası:', error);
    }
    
    return null;
  }

  // Router method'larından endpoint bilgilerini çıkarır
  extractRouterMethods(content, routeName) {
    const endpoints = [];
    
    // Router method'larını bul (router.get, router.post, vb.)
    const routerMethods = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
    
    routerMethods.forEach(methodCall => {
      const match = methodCall.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (match) {
        const method = match[1].toUpperCase();
        const path = match[2];
        
        // Erişim seviyesini belirle (basit kontrol)
        let access = 'Public';
        if (content.includes('protect') && content.includes(methodCall)) {
          access = 'Private';
          if (content.includes('authorize') && content.includes(methodCall)) {
            access = 'Private/Admin';
          }
        }
        
        endpoints.push({
          method,
          path,
          summary: `${method} ${path}`,
          tags: [routeName],
          access,
          routeName
        });
      }
    });
    
    return endpoints;
  }

  // Model dosyalarını analiz eder
  analyzeModels() {
    const modelsPath = path.join(this.srcPath, 'models');
    const modelFiles = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js'));
    
    const models = [];
    
    modelFiles.forEach(file => {
      const filePath = path.join(modelsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const modelName = file.replace('.js', '');
      const fields = this.extractModelFields(content);
      
      models.push({
        name: modelName,
        fields: fields
      });
    });
    
    return models;
  }

  // Model dosyasından field'ları çıkarır
  extractModelFields(content) {
    const fields = [];
    
    // Schema field'larını bul
    const fieldMatches = content.match(/^\s*(\w+):\s*\{[\s\S]*?\}/gm);
    
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const fieldName = match.match(/^\s*(\w+):/)[1];
        const fieldType = this.extractFieldType(match);
        const isRequired = match.includes('required: true') || match.includes('required: [true');
        
        fields.push({
          name: fieldName,
          type: fieldType,
          required: isRequired
        });
      });
    }
    
    return fields;
  }

  // Field type'ını çıkarır
  extractFieldType(fieldContent) {
    if (fieldContent.includes('type: String')) return 'String';
    if (fieldContent.includes('type: Number')) return 'Number';
    if (fieldContent.includes('type: Boolean')) return 'Boolean';
    if (fieldContent.includes('type: Date')) return 'Date';
    if (fieldContent.includes('type: ObjectId')) return 'ObjectId';
    if (fieldContent.includes('type: Array')) return 'Array';
    return 'Mixed';
  }

  // Middleware'leri analiz eder
  analyzeMiddlewares() {
    const middlewarePath = path.join(this.srcPath, 'middleware');
    const middlewareFiles = fs.readdirSync(middlewarePath).filter(file => file.endsWith('.js'));
    
    return middlewareFiles.map(file => ({
      name: file.replace('.js', ''),
      path: path.join(middlewarePath, file)
    }));
  }

  // Proje istatistiklerini hesaplar
  calculateStats() {
    const endpoints = this.analyzeRoutes();
    const models = this.analyzeModels();
    const middlewares = this.analyzeMiddlewares();
    
    const stats = {
      totalEndpoints: endpoints.length,
      totalModels: models.length,
      totalMiddlewares: middlewares.length,
      endpointsByMethod: {},
      endpointsByAccess: {},
      endpointsByRoute: {}
    };
    
    // Method'lara göre grupla
    endpoints.forEach(endpoint => {
      stats.endpointsByMethod[endpoint.method] = (stats.endpointsByMethod[endpoint.method] || 0) + 1;
      stats.endpointsByAccess[endpoint.access] = (stats.endpointsByAccess[endpoint.access] || 0) + 1;
      stats.endpointsByRoute[endpoint.routeName] = (stats.endpointsByRoute[endpoint.routeName] || 0) + 1;
    });
    
    return stats;
  }

  // Tam proje analizi yapar
  analyzeProject() {
    return {
      timestamp: new Date().toISOString(),
      endpoints: this.analyzeRoutes(),
      models: this.analyzeModels(),
      middlewares: this.analyzeMiddlewares(),
      stats: this.calculateStats()
    };
  }
}

module.exports = ProjectAnalyzer;
