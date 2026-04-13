@echo off
setlocal ENABLEDELAYEDEXPANSION

echo ==========================================
echo   Artopus MERN Project Runner
echo ==========================================

REM ---------- CHECK NODE ----------
echo.
echo Checking Node.js...
node -v >nul 2>&1 || (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo ✔ Node.js found

REM ---------- BACKEND ----------
echo.
echo ---------- BACKEND ----------
cd /d "%~dp0server" || (
    echo ❌ Server folder not found
    pause
    exit /b 1
)

IF NOT EXIST node_modules (
    echo 📦 node_modules not found (backend)
    echo Installing backend dependencies...
    npm install || (
        echo ❌ Backend npm install failed
        pause
        exit /b 1
    )
) ELSE (
    echo ✔ Backend dependencies already installed
)

echo Starting backend...
start "Artopus Backend" cmd /k "npm run dev"

REM ---------- WAIT ----------
echo Waiting for backend to boot...
timeout /t 5 /nobreak > nul

REM ---------- FRONTEND ----------
echo.
echo ---------- FRONTEND ----------
cd /d "%~dp0client" || (
    echo ❌ Client folder not found
    pause
    exit /b 1
)

IF NOT EXIST node_modules (
    echo 📦 node_modules not found (frontend)
    echo Installing frontend dependencies...
    npm install || (
        echo ❌ Frontend npm install failed
        pause
        exit /b 1
    )
) ELSE (
    echo ✔ Frontend dependencies already installed
)

echo Starting frontend...
start "Artopus Frontend" cmd /k "npm run dev"

REM ---------- BROWSER ----------
timeout /t 5 /nobreak > nul
echo Opening browser...
start http://localhost:5173

echo.
echo ✅ Backend & Frontend are running
echo ==========================================
pause
