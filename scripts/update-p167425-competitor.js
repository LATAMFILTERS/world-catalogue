'use strict';
const { Client } = require('pg');

const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : { connectionString: process.env.LEGACY_DB_URL, ssl:{ rejectUnauthorized:false } };

const DRY = process.argv.includes('--dry');

// Source: https://www.oilfilter-crossreference.com/convert/DONALDSON/P167425
const RAW = `ALLIS-CHALMERS 1900201
ALLIS-CHALMERS 1978785
AMERICAN-PARTS 2107
AMERICAN-PARTS 92434
Baldwin PT707-HD Buy from Amazon
Baldwin PT707HD
BIG A 2107
BLOUNT 120088
BLOUNT A120088
CANFLO CORPORATION F2525NM
CARQUEST 85434
CATERPILLAR 3I1475
Champion Laboratories LP2854
Champion Laboratories P2854
CIM-TEK 30130
CLARK SC3210180
COOPERS HEM6077
FIAT 190020
FIAT 1978782
FILTER-PRODUCTS FPE2525N
FILTREC D650C25A
Fleetguard HF6111
FLEETLIFE FP40925
FLEETRITE HFR86087
FLEETRITE HFR86111
FLOW-EZY 658305
FLUITEK P390930B7
FPC FPE2525N
Fram C1682 Buy from Amazon
Fram C3955
FRANKLIN EQUIPMENT 1508438
FRANKLIN EQUIPMENT 1510460
GEHL 061584
GEHL L61584
GUARDIAN G051434
GUD G860
HASTINGS HF758 Buy from Amazon
HEAVY-DUTY-AIR A18004
HIFI-FILTER SH56161
HY-PRO HPKL925CB
HYDAC 02058778
HYDAC 50309D25P
HYDAC HK020P
HYDAC HK025P
INTRUPA 83362
INTRUPA 83362Q
JLG 2120107
John Deere F121332
KAWASAKI 7100150L003
Komatsu 1454911580
Komatsu 1454932420
LETOURNEAU WESTINGHOUSE VF4454
LHA TIE25251
LHA TIE2525P
LUBER-FINER LP2854
MANN & HUMMEL H10007
MP-FILTRI MFS180925
MP-FILTRI MP8303
NAPA 1434 Buy from Amazon
Parker 925773
Parker 925773M
Parker 926899
PTI HF4050DCB
Purolator 9700EAL202N
Purolator 9700EAL202N1
Purolator EP320
Purolator EP326
Purolator PM5035
READY-POWER 120088
REFILCO PL409251
Sakura H7976
SCHROEDER G1139
SCHROEDER G713
SCHROEDER K25
SEPARATION-TECHNOLOGIES 818ACC25CB
SEPARATION-TECHNOLOGIES ST6111
STAUFF RTE48D25B
SURE SFH1130
TEREX 15267046
VMC HF167425
WESTERN E0250BT25
WESTERN E4051B3P20
Wix 51434 Buy from Amazon
WOODGATE WGH6087
WOODGATE WGH6111
ZINGA RE25
ZINGA SRE40925`;

function parse(raw) {
  return raw.trim().split('\n').map(line => {
    line = line.replace(/\s*Buy from Amazon\s*$/i, '').trim();
    const lastSpace = line.lastIndexOf(' ');
    if (lastSpace < 0) return null;
    return {
      manufacturer: line.slice(0, lastSpace).trim().toUpperCase(),
      code: line.slice(lastSpace + 1).trim().toUpperCase(),
    };
  }).filter(Boolean);
}

async function run() {
  const refs = parse(RAW);
  console.log(`Parsed ${refs.length} competitor cross-references for P167425`);

  if (DRY) {
    refs.slice(0, 8).forEach(r => console.log(JSON.stringify(r)));
    console.log('[DRY RUN] No DB writes. Remove --dry to execute.');
    return;
  }

  const client = new Client(DB_CONFIG);
  await client.connect();

  const { rows } = await client.query(
    `SELECT sku, jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) AS current
     FROM elimfilters_catalog WHERE codigo_base = 'P167425'`
  );

  if (!rows.length) {
    console.error('P167425 not found in DB'); await client.end(); return;
  }
  console.log(`Found: ${rows[0].sku} — currently ${rows[0].current} competitor_codes`);

  await client.query(
    `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE codigo_base = 'P167425'`,
    [JSON.stringify(refs)]
  );
  console.log(`✅ ${rows[0].sku}: ${refs.length} competitor_codes written`);
  await client.end();
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
