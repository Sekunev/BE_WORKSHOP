@echo off
echo Android cihazlar kontrol ediliyor...
echo.

set ANDROID_HOME=C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%PATH%

echo Bağlı cihazlar:
"C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices

echo.
echo Eğer telefonunuz listede görünmüyorsa:
echo 1. USB Debugging açık olduğundan emin olun
echo 2. Telefonda çıkan izin penceresini onaylayın
echo 3. USB kablosunu kontrol edin
echo 4. Farklı USB portu deneyin

pause