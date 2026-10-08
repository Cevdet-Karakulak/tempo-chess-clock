@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto node_missing
node -e "if(Number(process.versions.node.split('.')[0])<22)process.exit(1)"
if errorlevel 1 goto node_missing
node scripts/verify-release-a1.cjs
if errorlevel 1 goto failed
node -e "process.exit(require('./app.json').expo.extra?.eas?.projectId?0:1)"
if errorlevel 1 goto wrong_folder
call npm ci --include=dev --bin-links=true --no-audit --no-fund
if errorlevel 1 goto failed
node node_modules\typescript\bin\tsc --version
if errorlevel 1 goto typescript_missing
call npm test
if errorlevel 1 goto failed
call npm run check
if errorlevel 1 goto failed
call npm run release:check
if errorlevel 1 goto failed
set EAS_NO_VCS=1
call npx --yes eas-cli@24.10.0 whoami
if errorlevel 1 call npx --yes eas-cli@24.10.0 login
if errorlevel 1 goto failed
node scripts/android-apk.cjs build
if errorlevel 1 goto failed
echo APK downloaded. Send the .apk file to your Android phone.
pause
exit /b 0
:node_missing
echo Install Node.js 22.13 or newer, then run again.
pause
exit /b 1
:wrong_folder
echo Use the existing tempo-animated folder already linked to your Expo project.
pause
exit /b 1
:typescript_missing
echo TypeScript installation is missing. Keep the npm install output above.
pause
exit /b 1
:failed
echo This step failed. Keep the message above.
echo If build finished but download failed, run Tempo-APK-Indir.bat.
pause
exit /b 1
