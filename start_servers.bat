@echo off
echo Cleaning up stale processes on ports 5000, 5001, 5173, 5176...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5176') do taskkill /f /pid %%a >nul 2>&1

echo Starting Backend Server...
cd backend
start cmd /k "npm start"
cd ..
echo Backend started in new window

timeout /t 2 /nobreak > nul

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..
echo Frontend started in new window

echo.
echo All services starting...
echo Backend will be on: http://localhost:5000
echo Frontend will be on: http://localhost:5173
echo ML Service is currently running on: http://localhost:5001
echo.
echo Check the new terminal windows for status
pause
