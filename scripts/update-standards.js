/**
 * update-standards.js
 * Actualiza campos de estándares ISO por prefijo de SKU:
 *   iso_test_method, micron_rating, nominal_efficiency,
 *   burst_pressure_psi, collapse_pressure_psi
 *
 * Solo actualiza registros que no tengan donaldson_url (usa COALESCE para no sobreescribir).
 *
 * Uso: node scripts/update-standards.js
 */

const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm@ballast.proxy.rlwy.net:18263/railway';

const STANDARDS = {
  'EL8': { iso_test_method: 'ISO 4548-12',   micron_rating: '20 µm',  nominal_efficiency: '99.5%', burst_pressure_psi: 150,  collapse_pressure_psi: 75  },
  'EH6': { iso_test_method: 'ISO 16889',      micron_rating: '10 µm',  nominal_efficiency: '99.0%', burst_pressure_psi: 3625, collapse_pressure_psi: 363 },
  'EC1': { iso_test_method: 'ISO 11155-1',    micron_rating: '2.5 µm', nominal_efficiency: '99.5%', burst_pressure_psi: null, collapse_pressure_psi: null },
  'EA1': { iso_test_method: 'ISO 5011',       micron_rating: '5 µm',   nominal_efficiency: '99.9%', burst_pressure_psi: null, collapse_pressure_psi: null },
  'EA2': { iso_test_method: 'ISO 5011',       micron_rating: '5 µm',   nominal_efficiency: '99.9%', burst_pressure_psi: null, collapse_pressure_psi: null },
  'EF9': { iso_test_method: 'ISO 19438',      micron_rating: '10 µm',  nominal_efficiency: '98.7%', burst_pressure_psi: 150,  collapse_pressure_psi: 75  },
  'ES9': { iso_test_method: 'ISO 19438',      micron_rating: '10 µm',  nominal_efficiency: '98.7%', burst_pressure_psi: 150,  collapse_pressure_psi: 75  },
  'ED4': { iso_test_method: 'ISO 12500-1',    micron_rating: '1 µm',   nominal_efficiency: '99.0%', burst_pressure_psi: 250,  collapse_pressure_psi: 125 },
  'EM9': { iso_test_method: 'ISO 19438',      micron_rating: '10 µm',  nominal_efficiency: '98.7%', burst_pressure_psi: 150,  collapse_pressure_psi: 75  },
  'ET9': { iso_test_method: 'ISO 19438',      micron_rating: '10 µm',  nominal_efficiency: '98.7%', burst_pressure_psi: null, collapse_pressure_psi: null },
  'EW7': { iso_test_method: 'ISO 4548-12',    micron_rating: '40 µm',  nominal_efficiency: '98.0%', burst_pressure_psi: 150,  collapse_pressure_psi: 75  },
};

async function run() {
  const db = new Client(DB_URL);
  await db.connect();
  let totalUpdated = 0;
  const results = {};

  for (const [prefix, standards] of Object.entries(STANDARDS)) {
    try {
      const result = await db.query(
        `UPDATE elimfilters_catalog
         SET iso_test_method      = COALESCE(iso_test_method, $1),
             micron_rating        = COALESCE(micron_rating, $2),
             nominal_efficiency   = COALESCE(nominal_efficiency, $3),
             burst_pressure_psi   = COALESCE(burst_pressure_psi, $4),
             collapse_pressure_psi = COALESCE(collapse_pressure_psi, $5)
         WHERE sku LIKE $6
           AND donaldson_url IS NULL`,
        [
          standards.iso_test_method,
          standards.micron_rating,
          standards.nominal_efficiency,
          standards.burst_pressure_psi,
          standards.collapse_pressure_psi,
          prefix + '%'
        ]
      );
      results[prefix] = result.rowCount;
      totalUpdated += result.rowCount;
      console.log(`${prefix}: ${result.rowCount} registros actualizados`);
    } catch (e) {
      console.error(`ERROR en ${prefix}:`, e.message);
    }
  }

  await db.end();
  console.log('\n=== RESUMEN ===');
  console.log(JSON.stringify(results, null, 2));
  console.log(`\nTotal registros con valores estándar: ${totalUpdated}`);
}

run().catch(console.error);
