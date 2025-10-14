# 🚀 AI Blog Sistemi - Hızlı Başlangıç

## ⚡ 3 Adımda Başlayın

### 1️⃣ API Key Ayarlayın

`.env` dosyası oluşturun:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx  # Kendi key'inizi buraya yazın
ENABLE_AUTO_SCHEDULER=true
```

### 2️⃣ Paketleri Yükleyin ve Admin Oluşturun

```bash
npm install
npm run create-admin
```

### 3️⃣ Server'ı Başlatın

```bash
npm run dev
```

## 🎯 İlk AI Blog'unuzu Oluşturun

### Yöntem 1: Test Script ile (Önerilen)

```bash
npm run test:ai-blog
```

Bu script otomatik olarak:
- Admin kullanıcı kontrol eder
- Rastgele bir blog konusu seçer
- AI ile blog oluşturur
- Veritabanına kaydeder
- Detaylı rapor gösterir

### Yöntem 2: API ile

1. **Login olun:**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

2. **Rastgele blog oluşturun:**
```bash
POST http://localhost:5000/api/blogs/ai/generate-random
Authorization: Bearer {token}
{
  "autoPublish": true
}
```

### Yöntem 3: Swagger UI ile

1. Tarayıcıda açın: `http://localhost:5000/api-docs`
2. "Authorize" butonuna tıklayın, admin token'ı girin
3. "AI Blogs" → "generate-random" endpoint'ini deneyin

## 📅 Otomatik Blog Zamanlaması

Scheduler otomatik olarak çalışır:
- ✅ Her gün saat 09:00
- ✅ Pazartesi ve Perşembe 14:00

Console'da göreceksiniz:
```
🤖 Blog scheduler başlatılıyor...
✅ Blog scheduler başarıyla başlatıldı
```

## 🔑 Groq API Key Alma

1. [console.groq.com](https://console.groq.com) adresine gidin
2. Kaydolun (ücretsiz)
3. API Keys → Create API Key
4. Key'i kopyalayın ve `.env` dosyasına ekleyin

## 📊 Mevcut Özellikler

✅ 8 farklı blog konusu  
✅ 4 farklı yazı tarzı (profesyonel, samimi, akademik, eğitici)  
✅ 3 kelime sayısı seçeneği (800, 1200, 1500)  
✅ 3 hedef kitle seçeneği  
✅ Otomatik zamanlanmış blog oluşturma  
✅ Manuel blog oluşturma  
✅ AI metadata takibi  
✅ Swagger dokümantasyonu  

## 📖 Detaylı Bilgi

Daha fazla bilgi için: [AI_BLOG_GUIDE.md](AI_BLOG_GUIDE.md)

## 🆘 Sorun mu Yaşıyorsunuz?

### "GROQ_API_KEY bulunamadı"
➡️ `.env` dosyasına `GROQ_API_KEY=...` ekleyin

### "Admin kullanıcı bulunamadı"
➡️ `npm run create-admin` çalıştırın

### Scheduler çalışmıyor
➡️ `.env` dosyasında `ENABLE_AUTO_SCHEDULER=true` olmalı

## 🎉 Başarılı Kurulum Kontrolü

Server başlatıldığında şunları görmelisiniz:
```
🚀 Server 5000 portunda çalışıyor
✅ MongoDB bağlantısı başarılı
🤖 Blog scheduler başlatılıyor...
✅ Blog scheduler başarıyla başlatıldı
```

**Tebrikler! 🎊 AI blog sisteminiz hazır!**

