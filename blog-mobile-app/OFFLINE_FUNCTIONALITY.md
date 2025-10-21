# Çevrimdışı Destek ve Önbellekleme Sistemi

Bu döküman, blog mobil uygulamasının çevrimdışı destek ve önbellekleme sistemini açıklar.

## Özellikler

### 1. Çevrimdışı Blog Okuma
- Daha önce görüntülenen bloglar otomatik olarak önbelleğe alınır
- İnternet bağlantısı olmadığında önbellekteki bloglar görüntülenebilir
- Blog listesi ve detay sayfaları çevrimdışı çalışır

### 2. Taslak Yönetimi
- Çevrimdışıyken yazılan bloglar taslak olarak kaydedilir
- Taslaklar internet bağlantısı geldiğinde otomatik senkronize edilir
- Taslak durumu ve senkronizasyon ilerlemesi takip edilir

### 3. Çevrimdışı İşlem Kuyruğu
- Çevrimdışıyken yapılan işlemler (beğeni, paylaşım vb.) kuyruğa alınır
- İnternet bağlantısı geldiğinde kuyrukdaki işlemler otomatik çalıştırılır
- Başarısız işlemler için yeniden deneme mekanizması

### 4. Akıllı Önbellekleme
- LRU (Least Recently Used) algoritması ile önbellek yönetimi
- Önbellek boyutu ve yaşı sınırları
- Otomatik temizleme ve optimizasyon

### 5. Ağ Durumu İzleme
- Gerçek zamanlı ağ durumu takibi
- Bağlantı türü ve kalitesi bilgisi
- Çevrimdışı/çevrimiçi geçiş bildirimleri

## Kullanım

### Temel Kullanım

```typescript
import { useOffline } from '@/hooks/useOffline';
import { OfflineIndicator } from '@/components/common';

function MyComponent() {
  const { 
    isOffline, 
    saveDraft, 
    syncPendingData,
    isBlogAvailableOffline 
  } = useOffline();

  // Çevrimdışı durumu kontrol et
  if (isOffline) {
    console.log('Çevrimdışı modda');
  }

  // Taslak kaydet
  const handleSaveDraft = (blogData) => {
    const draftId = saveDraft(blogData);
    console.log('Taslak kaydedildi:', draftId);
  };

  // Bekleyen verileri senkronize et
  const handleSync = async () => {
    await syncPendingData();
  };

  return (
    <View>
      <OfflineIndicator />
      {/* Diğer bileşenler */}
    </View>
  );
}
```

### Blog Servisi ile Kullanım

```typescript
import BlogService from '@/services/blogService';

// Blog listesi al (çevrimdışı destekli)
const blogs = await BlogService.getBlogs({ page: 1, limit: 10 });

// Blog oluştur (çevrimdışı destekli)
const result = await BlogService.createBlog({
  title: 'Yeni Blog',
  content: 'Blog içeriği...',
  category: 'teknoloji',
  tags: ['react', 'mobile'],
  isPublished: true,
});

// Blog çevrimdışı mevcut mu kontrol et
const isAvailable = BlogService.isBlogAvailableOffline('blog-id');

// Blogları çevrimdışı okuma için hazırla
await BlogService.preloadBlogsForOffline(['blog1', 'blog2', 'blog3']);
```

### Önbellek Yönetimi

```typescript
import { cacheManager } from '@/services/cacheManager';

// Blog önbelleğe al
cacheManager.cacheBlog(blog);

// Önbellekten blog al
const cachedBlog = cacheManager.getCachedBlog('blog-id');

// Önbellek istatistikleri
const stats = cacheManager.getStats();
console.log('Önbellek boyutu:', stats.totalSize);
console.log('Önbellek isabet oranı:', stats.hitRate);

// Önbelleği temizle
cacheManager.invalidateCache();
```

## Bileşenler

### OfflineIndicator
Çevrimdışı durumu ve senkronizasyon bilgilerini gösteren bileşen.

```typescript
<OfflineIndicator 
  showSyncButton={true}
  onSyncPress={() => handleSync()}
/>
```

### SyncStatus
Detaylı senkronizasyon durumu ve istatistikleri gösteren bileşen.

```typescript
<SyncStatus 
  showDetails={true}
  onRefresh={() => handleRefresh()}
/>
```

