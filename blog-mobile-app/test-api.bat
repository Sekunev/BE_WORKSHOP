@echo off
echo API endpoint'leri test ediliyor...
echo.

echo 1. Backend health check:
curl -s http://localhost:5000/health
echo.
echo.

echo 2. Blog listesi:
curl -s http://localhost:5000/api/blogs | head -5
echo.
echo.

echo 3. Tek blog (slug ile):
curl -s "http://localhost:5000/api/blogs/yapay-zeka-is-dunyasini-nasil-donusturuyor" | head -5
echo.
echo.

echo 4. Kategoriler:
curl -s http://localhost:5000/api/blogs/categories
echo.
echo.

echo Test tamamlandı!
pause