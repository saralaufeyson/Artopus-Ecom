@echo off

start "Artopus Backend" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 5 /nobreak >nul

start "Artopus Frontend" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 5 /nobreak >nul

start http://localhost:5173