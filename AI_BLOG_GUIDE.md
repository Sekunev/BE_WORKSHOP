# 🤖 AI Blog Oluşturma Sistemi Kullanım Kılavuzu

## 📋 İçindekiler
1. [Kurulum](#kurulum)
2. [Konfigürasyon](#konfigürasyon)
3. [API Kullanımı](#api-kullanımı)
4. [Scheduler Kullanımı](#scheduler-kullanımı)
5. [Test Etme](#test-etme)
6. [Sorun Giderme](#sorun-giderme)

## 🚀 Kurulum

### 1. Gerekli Paketleri Yükleyin
```bash
npm install
```

Yeni eklenen paketler:
- `axios` - Groq API iletişimi için
- `node-cron` - Zamanlanmış görevler için

### 2. Environment Variables Ayarlayın

`.env` dosyanızı oluşturun (`.env.example` dosyasından kopyalayabilirsiniz):

```env
# AI Integration (Groq API)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx  # Buraya kendi API key'inizi ekleyin
GROQ_MODEL=llama-3.3-70b-versatile

# Blog Scheduler
ENABLE_AUTO_SCHEDULER=true
ENABLE_TEST_SCHEDULER=false  # Sadece development ortamında true yapın
```

### 3. Groq API Key Alma

1. [https://console.groq.com](https://console.groq.com) adresine gidin
2. Kaydolun veya giriş yapın
3. API Keys bölümünden yeni bir key oluşturun
4. Key'i kopyalayıp `.env` dosyasına ekleyin

## ⚙️ Konfigürasyon

### Blog Konuları

Sistem 8 farklı önceden tanımlı konu ile gelir:

1. Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?
2. 2025'te Öne Çıkacak Teknoloji Trendleri
3. Remote Çalışma Kültürü ve Verimlilik
4. JavaScript ES2024 Yenilikleri
5. Dijital Pazarlama Temelleri
6. Online Eğitimde Başarı Sırları
7. Yeni Nesil Öğrenme Platformları
8. Kariyer Değişimi için Yol Haritası

Yeni konular eklemek için `src/services/groqService.js` dosyasındaki `blogKonulari` dizisini düzenleyin.

### Blog Parametreleri

- **Tarz:** profesyonel, samimi, akademik, eğitici
- **Kelime Sayısı:** 800, 1200, 1500
- **Hedef Kitle:** yeni başlayanlar, profesyoneller, öğrenciler

## 📡 API Kullanımı

### 1. Manuel Blog Oluşturma (Parametreli)

**Endpoint:** `POST /api/blogs/ai/generate`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "konu": "Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?",
  "tarz": "profesyonel",
  "kelimeSayisi": 1200,
  "hedefKitle": "profesyoneller",
  "autoPublish": true
}
```

**Yanıt:**
```json
{
  "status": "success",
  "message": "AI blog başarıyla oluşturuldu",
  "data": {
    "blog": {
      "_id": "...",
      "title": "...",
      "content": "...",
      "excerpt": "...",
      "category": "Teknoloji",
      "tags": ["yapay zeka", "iş dünyası", ...],
      "aiGenerated": true,
      "aiMetadata": {
        "konu": "Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?",
        "tarz": "profesyonel",
        "kelimeSayisi": 1200,
        "hedefKitle": "profesyoneller",
        "model": "llama-3.3-70b-versatile",
        "generatedAt": "2025-10-13T..."
      }
    }
  }
}
```

### 2. Rastgele Blog Oluşturma

**Endpoint:** `POST /api/blogs/ai/generate-random`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "autoPublish": true
}
```

### 3. Kullanılabilir Konuları Görme

**Endpoint:** `GET /api/blogs/ai/topics`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Yanıt:**
```json
{
  "status": "success",
  "data": {
    "allTopics": [...],
    "usedTopics": [...],
    "remainingTopics": [...],
    "totalTopics": 8,
    "usedCount": 3,
    "remainingCount": 5
  }
}
```

### 4. AI Bloglarını Listeleme

**Endpoint:** `GET /api/blogs/ai/blogs?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {admin_token}
```

## ⏰ Scheduler Kullanımı

### Otomatik Zamanlamalar

Scheduler otomatik olarak şu zamanlarda blog oluşturur:

1. **Günlük:** Her gün saat 09:00
2. **Haftalık:** Pazartesi ve Perşembe 14:00

Timezone: **Europe/Istanbul**

### Scheduler'ı Aktifleştirme

`.env` dosyasında:
```env
ENABLE_AUTO_SCHEDULER=true
```

Server başlatıldığında scheduler otomatik olarak başlar:
```bash
npm start
# veya
npm run dev
```

Console'da şu mesajları görmelisiniz:
```
🤖 Blog scheduler başlatılıyor...
✅ Blog scheduler başarıyla başlatıldı
📅 Günlük blog: Her gün 09:00
📅 Haftalık blog: Pazartesi ve Perşembe 14:00
```

### Test Modu

Development ortamında her 2 saatte bir blog oluşturmak için:

```env
NODE_ENV=development
ENABLE_TEST_SCHEDULER=true
```

## 🧪 Test Etme

### 1. Manuel Test - Postman/Thunder Client

#### Adım 1: Admin Token Alın
```
POST http://localhost:5000/api/auth/login

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### Adım 2: AI Blog Oluşturun
```
POST http://localhost:5000/api/blogs/ai/generate-random
Authorization: Bearer {token}

{
  "autoPublish": true
}
```

### 2. Swagger ile Test

1. Tarayıcıda açın: `http://localhost:5000/api-docs`
2. "AI Blogs" kategorisini genişletin
3. "Authorize" butonuna tıklayın, admin token girin
4. İstediğiniz endpoint'i test edin

### 3. CLI ile Test

Admin kullanıcı oluşturun:
```bash
npm run create-admin
```

Server'ı başlatın:
```bash
npm run dev
```

## 🔧 Sorun Giderme

### Problem: "GROQ_API_KEY environment variable bulunamadı"

**Çözüm:** `.env` dosyasına GROQ_API_KEY ekleyin:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

### Problem: "Admin kullanıcı bulunamadı"

**Çözüm:** Admin kullanıcı oluşturun:
```bash
npm run create-admin
```

### Problem: "Blog scheduler zaten çalışıyor"

**Çözüm:** Normal bir durumdur. Server restart edildiğinde scheduler yeniden başlar.

### Problem: Scheduler çalışmıyor

**Kontrol Listesi:**
1. `.env` dosyasında `ENABLE_AUTO_SCHEDULER=true` olmalı
2. Server başarıyla başlatılmış olmalı
3. Console'da scheduler başlatma mesajını görmelisiniz

### Problem: API 403 Forbidden hatası veriyor

**Çözüm:** 
1. Admin token kullandığınızdan emin olun
2. Token'ın geçerli olduğunu kontrol edin
3. User role'ünün "admin" olduğunu doğrulayın

## 📊 Model Bilgileri

**Kullanılan Model:** `llama-3.3-70b-versatile`

**Özellikler:**
- Ücretsiz (Free tier)
- Hızlı yanıt süresi
- Yüksek kaliteli Türkçe içerik üretimi
- 4000 token max_tokens limiti

## 🔐 Güvenlik Notları

1. ✅ **API Key'i asla commit etmeyin**
2. ✅ **Production'da ENABLE_TEST_SCHEDULER=false olmalı**
3. ✅ **Sadece admin kullanıcılar AI endpoint'lerine erişebilir**
4. ✅ **Rate limiting aktif olmalı**

## 📝 Örnek Kullanım Senaryosu

```bash
# 1. Admin kullanıcı oluştur
npm run create-admin

# 2. Server'ı başlat
npm run dev

# 3. Login olup token al
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 4. Rastgele blog oluştur
curl -X POST http://localhost:5000/api/blogs/ai/generate-random \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"autoPublish":true}'

# 5. AI bloglarını listele
curl http://localhost:5000/api/blogs/ai/blogs \
  -H "Authorization: Bearer {token}"
```

## 📚 Ek Kaynaklar

- [Groq API Dokümantasyonu](https://console.groq.com/docs)
- [Node-Cron Dokümantasyonu](https://www.npmjs.com/package/node-cron)
- [Proje README](README.md)
- [API Dokümantasyonu](http://localhost:5000/api-docs)

## 🤝 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. `.env` dosyasını kontrol edin
3. Admin kullanıcı olduğunuzdan emin olun
4. Swagger dokümantasyonunu inceleyin

