# 📋 Proje Kuralları ve Standartları

## 🎯 Genel Kurallar

### 1. Kod Yazım Standartları
- **Dosya İsimlendirme**: camelCase kullanın (örn: `userController.js`)
- **Fonksiyon İsimlendirme**: camelCase kullanın (örn: `getUserProfile`)
- **Sabit Değerler**: UPPER_SNAKE_CASE kullanın (örn: `MAX_FILE_SIZE`)
- **Türkçe Açıklamalar**: Tüm yorumlar ve mesajlar Türkçe olmalıdır

### 2. API Endpoint Kuralları
- **RESTful Standartlar**: HTTP method'ları doğru kullanın
  - `GET`: Veri okuma
  - `POST`: Yeni kayıt oluşturma
  - `PUT`: Tam güncelleme
  - `PATCH`: Kısmi güncelleme
  - `DELETE`: Silme
- **URL Yapısı**: `/api/{resource}` formatında
- **HTTP Status Kodları**: Doğru status kodlarını kullanın

### 3. Swagger Dokümantasyon Kuralları
- **Her endpoint için zorunlu alanlar**:
  ```javascript
  /**
   * @swagger
   * /api/endpoint:
   *   method:
   *     summary: Açıklama
   *     tags: [Tag]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Başarılı
   */
  ```

### 4. Validation Kuralları
- **Her input için validation** ekleyin
- **Express-validator** kullanın
- **Hata mesajları Türkçe** olmalıdır

### 5. Güvenlik Kuralları
- **JWT Token**: Tüm private endpoint'lerde zorunlu
- **Password Hashing**: bcrypt kullanın
- **Rate Limiting**: API endpoint'lerinde aktif
- **CORS**: Frontend URL'lerini belirtin

## 📁 Dosya Yapısı Kuralları

### Controller'lar
```
src/controllers/
├── authController.js      # Authentication işlemleri
├── userController.js      # Kullanıcı işlemleri
├── blogController.js      # Blog işlemleri
└── commentController.js   # Yorum işlemleri
```

### Route'lar
```
src/routes/
├── authRoutes.js          # /api/auth/*
├── userRoutes.js          # /api/users/*
├── blogRoutes.js          # /api/blogs/*
└── commentRoutes.js       # /api/comments/*
```

### Model'ler
```
src/models/
├── User.js               # Kullanıcı modeli
├── Blog.js               # Blog modeli
└── Comment.js            # Yorum modeli
```

## 🔄 Otomatik Dokümantasyon Kuralları

### 1. Yeni Endpoint Ekleme
Yeni bir endpoint eklediğinizde:

1. **Route dosyasına Swagger dokümantasyonu** ekleyin
2. **Controller fonksiyonu** oluşturun
3. **Validation kuralları** ekleyin
4. **Test yazın** (opsiyonel)
5. **Dokümantasyonu güncelleyin**:
   ```bash
   npm run docs:update
   ```

### 2. Dokümantasyon Güncelleme
```bash
# Proje analizi yap
npm run docs:analyze

# Dokümantasyonu güncelle
npm run docs:update

# Tüm formatlarda export et
npm run docs:export
```

### 3. Commit Mesajları
- **Türkçe** olmalıdır
- **Kısa ve öz** olmalıdır
- **Format**: `feat: yeni endpoint eklendi` veya `fix: hata düzeltildi`

## 📊 Dokümantasyon Çıktıları

### Otomatik Oluşturulan Dosyalar
- `PROJECT_STATUS.md` - Markdown formatında proje durumu
- `PROJECT_STATUS.html` - HTML formatında proje durumu
- `api-endpoints.json` - JSON formatında endpoint listesi

### İçerik
- **Genel istatistikler**
- **Endpoint listesi** (method, path, açıklama, erişim)
- **Model bilgileri** (field'lar ve tipleri)
- **Middleware listesi**
- **HTTP method dağılımı**
- **Erişim yetkisi dağılımı**

## 🚀 Yeni Özellik Ekleme Süreci

### 1. Planlama
- [ ] Özellik gereksinimlerini belirle
- [ ] API endpoint'lerini tasarla
- [ ] Veritabanı değişikliklerini planla

### 2. Geliştirme
- [ ] Model'i oluştur/güncelle
- [ ] Controller fonksiyonlarını yaz
- [ ] Route'ları ekle
- [ ] Validation kurallarını ekle
- [ ] Swagger dokümantasyonunu ekle

### 3. Test
- [ ] Unit testler yaz
- [ ] Integration testler yaz
- [ ] API endpoint'lerini test et

### 4. Dokümantasyon
- [ ] README'yi güncelle
- [ ] Proje durumunu güncelle: `npm run docs:update`
- [ ] Değişiklikleri commit et

## 🔍 Kalite Kontrol

### Kod İnceleme Checklist
- [ ] Swagger dokümantasyonu var mı?
- [ ] Validation kuralları eklenmiş mi?
- [ ] Hata yönetimi yapılmış mı?
- [ ] Güvenlik kontrolleri var mı?
- [ ] Türkçe mesajlar kullanılmış mı?

### Performans Kontrolü
- [ ] Database query'leri optimize edilmiş mi?
- [ ] Gereksiz veri çekiliyor mu?
- [ ] Pagination kullanılmış mı?
- [ ] Rate limiting aktif mi?

## 📝 Örnek Endpoint Ekleme

```javascript
// 1. Route dosyasına ekle (src/routes/blogRoutes.js)
/**
 * @swagger
 * /api/blogs/{id}/comments:
 *   post:
 *     summary: Blog'a yorum ekle
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Harika bir yazı!"
 *     responses:
 *       201:
 *         description: Yorum başarıyla eklendi
 */
router.post('/:id/comments', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Yorum 1-1000 karakter arasında olmalıdır')
], handleValidationErrors, addComment);

// 2. Controller fonksiyonu ekle (src/controllers/blogController.js)
const addComment = async (req, res, next) => {
  try {
    // Implementation
  } catch (error) {
    next(error);
  }
};

// 3. Dokümantasyonu güncelle
// npm run docs:update
```

## 🎯 Başarı Metrikleri

### Teknik Metrikler
- **Endpoint Coverage**: %100 Swagger dokümantasyonu
- **Validation Coverage**: %100 input validation
- **Error Handling**: %100 hata yakalama
- **Security**: %100 JWT koruması (private endpoint'ler)

### Dokümantasyon Metrikleri
- **Güncellik**: Her endpoint değişikliğinde otomatik güncelleme
- **Kapsamlılık**: Tüm endpoint'ler dokümante edilmiş
- **Format Çeşitliliği**: Markdown, HTML, JSON formatları

---

**Not**: Bu kurallar projenin tutarlılığını ve kalitesini sağlamak için oluşturulmuştur. Her geliştirici bu kurallara uymalıdır.
