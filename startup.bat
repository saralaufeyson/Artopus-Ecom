@echo off
setlocal

echo ==========================================
echo   Artopus Project Runner
echo ==========================================

REM ---------- BACKEND ----------
echo.
echo Starting backend...
cd /d "%~dp0server" || (
    echo ❌ Server folder not found
    pause
    exit /b 1
)

start "Artopus Backend" cmd /k "npm run dev"

REM ---------- WAIT ----------
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

REM ---------- FRONTEND ----------
echo.
echo Starting frontend...
cd /d "%~dp0client" || (
    echo ❌ Client folder not found
    pause
    exit /b 1
)

start "Artopus Frontend" cmd /k "npm run dev"

REM ---------- BROWSER ----------
timeout /t 5 /nobreak > nul
echo Opening browser...
start http://localhost:5173

echo.
echo ✅ Backend & Frontend are running
pause