### BlogListWithOffline
Çevrimdışı desteği olan blog listesi bileşeni.

```typescript
<BlogListWithOffline
  onBlogPress={(blog) => navigateToBlog(blog)}
  searchParams={{ category: 'teknoloji' }}
/>
```

## Konfigürasyon

### Önbellek Ayarları

```typescript
// src/constants/storage.ts
export const CACHE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_ENTRIES: 1000,
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 saat
};

export const CACHE_EXPIRY = {
  SHORT: 5 * 60 * 1000, // 5 dakika
  MEDIUM: 30 * 60 * 1000, // 30 dakika
  LONG: 24 * 60 * 60 * 1000, // 24 saat
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 7 gün
};
```

### Depolama Anahtarları

```typescript
export const STORAGE_KEYS = {
  BLOG_CACHE: 'blog_cache',
  DRAFT_BLOGS: 'draft_blogs',
  OFFLINE_ACTIONS: 'offline_actions',
  // ... diğer anahtarlar
};
```

## Veri Akışı

### Çevrimiçi Mod
1. API'den veri çek
2. Veriyi önbelleğe al
3. Kullanıcıya göster

### Çevrimdışı Mod
1. Önbellekten veri al
2. Varsa kullanıcıya göster
3. Yoksa boş durum göster

### Çevrimdışı İşlemler
1. İşlemi kuyruğa al
2. Yerel durumu güncelle
3. Bağlantı geldiğinde senkronize et

## Hata Yönetimi

### Ağ Hataları
- Otomatik yeniden deneme
- Graceful degradation
- Kullanıcı bilgilendirmesi

### Önbellek Hataları
- Fallback mekanizmaları
- Hata loglaması
- Otomatik kurtarma

### Senkronizasyon Hataları
- Çakışma çözümü
- Manuel müdahale seçenekleri
- Hata raporlama

## Performans Optimizasyonları

### Önbellek Stratejileri
- LRU eviction policy
- Boyut tabanlı sınırlar
- Yaş tabanlı temizleme

### Ağ Optimizasyonları
- Request batching
- Compression
- Conditional requests

### Bellek Yönetimi
- Lazy loading
- Memory pressure handling
- Garbage collection

## Test Senaryoları

### Çevrimdışı Testleri
1. Ağ bağlantısını kes
2. Önbellekteki verileri kontrol et
3. Yeni işlemleri test et
4. Bağlantıyı geri aç
5. Senkronizasyonu doğrula

### Önbellek Testleri
1. Veri önbellekleme
2. Önbellek süresi dolması
3. Önbellek boyutu sınırları
4. LRU eviction

### Senkronizasyon Testleri
1. Taslak senkronizasyonu
2. İşlem kuyruğu
3. Çakışma çözümü
4. Hata durumları

## Bilinen Sınırlamalar

1. **Önbellek Boyutu**: Maksimum 50MB önbellek boyutu
2. **Taslak Sayısı**: Maksimum 100 taslak
3. **İşlem Kuyruğu**: Maksimum 50 bekleyen işlem
4. **Senkronizasyon**: Sadece WiFi/mobil veri ile

## Gelecek Geliştirmeler

1. **Akıllı Önbellekleme**: Kullanıcı davranışlarına göre önceliklendirme
2. **P2P Senkronizasyon**: Cihazlar arası veri paylaşımı
3. **Gelişmiş Çakışma Çözümü**: Otomatik merge algoritmaları
4. **Önbellek Analitikleri**: Detaylı kullanım istatistikleri

## Sorun Giderme

### Sık Karşılaşılan Sorunlar

**Senkronizasyon çalışmıyor**
- Ağ bağlantısını kontrol edin
- Uygulama izinlerini kontrol edin
- Önbelleği temizleyip tekrar deneyin

**Taslaklar kayboldu**
- Uygulama verilerini kontrol edin
- Cihaz depolama alanını kontrol edin
- Backup'tan geri yükleme yapın

**Önbellek çok büyük**
- Önbellek temizleme yapın
- Önbellek boyutu ayarlarını kontrol edin
- Eski verileri manuel temizleyin

### Debug Komutları

```typescript
// Önbellek durumunu kontrol et
console.log(cacheManager.getStats());

// Çevrimdışı durumu kontrol et
console.log(offlineService.getState());

// Senkronizasyon durumu
console.log(offlineService.getSyncStatus());
```