#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
const filterType = String(args['filter-type'] || '').trim().toUpperCase();
const catalogTechnology = String(args.technology || '').trim();
if (!filterType && !catalogTechnology) throw new Error('Usage: --filter-type=<type> [--technology=<catalog-tech>]');

const map = new Map([
  ['LUBE','SINTRAX'], ['OIL','SINTRAX'], ['OIL_FILTER','SINTRAX'], ['LUBE_FILTER','SINTRAX'],
  ['FUEL','SYNTAPORE'], ['FUEL_FILTER','SYNTAPORE'],
  ['HYDRAULIC','NANOFORCE'], ['HYDRAULIC_FILTER','NANOFORCE'],
  ['FUEL_WATER_SEPARATOR','HYDRACORE'], ['FUEL/WATER_SEPARATOR','HYDRACORE'], ['WATER_SEPARATOR','HYDRACORE'],
  ['COOLANT','THERMACORE'], ['COOLANT_FILTER','THERMACORE'],
  ['AIR_DRYER','DRYCORE'], ['AIR DRYER','DRYCORE']
]);
const normalizedCatalog = catalogTechnology.toUpperCase().replace(/[®™]/g,'').trim();
const tech = normalizedCatalog || map.get(filterType);
if (!tech) throw new Error(`STOP_TECHNOLOGY_UNRESOLVED:${filterType}`);
const approved = new Set(['SINTRAX','SYNTAPORE','NANOFORCE','HYDRACORE','THERMACORE','DRYCORE']);
if (!approved.has(tech)) throw new Error(`STOP_TECHNOLOGY_NOT_APPROVED:${tech}`);
const dir = 'frontend/public/assets';
const files = await fs.readdir(dir);
const candidates = files.filter(f => f.toUpperCase().replace(/[^A-Z0-9]/g,'').includes(tech.replace(/[^A-Z0-9]/g,'')) && /\.(png|svg|webp|jpg|jpeg)$/i.test(f));
if (candidates.length !== 1) throw new Error(`STOP_TECHNOLOGY_ASSET_${candidates.length === 0 ? 'MISSING' : 'AMBIGUOUS'}:${tech}:${candidates.join(',')}`);
const asset = path.posix.join(dir, candidates[0]);
const stat = await fs.stat(asset);
if (!stat.isFile() || stat.size === 0) throw new Error(`STOP_TECHNOLOGY_ASSET_INVALID:${asset}`);
console.log(JSON.stringify({ ok:true, technology:`${tech}®`, technology_key:tech, technology_asset_path:asset, bytes:stat.size }, null, 2));
