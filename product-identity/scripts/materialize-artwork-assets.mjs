#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
if (!args['technology-asset']) throw new Error('Usage: --technology-asset=<path> [--out-dir=<dir>]');
const logo = 'frontend/public/assets/logo-elimfilters.png';
const tech = args['technology-asset'];
for (const p of [logo, tech]) {
  const st = await fs.stat(p).catch(() => null);
  if (!st?.isFile() || st.size === 0) throw new Error(`STOP_ARTWORK_ASSET_MISSING:${p}`);
}
const outDir = args['out-dir'] || 'product-identity/render-assets';
await fs.mkdir(outDir, { recursive: true });
const logoOut = path.join(outDir, path.basename(logo));
const techOut = path.join(outDir, path.basename(tech));
await fs.copyFile(logo, logoOut);
await fs.copyFile(tech, techOut);
console.log(JSON.stringify({ ok:true, logo_asset_path:logoOut, technology_asset_path:techOut }, null, 2));
