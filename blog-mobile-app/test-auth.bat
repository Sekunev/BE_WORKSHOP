@echo off
echo Authentication test ediliyor...
echo.

echo 1. Login test:
curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@user.com\",\"password\":\"123456\"}" http://localhost:5000/api/auth/login > temp_login.json
echo Login response kaydedildi: temp_login.json

echo.
echo 2. Token extract ediliyor...
for /f "tokens=*" %%i in ('type temp_login.json ^| findstr "token"') do set TOKEN_LINE=%%i
echo Token line: %TOKEN_LINE%

echo.
echo 3. My blogs test (token ile):
echo Bu adımı manuel yapmanız gerekiyor - token'ı kopyalayıp test edin

echo.
echo Test tamamlandı!
pause