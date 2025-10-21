@echo off
echo Setting up environment for Android build...

set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%

echo.
echo Testing Java...
java -version

echo.
echo Testing ADB...
adb version

echo.
echo Building Android app...
cd android
gradlew.bat app:installDebug -PreactNativeDevServerPort=8081