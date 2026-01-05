@echo off
REM --- Navigate to the server folder and install dependencies ---
echo Installing backend dependencies...
cd /d "%~dp0server"
npm install

REM --- Start the backend server in a new window ---
echo Starting the backend server...
start "Artopus Backend" cmd /k "npm run dev"

REM --- Wait for 5 seconds to give the server time to start up ---
echo Waiting for the server to warm up...
timeout /t 5 /nobreak > nul

REM --- Navigate to the client folder and install dependencies ---
echo Installing frontend dependencies...
cd /d "%~dp0client"
npm install

REM --- Start the frontend client in a new window ---
echo Starting the frontend client...
start "Artopus Frontend" cmd /k "npm run dev"

REM --- Wait for 5 seconds before opening the browser ---
echo Waiting for the client to warm up...
timeout /t 5 /nobreak > nul

REM --- Open the frontend in the default browser ---
echo Opening the frontend in your browser...
start http://localhost:5173

echo All done!