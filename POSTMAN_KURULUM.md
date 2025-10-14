# 📮 Postman Kurulum ve Kullanım Rehberi

## 🐛 "jwt malformed" Hatası Çözümü

Bu hata genellikle token'ın yanlış kaydedildiğini gösterir. Collection güncelledim, şimdi doğru çalışacak!

## 🚀 Kurulum Adımları

### 1. Collection'ı Import Edin

1. Postman'i açın
2. **Import** butonuna tıklayın
3. `postman/Blog_API_Collection.json` dosyasını sürükleyin
4. **Import** yapın

### 2. Environment'ı Import Edin (Opsiyonel)

1. **Environments** sekmesine gidin
2. **Import** butonuna tıklayın
3. `postman/Blog_API_Environment.json` dosyasını seçin
4. **Import** yapın
5. Sağ üstten "Blog API Environment" seçin

## ✅ İlk Kullanım

### Adım 1: Login Yapın

1. **Authentication** → **Login** endpoint'ini açın
2. **Send** butonuna tıklayın
3. Console'da şunu göreceksiniz:
   ```
   ✅ Login başarılı!
   🎫 Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6...
   🔄 Refresh Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6...
   ⏰ Expires: 2025-10-20T...
   💾 Token kaydedildi (collection & environment)
   ```

### Adım 2: Token'ı Test Edin

1. **Authentication** → **Debug Token** endpoint'ini açın
2. **Send** butonuna tıklayın
3. Console'da token bilgilerini göreceksiniz:
   ```
   📋 Kullanılan Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   📦 Collection Token: VAR
   🌍 Environment Token: VAR
   ```

### Adım 3: AI Blog Oluşturun

1. **AI Blogs** → **Generate Random AI Blog** endpoint'ini açın
2. **Send** butonuna tıklayın
3. 2-5 saniye içinde blog oluşacak!

## 🔧 Sorun Giderme

### Token "jwt malformed" Hatası

**Çözüm:**
1. Login endpoint'ini tekrar çalıştırın
2. Console'da "💾 Token kaydedildi" mesajını görmelisiniz
3. "Debug Token" endpoint'i ile test edin

### Token "jwt must be provided" Hatası

**Çözüm:**
1. Collection Variables'ı kontrol edin:
   - Collection → **Variables** sekmesi
   - `accessToken` boş mu?
2. Login yapın, otomatik dolacak

### "Bu işlem için yetkiniz bulunmuyor" Hatası

**Çözüm:**
- Admin kullanıcı ile login olun
- Email: `admin@user.com`
- Password: `123456`

## 📊 Collection Özellikleri

### Otomatik Token Yönetimi

Login yaptığınızda:
- ✅ Token otomatik kaydedilir
- ✅ Hem collection hem environment'a yazılır
- ✅ Tüm endpoint'ler otomatik kullanır
- ✅ Console'da bilgi gösterilir

### Endpoint Kategorileri

1. **Authentication** (5 endpoint)
   - Register, Login, Get Me, Refresh, Change Password

2. **Users** (5 endpoint)
   - Get All, Get by ID, Update Profile, Get User Blogs

3. **Blogs** (6 endpoint)
   - Get All, Get by Slug, Create, My Blogs, Categories, Tags

4. **AI Blogs** (4 endpoint) 🤖
   - Generate AI Blog
   - Generate Random AI Blog
   - Get AI Topics
   - Get AI Blogs

5. **Health Check** (1 endpoint)
   - Server durumu

## 🎯 Test Senaryosu

### Tam AI Blog Test Akışı

```
1. Health Check → Server çalışıyor mu?
2. Login → Token al
3. Debug Token → Token doğru mu?
4. Get AI Topics → Hangi konular mevcut?
5. Generate Random AI Blog → Blog oluştur
6. Get AI Blogs → Oluşturulan blogları gör
7. Get All Blogs → Tüm bloglarda AI blog'u gör
```

## 💡 İpuçları

1. **Console'u Açık Tutun**
   - View → Show Postman Console (Alt+Ctrl+C)
   - Token kaydedilme durumunu görün

2. **Variables Kontrol**
   - Collection → Variables sekmesi
   - `accessToken` ve `refreshToken` değerlerini görün

3. **Environment Seçimi**
   - Sağ üstten "Blog API Environment" seçin
   - Veya collection variables kullanın (ikisi de çalışır)

4. **Token Süresi**
   - Access Token: 7 gün
   - Refresh Token: 30 gün
   - Dolunca yeniden login yapın

## 🆘 Hata Mesajları ve Çözümleri

| Hata | Sebep | Çözüm |
|------|-------|-------|
| jwt malformed | Token format hatası | Login yapın, tekrar test edin |
| jwt must be provided | Token gönderilmemiş | Authorization header kontrol |
| Token süresi dolmuş | 7 gün geçmiş | Yeniden login |
| Yetkiniz bulunmuyor | Admin değil | Admin ile login |
| Connection refused | Server kapalı | `npm run dev` çalıştırın |

## 📝 Collection Structure

```
Blog API Collection
├─ Authentication
│  ├─ Register ✨ (Auto-save token)
│  ├─ Login ✨ (Auto-save token)
│  ├─ Debug Token 🔍 (Test token)
│  ├─ Get Me
│  ├─ Refresh Token ✨ (Auto-save token)
│  └─ Change Password
├─ Users (Admin)
├─ Blogs
├─ AI Blogs 🤖
│  ├─ Generate AI Blog
│  ├─ Generate Random AI Blog
│  ├─ Get AI Topics
│  └─ Get AI Blogs
└─ Health Check
```

## 🎉 Başarı Kontrolü

Postman'de şu adımları sırayla test edin:

1. ✅ Login → 200 OK, Console'da "✅ Login başarılı!"
2. ✅ Debug Token → 200 OK, Token bilgileri
3. ✅ Get AI Topics → 200 OK, Konu listesi
4. ✅ Generate Random AI Blog → 201 Created
5. ✅ Get AI Blogs → 200 OK, Oluşturulan blog listede

Hepsi başarılıysa sistem hazır! 🚀

