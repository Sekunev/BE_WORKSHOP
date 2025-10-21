@echo off
echo Telefonda uygulama çalıştırılıyor...

set ANDROID_HOME=C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%PATH%

echo.
echo Bağlı cihazlar kontrol ediliyor...
"C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices

echo.
echo Metro bundler başlatılıyor...
start "Metro Bundler" cmd /c "npm start"

echo 5 saniye bekleniyor...
timeout /t 5 /nobreak

echo.
echo Uygulama telefona yükleniyor...
npm run android

echo.
echo Uygulama başlatıldı!
echo.
echo Sorun yaşarsanız:
echo - Telefonda USB Debugging açık olduğundan emin olun
echo - "Bu bilgisayara güven" seçeneğini işaretleyin
echo - Metro bundler penceresinde 'r' tuşuna basarak reload yapın

pause