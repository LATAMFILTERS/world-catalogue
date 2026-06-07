/**
 * merge_alternatives.js
 * Para cada grupo de productos alternativos, propaga la unión de
 * oem_codes + competitor_codes + equipment_applications a todos los miembros.
 *
 * Las relaciones de alternativas se leen desde los JSON locales (donaldson_*_results.json).
 * Los datos actuales y las actualizaciones van al DB via DATABASE_URL o Railway directo.
 *
 * Uso:
 *   node scripts/merge_alternatives.js --dry-run   (solo muestra stats)
 *   node scripts/merge_alternatives.js             (escribe al DB)
 */

'use strict';

const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');

const DRY_RUN  = process.argv.includes('--dry-run');
const JSON_DIR = path.join(__dirname);   // JSON files live next to this script

const POOL = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host:     'ballast.proxy.rlwy.net',
      port:     18263,
      database: 'railway',
      user:     'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      ssl:      { rejectUnauthorized: false },
    });

// ── helpers ────────────────────────────────────────────────────────────────

function keyOem(o)   { return `${(o.manufacturer||'').toUpperCase()}|${(o.code||'').toUpperCase()}`; }
function keyEquip(e) { return `${e.equipment||''}|${e.type||''}|${e.engine||''}`; }

function unionArrays(arrays, keyFn) {
  const seen = new Map();
  for (const arr of arrays) {
    for (const item of (arr || [])) {
      const k = keyFn(item);
      if (!seen.has(k)) seen.set(k, item);
    }
  }
  return [...seen.values()];
}

// ── load alternatives from JSON files ─────────────────────────────────────

function buildAlternativesGraph() {
  // donaldson_pn → sku_elimfilters
  const pnToSku = new Map();
  // sku → Set<sku>  (undirected edges)
  const graph   = new Map();

  const files = fs.readdirSync(JSON_DIR)
    .filter(f => /^donaldson_.*_results\.json$/.test(f))
    .map(f => path.join(JSON_DIR, f));

  // Pass 1: build pn→sku map
  for (const fpath of files) {
    let data;
    try { data = JSON.parse(fs.readFileSync(fpath, 'utf8')); }
    catch { continue; }
    for (const p of data) {
      if (p.sku_elimfilters && p.part_number) {
        pnToSku.set(p.part_number, p.sku_elimfilters);
      }
    }
  }

  // Pass 2: build graph
  for (const fpath of files) {
    let data;
    try { data = JSON.parse(fs.readFileSync(fpath, 'utf8')); }
    catch { continue; }
    for (const p of data) {
      const sku  = p.sku_elimfilters;
      const alts = p.alternatives || [];
      if (!sku) continue;
      if (!graph.has(sku)) graph.set(sku, new Set());
      for (const altPn of alts) {
        const altSku = pnToSku.get(altPn);
        if (!altSku || altSku === sku) continue;
        if (!graph.has(altSku)) graph.set(altSku, new Set());
        graph.get(sku).add(altSku);
        graph.get(altSku).add(sku);
      }
    }
  }

  return graph;
}

function findComponents(graph) {
  const visited    = new Set();
  const components = [];
  for (const sku of graph.keys()) {
    if (visited.has(sku)) continue;
    const component = [];
    const queue     = [sku];
    visited.add(sku);
    while (queue.length) {
      const cur = queue.shift();
      component.push(cur);
      for (const neighbor of (graph.get(cur) || [])) {
        if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); }
      }
    }
    if (component.length > 1) components.push(component);
  }
  return components;
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  // 1. Build groups from JSON
  console.log('Construyendo grafo de alternativos desde JSON...');
  const graph      = buildAlternativesGraph();
  const components = findComponents(graph);
  const allSkus    = new Set(components.flat());
  console.log(`  ${components.length} grupos | ${allSkus.size} SKUs involucrados`);

  if (components.length === 0) {
    console.log('No hay grupos de alternativos. Saliendo.');
    await POOL.end();
    return;
  }

  // 2. Fetch DB data for all involved SKUs
  console.log('Cargando datos del DB...');
  const client = await POOL.connect();
  const skuList = [...allSkus];
  const placeholders = skuList.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = await client.query(`
    SELECT sku, oem_codes, competitor_codes, equipment_applications
    FROM   elimfilters_catalog
    WHERE  sku IN (${placeholders})
  `, skuList);
  console.log(`  ${rows.length} / ${skuList.length} SKUs encontrados en DB`);

  const bySku = new Map(rows.map(r => [r.sku, r]));

  // 3. Process each group
  let totalUpdated = 0;
  let groupsChanged = 0;

  for (const group of components) {
    const members = group.map(sku => bySku.get(sku)).filter(Boolean);
    if (members.length < 2) continue;

    const oemUnion   = unionArrays(members.map(m => m.oem_codes),              keyOem);
    const compUnion  = unionArrays(members.map(m => m.competitor_codes),        keyOem);
    const equipUnion = unionArrays(members.map(m => m.equipment_applications),  keyEquip);

    let groupChanged = false;

    for (const member of members) {
      const curOem   = (member.oem_codes              || []).length;
      const curComp  = (member.competitor_codes        || []).length;
      const curEquip = (member.equipment_applications  || []).length;

      // NEVER reduce — only apply union if it adds entries
      const finalOem   = oemUnion.length   > curOem   ? oemUnion   : (member.oem_codes   || []);
      const finalComp  = compUnion.length  > curComp  ? compUnion  : (member.competitor_codes || []);
      const finalEquip = equipUnion.length > curEquip ? equipUnion : (member.equipment_applications || []);

      const needsUpdate =
        finalOem.length   > curOem   ||
        finalComp.length  > curComp  ||
        finalEquip.length > curEquip;

      if (!needsUpdate) continue;

      if (DRY_RUN) {
        const parts = [];
        if (finalOem.length   > curOem)   parts.push(`oem ${curOem}→${finalOem.length}`);
        if (finalComp.length  > curComp)  parts.push(`comp ${curComp}→${finalComp.length}`);
        if (finalEquip.length > curEquip) parts.push(`equip ${curEquip}→${finalEquip.length}`);
        console.log(`  [DRY] ${member.sku}: ${parts.join(' | ')}`);
      } else {
        await client.query(`
          UPDATE elimfilters_catalog
          SET    oem_codes              = $1::jsonb,
                 competitor_codes       = $2::jsonb,
                 equipment_applications = $3::jsonb
          WHERE  sku = $4
        `, [
          JSON.stringify(finalOem),
          JSON.stringify(finalComp),
          JSON.stringify(finalEquip),
          member.sku,
        ]);
      }
      totalUpdated++;
      groupChanged = true;
    }
    if (groupChanged) groupsChanged++;
  }

  client.release();
  await POOL.end();

  const action = DRY_RUN ? '[DRY RUN] ' : '';
  console.log(`\n${action}DONE: ${totalUpdated} productos actualizados en ${groupsChanged} grupos`);
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
