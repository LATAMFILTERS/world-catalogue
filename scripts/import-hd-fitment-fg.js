/**
 * import-hd-fitment-fg.js
 *
 * Reads C:\mann\hd_fitment_fleetguard.jsonl and POSTs equipment_applications
 * to the Render API in batches of 100.
 *
 * Run on Windows PowerShell:
 *   node scripts\import-hd-fitment-fg.js
 *   node scripts\import-hd-fitment-fg.js --dry
 *   node scripts\import-hd-fitment-fg.js --file C:\mann\hd_fitment_fleetguard.jsonl
 *
 * Requires:
 *   set ADMIN_KEY=<your key>   (or hardcode below for local use)
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const http = require('https');

const API_BASE   = 'https://elimfilters-search-pro.onrender.com';
const ENDPOINT   = '/api/import/hd-fitment';
const BATCH_SIZE = 100;
const DRY_RUN    = process.argv.includes('--dry');
const ADMIN_KEY  = process.env.ADMIN_KEY || '';

const fileArg = process.argv.find(a => a.startsWith('--file='));
const INPUT_FILE = fileArg
  ? fileArg.split('=')[1]
  : String.raw`C:\mann\hd_fitment_fleetguard.jsonl`;

if (!ADMIN_KEY) {
  console.error('ERROR: Set ADMIN_KEY environment variable before running.');
  console.error('  set ADMIN_KEY=<your key>');
  process.exit(1);
}

if (!fs.existsSync(INPUT_FILE)) {
  console.error(`ERROR: File not found: ${INPUT_FILE}`);
  process.exit(1);
}

function postBatch(batch) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(batch);
    const options = {
      hostname: 'elimfilters-search-pro.onrender.com',
      path:     ENDPOINT,
      method:   'POST',
      headers:  {
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-admin-key':    ADMIN_KEY,
      },
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  IMPORT HD FITMENT → Render API  (Fleetguard)');
  console.log(`  File  : ${INPUT_FILE}`);
  console.log(`  Mode  : ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const lines = fs.readFileSync(INPUT_FILE, 'utf8').split('\n').filter(Boolean);
  console.log(`Total rows in file : ${lines.length}`);

  const withEquip = [];
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      if (Array.isArray(row.equipment) && row.equipment.length > 0) {
        withEquip.push({ part: row.part, brand: row.brand || 'fleetguard', mann_part: row.mann_part, equipment: row.equipment });
      }
    } catch { /* skip malformed */ }
  }

  console.log(`Rows with equipment: ${withEquip.length}`);
  console.log(`Batches (${BATCH_SIZE}/batch): ${Math.ceil(withEquip.length / BATCH_SIZE)}\n`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Sample row:');
    console.log(JSON.stringify(withEquip[0], null, 2));
    return;
  }

  let totalUpdated = 0, totalSkipped = 0, batchNum = 0;

  for (let i = 0; i < withEquip.length; i += BATCH_SIZE) {
    batchNum++;
    const batch = withEquip.slice(i, i + BATCH_SIZE);
    process.stdout.write(`Batch ${batchNum} (${i + 1}–${Math.min(i + BATCH_SIZE, withEquip.length)})... `);

    try {
      const res = await postBatch(batch);
      if (res.status !== 200) {
        console.log(`ERROR ${res.status}: ${JSON.stringify(res.body)}`);
        continue;
      }
      const { updated = 0, skipped_no_sku = 0, skipped_already_has = 0, skipped_no_equip = 0 } = res.body;
      totalUpdated += updated;
      totalSkipped += skipped_no_sku + skipped_already_has + skipped_no_equip;
      console.log(`✅ updated=${updated} | no_sku=${skipped_no_sku} | already_has=${skipped_already_has}`);
    } catch (err) {
      console.log(`NETWORK ERROR: ${err.message}`);
    }

    // Small pause between batches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Total updated : ${totalUpdated}`);
  console.log(`  Total skipped : ${totalSkipped}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
