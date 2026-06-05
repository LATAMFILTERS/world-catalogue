/**
 * audit-ea10695-refs.js
 *
 * Compares EA10695 / P150695 cross-references stored in the DB
 * against the 35 OEM codes scraped from the Donaldson website.
 *
 * Run on Render Shell:
 *   node scripts/audit-ea10695-refs.js
 */
'use strict';

const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Run on the Render shell.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── 35 OEM codes from Donaldson website for P150695 ──────────────────────────
const DONALDSON_OEMS = [
  { manufacturer: 'AC DELCO',                      code: 'A1140C'        },
  { manufacturer: 'AMERICAN PARTS',                code: '94882'         },
  { manufacturer: 'BIG A',                         code: '94882'         },
  { manufacturer: 'CATERPILLAR',                   code: '3I0405'        },
  { manufacturer: 'CUMMINS',                       code: '01402464'      },
  { manufacturer: 'DART',                          code: 'PPP150695'     },
  { manufacturer: 'DONSSON',                       code: 'DA2513'        },
  { manufacturer: 'FORD',                          code: '9576P150695'   },
  { manufacturer: 'FREIGHTLINER',                  code: 'P150695'       },
  { manufacturer: 'FREIGHTLINER',                  code: 'DNP150695'     },
  { manufacturer: 'FREIGHTLINER',                  code: '2505002000'    },
  { manufacturer: 'IVECO',                         code: '97136305'      },
  { manufacturer: 'KRALINATOR',                    code: 'LA1225'        },
  { manufacturer: 'MACK',                          code: '57MD42'        },
  { manufacturer: 'MACK',                          code: '2MD4128M'      },
  { manufacturer: 'MACK',                          code: '57MD42M'       },
  { manufacturer: 'MACK',                          code: '57MD428M'      },
  { manufacturer: 'MACK',                          code: '25042054'      },
  { manufacturer: 'MACK',                          code: 'FA2191P901439' },
  { manufacturer: 'METSO',                         code: '31483001'      },
  { manufacturer: 'NABI BUS',                      code: '6302034'       },
  { manufacturer: 'NELSON',                        code: '70016S'        },
  { manufacturer: 'NEOPLAN',                       code: 'DONP150695'    },
  { manufacturer: 'NUTECH',                        code: 'N0397'         },
  { manufacturer: 'ONAN',                          code: '1402464'       },
  { manufacturer: 'ONAN',                          code: '01402464'      },
  { manufacturer: 'PACCAR',                        code: 'P150695PAC'    },
  { manufacturer: 'PAI INDUSTRIES INC',            code: 'FAF4558'       },
  { manufacturer: 'PETERBILT',                     code: 'PPP150695'     },
  { manufacturer: 'PREVOST CAR',                   code: '530162'        },
  { manufacturer: 'REFILCO',                       code: 'AF695'         },
  { manufacturer: 'UNITED CENTRAL INDUSTRIAL SUPP',code: '686984'        },
  { manufacturer: 'UNITED ENGINE LIFE',            code: 'DEL150695'     },
  { manufacturer: 'VMC',                           code: 'AF150695'      },
  { manufacturer: 'VOLVO',                         code: '1110903'       },
  { manufacturer: 'VOLVO',                         code: 'V1110903'      },
];

function normalise(str) {
  return (str || '').toUpperCase().replace(/[\s\-_.]/g, '');
}

function key(mfr, code) {
  return `${normalise(mfr)}|${normalise(code)}`;
}

async function main() {
  await client.connect();

  // Query by sku OR codigo_base
  const res = await client.query(
    `SELECT sku, codigo_base, oem_codes, competitor_codes, brand_crossrefs
     FROM elimfilters_catalog
     WHERE sku = 'EA10695' OR UPPER(codigo_base) = 'P150695'
     LIMIT 5`
  );

  if (!res.rows.length) {
    console.log('❌  EA10695 / P150695 not found in DB.');
    await client.end();
    return;
  }

  const row = res.rows[0];
  console.log(`\n╔══ DB RECORD ═════════════════════════════════════════════`);
  console.log(`  SKU          : ${row.sku}`);
  console.log(`  codigo_base  : ${row.codigo_base}`);

  const dbOems  = Array.isArray(row.oem_codes)        ? row.oem_codes        : [];
  const dbComps = Array.isArray(row.competitor_codes)  ? row.competitor_codes : [];
  const allDb   = [...dbOems, ...dbComps];

  console.log(`  oem_codes    : ${dbOems.length} entries`);
  console.log(`  comp_codes   : ${dbComps.length} entries`);

  // Build lookup set from DB
  const dbSet = new Set(allDb.map(e => key(e.manufacturer || e.brand, e.code)));

  // ── Comparison matrix ─────────────────────────────────────────────────────
  console.log(`\n╔══ COMPARISON MATRIX (${DONALDSON_OEMS.length} Donaldson OEM codes) ════════════`);
  console.log(`${'#'.padEnd(3)} ${'MANUFACTURER'.padEnd(34)} ${'CODE'.padEnd(18)} STATUS`);
  console.log('─'.repeat(75));

  const missing = [];
  const present = [];

  DONALDSON_OEMS.forEach((d, i) => {
    const k = key(d.manufacturer, d.code);
    const found = dbSet.has(k);
    const status = found ? '✅ IN DB' : '❌ MISSING';
    const n = String(i + 1).padEnd(3);
    console.log(`${n} ${d.manufacturer.padEnd(34)} ${d.code.padEnd(18)} ${status}`);
    (found ? present : missing).push(d);
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n╔══ SUMMARY ═════════════════════════════════════════════════`);
  console.log(`  Donaldson source codes : ${DONALDSON_OEMS.length}`);
  console.log(`  Present in DB          : ${present.length}`);
  console.log(`  Missing from DB        : ${missing.length}`);

  if (missing.length) {
    console.log(`\n  Missing codes:`);
    missing.forEach(d => console.log(`    ${d.manufacturer} → ${d.code}`));
  }

  // ── DB codes not in Donaldson list ────────────────────────────────────────
  const donSet = new Set(DONALDSON_OEMS.map(d => key(d.manufacturer, d.code)));
  const extra = allDb.filter(e => !donSet.has(key(e.manufacturer || e.brand, e.code)));

  if (extra.length) {
    console.log(`\n  DB codes NOT in Donaldson list (${extra.length}): may be from other sources`);
    extra.forEach(e => console.log(`    ${e.manufacturer || e.brand} → ${e.code}`));
  }

  // ── Raw DB dump ───────────────────────────────────────────────────────────
  console.log(`\n╔══ RAW DB oem_codes ════════════════════════════════════════`);
  console.log(JSON.stringify(dbOems, null, 2));
  console.log(`\n╔══ RAW DB competitor_codes ═════════════════════════════════`);
  console.log(JSON.stringify(dbComps, null, 2));

  await client.end();
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
