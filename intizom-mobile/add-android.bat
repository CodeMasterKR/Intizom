@echo off
cd /d C:\Users\Kamronbek\Desktop\intizom-mobile
echo Adding Android platform...
npx cap add android
echo Syncing...
npx cap sync android
echo Done! Open Android Studio with: npx cap open android
pause
