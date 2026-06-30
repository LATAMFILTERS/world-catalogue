// Audit: detect HD/LD code crossover contamination in both directions
// HD-only brands/prefixes that should NOT appear on LD products
// LD-only brands/prefixes that should NOT appear on HD products

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// FRAM LD-only prefixes (passenger/light commercial)
const FRAM_LD = /^(PH|XG|TG|DG)\d/i;

// Brands exclusively associated with heavy equipment OEM fitment
// These appearing on LD (EL3x/EA3x/EC3x/EF3x) would be suspicious
const HD_ONLY_OEM_BRANDS = new Set([
  'CATERPILLAR', 'CUMMINS', 'DETROIT DIESEL', 'JOHN DEERE',
  'KOMATSU', 'VOLVO TRUCKS', 'MACK', 'KENWORTH', 'PETERBILT',
  'FREIGHTLINER', 'INTERNATIONAL', 'FLEETGUARD', 'FLEETRITE',
]);

// Passenger car OEM brands that should NOT appear as oem_codes on HD products
const LD_ONLY_OEM_BRANDS = new Set([
  'VOLKSWAGEN', 'BMW', 'AUDI', 'OPEL', 'FIAT', 'PEUGEOT',
  'RENAULT', 'CITROEN', 'ALFA ROMEO', 'SEAT', 'SKODA',
  'MINI', 'SMART', 'LANCIA', 'DACIA',
]);

// Fleetguard/Baldwin codes in competitor_codes of LD products = suspicious
const FLEETGUARD_PATTERN = /^(LF|HF|FF|AF|WF|CF)\d{4,}/i;
const BALDWIN_HD_PATTERN = /^(B\d{4,}|BT\d+|RS\d+|PA\d+|RS\d+)/i;

