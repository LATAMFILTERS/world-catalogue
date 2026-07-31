#!/bin/bash
set -e

echo "Starting Knowledge Center API..."
echo "Running migrations..."
node dist/migrate.js

echo "Migrations completed. Starting server..."
node dist/server.js
