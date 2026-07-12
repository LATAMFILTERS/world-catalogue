import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const nextDir = resolve(process.cwd(), '.next');
const cacheDir = resolve(nextDir, 'cache');

rmSync(nextDir, { recursive: true, force: true });
console.log(`[ensure-next-cache] Removed stale Next build directory: ${nextDir}`);

mkdirSync(cacheDir, { recursive: true });
console.log(`[ensure-next-cache] Ready: ${cacheDir}`);
