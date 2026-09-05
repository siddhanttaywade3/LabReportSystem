@echo off
title Samruddhi Clinical Laboratory

echo Starting Lab Report System...

sc query MongoDB | find "RUNNING" >nul

if errorlevel 1 (
    echo MongoDB service is not running.
    echo Open Windows Services, start MongoDB, and try again.
    pause
    exit /b 1
)

start "Lab System Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"

start "Lab System Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo Waiting for the application to start...
timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"

exit