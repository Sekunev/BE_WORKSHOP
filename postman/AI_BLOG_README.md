# 🤖 AI Blog Postman Collection

Bu Postman collection AI blog oluşturma endpoint'lerini test etmek için kullanılır.

## 📋 İçerik

Collection'da 4 yeni AI Blog endpoint'i bulunur:

1. **Generate AI Blog** - Parametreli blog oluşturma
2. **Generate Random AI Blog** - Rastgele blog oluşturma  
3. **Get AI Topics** - Konuları görüntüleme
4. **Get AI Blogs** - AI bloglarını listeleme

## 🚀 Kurulum

### 1. Postman'e Collection'ı Import Edin

1. Postman'i açın
2. **Import** butonuna tıklayın
3. `Blog_API_Collection.json` dosyasını seçin
4. **Import** yapın

### 2. Environment Değişkenlerini Ayarlayın

Collection şu değişkenleri kullanır:

- `baseUrl`: API base URL (varsayılan: `http://localhost:5000/api`)
- `accessToken`: JWT access token (otomatik doldurulur)
- `adminEmail`: Admin email (varsayılan: `admin@user.com`)
- `adminPassword`: Admin şifre (varsayılan: `123456`)

### 3. Login Olun

1. **Authentication** → **Login** endpoint'ini açın
2. Body'de admin bilgilerinizi kontrol edin
3. **Send** butonuna tıklayın
4. Token otomatik olarak `accessToken` değişkenine kaydedilecek

## 📝 Endpoint Kullanımı

### 1. Generate AI Blog (Parametreli)

**Endpoint:** `POST /api/blogs/ai/generate`

**Kullanım:**
1. "AI Blogs" klasörünü açın
2. "Generate AI Blog" endpoint'ini seçin
3. Body'de parametreleri düzenleyin:
   ```json
   {
     "konu": "Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?",
     "tarz": "profesyonel",
     "kelimeSayisi": 1200,
     "hedefKitle": "profesyoneller",
     "autoPublish": true
   }
   ```
4. Send butonuna tıklayın

**Parametreler:**
- `konu`: Blog konusu (8 önceden tanımlı konu var)
- `tarz`: profesyonel, samimi, akademik, eğitici
- `kelimeSayisi`: 800, 1200, 1500
- `hedefKitle`: yeni başlayanlar, profesyoneller, öğrenciler
- `autoPublish`: true/false (direkt yayınlansın mı?)

**Mevcut Konular:**
1. Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?
2. 2025'te Öne Çıkacak Teknoloji Trendleri
3. Remote Çalışma Kültürü ve Verimlilik
4. JavaScript ES2024 Yenilikleri
5. Dijital Pazarlama Temelleri
6. Online Eğitimde Başarı Sırları
7. Yeni Nesil Öğrenme Platformları
8. Kariyer Değişimi için Yol Haritası

### 2. Generate Random AI Blog

**Endpoint:** `POST /api/blogs/ai/generate-random`

**Kullanım:**
1. "Generate Random AI Blog" endpoint'ini seçin
2. Body (opsiyonel):
   ```json
   {
     "autoPublish": true
   }
   ```
3. Send butonuna tıklayın

Bu endpoint rastgele bir konu, tarz, kelime sayısı ve hedef kitle seçer.

### 3. Get AI Topics

**Endpoint:** `GET /api/blogs/ai/topics`

**Kullanım:**
1. "Get AI Topics" endpoint'ini seçin
2. Send butonuna tıklayın

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

### 4. Get AI Blogs

**Endpoint:** `GET /api/blogs/ai/blogs?page=1&limit=10`

**Kullanım:**
1. "Get AI Blogs" endpoint'ini seçin
2. Query parametrelerini ayarlayın:
   - `page`: Sayfa numarası
   - `limit`: Sayfa başına kayıt
3. Send butonuna tıklayın

## 🔐 Yetkilendirme

**ÖNEMLİ:** Tüm AI endpoint'leri **sadece admin** kullanıcılar tarafından kullanılabilir!

Eğer 403 Forbidden hatası alırsanız:
1. Login olduğunuzdan emin olun
2. Admin yetkisine sahip olduğunuzu kontrol edin
3. Token'ın doğru ayarlandığını kontrol edin

## 🧪 Test Senaryosu

### Temel Test Akışı

1. **Health Check**
   - Server çalışıyor mu kontrol et
   
2. **Login** (Admin olarak)
   - Admin token al
   
3. **Get AI Topics**
   - Hangi konular kullanılmış göster
   
4. **Generate Random AI Blog**
   - Rastgele bir blog oluştur
   
5. **Get AI Blogs**
   - Oluşturulan AI blogları listele
   
6. **Get All Blogs**
   - Tüm bloglarda AI blog'un göründüğünü kontrol et

## 📊 Yanıt Örnekleri

### Başarılı Blog Oluşturma

```json
{
  "status": "success",
  "message": "AI blog başarıyla oluşturuldu",
  "data": {
    "blog": {
      "_id": "...",
      "title": "Yapay Zeka ve İş Dünyası",
      "content": "...",
      "excerpt": "...",
      "category": "Teknoloji",
      "tags": ["yapay zeka", "iş dünyası"],
      "aiGenerated": true,
      "aiMetadata": {
        "konu": "Yapay Zeka İş Dünyasını Nasıl Dönüştürüyor?",
        "tarz": "profesyonel",
        "kelimeSayisi": 1200,
        "hedefKitle": "profesyoneller",
        "model": "llama-3.3-70b-versatile"
      }
    }
  }
}
```

### Hata Durumları

**403 Forbidden:**
```json
{
  "status": "error",
  "message": "Bu işlem için yetkiniz bulunmuyor"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Blog içeriği oluşturulamadı: ..."
}
```

## 💡 İpuçları

1. **Token Yenileme:** Login endpoint'inde token otomatik güncellenir
2. **Süre:** AI blog oluşturma 10-30 saniye sürebilir
3. **Rate Limit:** API rate limit'e dikkat edin
4. **Test Modu:** İlk testlerde `autoPublish: false` kullanın
5. **Konular:** Aynı konuyu birden fazla kullanabilirsiniz

## 🔧 Sorun Giderme

### "GROQ_API_KEY bulunamadı"
- Backend'de `.env` dosyasını kontrol edin
- `GROQ_API_KEY` değişkeninin ayarlandığından emin olun

### "Admin kullanıcı bulunamadı"
- Backend'de admin kullanıcı oluşturun: `npm run create-admin`

### Token Hatası
- Yeniden login olun
- Collection variables'da `accessToken`'ı kontrol edin

### Timeout Hatası
- Postman timeout ayarlarını artırın (Settings → General → Request timeout)
- AI yanıtı için 60 saniye timeout yeterli

## 📚 Ek Kaynaklar

- [AI_BLOG_GUIDE.md](../AI_BLOG_GUIDE.md) - Detaylı kullanım kılavuzu
- [HIZLI_BAŞLANGIÇ.md](../HIZLI_BAŞLANGIÇ.md) - Hızlı başlangıç
- Swagger: `http://localhost:5000/api-docs`

