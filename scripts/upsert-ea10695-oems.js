/**
 * upsert-ea10695-oems.js
 *
 * Inserts/merges the 35 Donaldson OEM cross-refs for P150695 → EA10695.
 * Idempotent: existing entries are kept, missing ones are added.
 *
 * Run on Render Shell:
 *   node scripts/upsert-ea10695-oems.js
 *
 * Or locally with real DATABASE_URL:
 *   $env:DATABASE_URL="postgresql://..." ; node scripts/upsert-ea10695-oems.js
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

const SOURCE_OEMS = [
  { manufacturer: 'AC DELCO',                       code: 'A1140C'         },
  { manufacturer: 'AMERICAN PARTS',                 code: '94882'          },
  { manufacturer: 'BIG A',                          code: '94882'          },
  { manufacturer: 'CATERPILLAR',                    code: '3I0405'         },
  { manufacturer: 'CUMMINS',                        code: '01402464'       },
  { manufacturer: 'DART',                           code: 'PPP150695'      },
  { manufacturer: 'DONSSON',                        code: 'DA2513'         },
  { manufacturer: 'FORD',                           code: '9576P150695'    },
  { manufacturer: 'FREIGHTLINER',                   code: 'P150695'        },
  { manufacturer: 'FREIGHTLINER',                   code: 'DNP150695'      },
  { manufacturer: 'FREIGHTLINER',                   code: '2505002000'     },
  { manufacturer: 'IVECO',                          code: '97136305'       },
  { manufacturer: 'KRALINATOR',                     code: 'LA1225'         },
  { manufacturer: 'MACK',                           code: '57MD42'         },
  { manufacturer: 'MACK',                           code: '2MD4128M'       },
  { manufacturer: 'MACK',                           code: '57MD42M'        },
  { manufacturer: 'MACK',                           code: '57MD428M'       },
  { manufacturer: 'MACK',                           code: '25042054'       },
  { manufacturer: 'MACK',                           code: 'FA2191P901439'  },
  { manufacturer: 'METSO',                          code: '31483001'       },
  { manufacturer: 'NABI BUS',                       code: '6302034'        },
  { manufacturer: 'NELSON',                         code: '70016S'         },
  { manufacturer: 'NEOPLAN',                        code: 'DONP150695'     },
  { manufacturer: 'NUTECH',                         code: 'N0397'          },
  { manufacturer: 'ONAN',                           code: '1402464'        },
  { manufacturer: 'ONAN',                           code: '01402464'       },
  { manufacturer: 'PACCAR',                         code: 'P150695PAC'     },
  { manufacturer: 'PAI INDUSTRIES INC',             code: 'FAF4558'        },
  { manufacturer: 'PETERBILT',                      code: 'PPP150695'      },
  { manufacturer: 'PREVOST CAR',                    code: '530162'         },
  { manufacturer: 'REFILCO',                        code: 'AF695'          },
  { manufacturer: 'UNITED CENTRAL INDUSTRIAL SUPP', code: '686984'         },
  { manufacturer: 'UNITED ENGINE LIFE',             code: 'DEL150695'      },
  { manufacturer: 'VMC',                            code: 'AF150695'       },
  { manufacturer: 'VOLVO',                          code: '1110903'        },
  { manufacturer: 'VOLVO',                          code: 'V1110903'       },
];

function norm(s) { return (s || '').toUpperCase().replace(/[\s\-_.]/g, ''); }
function key(m, c) { return `${norm(m)}|${norm(c)}`; }

async function main() {
  await client.connect();

  const res = await client.query(
    `SELECT id, sku, oem_codes
     FROM elimfilters_catalog
     WHERE sku = 'EA10695' OR UPPER(codigo_base) = 'P150695'
     ORDER BY sku = 'EA10695' DESC
     LIMIT 1`
  );

  if (!res.rows.length) {
    console.log('❌  EA10695 / P150695 not found in DB.');
    await client.end();
    return;
  }

  const row = res.rows[0];
  console.log(`Found: id=${row.id}  sku=${row.sku}`);

  // Existing oem_codes
  const existing = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const existingSet = new Set(existing.map(e => key(e.manufacturer || e.brand, e.code)));

  // Merge
  const toAdd = SOURCE_OEMS.filter(o => !existingSet.has(key(o.manufacturer, o.code)));
  const merged = [...existing, ...toAdd];

  console.log(`\n  Existing OEM entries : ${existing.length}`);
  console.log(`  Source codes         : ${SOURCE_OEMS.length}`);
  console.log(`  Already present      : ${SOURCE_OEMS.length - toAdd.length}`);
  console.log(`  To add               : ${toAdd.length}`);

  if (toAdd.length === 0) {
    console.log('\n✅  All 36 codes already in DB. Nothing to update.');
    await client.end();
    return;
  }

  console.log('\n  Adding:');
  toAdd.forEach(o => console.log(`    + ${o.manufacturer.padEnd(34)} ${o.code}`));

  await client.query(
    `UPDATE elimfilters_catalog
     SET oem_codes = $1::jsonb
     WHERE id = $2`,
    [JSON.stringify(merged), row.id]
  );

  console.log(`\n✅  Done. oem_codes now has ${merged.length} entries for ${row.sku}.`);
  await client.end();
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
