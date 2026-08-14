#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'frontend', 'out');
const destination = path.join(root, 'out');

if (!fs.existsSync(source)) {
  throw new Error(`Frontend static export not found: ${source}`);
}

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });

if (!fs.existsSync(path.join(destination, 'index.html'))) {
  throw new Error('Root static export is missing index.html after sync.');
}

console.log('Static export synced to repository root: out/');
