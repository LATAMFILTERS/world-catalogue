/**
 * merge_alternatives.js
 * Para cada grupo de productos alternativos, propaga la unión de
 * oem_codes + competitor_codes + equipment_applications a todos los miembros.
 *
 * Uso en Render shell:
 *   node scripts/merge_alternatives.js [--dry-run]
 */

'use strict';

const { Pool } = require('pg');

const DRY_RUN = process.argv.includes('--dry-run');
const POOL    = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── helpers ────────────────────────────────────────────────────────────────

function keyOem(o)   { return `${o.manufacturer}|${o.code}`; }
function keyEquip(e) { return `${e.equipment}|${e.type}|${e.engine}`; }

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

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  const client = await POOL.connect();

  // 1. Load all products
  console.log('Cargando productos...');
  const { rows } = await client.query(`
    SELECT sku, codigo_base, alternatives,
           oem_codes, competitor_codes, equipment_applications
    FROM   elimfilters_catalog
  `);
  console.log(`  ${rows.length} productos cargados`);

  // 2. Build map: donaldson_pn → row
  const byBase = new Map();
  for (const row of rows) {
    if (row.codigo_base) byBase.set(row.codigo_base, row);
  }

  // 3. Build undirected graph: sku → Set<sku>
  const graph = new Map();
  for (const row of rows) {
    if (!graph.has(row.sku)) graph.set(row.sku, new Set());
    const alts = row.alternatives || [];
    for (const altPn of alts) {
      const altRow = byBase.get(altPn);
      if (!altRow) continue;
      if (!graph.has(altRow.sku)) graph.set(altRow.sku, new Set());
      graph.get(row.sku).add(altRow.sku);
      graph.get(altRow.sku).add(row.sku);
    }
  }

  // 4. Find connected components (BFS)
  const visited   = new Set();
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
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    if (component.length > 1) components.push(component);
  }
  console.log(`  ${components.length} grupos de alternativos encontrados`);

  // 5. Build lookup by sku
  const bySku = new Map(rows.map(r => [r.sku, r]));

  // 6. For each group: compute union and update
  let totalUpdated = 0;
  let groupsWithChanges = 0;

  for (const group of components) {
    const members = group.map(sku => bySku.get(sku)).filter(Boolean);

    const oemUnion   = unionArrays(members.map(m => m.oem_codes),   keyOem);
    const compUnion  = unionArrays(members.map(m => m.competitor_codes), keyOem);
    const equipUnion = unionArrays(members.map(m => m.equipment_applications), keyEquip);

    let groupChanged = false;

    for (const member of members) {
      const curOem   = (member.oem_codes || []).length;
      const curComp  = (member.competitor_codes || []).length;
      const curEquip = (member.equipment_applications || []).length;

      const needsUpdate =
        oemUnion.length   > curOem   ||
        compUnion.length  > curComp  ||
        equipUnion.length > curEquip;

      if (!needsUpdate) continue;

      if (DRY_RUN) {
        console.log(`  [DRY] ${member.sku}: oem ${curOem}→${oemUnion.length} | comp ${curComp}→${compUnion.length} | equip ${curEquip}→${equipUnion.length}`);
        totalUpdated++;
        groupChanged = true;
        continue;
      }

      await client.query(`
        UPDATE elimfilters_catalog
        SET    oem_codes               = $1::jsonb,
               competitor_codes        = $2::jsonb,
               equipment_applications  = $3::jsonb
        WHERE  sku = $4
      `, [
        JSON.stringify(oemUnion),
        JSON.stringify(compUnion),
        JSON.stringify(equipUnion),
        member.sku,
      ]);
      totalUpdated++;
      groupChanged = true;
    }

    if (groupChanged) groupsWithChanges++;
  }

  client.release();
  await POOL.end();

  console.log(`\nDONE: ${totalUpdated} productos actualizados en ${groupsWithChanges} grupos`);
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
