@echo off
setlocal
cd /d "%~dp0"
title Maison Hotel Management - Browser Edition
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js LTS from https://nodejs.org/ and retry.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing website dependencies for the first run...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and retry.
    pause
    exit /b 1
  )
)
set "APP_PORT=3010"
netstat -ano | findstr /R /C:":3010 .*LISTENING" >nul
if not errorlevel 1 set "APP_PORT=3011"
start "" /b powershell -NoProfile -ExecutionPolicy Bypass -Command "while (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port %APP_PORT% -InformationLevel Quiet)) { Start-Sleep -Seconds 1 }; Start-Process 'http://localhost:%APP_PORT%/login'"
if "%APP_PORT%"=="3011" (
  echo Port 3010 is busy; starting Maison on port 3011.
  call npm run dev:alternate
) else (
  call npm run dev
)
pause
