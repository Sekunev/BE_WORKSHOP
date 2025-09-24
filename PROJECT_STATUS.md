# 📊 Proje Durumu Raporu

> Son güncelleme: 24.09.2025 22:05:57

## 📈 Genel İstatistikler

| Metrik | Değer |
|--------|-------|
| **Toplam Endpoint** | 18 |
| **Toplam Model** | 3 |
| **Toplam Middleware** | 3 |

## 🔄 Endpoint Dağılımı

### HTTP Method'lara Göre
| Method | Sayı |
|--------|------|
| GET | 9 |
| POST | 4 |
| PUT | 3 |
| DELETE | 2 |
| PATCH | 0 |


### Erişim Yetkisine Göre
| Erişim | Sayı |
|--------|------|
| 🔒 Private | 4 |
| 👑 Private/Admin | 14 |


### Route'lara Göre
| Route | Endpoint Sayısı |
|-------|-----------------|
| /api/auth | 4 |
| /api/blog | 9 |
| /api/user | 5 |


## 🛠️ API Endpoints

| Method | Endpoint | Açıklama | Erişim | Route |
|--------|----------|----------|--------|-------|
| ➕ POST | `/register` | POST /register | 🔒 Private | auth |
| ➕ POST | `/login` | POST /login | 🔒 Private | auth |
| 🔍 GET | `/me` | GET /me | 🔒 Private | auth |
| ✏️ PUT | `/change-password` | PUT /change-password | 🔒 Private | auth |
| 🔍 GET | `/` | GET / | 👑 Private/Admin | blog |
| 🔍 GET | `/:slug` | GET /:slug | 👑 Private/Admin | blog |
| ➕ POST | `/` | POST / | 👑 Private/Admin | blog |
| ✏️ PUT | `/:id` | PUT /:id | 👑 Private/Admin | blog |
| 🗑️ DELETE | `/:id` | DELETE /:id | 👑 Private/Admin | blog |
| 🔍 GET | `/my-blogs` | GET /my-blogs | 👑 Private/Admin | blog |
| ➕ POST | `/:id/like` | POST /:id/like | 👑 Private/Admin | blog |
| 🔍 GET | `/categories` | GET /categories | 👑 Private/Admin | blog |
| 🔍 GET | `/tags` | GET /tags | 👑 Private/Admin | blog |
| 🔍 GET | `/` | GET / | 👑 Private/Admin | user |
| 🔍 GET | `/:id` | GET /:id | 👑 Private/Admin | user |
| ✏️ PUT | `/profile` | PUT /profile | 👑 Private/Admin | user |
| 🗑️ DELETE | `/:id` | DELETE /:id | 👑 Private/Admin | user |
| 🔍 GET | `/:id/blogs` | GET /:id/blogs | 👑 Private/Admin | user |


## 📋 Veritabanı Modelleri

| Model | Field Sayısı | Field'lar |
|-------|--------------|----------|
| Blog | 13 | title (String, **required**), content (String, **required**), excerpt (String), author (Mixed, **required**), category (String, **required**), featuredImage (String), isPublished (Boolean), publishedAt (Date), viewCount (Number), likeCount (Number), commentCount (Number), readingTime (Number), slug (String) |
| Comment | 6 | content (String, **required**), author (Mixed, **required**), blog (Mixed, **required**), parentComment (Mixed), isApproved (Boolean), likeCount (Number) |
| User | 8 | name (String, **required**), email (String, **required**), password (String, **required**), role (String), avatar (String), bio (String), isActive (Boolean), lastLogin (Date) |


## 🔧 Middleware'ler

| Middleware | Açıklama |
|------------|----------|
| auth | JWT token doğrulama ve yetkilendirme |
| errorHandler | Merkezi hata yakalama sistemi |
| validation | Input validation kontrolü |


## 📝 Son Değişiklikler

Bu dokümantasyon otomatik olarak oluşturulmuştur. Yeni endpoint eklediğinizde:

1. Route dosyasına Swagger dokümantasyonu ekleyin
2. `npm run docs:update` komutunu çalıştırın
3. Bu dokümantasyon otomatik güncellenecektir

## 🔍 Endpoint Detayları

### AUTH Routes

**➕ POST /register**
- **Açıklama**: POST /register
- **Erişim**: 🔒 Private
- **Etiketler**: auth

**➕ POST /login**
- **Açıklama**: POST /login
- **Erişim**: 🔒 Private
- **Etiketler**: auth

**🔍 GET /me**
- **Açıklama**: GET /me
- **Erişim**: 🔒 Private
- **Etiketler**: auth

**✏️ PUT /change-password**
- **Açıklama**: PUT /change-password
- **Erişim**: 🔒 Private
- **Etiketler**: auth

### BLOG Routes

**🔍 GET /**
- **Açıklama**: GET /
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**🔍 GET /:slug**
- **Açıklama**: GET /:slug
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**➕ POST /**
- **Açıklama**: POST /
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**✏️ PUT /:id**
- **Açıklama**: PUT /:id
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**🗑️ DELETE /:id**
- **Açıklama**: DELETE /:id
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**🔍 GET /my-blogs**
- **Açıklama**: GET /my-blogs
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**➕ POST /:id/like**
- **Açıklama**: POST /:id/like
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**🔍 GET /categories**
- **Açıklama**: GET /categories
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

**🔍 GET /tags**
- **Açıklama**: GET /tags
- **Erişim**: 👑 Private/Admin
- **Etiketler**: blog

### USER Routes

**🔍 GET /**
- **Açıklama**: GET /
- **Erişim**: 👑 Private/Admin
- **Etiketler**: user

**🔍 GET /:id**
- **Açıklama**: GET /:id
- **Erişim**: 👑 Private/Admin
- **Etiketler**: user

**✏️ PUT /profile**
- **Açıklama**: PUT /profile
- **Erişim**: 👑 Private/Admin
- **Etiketler**: user

**🗑️ DELETE /:id**
- **Açıklama**: DELETE /:id
- **Erişim**: 👑 Private/Admin
- **Etiketler**: user

**🔍 GET /:id/blogs**
- **Açıklama**: GET /:id/blogs
- **Erişim**: 👑 Private/Admin
- **Etiketler**: user



---

*Bu rapor 24.09.2025 22:05:57 tarihinde otomatik oluşturulmuştur.*