async function main() {
  console.log('=== AUDIT: HD/LD Cross-Contamination ===\n');

  // --- CHECK 1: LD products with FRAM HD codes (CH/CA prefixes = HD FRAM) ---
  // Note: PH/XG/TG/DG are LD; CH/CA/CF are HD FRAM - but these could legitimately cross
  // Focus on OEM brand contamination instead

  // --- CHECK 2: LD products with HD-only OEM manufacturer codes ---
  console.log('--- LD products with heavy equipment OEM codes ---');
  const ldWithHdOem = await pool.query(`
    SELECT sku, filter_type,
      (SELECT json_agg(json_build_object('mfr', elem->>'manufacturer', 'code', elem->>'code'))
       FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
       WHERE UPPER(elem->>'manufacturer') = ANY($1)) as suspicious_oem
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
    AND oem_codes IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
      WHERE UPPER(elem->>'manufacturer') = ANY($1)
    )
  `, [Array.from(HD_ONLY_OEM_BRANDS)]);

  if (ldWithHdOem.rows.length === 0) {
    console.log('✓ Ningún producto LD tiene OEM codes de fabricantes HD exclusivos\n');
  } else {
    ldWithHdOem.rows.forEach(r => {
      console.log(`  ${r.sku} (${r.filter_type}): ${JSON.stringify(r.suspicious_oem)}`);
    });
    console.log('');
  }

  // --- CHECK 3: LD products with Fleetguard codes in competitor_codes ---
  console.log('--- LD products con códigos Fleetguard en competitor_codes ---');
  const ldWithFleetguard = await pool.query(`
    SELECT sku, filter_type,
      (SELECT json_agg(json_build_object('mfr', elem->>'manufacturer', 'code', elem->>'code'))
       FROM jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) elem
       WHERE UPPER(elem->>'manufacturer') = 'FLEETGUARD'
          OR UPPER(elem->>'manufacturer') = 'FLEETRITE') as fg_codes
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
    AND competitor_codes IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) elem
      WHERE UPPER(elem->>'manufacturer') IN ('FLEETGUARD','FLEETRITE')
    )
  `);

  if (ldWithFleetguard.rows.length === 0) {
    console.log('✓ Ningún producto LD tiene códigos Fleetguard\n');
  } else {
    console.log(`  ${ldWithFleetguard.rows.length} productos LD con Fleetguard:`);
    ldWithFleetguard.rows.slice(0, 10).forEach(r => {
      console.log(`  ${r.sku}: ${JSON.stringify(r.fg_codes).slice(0, 120)}`);
    });
    if (ldWithFleetguard.rows.length > 10) console.log(`  ... y ${ldWithFleetguard.rows.length - 10} más`);
    console.log('');
  }

  // --- CHECK 4: HD products with passenger-car OEM manufacturer codes ---
  console.log('--- HD products con OEM codes de fabricantes de autos de pasajeros ---');
  const hdWithLdOem = await pool.query(`
    SELECT sku, filter_type,
      (SELECT json_agg(json_build_object('mfr', elem->>'manufacturer', 'code', elem->>'code'))
       FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
       WHERE UPPER(elem->>'manufacturer') = ANY($1)
       LIMIT 5) as suspicious_oem
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
    AND oem_codes IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
      WHERE UPPER(elem->>'manufacturer') = ANY($1)
    )
    LIMIT 20
  `, [Array.from(LD_ONLY_OEM_BRANDS)]);

  if (hdWithLdOem.rows.length === 0) {
    console.log('✓ Ningún producto HD tiene OEM codes de marcas de autos de pasajeros\n');
  } else {
    console.log(`  ${hdWithLdOem.rows.length} productos HD con OEM de pasajeros (muestra):`);
    hdWithLdOem.rows.slice(0, 10).forEach(r => {
      console.log(`  ${r.sku} (${r.filter_type}): ${JSON.stringify(r.suspicious_oem).slice(0, 120)}`);
    });
    console.log('');
  }

  // --- CHECK 5: HD products with MANN passenger-car codes (ML/W/HU = oil; C = air; WK/CF = fuel) ---
  // MANN codes in HD competitor_codes are EXPECTED (heavy trucks use MANN too)
  // But MANN codes in HD oem_codes suggest a Mann LD product's data leaked in
  console.log('--- HD products con MANN codes en oem_codes (posible contaminación LD) ---');
  const hdWithMannOem = await pool.query(`
    SELECT sku, filter_type,
      (SELECT json_agg(json_build_object('code', elem->>'code'))
       FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
       WHERE UPPER(elem->>'manufacturer') = 'MANN'
          OR UPPER(elem->>'manufacturer') = 'MANN-FILTER'
       LIMIT 5) as mann_codes
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
    AND oem_codes IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
      WHERE UPPER(elem->>'manufacturer') IN ('MANN','MANN-FILTER')
    )
    LIMIT 20
  `);

  if (hdWithMannOem.rows.length === 0) {
    console.log('✓ Ningún producto HD tiene MANN codes en oem_codes\n');
  } else {
    console.log(`  ${hdWithMannOem.rows.length} productos HD con MANN en oem_codes:`);
    hdWithMannOem.rows.slice(0, 10).forEach(r => {
      console.log(`  ${r.sku} (${r.filter_type}): ${JSON.stringify(r.mann_codes)}`);
    });
    console.log('');
  }

  // --- CHECK 6: Same code appearing on both HD and LD products ---
  console.log('--- Códigos FRAM que aparecen en AMBOS HD y LD (conflicto directo) ---');
  const conflicts = await pool.query(`
    WITH hd_fram AS (
      SELECT UPPER(elem->>'code') as code
      FROM elimfilters_catalog, jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) elem
      WHERE duty = 'HEAVY_DUTY' AND UPPER(elem->>'manufacturer') = 'FRAM'
      GROUP BY 1
    ),
    ld_fram AS (
      SELECT UPPER(elem->>'code') as code
      FROM elimfilters_catalog, jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) elem
      WHERE duty = 'LIGHT_DUTY' AND UPPER(elem->>'manufacturer') = 'FRAM'
      GROUP BY 1
    )
    SELECT h.code FROM hd_fram h INNER JOIN ld_fram l ON h.code = l.code
    ORDER BY h.code
    LIMIT 30
  `);

  if (conflicts.rows.length === 0) {
    console.log('✓ Ningún código FRAM aparece en HD y LD al mismo tiempo\n');
  } else {
    console.log(`  ${conflicts.rows.length} códigos FRAM en conflicto HD/LD:`);
    console.log('  ' + conflicts.rows.map(r => r.code).join(', '));
    console.log('');
  }

  console.log('=== FIN DE AUDITORÍA ===');
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
