@echo off
title Twoverlay - Twitch Chat Overlay
cd /d "%~dp0"

echo.
echo  ============================================
echo   Twoverlay - Twitch Chat Overlay
echo  ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found!
    echo.
    echo  Please install Node.js from: https://nodejs.org/
    echo  Download the LTS version and run the installer.
    echo.
    pause
    start https://nodejs.org/
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo  [INFO] First launch - installing dependencies...
    echo  This will take about 1-2 minutes, please wait...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  [ERROR] Failed to install dependencies.
        echo  Make sure you have an internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed successfully!
    echo.
)

:: Launch the app
echo  [INFO] Starting Twoverlay...
echo  Press Ctrl+Shift+Y in overlay window to unlock settings.
echo.
npm start

