'use strict';
/**
 * READ-ONLY. Run on Render Shell:
 *   node run_057_lookup_fleetguard_new_products.js
 *
 * Checks the ~272 Fleetguard "New Products (Last 12 Months)" part
 * numbers (pasted from fleetguard.com/new-products, 2026-07-21) against
 * elimfilters_catalog.oem_codes/competitor_codes/codigo_base, to see
 * which of these newly-released Fleetguard filters we already carry
 * under some SKU vs which are genuinely new/uncovered.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const CODES = [
  'AD27810',
  'AF24304',
  'AF24305',
  'AF24309',
  'AF27779',
  'AF27784',
  'AF27785',
  'AF27800',
  'AF27801',
  'AF27803',
  'AF27806',
  'AF27811',
  'AF27842',
  'AF28005',
  'AF4471',
  'AF5003',
  'AF5004',
  'AF5006',
  'AF5010',
  'AF55001',
  'AF56001',
  'AF56005',
  'AF56125',
  'AF56132',
  'AF56140',
  'AF56142',
  'AF56143',
  'AF56144',
  'AF56145',
  'AF56146',
  'AF56148',
  'AF56157',
  'AF56158',
  'AF56159',
  'AF56160',
  'AF56161',
  'AF56162',
  'AF56163',
  'AF56164',
  'AF56166',
  'AS2542',
  'AS2546',
  'AS2548',
  'AS2549',
  'AS2550',
  'AS2551',
  'AS2552',
  'AS2554',
  'AS2555',
  'AS2558',
  'AS2559',
  'AS2563',
  'AS2566',
  'AS2569',
  'AS2570',
  'CC2747EEJ',
  'CC2749EEP',
  'CC2821EED',
  'CC2851EET',
  'CV50862',
  'CV50869',
  'CV50870',
  'CV50871',
  'CV50873',
  'FF42198',
  'FF42201',
  'FF42219',
  'FF42228',
  'FF42237',
  'FF42238',
  'FF42239',
  'FF42240',
  'FF42241',
  'FF42246',
  'FF5638',
  'FF63055NN',
  'FK11024',
  'FK11025',
  'FS19870',
  'FS20194',
  'FS20218',
  'FS20318',
  'FS20377',
  'FS20427',
  'FS20428',
  'FS20429',
  'FS20430',
  'FS20431',
  'FS20432',
  'FS20494',
  'HF29208',
  'HF29211',
  'HF29216',
  'HF29217',
  'HF29218',
  'HF29219',
  'HF29220',
  'HF29221',
  'HF29222',
  'HF29223',
  'HF29224',
  'HF29225',
  'HF29226',
  'HF29227',
  'HF29228',
  'HF29229',
  'HF29230',
  'HF29231',
  'HF29232',
  'HF29233',
  'HF29234',
  'HF29235',
  'HF29236',
  'HF29237',
  'HF29238',
  'HF29239',
  'HF29240',
  'HF29241',
  'HF29242',
  'HF29243',
  'HF29244',
  'HF29245',
  'HF29246',
  'HF29247',
  'HF29248',
  'HF29249',
  'HF29250',
  'HF29251',
  'HF29252',
  'HF29253',
  'HF29254',
  'HF29255',
  'HF29256',
  'HF29257',
  'HF29258',
  'HF29262',
  'HF29264',
  'HF29265',
  'HF29267',
  'HF29298',
  'HF29299',
  'HF29301',
  'HF29322',
  'HF29323',
  'HF29324',
  'HF29325',
  'HF29326',
  'HF29327',
  'HF29328',
  'HF29329',
  'HF29330',
  'HF29331',
  'HF29332',
  'HF29333',
  'HF29334',
  'HF29335',
  'HF29336',
  'HF29337',
  'HF29338',
  'HF29339',
  'HF29340',
  'HF29341',
  'HF29342',
  'HF29343',
  'HF29344',
  'HF29345',
  'HF29346',
  'HF29347',
  'HF29348',
  'HF29349',
  'HF29350',
  'HF29351',
  'HF29352',
  'HF29353',
  'HF29354',
  'HF29355',
  'HF29356',
  'HF29357',
  'HF29358',
  'HF29359',
  'HF29360',
  'HF29361',
  'HF29362',
  'HF29363',
  'HF5000',
  'HF5001',
  'HF5002',
  'HF5012',
  'HF5013',
  'HF5014',
  'HF5015',
  'HF5016',
  'HF5017',
  'HF5018',
  'HF5019',
  'HF5020',
  'HF5021',
  'HF5022',
  'HF5023',
  'HF5024',
  'HF5025',
  'HF5026',
  'HF5027',
  'HF5028',
  'HF5029',
  'HF5030',
  'HF5031',
  'HF5032',
  'HF5033',
  'HF5034',
  'HF5035',
  'HF5036',
  'HF5037',
  'HF5038',
  'HF5039',
  'HF5040',
  'HF5041',
  'HF5042',
  'HF5043',
  'HF5044',
  'HF5045',
  'HF5046',
  'HF5047',
  'HF5048',
  'HF5049',
  'HF5054',
  'HF5055',
  'HF5056',
  'HF5057',
  'HF5058',
  'HF5059',
  'HF5060',
  'HF5061',
  'HF5062',
  'HF9501',
  'HH29304',
  'HH29305',
  'HV1224108',
  'HV1224208',
  'HV1224408',
  'HV1620108',
  'HV1620208',
  'HV1625108',
  'HV1625208',
  'HV2020108',
  'HV2020208',
  'HV2020408',
  'HV2024108',
  'HV2024208',
  'HV2025108',
  'HV2025208',
  'HV2424108',
  'HV2424208',
  'HV2424408',
  'LF14019NN',
  'LF16537',
  'LF17510',
  'LF17821',
  'LF17822',
  'LF17830',
  'LF17843',
  'MK14826',
  'MK14827',
  'MK14869',
  'MK14890',
  'MK14892',
  'MK14894',
  'MK14895',
  'MK14896',
  'MK14897',
  'MK14898',
  'WF2109'
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`Connected. Checking ${CODES.length} codes in 2 batched queries...`);

  const normalized = CODES.map(c => c.replace(/[^A-Za-z0-9]/g, '').toUpperCase());

  const byNormCode = new Map();
  console.log('Query 1/2: scanning oem_codes/competitor_codes...');
  const { rows: refRows } = await client.query(
    `SELECT UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')) AS norm_code, sku, filter_type, duty
       FROM elimfilters_catalog, jsonb_array_elements(oem_codes||competitor_codes) ref
      WHERE UPPER(REGEXP_REPLACE(ref->>'code','[^A-Za-z0-9]','','g')) = ANY($1::text[])`,
    [normalized]
  );
  console.log(`  -> ${refRows.length} raw matches`);
  for (const r of refRows) {
    if (!byNormCode.has(r.norm_code)) byNormCode.set(r.norm_code, []);
    byNormCode.get(r.norm_code).push(r);
  }

  console.log('Query 2/2: checking codigo_base...');
  const { rows: cbRows } = await client.query(
    `SELECT codigo_base, sku, filter_type, duty FROM elimfilters_catalog WHERE codigo_base = ANY($1::text[])`,
    [CODES]
  );
  console.log(`  -> ${cbRows.length} raw matches`);
  const byRawCode = new Map();
  for (const r of cbRows) {
    if (!byRawCode.has(r.codigo_base)) byRawCode.set(r.codigo_base, []);
    byRawCode.get(r.codigo_base).push(r);
  }

  const found = [];
  const notFound = [];
  for (let i = 0; i < CODES.length; i++) {
    const matches = [...(byNormCode.get(normalized[i]) || []), ...(byRawCode.get(CODES[i]) || [])];
    if (matches.length) found.push({ code: CODES[i], matches });
    else notFound.push(CODES[i]);
  }

  console.log(`\n${found.length}/${CODES.length} already in catalog:`);
  found.forEach(f => console.log(`  ${f.code} -> ${f.matches.map(m => `${m.sku}(${m.filter_type},${m.duty})`).join(', ')}`));

  console.log(`\n${notFound.length}/${CODES.length} NOT in catalog:`);
  console.log('  ' + notFound.join(', '));

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
