@echo off
echo Token debug testi...
echo.

echo 1. Admin login:
curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@user.com\",\"password\":\"123456\"}" http://localhost:5000/api/auth/login | jq .

echo.
echo 2. My blogs endpoint test (manuel token gerekli):
echo curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/blogs/my-blogs

echo.
echo 3. Create blog test (manuel token gerekli):
echo curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"Test Blog\",\"content\":\"Test content for mobile app\",\"category\":\"Teknoloji\",\"isPublished\":true}" http://localhost:5000/api/blogs

pause