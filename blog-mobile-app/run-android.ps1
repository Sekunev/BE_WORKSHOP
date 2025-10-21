Write-Host "Setting up environment for Android build..."

$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

Write-Host ""
Write-Host "Testing Java..."
& "$env:JAVA_HOME\bin\java.exe" -version

Write-Host ""
Write-Host "Testing ADB..."
& "$env:ANDROID_HOME\platform-tools\adb.exe" version

Write-Host ""
Write-Host "Cleaning Gradle cache..."
Set-Location android
& ".\gradlew.bat" clean

Write-Host ""
Write-Host "Building Android app..."
& ".\gradlew.bat" app:installDebug -PreactNativeDevServerPort=8081