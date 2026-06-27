#!/bin/bash
# Start the Expo dev server.
# Scan the QR code with Expo Go on your Android phone.

cd "$(dirname "$0")/.." || exit 1

echo "Starting InterviewAI Expo dev server..."
echo "Scan the QR code with Expo Go on your Android phone."
echo "Press Ctrl+C to stop."
echo ""

npx expo start
