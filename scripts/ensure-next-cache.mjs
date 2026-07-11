import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const cacheDir = resolve(process.cwd(), '.next', 'cache');
mkdirSync(cacheDir, { recursive: true });
console.log(`[ensure-next-cache] Ready: ${cacheDir}`);
