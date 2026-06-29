@echo off
title Twoverlay - Setup Desktop Shortcut
cd /d "%~dp0"

echo.
echo  ============================================
echo   Twoverlay - Create Desktop Shortcut
echo  ============================================
echo.

:: Create shortcut on desktop using PowerShell
set SCRIPT_DIR=%~dp0
set BAT_FILE=%SCRIPT_DIR%start.bat
set SHORTCUT=%USERPROFILE%\Desktop\Twoverlay.lnk
set ICON_FILE=%SCRIPT_DIR%start.bat

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $s = $ws.CreateShortcut('%SHORTCUT%'); ^
   $s.TargetPath = '%BAT_FILE%'; ^
   $s.WorkingDirectory = '%SCRIPT_DIR%'; ^
   $s.WindowStyle = 7; ^
   $s.Description = 'Twoverlay - Twitch Chat Overlay'; ^
   $s.Save()"

if exist "%SHORTCUT%" (
    echo  [OK] Shortcut created on your Desktop!
    echo.
    echo  You can now launch Twoverlay by double-clicking
    echo  the "Twoverlay" icon on your desktop.
    echo.
) else (
    echo  [ERROR] Failed to create shortcut.
    echo  You can still launch the app by double-clicking start.bat
    echo.
)

pause
