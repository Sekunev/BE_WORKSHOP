@echo off
echo Uygulama sorunlari duzeltiliyor...

REM Environment variables
set ANDROID_HOME=C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%PATH%

echo.
echo 1. Uygulama cache'i temizleniyor...
"C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell pm clear com.blogmobileapp

echo.
echo 2. Metro cache temizleniyor...
npx react-native start --reset-cache

echo.
echo Duzeltme tamamlandi! Uygulamayi yeniden baslatmayi deneyin.
pause