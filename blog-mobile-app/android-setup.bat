@echo off
echo Setting up Android and Java environment variables...

set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\Abdullah AHLATLI\AppData\Local\Android\Sdk
set PATH=%PATH%;%JAVA_HOME%\bin
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
set PATH=%PATH%;%ANDROID_HOME%\tools
set PATH=%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin

echo Environment variables set for this session.
echo.
echo Checking ADB...
adb version
echo.
echo Checking connected devices...
adb devices
echo.
echo Starting React Native...
npm run android