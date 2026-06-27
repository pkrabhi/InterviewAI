@echo off
REM Start the Expo dev server.
REM Scan the QR code with Expo Go on your Android phone.

cd /d "%~dp0.."

echo Starting InterviewAI Expo dev server...
echo Scan the QR code with Expo Go on your Android phone.
echo Press Ctrl+C to stop.
echo.

npx expo start
