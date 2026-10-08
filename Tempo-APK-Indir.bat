@echo off
setlocal
cd /d "%~dp0"
set EAS_NO_VCS=1
node scripts/android-apk.cjs download
if errorlevel 1 goto failed
pause
exit /b 0
:failed
echo Download failed. No new build started. Keep the message above.
pause
exit /b 1
