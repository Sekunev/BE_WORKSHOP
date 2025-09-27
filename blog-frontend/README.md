# Blog Platformu Frontend

Modern blog platformu için Next.js, shadcn/ui ve Tailwind CSS ile geliştirilmiş frontend uygulaması.

## 🚀 Özellikler

- **Modern UI/UX**: shadcn/ui bileşenleri ile profesyonel tasarım
- **Responsive Design**: Mobil ve desktop uyumlu
- **Authentication**: Kullanıcı girişi, kayıt ve profil yönetimi
- **Blog Yönetimi**: Blog oluşturma, düzenleme, silme
- **Dashboard**: Kişisel blog istatistikleri ve yönetim paneli
- **Real-time Updates**: API entegrasyonu ile gerçek zamanlı veri
- **TypeScript**: Tip güvenliği ve geliştirici deneyimi

## 🛠️ Teknolojiler

- **Next.js 14**: React framework
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI bileşenleri
- **React Hook Form**: Form yönetimi
- **Zod**: Schema validation
- **Axios**: HTTP client
- **Lucide React**: İkonlar
- **date-fns**: Tarih işlemleri

## 📦 Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Environment değişkenlerini ayarlayın:**
   ```bash
   cp .env.example .env.local
   ```
   
   `.env.local` dosyasını düzenleyin:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

4. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

## 🏗️ Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication sayfaları
│   ├── blogs/             # Blog sayfaları
│   ├── dashboard/         # Dashboard sayfası
│   └── layout.tsx         # Ana layout
├── components/            # React bileşenleri
│   ├── auth/              # Auth bileşenleri
│   ├── blog/              # Blog bileşenleri
│   ├── layout/            # Layout bileşenleri
│   └── ui/                # shadcn/ui bileşenleri
├── contexts/              # React Context'ler
├── lib/                   # Utility fonksiyonlar
│   ├── api.ts            # Axios konfigürasyonu
│   └── services/         # API servisleri
└── utils/                # Yardımcı fonksiyonlar
```

## 🔗 API Entegrasyonu

Frontend, backend API'si ile tam entegre çalışır:

- **Authentication**: Login, register, token yenileme
- **Blog Management**: CRUD işlemleri
- **User Management**: Profil yönetimi
- **Real-time Updates**: Otomatik token yenileme

## 📱 Sayfalar

### Public Sayfalar
- **Ana Sayfa** (`/`): Hero section ve blog listesi
- **Blog Listesi** (`/blogs`): Tüm bloglar
- **Blog Detayı** (`/blogs/[slug]`): Tek blog görüntüleme
- **Giriş** (`/auth/login`): Kullanıcı girişi
- **Kayıt** (`/auth/register`): Kullanıcı kaydı

### Private Sayfalar
- **Dashboard** (`/dashboard`): Kişisel blog yönetimi
- **Blog Oluştur** (`/blogs/create`): Yeni blog yazma
- **Blog Düzenle** (`/blogs/[id]/edit`): Blog düzenleme

## 🎨 UI Bileşenleri

shadcn/ui bileşenleri kullanılarak oluşturulmuş modern arayüz:

- **Form Components**: Input, Textarea, Select
- **Layout Components**: Card, Navigation, Footer
- **Feedback Components**: Toast, Badge, Avatar
- **Interactive Components**: Button, Dialog, Dropdown

## 🔐 Authentication

Context API ile state yönetimi:

- **AuthContext**: Kullanıcı durumu ve authentication
- **Token Management**: Otomatik token yenileme
- **Route Protection**: Private sayfa koruması
- **Persistent Login**: LocalStorage ile oturum sürdürme

## 📊 Dashboard

Kullanıcılar için kişisel yönetim paneli:

- **İstatistikler**: Toplam blog, görüntüleme, beğeni sayıları
- **Blog Listesi**: Kişisel blogların listesi
- **Hızlı İşlemler**: Blog oluşturma, düzenleme, silme
- **Durum Takibi**: Yayında/taslak blog durumları

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t blog-frontend .
docker run -p 3000:3000 blog-frontend
```

## 🔧 Geliştirme

### Yeni Bileşen Ekleme
```bash
npx shadcn-ui@latest add [component-name]
```

### TypeScript Kontrolü
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📝 Önemli Notlar

1. **Backend Bağlantısı**: Backend API'sinin çalışır durumda olması gerekir
2. **Environment Variables**: API URL'ini doğru ayarlayın
3. **CORS**: Backend'de CORS ayarlarının yapılmış olması gerekir
4. **Token Expiry**: Token süreleri backend ile uyumlu olmalı

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Abdullah AHLATLI**
- Modern web teknolojileri uzmanı
- Full-stack developer
- Blog ve eğitim içerikleri üreticisi

---

**Not**: Bu frontend uygulaması, backend API'si ile birlikte çalışacak şekilde tasarlanmıştır. Backend API'sinin çalışır durumda olduğundan emin olun.