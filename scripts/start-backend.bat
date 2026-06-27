@echo off
REM Start the Spring Boot backend with the "local" profile.
REM Your application-local.properties is loaded automatically.

cd /d "%~dp0..\backend"

echo Starting InterviewAI backend on http://localhost:8080 ...
echo Press Ctrl+C to stop.
echo.

mvn spring-boot:run -Dspring-boot.run.profiles=local
