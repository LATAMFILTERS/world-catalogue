#!/bin/bash

echo "Starting ELIMFILTERS servers..."

# Start API server in background
echo "→ API server (port ${API_PORT:-5000})"
node api-server.js &
API_PID=$!

# Start frontend server
echo "→ Frontend server (port ${PORT:-3000})"
node server.js &
FRONTEND_PID=$!

# Handle shutdown gracefully
trap "kill $API_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM

wait
