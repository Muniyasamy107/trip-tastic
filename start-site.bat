@echo off
title Trip Tastic Holidays
cd /d "%~dp0"

echo.
echo   ============================================
echo    TRIP TASTIC HOLIDAYS - local dev server
echo   ============================================

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   [X] Node.js kaanom.
  echo       https://nodejs.org la LTS version install pannunga ^(Node 20+^).
  echo.
  pause
  exit /b 1
)

node -v

if not exist "node_modules" (
  echo.
  echo   [1/2] Packages install aaguthu... first time mattum, 1-2 nimisham.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   [X] npm install fail aachu.
    echo       node_modules folder-a delete panni marubadiyum try pannunga.
    echo.
    pause
    exit /b 1
  )
) else (
  echo   [1/2] node_modules ready - install skip.
)

echo.
echo   [2/2] Server start aaguthu... free port automatic-a edukkum.
echo         Browser thaana open aagum. Stop panna: Ctrl + C  ^(apram Y + Enter^)
echo.

call node scripts\launch.mjs
pause
