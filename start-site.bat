@echo off
title Trip Tastic Holidays
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js kaanom. https://nodejs.org la LTS version install pannunga.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo.
  echo   Packages install aaguthu... first time mattum, 1-2 nimisham aagum.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   npm install fail aachu. node_modules folder-a delete panni marubadiyum try pannunga.
    pause
    exit /b 1
  )
)

echo.
echo   Trip Tastic website start aaguthu...
echo   Browser automatic-a open aagum: http://localhost:3000
echo   Stop panna: Ctrl + C  (apram Y + Enter)
echo.
start "" cmd /c "timeout /t 5 >nul & start http://localhost:3000"
call npm run dev -- --port 3000 --strictPort
pause
