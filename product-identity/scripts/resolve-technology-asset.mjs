#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPE_TO_TECH = new Map([
  ['LUBE', 'SYNTRAX'], ['OIL', 'SYNTRAX'], ['OIL_FILTER', 'SYNTRAX'], ['LUBE_FILTER', 'SYNTRAX'],
  ['FUEL', 'SYNTAPORE'], ['FUEL_FILTER', 'SYNTAPORE'],
  ['HYDRAULIC', 'NANOFORCE'], ['HYDRAULIC_FILTER', 'NANOFORCE'],
  ['FUEL_WATER_SEPARATOR', 'HYDROCORE'], ['FUEL/WATER_SEPARATOR', 'HYDROCORE'], ['WATER_SEPARATOR', 'HYDROCORE'],
  ['COOLANT', 'THERMACORE'], ['COOLANT_FILTER', 'THERMACORE'],
  ['AIR_DRYER', 'DRYCORE'], ['AIR DRYER', 'DRYCORE'],
  ['FUEL_FILTER_HOUSING', 'TURBOCORE'], ['FUEL HOUSING', 'TURBOCORE']
]);

const LEGACY_ALIASES = new Map([
  ['SINTRAX', 'SYNTRAX'],
  ['HYDRACORE', 'HYDROCORE']
]);

const APPROVED = new Set(['SYNTRAX', 'SYNTAPORE', 'NANOFORCE', 'HYDROCORE', 'THERMACORE', 'DRYCORE', 'TURBOCORE']);

const DESCRIPTORS = new Map([
  ['SYNTAPORE', 'Fuel System Protection'],
  ['SYNTRAX', 'Powered Filtration']
]);

function normalize(value) {
  const raw = String(value || '').toUpperCase().replace(/[®™]/g, '').trim();
  return LEGACY_ALIASES.get(raw) || raw;
}

export async function resolveTechnologyAsset({
  filterType = '',
  catalogTechnology = '',
  assetsDir = 'frontend/public/assets'
} = {}) {
  const normalizedType = String(filterType || '').trim().toUpperCase();
  const catalogTech = normalize(catalogTechnology);
  const technologyKey = catalogTech || TYPE_TO_TECH.get(normalizedType);
  if (!technologyKey) throw new Error(`STOP_TECHNOLOGY_UNRESOLVED:${normalizedType}`);
  if (!APPROVED.has(technologyKey)) throw new Error(`STOP_TECHNOLOGY_NOT_APPROVED:${technologyKey}`);

  const files = await fs.readdir(assetsDir);
  const supported = /\.(png|svg|webp|jpg|jpeg|avif)$/i;
  const canonical = files.filter((file) => new RegExp(`^${technologyKey}_final\\.(avif|png|svg|webp|jpg|jpeg)$`, 'i').test(file));
  const needle = technologyKey.replace(/[^A-Z0-9]/g, '');
  const candidates = canonical.length === 1
    ? canonical
    : files.filter((file) =>
        file.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(needle)
        && supported.test(file)
        && !/preview/i.test(file)
      );
  if (candidates.length !== 1) {
    throw new Error(`STOP_TECHNOLOGY_ASSET_${candidates.length === 0 ? 'MISSING' : 'AMBIGUOUS'}:${technologyKey}:${candidates.join(',')}`);
  }
  const asset = path.posix.join(assetsDir.replace(/\\/g, '/'), candidates[0]);
  const stat = await fs.stat(asset);
  if (!stat.isFile() || stat.size === 0) throw new Error(`STOP_TECHNOLOGY_ASSET_INVALID:${asset}`);
  return {
    ok: true,
    technology: `${technologyKey}™`,
    technology_key: technologyKey,
    technology_descriptor: DESCRIPTORS.get(technologyKey) ?? null,
    technology_asset_path: asset,
    bytes: stat.size
  };
}

async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, '').split('=');
    return [key, value.join('=')];
  }));
  const filterType = String(args['filter-type'] || '').trim();
  const catalogTechnology = String(args.technology || '').trim();
  if (!filterType && !catalogTechnology) {
    throw new Error('Usage: --filter-type=<type> [--technology=<catalog-tech>]');
  }
  const result = await resolveTechnologyAsset({ filterType, catalogTechnology });
  console.log(JSON.stringify(result, null, 2));
}

const direct = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (direct) main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
