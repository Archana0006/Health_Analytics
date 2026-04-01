@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Digital Health Analytics System - Robust Startup
echo ===================================================

:: 1. Cleanup Stale Processes
echo [1/4] Cleaning up ports 5000, 5001, 5176...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5176 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

:: 2. Prerequisite Checks
echo [2/4] Checking prerequisites...
where node >nul 2>&1 || (echo ERROR: Node.js NOT found! & pause & exit /b 1)
where python >nul 2>&1 || (echo ERROR: Python NOT found! & pause & exit /b 1)
echo Prerequisites OK.

:: 3. Start Services
echo [3/4] Starting services...

:: Start Backend
echo Starting Backend...
start "Backend API" cmd /c "cd backend && npm.cmd start"

:: Start ML Service
echo Starting ML Service...
start "ML Service" cmd /c "cd ml-service && python app.py"

:: Start Frontend
echo Starting Frontend...
start "Frontend UI" cmd /c "cd frontend && npm.cmd run dev"

:: 4. Launch Application
echo [4/4] Finalizing...
echo Waiting 5 seconds for services to initialize...
timeout /t 5 /nobreak >nul

echo Opening application in browser...
start http://localhost:5176

echo.
echo ===================================================
echo   SYSTEM IS STARTING UP!
echo   Frontend: http://localhost:5176
echo   Backend:  http://localhost:5000
echo   ML:       http://localhost:5001
echo ===================================================
echo Keep these windows open while using the app.
pause
