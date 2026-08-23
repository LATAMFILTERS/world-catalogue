const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const oemCodes = [
  {"manufacturer": "CATERPILLAR", "code": "1R0755"},
  {"manufacturer": "CATERPILLAR", "code": "3890433"},
  {"manufacturer": "WIRTGEN", "code": "2110145"},
  {"manufacturer": "BUCYRUS", "code": "V013569"},
  {"manufacturer": "SANDVIK", "code": "016641061"},
  {"manufacturer": "SANDVIK", "code": "61141061"},
  {"manufacturer": "SANDVIK", "code": "061141061"},
  {"manufacturer": "WEICHAI", "code": "1001421244"},
  {"manufacturer": "WEICHAI", "code": "1003297630"},
  {"manufacturer": "WEICHAI", "code": "1000104483"},
  {"manufacturer": "WEICHAI", "code": "1008088046"},
  {"manufacturer": "WEICHAI", "code": "1004300450"},
  {"manufacturer": "WEICHAI", "code": "1003877744"}
];

const competitorCodes = [
  {"manufacturer": "BALDWIN", "code": "BF7639"},
  {"manufacturer": "FLEETGUARD", "code": "FF5317"},
  {"manufacturer": "WIX FILTERS", "code": "33685"},
  {"manufacturer": "WIX FILTERS", "code": "33685NP"},
  {"manufacturer": "LUBER-FINER", "code": "LFF4102"},
  {"manufacturer": "FRAM", "code": "P8430"},
  {"manufacturer": "CARQUEST", "code": "86685"},
  {"manufacturer": "HASTINGS", "code": "FF1090"},
  {"manufacturer": "KRALINATOR", "code": "F498"},
  {"manufacturer": "DONALDSON (VMC)", "code": "FF551316"},
  {"manufacturer": "HIFI FILTER", "code": "SN55424"},
  {"manufacturer": "JURA", "code": "SN55424"},
  {"manufacturer": "DONALDSON", "code": "P551316"}
];

async function main() {
  const exists = await pool.query("SELECT sku FROM elimfilters_catalog WHERE sku='EF91316'");
  if (exists.rows.length > 0) {
    console.log('EF91316 already exists, updating cross-references...');
    await pool.query(
      'UPDATE elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb WHERE sku=$3',
      [JSON.stringify(oemCodes), JSON.stringify(competitorCodes), 'EF91316']
    );
    console.log('Updated EF91316');
  } else {
    await pool.query(
      `INSERT INTO elimfilters_catalog (
        sku, codigo_base, description, filter_type, sub_type, technology,
        installation_type, thread_size, outer_diameter_mm, height_mm,
        gasket_od_mm, gasket_id_mm, micron_rating, nominal_efficiency,
        burst_pressure_psi, duty, oem_codes, competitor_codes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18::jsonb)`,
      [
        'EF91316', 'P551316',
        'ELIMFILTERS SYNTRAX Lube Filter Spin-On OD 135.2 mm x L 308 mm. 99% @ 4 micron / 99.9% @ 5 micron (SAE J1858) | Thread 1 3/8-16 UN | burst rated 149 psi (10.3 bar). Cellulose media. Caterpillar 1R-0755 heavy equipment applications.',
        'lube', 'Cellulose', 'SYNTRAX',
        'Spin-On', '1 3/8-16 UN', 135.2, 308,
        110.5, 100.3, 4, '4 micron',
        149, 'HEAVY_DUTY',
        JSON.stringify(oemCodes), JSON.stringify(competitorCodes)
      ]
    );
    console.log('Inserted EF91316 (P551316) with', oemCodes.length, 'OEM codes and', competitorCodes.length, 'competitor codes');
  }
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
