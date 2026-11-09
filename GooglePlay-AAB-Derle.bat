@echo off
chcp 65001 > nul
echo ===================================================
echo   Tempo · Satranç Saati - Google Play AAB Derleyici
echo   FloppaTech Corp (c) 2026
echo ===================================================
echo.
cd /d "%~dp0"

echo [1/3] Kod tabanı testleri ve doğrulama yapılıyor...
call npm test
if %errorlevel% neq 0 (
    echo [HATA] Testler başarısız oldu! Derleme durduruldu.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Android Release App Bundle (AAB) derleniyor...
cd android
call .\gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo [HATA] Gradle derleme hatası oluştu!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [3/3] Çıktı dosyası kopyalanıyor...
copy /Y "android\app\build\outputs\bundle\release\app-release.aab" "Tempo-Release.aab"
copy /Y "android\app\build\outputs\bundle\release\app-release.aab" "store-assets\Tempo-Release.aab"

echo.
echo ===================================================
echo [BAŞARILI] Google Play Store paketi hazır!
echo Dosya: %~dp0Tempo-Release.aab
echo ===================================================
pause
