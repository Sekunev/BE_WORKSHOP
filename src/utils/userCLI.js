#!/usr/bin/env node

const UserManager = require('./userManagement');

const userManager = new UserManager();

// CLI argument'larını parse et
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];

const showHelp = () => {
  console.log('👥 Kullanıcı Yönetimi CLI');
  console.log('='.repeat(40));
  console.log('');
  console.log('Kullanım:');
  console.log('  node src/utils/userCLI.js <komut> [email]');
  console.log('');
  console.log('Komutlar:');
  console.log('  list                    - Tüm kullanıcıları listele');
  console.log('  details <email>         - Kullanıcı detayları');
  console.log('  make-admin <email>      - Kullanıcıyı admin yap');
  console.log('  make-user <email>       - Kullanıcıyı user yap');
  console.log('  toggle <email>          - Kullanıcı durumunu değiştir');
  console.log('  delete <email>          - Kullanıcıyı sil');
  console.log('');
  console.log('Örnekler:');
  console.log('  node src/utils/userCLI.js list');
  console.log('  node src/utils/userCLI.js details admin@example.com');
  console.log('  node src/utils/userCLI.js make-admin user@example.com');
  console.log('');
};

const runCommand = async () => {
  if (!command || command === 'help') {
    showHelp();
    return;
  }

  switch (command) {
    case 'list':
      await userManager.listUsers();
      break;
      
    case 'details':
      if (!email) {
        console.log('❌ E-posta adresi gerekli!');
        console.log('Kullanım: node src/utils/userCLI.js details <email>');
        return;
      }
      await userManager.getUserDetails(email);
      break;
      
    case 'make-admin':
      if (!email) {
        console.log('❌ E-posta adresi gerekli!');
        console.log('Kullanım: node src/utils/userCLI.js make-admin <email>');
        return;
      }
      await userManager.makeAdmin(email);
      break;
      
    case 'make-user':
      if (!email) {
        console.log('❌ E-posta adresi gerekli!');
        console.log('Kullanım: node src/utils/userCLI.js make-user <email>');
        return;
      }
      await userManager.makeUser(email);
      break;
      
    case 'toggle':
      if (!email) {
        console.log('❌ E-posta adresi gerekli!');
        console.log('Kullanım: node src/utils/userCLI.js toggle <email>');
        return;
      }
      await userManager.toggleUserStatus(email);
      break;
      
    case 'delete':
      if (!email) {
        console.log('❌ E-posta adresi gerekli!');
        console.log('Kullanım: node src/utils/userCLI.js delete <email>');
        return;
      }
      await userManager.deleteUser(email);
      break;
      
    default:
      console.log(`❌ Bilinmeyen komut: ${command}`);
      showHelp();
  }
};

runCommand().catch(console.error);
