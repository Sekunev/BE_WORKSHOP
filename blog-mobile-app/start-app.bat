@echo off
echo Mobil uygulama baslatiliyor...

REM Environment variables ayarla
set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%

echo Environment variables ayarlandi.
echo.

REM Onceki cache'leri temizle
echo Cache temizleniyor...
call npm run clean:android
echo.

REM AsyncStorage'i temizle
echo AsyncStorage temizleniyor...
"C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell pm clear com.blogmobileapp
echo.

REM Metro bundler'i baslat (arka planda)
echo Metro bundler baslatiliyor...
start "Metro Bundler" cmd /c "npm start"

REM 5 saniye bekle
timeout /t 5 /nobreak

REM Android uygulamasini baslat
echo Android uygulamasi baslatiliyor...
call npm run android

echo.
echo Uygulama baslatildi! Sorun yasarsaniz:
echo 1. Metro bundler penceresinde 'r' tusuna basin (reload)
echo 2. Emulator'de Ctrl+M ile dev menu'yu acin
echo 3. "Reload" secenegini secin
pause