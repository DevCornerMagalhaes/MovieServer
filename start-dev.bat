@echo off
REM Windows Development Startup Script

echo 🚀 Starting MovieServer Local Development Environment
echo.

REM Start backend in background
echo 📡 Starting ASP.NET Core Backend on port 5000...
start /b "Backend" cmd /c "cd backend && dotnet run"

REM Wait for backend to start
timeout /t 3 >nul

REM Start transcoding service in background  
echo 🎬 Starting Transcoding Service on port 5001...
start /b "Transcoding" cmd /c "cd backend && node transcoding-service.js"

REM Wait for transcoding service to start
timeout /t 3 >nul

REM Start frontend in background
echo ⚛️ Starting React Frontend on port 3000...
start /b "Frontend" cmd /c "cd frontend && npm start"

echo.
echo ✅ All services started!
echo    Backend: http://localhost:5000
echo    Transcoding: http://localhost:5001  
echo    Frontend: http://localhost:3000
echo.
echo Press any key to stop all services...
pause >nul

REM Kill all processes
taskkill /f /im dotnet.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ All services stopped
