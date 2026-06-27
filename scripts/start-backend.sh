#!/bin/bash
# Start the Spring Boot backend with the "local" profile.
# Your application-local.properties is loaded automatically.

cd "$(dirname "$0")/../backend" || exit 1

echo "Starting InterviewAI backend on http://localhost:8080 ..."
echo "Press Ctrl+C to stop."
echo ""

mvn spring-boot:run -Dspring-boot.run.profiles=local
