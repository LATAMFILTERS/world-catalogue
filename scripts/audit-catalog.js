/**
 * audit-catalog.js — Full data quality audit for elimfilters_catalog
 *
 * Run on Render Shell:
 *   node scripts/audit-catalog.js
 *
 * Or with DATABASE_URL env var set:
 *   DATABASE_URL=postgres://... node scripts/audit-catalog.js
 */
'use strict';

const { Client } = require('pg');

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: 'ballast.proxy.rlwy.net', port: 18263,
      database: 'railway', user: 'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      ssl: { rejectUnauthorized: false },
    };

async function run() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ELIMFILTERS CATALOG AUDIT —', new Date().toLocaleString());
  console.log('═══════════════════════════════════════════════════════════\n');

  // ── 1. Overview ──────────────────────────────────────────────────────────
  const { rows: [overview] } = await client.query(`
    SELECT
      COUNT(*)                                                          AS total,
      COUNT(*) FILTER (WHERE codigo_base ~ '^P[0-9]')                  AS donaldson,
      COUNT(*) FILTER (WHERE codigo_base !~ '^P[0-9]' OR codigo_base IS NULL) AS other_brands
    FROM elimfilters_catalog
  `);
  console.log('── OVERVIEW ──────────────────────────────────────────────');
  console.log(`  Total products   : ${overview.total}`);
  console.log(`  Donaldson (P###) : ${overview.donaldson}`);
  console.log(`  Other brands     : ${overview.other_brands}\n`);

  const d = parseInt(overview.donaldson);

  // ── 2. Completeness ──────────────────────────────────────────────────────
  const { rows: [comp] } = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
        AS no_oem,
      COUNT(*) FILTER (WHERE competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
        AS no_competitor,
      COUNT(*) FILTER (WHERE equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)
        AS no_equip,
      COUNT(*) FILTER (WHERE
        (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
        AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0))
        AS no_oem_and_equip,
      COUNT(*) FILTER (WHERE description IS NULL OR description::text = 'null')
        AS no_description
    FROM elimfilters_catalog
    WHERE codigo_base ~ '^P[0-9]'
  `);
  const pct = n => `${n} (${((n/d)*100).toFixed(1)}%)`;
  console.log('── COMPLETENESS (Donaldson products only) ────────────────');
  console.log(`  No OEM codes         : ${pct(parseInt(comp.no_oem))}`);
  console.log(`  No competitor codes  : ${pct(parseInt(comp.no_competitor))}`);
  console.log(`  No equipment apps    : ${pct(parseInt(comp.no_equip))}`);
  console.log(`  No OEM + no equip    : ${pct(parseInt(comp.no_oem_and_equip))}`);
  console.log(`  No description       : ${pct(parseInt(comp.no_description))}\n`);

  // ── 3. Recheck queue ─────────────────────────────────────────────────────
  const { rows: [rq] } = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE
        (outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL OR thread_size IS NOT NULL)
        AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
        AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0))
        AS has_specs_missing_both,
      COUNT(*) FILTER (WHERE
        (outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL OR thread_size IS NOT NULL)
        AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0))
        AS has_specs_missing_oem,
      COUNT(*) FILTER (WHERE
        (outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL OR thread_size IS NOT NULL)
        AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0))
        AS has_specs_missing_equip,
      COUNT(*) FILTER (WHERE
        outer_diameter_mm IS NULL AND height_mm IS NULL AND thread_size IS NULL AND filter_type IS NULL
        AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
        AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0))
        AS fully_empty
    FROM elimfilters_catalog
    WHERE codigo_base ~ '^P[0-9]'
  `);
  console.log('── RECHECK QUEUE (Show More missed) ─────────────────────');
  console.log(`  Has specs, missing OEM + equip : ${rq.has_specs_missing_both}  ← priority recheck`);
  console.log(`  Has specs, missing OEM only    : ${rq.has_specs_missing_oem}`);
  console.log(`  Has specs, missing equip only  : ${rq.has_specs_missing_equip}`);
  console.log(`  Fully empty (likely obsolete)  : ${rq.fully_empty}\n`);

  // ── 4. OEM manufacturer breakdown ────────────────────────────────────────
  const { rows: oemMfr } = await client.query(`
    SELECT elem->>'manufacturer' AS mfr, COUNT(*) AS cnt
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS elem
    WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
      AND codigo_base ~ '^P[0-9]'
    GROUP BY mfr ORDER BY cnt DESC LIMIT 25
  `);
  console.log('── TOP OEM MANUFACTURERS ─────────────────────────────────');
  oemMfr.forEach(r => console.log(`  ${String(r.mfr || 'UNKNOWN').padEnd(28)} ${r.cnt}`));
  console.log();

  // ── 5. Competitor brand breakdown ────────────────────────────────────────
  const { rows: compMfr } = await client.query(`
    SELECT elem->>'manufacturer' AS mfr, COUNT(*) AS cnt
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS elem
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
      AND codigo_base ~ '^P[0-9]'
    GROUP BY mfr ORDER BY cnt DESC LIMIT 25
  `);
  console.log('── TOP COMPETITOR BRANDS ─────────────────────────────────');
  compMfr.forEach(r => console.log(`  ${String(r.mfr || 'UNKNOWN').padEnd(28)} ${r.cnt}`));
  console.log();

  // ── 6. Suspicious: equipment makers in competitor_codes ──────────────────
  const EQUIPMENT_MAKERS = ['CUMMINS','CATERPILLAR','CAT','JOHN DEERE','VOLVO','KOMATSU',
    'LIEBHERR','PERKINS','DETROIT','MACK','NAVISTAR','INTERNATIONAL','CLAAS','CASE',
    'NEW HOLLAND','JCB','DOOSAN','HITACHI','KOBELCO','HYUNDAI','YANMAR','KUBOTA',
    'FORD','GM','TOYOTA','ISUZU','HINO','MITSUBISHI','DEUTZ','SAME','FENDT',
    'MASSEY FERGUSON','KENWORTH','PETERBILT','FREIGHTLINER','PACCAR'];
  const eqInComp = await client.query(`
    SELECT elem->>'manufacturer' AS mfr, COUNT(*) AS cnt
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS elem
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
      AND UPPER(elem->>'manufacturer') = ANY($1)
    GROUP BY mfr ORDER BY cnt DESC
  `, [EQUIPMENT_MAKERS]);
  if (eqInComp.rows.length) {
    console.log('── ⚠️  MISCLASSIFIED: Equipment makers in competitor_codes ──');
    eqInComp.rows.forEach(r => console.log(`  ${String(r.mfr).padEnd(28)} ${r.cnt} entries → should be oem_codes`));
    console.log();
  }

  // ── 7. Filter brands in oem_codes ────────────────────────────────────────
  const FILTER_BRANDS = ['DONALDSON','BALDWIN','FLEETGUARD','MANN','WIX','FRAM','PUROLATOR',
    'HASTINGS','BOSCH','MAHLE','HENGST','SAKURA','LUBER-FINER','UFI','CHAMPION',
    'FILTRON','HIFI FILTER','RYCO','CARQUEST','NAPA','MOTORCRAFT','KNECHT'];
  const fbInOem = await client.query(`
    SELECT elem->>'manufacturer' AS mfr, COUNT(*) AS cnt
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS elem
    WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
      AND UPPER(elem->>'manufacturer') = ANY($1)
    GROUP BY mfr ORDER BY cnt DESC
  `, [FILTER_BRANDS]);
  if (fbInOem.rows.length) {
    console.log('── ⚠️  MISCLASSIFIED: Filter brands in oem_codes ───────────');
    fbInOem.rows.forEach(r => console.log(`  ${String(r.mfr).padEnd(28)} ${r.cnt} entries → should be competitor_codes`));
    console.log();
  }

  // ── 8. Sample: 5 products from recheck queue ─────────────────────────────
  const { rows: samples } = await client.query(`
    SELECT sku, codigo_base,
      jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) AS oem_count,
      jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) AS comp_count,
      jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) AS equip_count,
      outer_diameter_mm IS NOT NULL AS has_specs
    FROM elimfilters_catalog
    WHERE codigo_base ~ '^P[0-9]'
      AND (outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL)
      AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
      AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)
    ORDER BY sku LIMIT 5
  `);
  if (samples.length) {
    console.log('── SAMPLE: Recheck candidates ────────────────────────────');
    samples.forEach(r => console.log(
      `  ${r.sku.padEnd(10)} | ${r.codigo_base.padEnd(10)} | OEM:${r.oem_count} COMP:${r.comp_count} EQUIP:${r.equip_count} specs:${r.has_specs}`
    ));
    console.log();
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  END OF AUDIT');
  console.log('═══════════════════════════════════════════════════════════\n');

  await client.end();
}

run().catch(e => { console.error('AUDIT FAILED:', e.message); process.exit(1); });
