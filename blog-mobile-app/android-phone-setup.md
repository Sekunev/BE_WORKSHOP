# Android Telefon Kurulum Rehberi

## 1. Geliştirici Seçeneklerini Aktifleştirme

### Adım 1: Build Number'ı Bulun
- **Ayarlar** > **Telefon Hakkında** (veya **Cihaz Hakkında**)
- **Yazılım Bilgileri** (bazı telefonlarda)
- **Yapı Numarası** (Build Number) bulun

### Adım 2: Geliştirici Modunu Aktifleştirin
- **Yapı Numarası**'na **7 kez** hızlıca dokunun
- "Artık geliştiricisiniz!" mesajı görünecek

### Adım 3: USB Debugging'i Açın
- **Ayarlar** > **Geliştirici Seçenekleri**
- **USB Debugging**'i açın
- **USB ile Yüklemeye İzin Ver**'i açın (varsa)

## 2. Telefonu Bilgisayara Bağlama

### USB Bağlantısı
1. Telefonu USB kablosu ile bilgisayara bağlayın
2. Telefonda "USB Debugging'e izin ver mi?" sorusu çıkacak
3. **"Bu bilgisayara her zaman izin ver"** işaretleyin
4. **İzin Ver** butonuna basın

### Bağlantıyı Test Etme
```bash
adb devices
```
Bu komut telefonunuzu listede göstermeli.

## 3. React Native Uygulamasını Çalıştırma

### Metro Bundler'ı Başlatın
```bash
npm start
```

### Uygulamayı Telefona Yükleyin
```bash
npm run android
```

## 4. Sorun Giderme

### Telefon Görünmüyorsa
- USB kablosunu değiştirin
- Farklı USB portunu deneyin
- Telefonu yeniden başlatın
- `adb kill-server` sonra `adb start-server` çalıştırın

### İzin Sorunları
- Telefonda "Bilinmeyen Kaynaklardan Yükleme"yi açın
- Güvenlik ayarlarından uygulama yükleme izinlerini kontrol edin

### Network Hatası
- Telefon ve bilgisayar aynı WiFi ağında olmalı
- Firewall ayarlarını kontrol edin

2. Şimdi Telefonu Kontrol Edelim
"C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
