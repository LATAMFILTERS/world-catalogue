#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
const filterType = String(args['filter-type'] || '').trim().toUpperCase();
const catalogTechnology = String(args.technology || '').trim();
if (!filterType && !catalogTechnology) throw new Error('Usage: --filter-type=<type> [--technology=<catalog-tech>]');

const filterMap = new Map([
  ['LUBE','SYNTRAX'], ['OIL','SYNTRAX'], ['OIL_FILTER','SYNTRAX'], ['LUBE_FILTER','SYNTRAX'],
  ['FUEL','SYNTAPORE'], ['FUEL_FILTER','SYNTAPORE'],
  ['HYDRAULIC','NANOFORCE'], ['HYDRAULIC_FILTER','NANOFORCE'],
  ['FUEL_WATER_SEPARATOR','HYDROCORE'], ['FUEL/WATER_SEPARATOR','HYDROCORE'], ['WATER_SEPARATOR','HYDROCORE'],
  ['COOLANT','THERMACORE'], ['COOLANT_FILTER','THERMACORE'],
  ['AIR_DRYER','DRYCORE'], ['AIR DRYER','DRYCORE'],
  ['FUEL_FILTER_HOUSING','TURBOCORE'], ['FUEL HOUSING','TURBOCORE']
]);
const aliases = new Map([['SINTRAX','SYNTRAX'], ['HYDRACORE','HYDROCORE']]);
const labels = new Map([
  ['SYNTRAX','SYNTRAX™'], ['SYNTAPORE','SYNTAPORE™'], ['NANOFORCE','NANOFORCE™'],
  ['HYDROCORE','HYDROCORE™'], ['THERMACORE','THERMACORE™'], ['DRYCORE','DRYCORE'], ['TURBOCORE','TURBOCORE™']
]);
const normalizedCatalog = catalogTechnology.toUpperCase().replace(/[®™]/g,'').trim();
const catalogKey = aliases.get(normalizedCatalog) || normalizedCatalog;
const tech = catalogKey || filterMap.get(filterType);
if (!tech) throw new Error(`STOP_TECHNOLOGY_UNRESOLVED:${filterType}`);
if (!labels.has(tech)) throw new Error(`STOP_TECHNOLOGY_NOT_APPROVED:${tech}`);

const dir = 'frontend/public/assets';
const files = await fs.readdir(dir);
const supported = /\.(avif|png|svg|webp|jpg|jpeg)$/i;
const canonical = files.filter(f => new RegExp(`^${tech}_final\\.(avif|png|svg|webp|jpg|jpeg)$`, 'i').test(f));
const candidates = canonical.length === 1 ? canonical : files.filter(f =>
  f.toUpperCase().replace(/[^A-Z0-9]/g,'').includes(tech.replace(/[^A-Z0-9]/g,'')) && supported.test(f) && !/preview/i.test(f)
);
if (candidates.length !== 1) throw new Error(`STOP_TECHNOLOGY_ASSET_${candidates.length === 0 ? 'MISSING' : 'AMBIGUOUS'}:${tech}:${candidates.join(',')}`);
const asset = path.posix.join(dir, candidates[0]);
const stat = await fs.stat(asset);
if (!stat.isFile() || stat.size === 0) throw new Error(`STOP_TECHNOLOGY_ASSET_INVALID:${asset}`);

const descriptor = tech === 'SYNTAPORE' ? 'Fuel System Protection' : tech === 'SYNTRAX' ? 'Powered Filtration' : null;
console.log(JSON.stringify({
  ok:true,
  technology:labels.get(tech),
  technology_key:tech,
  technology_descriptor:descriptor,
  technology_asset_path:asset,
  bytes:stat.size
}, null, 2));
