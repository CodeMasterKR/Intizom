@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d C:\Users\Kamronbek\Desktop\intizom-mobile

echo [1/3] Building frontend...
call npm run build
if %errorlevel% neq 0 (
  echo Frontend build failed!
  pause
  exit /b 1
)

echo [2/3] Syncing to Android...
call npx cap sync android
if %errorlevel% neq 0 (
  echo Cap sync failed!
  pause
  exit /b 1
)

echo [3/3] Building APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
  echo APK build failed!
  pause
  exit /b 1
)

echo.
echo Done! APK is at:
echo C:\Users\Kamronbek\Desktop\intizom-mobile\android\app\build\outputs\apk\debug\app-debug.apk
pause
