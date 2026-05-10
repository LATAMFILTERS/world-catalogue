#!/bin/bash
set -e

echo "Installing root dependencies..."
npm install

echo "Installing Next.js dependencies..."
cd motor-de-busqueda
npm install
cd ..

echo "Starting server..."
node server.js
