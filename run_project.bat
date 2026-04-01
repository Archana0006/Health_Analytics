@echo off
echo Cleaning up stale processes on ports 5000, 5001, 5173, 5176...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5176') do taskkill /f /pid %%a >nul 2>&1

echo Starting Digital Health Analytics System...

:: Start Backend
start cmd /k "cd backend && npm.cmd start"

:: Start ML Service
start cmd /k "cd ml-service && python app.py"

:: Start Frontend
start cmd /k "cd frontend && npm.cmd run dev"

echo All services are starting up.
echo Backend: http://localhost:5000
echo ML-Service: http://localhost:5001
echo Frontend: http://localhost:5176
pause
