@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto node_missing
node -e "if(Number(process.versions.node.split('.')[0])<22)process.exit(1)"
if errorlevel 1 goto node_missing
call npm ci --no-audit --no-fund
if errorlevel 1 goto failed
node scripts/background-audio-fix.cjs verify .
if errorlevel 1 goto failed
call npm test
if errorlevel 1 goto failed
call npm run check
if errorlevel 1 goto failed
call npm run release:check
if errorlevel 1 goto failed
set EAS_NO_VCS=1
call npx --yes eas-cli@latest whoami
if errorlevel 1 call npx --yes eas-cli@latest login
if errorlevel 1 goto failed
node -e "process.exit(require('./app.json').expo.extra?.eas?.projectId?0:1)"
if errorlevel 1 call npx --yes eas-cli@latest init
if errorlevel 1 goto failed
call npx --yes eas-cli@latest build --platform ios --profile production
if errorlevel 1 goto failed
call npx --yes eas-cli@latest submit --platform ios --profile production --latest
if errorlevel 1 goto failed
echo TestFlight upload complete. Finish the App Store Connect listing using store files.
pause
exit /b 0
:node_missing
echo Install Node.js 22.13 or newer, then run this file again.
pause
exit /b 1
:failed
echo This step failed. Keep the message above; do not repeatedly create new projects.
pause
exit /b 1
