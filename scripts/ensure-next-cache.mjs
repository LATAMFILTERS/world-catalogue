import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const cacheDir = resolve(process.cwd(), '.next', 'cache');
mkdirSync(cacheDir, { recursive: true });

for (const entry of readdirSync(cacheDir)) {
  const normalized = entry.toLowerCase();
  if (normalized.includes('font')) {
    const target = join(cacheDir, entry);
    rmSync(target, { recursive: true, force: true });
    console.log(`[ensure-next-cache] Removed stale font cache: ${target}`);
  }
}

const serverDir = resolve(process.cwd(), '.next', 'server');
const serverFiles = ['next-font-manifest.json', 'next-font-manifest.js'];
if (existsSync(serverDir)) {
  for (const file of serverFiles) {
    const target = join(serverDir, file);
    rmSync(target, { force: true });
    console.log(`[ensure-next-cache] Removed stale font manifest: ${target}`);
  }
}

console.log(`[ensure-next-cache] Ready: ${cacheDir}`);
