# 🔑 Postman Token Kullanım Rehberi

## Sorun
```
GET /api/blogs/ai/blogs 401
Token doğrulama hatası: JsonWebTokenError: jwt must be provided
```

Bu hata token'ın header'a eklenmediğini gösterir.

## ✅ Çözüm Adımları

### Yöntem 1: Manuel Token Ekleme (Hızlı)

1. **Login isteği gönderin:**
   ```
   POST http://localhost:5000/api/auth/login
   ```
   Body:
   ```json
   {
     "email": "admin@user.com",
     "password": "123456"
   }
   ```

2. **Token'ı kopyalayın:**
   Yanıttan `data.accessToken.token` değerini kopyalayın

3. **AI endpoint'e gidin:**
   ```
   GET http://localhost:5000/api/blogs/ai/blogs
   ```

4. **Authorization sekmesine tıklayın**

5. **Type'ı seçin:**
   - `Bearer Token` seçin

6. **Token'ı yapıştırın:**
   - Sağdaki kutucuğa kopyaladığınız token'ı yapıştırın

### Yöntem 2: Collection Variables (Otomatik)

#### Adım 1: Collection Import
1. Postman'de **Import** butonuna tıklayın
2. `postman/Blog_API_Collection.json` dosyasını seçin

#### Adım 2: Login Test Script
Login endpoint'inin **Tests** sekmesine şu kodu ekleyin:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('accessToken', response.data.accessToken.token);
    console.log('✅ Token kaydedildi!');
}
```

#### Adım 3: Login Yapın
Login endpoint'ini çalıştırın. Token otomatik olarak kaydedilecek.

#### Adım 4: AI Endpoint'lerde Token Kullanın
Authorization sekmesinde:
- Type: `Bearer Token`
- Token: `{{accessToken}}`

### Yöntem 3: Environment Variables

#### Adım 1: Environment Oluştur
1. Sağ üstteki **Environments** ikonuna tıklayın
2. **Create Environment** → `Blog API Local`

#### Adım 2: Variables Ekle
```
baseUrl: http://localhost:5000/api
accessToken: (boş bırak, otomatik dolacak)
```

#### Adım 3: Login Test Script
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('accessToken', response.data.accessToken.token);
    console.log('✅ Token environment\'a kaydedildi!');
}
```

## 🧪 Token Doğrulama

Token'ın çalıştığını test edin:

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer {{accessToken}}
```

Başarılı yanıt:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@user.com",
      "role": "admin"
    }
  }
}
```

## ❌ Sık Karşılaşılan Hatalar

### "jwt must be provided"
**Sebep:** Token header'a eklenmemiş  
**Çözüm:** Authorization sekmesinde Bearer Token seçili mi kontrol edin

### "Geçersiz token"
**Sebep:** Token formatı yanlış  
**Çözüm:** Token'ın başında/sonunda boşluk olmasın

### "Token süresi dolmuş"
**Sebep:** 7 gün geçti  
**Çözüm:** Yeniden login olun

### "Bu işlem için yetkiniz bulunmuyor"
**Sebep:** User rolü admin değil  
**Çözüm:** Admin kullanıcı ile login olun

## 📋 Hazır Request

### Login ve Token Al
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@user.com",
    "password": "123456"
  }'
```

### Token ile AI Blog Oluştur
```bash
curl -X POST http://localhost:5000/api/blogs/ai/generate-random \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "autoPublish": true
  }'
```

## 💡 İpuçları

1. ✅ Token'ı kopyalarken **tüm** token'ı seçin
2. ✅ Authorization Type'ı **Bearer Token** seçin
3. ✅ Token'ın **önüne/sonuna boşluk eklemeyin**
4. ✅ Collection import ederseniz token **otomatik** kaydedilir
5. ✅ Token 7 gün geçerli, sonra yeniden login gerekir

## 🎯 Başarılı Kurulum Kontrolü

Postman'de şu endpoint'leri sırayla test edin:

1. ✅ `POST /api/auth/login` → 200 OK
2. ✅ `GET /api/auth/me` → 200 OK (token çalışıyor)
3. ✅ `GET /api/blogs/ai/topics` → 200 OK (admin yetkisi var)
4. ✅ `POST /api/blogs/ai/generate-random` → 201 Created

Hepsi başarılıysa sistem hazır! 🎉

