// Deep audit of suspicious crossovers found in HD/LD audit
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {

  // ═══════════════════════════════════════════════════════════════
  // PARTE 1: 6 filtros LD (EA3x) con Fleetguard AF en competitor_codes
  // ═══════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════');
  console.log('PARTE 1: LD Air Filters con Fleetguard AF codes');
  console.log('═══════════════════════════════════════════════\n');

  const ldAirSkus = ['EA32842','EA32117','EA31571','EA39131','EA32483','EA32136'];

  for (const sku of ldAirSkus) {
    const r = await pool.query('SELECT * FROM elimfilters_catalog WHERE sku = $1', [sku]);
    const p = r.rows[0];
    if (!p) { console.log(sku + ': NOT FOUND'); continue; }

    const oem = Array.isArray(p.oem_codes) ? p.oem_codes : [];
    const comp = Array.isArray(p.competitor_codes) ? p.competitor_codes : [];
    const fg = comp.filter(c => (c.manufacturer || '').toUpperCase() === 'FLEETGUARD');

    // Check: are vehicle_applications present? (LD should have vehicle apps)
    const vehApps = Array.isArray(p.vehicle_applications) ? p.vehicle_applications : [];
    const equipApps = Array.isArray(p.equipment_applications) ? p.equipment_applications : [];

    console.log('─── ' + sku + ' ───');
    console.log('  duty:        ' + p.duty);
    console.log('  filter_type: ' + p.filter_type);
    console.log('  sub_type:    ' + p.sub_type);
    console.log('  codigo_base: ' + p.codigo_base);
    console.log('  description: ' + p.description);
    console.log('  outer_dia:   ' + p.outer_diameter_mm + 'mm');
    console.log('  height:      ' + p.height_mm + 'mm');
    console.log('  thread:      ' + p.thread_size);
    console.log('  Fleetguard codes: ' + JSON.stringify(fg));
    console.log('  Vehicle apps: ' + vehApps.length + ' entries');
    if (vehApps.length > 0) {
      vehApps.slice(0, 5).forEach(v => console.log('    - ' + v.make + ' ' + v.model + ' ' + (v.engine || '') + ' ' + (v.year || '')));
      if (vehApps.length > 5) console.log('    ... y ' + (vehApps.length - 5) + ' más');
    }
    console.log('  Equipment apps: ' + equipApps.length + ' entries');
    if (equipApps.length > 0) {
      equipApps.slice(0, 3).forEach(e => console.log('    - ' + (e.equipment || e.model || '') + ' ' + (e.engine || '') + ' ' + (e.type || '')));
    }

    // Check: is there an HD product with the same Fleetguard code?
    for (const fg_code of fg) {
      const conflict = await pool.query(`
        SELECT sku, duty, filter_type FROM elimfilters_catalog
        WHERE duty = 'HEAVY_DUTY'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb)) elem
          WHERE UPPER(elem->>'manufacturer') = 'FLEETGUARD'
          AND UPPER(elem->>'code') = $1
        )
      `, [fg_code.code.toUpperCase()]);
      if (conflict.rows.length > 0) {
        console.log('  ⚠ CONFLICTO: ' + fg_code.code + ' también en HD: ' + conflict.rows.map(r => r.sku).join(', '));
      } else {
        console.log('  ✓ ' + fg_code.code + ' no aparece en ningún producto HD');
      }
    }

    // Check: is the MANN base code consistent with LD?
    const mannCodes = oem.filter(c => (c.manufacturer || '').toUpperCase() === 'MANN' || (c.manufacturer || '').toUpperCase() === 'MANN-FILTER');
    if (mannCodes.length > 0) {
      console.log('  MANN base codes: ' + mannCodes.map(c => c.code).join(', '));
    }
    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════
  // PARTE 2: EL87356 con VW 23B115403 y todos los HD con OEM de pasajeros
  // ═══════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════');
  console.log('PARTE 2: HD products con OEM codes de autos de pasajeros');
  console.log('═══════════════════════════════════════════════\n');

  const suspectHD = ['EL80715','EA15034','EA14723','EL83191','EL87356','EW72076'];
  const LD_BRANDS = new Set(['VOLKSWAGEN','BMW','AUDI','OPEL','FIAT','PEUGEOT','RENAULT','CITROEN','ALFA ROMEO','SEAT','SKODA','MINI','SMART','LANCIA','DACIA']);

  for (const sku of suspectHD) {
    const r = await pool.query('SELECT * FROM elimfilters_catalog WHERE sku = $1', [sku]);
    const p = r.rows[0];
    if (!p) { console.log(sku + ': NOT FOUND'); continue; }

    const oem = Array.isArray(p.oem_codes) ? p.oem_codes : [];
    const comp = Array.isArray(p.competitor_codes) ? p.competitor_codes : [];
    const equipApps = Array.isArray(p.equipment_applications) ? p.equipment_applications : [];

    const suspiciousOem = oem.filter(c => LD_BRANDS.has((c.manufacturer || '').toUpperCase()));

    console.log('─── ' + sku + ' ───');
    console.log('  duty:        ' + p.duty);
    console.log('  filter_type: ' + p.filter_type);
    console.log('  codigo_base: ' + p.codigo_base);
    console.log('  description: ' + p.description);
    console.log('  outer_dia:   ' + p.outer_diameter_mm + 'mm  thread: ' + p.thread_size);
    console.log('  height:      ' + p.height_mm + 'mm');
    console.log('  Suspicious OEM codes:');
    suspiciousOem.forEach(c => console.log('    ' + c.manufacturer + ': ' + c.code));

    // Does any LD product share these codes?
    for (const c of suspiciousOem) {
      const ldMatch = await pool.query(`
        SELECT sku, duty FROM elimfilters_catalog
        WHERE duty = 'LIGHT_DUTY'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
          WHERE UPPER(elem->>'manufacturer') = $1 AND UPPER(elem->>'code') = $2
        )
        LIMIT 3
      `, [(c.manufacturer || '').toUpperCase(), (c.code || '').toUpperCase()]);
      if (ldMatch.rows.length > 0) {
        console.log('  ⚠ CONFLICTO: ' + c.manufacturer + ' ' + c.code + ' también en LD: ' + ldMatch.rows.map(r => r.sku).join(', '));
      }
    }

    console.log('  Equipment apps: ' + equipApps.length);
    if (equipApps.length > 0) {
      equipApps.slice(0, 4).forEach(e => {
        const eq = e.equipment || e.model || '';
        const eng = e.engine || '';
        const typ = e.type || '';
        console.log('    - ' + eq + (eng ? ' / ' + eng : '') + (typ ? ' (' + typ + ')' : ''));
      });
      if (equipApps.length > 4) console.log('    ... y ' + (equipApps.length - 4) + ' más');
    }

    // Check if there's an LD product with the same MANN/Donaldson base that has these OEM codes legitimately
    const mannOem = oem.filter(c => (c.manufacturer || '').toUpperCase() === 'MANN');
    if (mannOem.length > 0) {
      console.log('  MANN codes in oem: ' + mannOem.slice(0, 5).map(c => c.code).join(', '));
      // Find LD product with same MANN code
      for (const m of mannOem.slice(0, 3)) {
        const ldWithMann = await pool.query(`
          SELECT sku FROM elimfilters_catalog
          WHERE duty = 'LIGHT_DUTY'
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
            WHERE UPPER(elem->>'code') = $1
          )
          LIMIT 2
        `, [(m.code || '').toUpperCase().replace(/\s/g, '')]);
        if (ldWithMann.rows.length > 0) {
          console.log('  ⚠ MANN ' + m.code + ' también en LD SKU: ' + ldWithMann.rows.map(r => r.sku).join(', '));
        }
      }
    }

    console.log('');
  }

  // ═══════════════════════════════════════════════════════════════
  // PARTE 3: Scan completo de HD con OEM de marcas de pasajeros
  // ¿cuántos hay en total?
  // ═══════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════');
  console.log('PARTE 3: Conteo completo HD con OEM de pasajeros por marca');
  console.log('═══════════════════════════════════════════════\n');

  const ldBrandsArr = Array.from(LD_BRANDS);
  const countRes = await pool.query(`
    SELECT UPPER(elem->>'manufacturer') as brand, COUNT(DISTINCT sku) as sku_count
    FROM elimfilters_catalog, jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)) elem
    WHERE duty = 'HEAVY_DUTY'
    AND UPPER(elem->>'manufacturer') = ANY($1)
    GROUP BY 1
    ORDER BY 2 DESC
  `, [ldBrandsArr]);

  if (countRes.rows.length === 0) {
    console.log('✓ Ninguna marca de pasajeros encontrada en HD\n');
  } else {
    countRes.rows.forEach(r => console.log('  ' + r.brand + ': ' + r.sku_count + ' SKUs HD'));
  }

  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
