#!/bin/bash
set -e

echo "Starting Knowledge Center API..."

if [ -n "${BRIDGE_UPSTREAM_URL:-}" ]; then
  echo "Bridge mode enabled; skipping PostgreSQL migrations."
  exec node dist/server.js
fi

echo "Running migrations..."
node dist/migrate.js

echo "Migrations completed. Starting server..."
exec node dist/server.js
