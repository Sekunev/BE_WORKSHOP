# 📮 Postman API Test Rehberi

## 🚀 Kurulum Adımları

### 1. Postman Kurulumu
- [Postman](https://www.postman.com/downloads/) indirin ve kurun
- Hesap oluşturun (ücretsiz)

### 2. Collection Import
1. Postman'i açın
2. **Import** butonuna tıklayın
3. `Blog_API_Collection.json` dosyasını seçin
4. **Import** butonuna tıklayın

### 3. Environment Import
1. **Environments** sekmesine gidin
2. **Import** butonuna tıklayın
3. `Blog_API_Environment.json` dosyasını seçin
4. **Import** butonuna tıklayın
5. Environment'ı aktif hale getirin (sağ üst köşede)

### 4. Server'ı Başlatın
```bash
npm run dev
```

## 🔑 API Test Sırası

### 1. Health Check
- **Request**: `Health Check > Health Check`
- **Method**: GET
- **URL**: `http://localhost:5000/health`
- **Beklenen Sonuç**: 200 OK

### 2. Kullanıcı Kaydı
- **Request**: `Authentication > Register`
- **Method**: POST
- **Body**: 
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "123456"
  }
  ```
- **Beklenen Sonuç**: 201 Created + Tokens

### 3. Kullanıcı Girişi
- **Request**: `Authentication > Login`
- **Method**: POST
- **Body**:
  ```json
  {
    "email": "admin@user.com",
    "password": "123456"
  }
  ```
- **Beklenen Sonuç**: 200 OK + Tokens

### 4. Profil Bilgileri
- **Request**: `Authentication > Get Me`
- **Method**: GET
- **Headers**: Authorization: Bearer {{accessToken}}
- **Beklenen Sonuç**: 200 OK + User Data

### 5. Blog Oluşturma
- **Request**: `Blogs > Create Blog`
- **Method**: POST
- **Headers**: Authorization: Bearer {{accessToken}}
- **Body**: Hazır JSON data
- **Beklenen Sonuç**: 201 Created + Blog Data

### 6. Blog Listesi
- **Request**: `Blogs > Get All Blogs`
- **Method**: GET
- **Beklenen Sonuç**: 200 OK + Blogs Array

## 🔄 Token Yönetimi

### Otomatik Token Kaydetme
Collection'da otomatik token kaydetme script'leri mevcut:

```javascript
// Login ve Register sonrası otomatik çalışır
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set('accessToken', response.data.accessToken.token);
    pm.collectionVariables.set('refreshToken', response.data.refreshToken.token);
}
```

### Token Yenileme
- **Request**: `Authentication > Refresh Token`
- **Method**: POST
- **Body**: `{"refreshToken": "{{refreshToken}}"}`

## 📊 Test Senaryoları

### Başarılı Senaryolar
1. ✅ Kullanıcı kaydı ve girişi
2. ✅ Token ile korumalı endpoint'lere erişim
3. ✅ Blog CRUD işlemleri
4. ✅ Token yenileme

### Hata Senaryoları
1. ❌ Yanlış şifre ile giriş
2. ❌ Geçersiz token ile erişim
3. ❌ Eksik validation data
4. ❌ Süresi dolmuş token

## 🛠️ Environment Variables

| Variable | Değer | Açıklama |
|----------|-------|----------|
| `baseUrl` | `http://localhost:5000/api` | API base URL |
| `accessToken` | (Otomatik) | JWT Access Token |
| `refreshToken` | (Otomatik) | JWT Refresh Token |
| `userId` | `68d4318a80320f2d46b2e259` | Test user ID |
| `adminEmail` | `admin@user.com` | Admin email |
| `adminPassword` | `123456` | Admin password |

## 🔍 Debug İpuçları

### Console Logs
Postman Console'da (View > Show Postman Console) token'ları görebilirsiniz:

```javascript
console.log('Access Token:', response.data.accessToken.token);
console.log('Refresh Token:', response.data.refreshToken.token);
console.log('Expires At:', response.data.accessToken.expiresAt);
```

### Response Validation
Test script'leri ile response'ları validate edin:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has access token", function () {
    const response = pm.response.json();
    pm.expect(response.data.accessToken.token).to.exist;
});
```

## 📝 Önemli Notlar

1. **Server Çalışıyor Olmalı**: `npm run dev` ile server'ı başlatın
2. **Environment Aktif**: Sağ üst köşede environment seçili olmalı
3. **Token'lar Otomatik**: Login/Register sonrası token'lar otomatik kaydedilir
4. **Admin Yetkisi**: Bazı endpoint'ler admin yetkisi gerektirir

## 🚨 Hata Durumları

### 401 Unauthorized
- Token eksik veya geçersiz
- Refresh token kullanın

### 403 Forbidden
- Yeterli yetki yok
- Admin kullanıcısı ile giriş yapın

### 400 Bad Request
- Validation hatası
- Request body'yi kontrol edin

### 500 Internal Server Error
- Server hatası
- Console log'ları kontrol edin

---

**İpucu**: Her request'ten sonra response'u inceleyin ve console log'larına bakın!
