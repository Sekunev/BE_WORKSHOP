const mongoose = require('mongoose');

// MongoDB bağlantı bilgilerini göster
const showConnectionInfo = () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-api';
  const dbName = process.env.DB_NAME || 'blog_api';
  
  console.log('🔗 MongoDB Bağlantı Bilgileri:');
  console.log(`   • URI: ${mongoUri}`);
  console.log(`   • Database: ${dbName}`);
  console.log(`   • Host: ${mongoUri.split('://')[1].split('/')[0]}`);
  
  return {
    uri: mongoUri,
    dbName: dbName,
    host: mongoUri.split('://')[1].split('/')[0]
  };
};

// VS Code MongoDB Extension için bağlantı string'i
const getVSCodeConnectionString = () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-api';
  const dbName = process.env.DB_NAME || 'blog_api';
  
  console.log('\n📋 VS Code MongoDB Extension için:');
  console.log(`   • Connection String: ${mongoUri}`);
  console.log(`   • Database Name: ${dbName}`);
  
  return {
    connectionString: mongoUri,
    databaseName: dbName
  };
};

module.exports = {
  showConnectionInfo,
  getVSCodeConnectionString
};
