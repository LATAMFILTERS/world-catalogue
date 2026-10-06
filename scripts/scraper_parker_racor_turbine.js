'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(__dirname, 'parker_racor_turbine_results.json');

const SOURCES = Object.freeze([
  {
    id: 'PARKER_RACOR_RSL0385_TURBINE_CATALOG',
    url: 'https://www.parker.com/content/dam/Parker-com/Literature/EMOE/cat/RSL0385_Turbine-Series_Catalog.pdf',
    models: ['500FG', '900FH', '1000FH'],
  },
  {
    id: 'PARKER_RACOR_500FG_CUTSHEET',
    url: 'https://www.parker.com/content/dam/Parker-com/Literature/Racor/RSL/RSL0288_CUT_500FG.pdf',
    models: ['500FG'],
  },
  {
    id: 'PARKER_RACOR_500FG_INSTRUCTIONS',
    url: 'https://www.parker.com/content/dam/Parker-com/Literature/Racor/15332_Rev_G_500FG.pdf',
    models: ['500FG'],
  },
  {
    id: 'PARKER_RACOR_900FH_1000FH_INSTRUCTIONS',
    url: 'https://www.parker.com/content/dam/Parker-com/Literature/Racor/Tech_Install/12960_900FH-1000FH_Turbines.pdf',
    models: ['900FH', '1000FH'],
  },
]);

const COMPATIBILITY = Object.freeze({
  '500FG': '2010',
  '500FH': '2010',
  '900FG': '2040',
  '900FH': '2040',
  '1000FG': '2020',
  '1000FH': '2020',
});

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ELIMFILTERS-PARKER-RACOR-EVIDENCE/1.0' },
  });
  const body = Buffer.from(await response.arrayBuffer());
  if (!response.ok) throw new Error(source.id + ' HTTP ' + response.status);
  if (body.length < 1000) throw new Error(source.id + ' returned implausibly small artifact');
  return {
    id: source.id,
    url: source.url,
    http_status: response.status,
    content_type: response.headers.get('content-type'),
    bytes: body.length,
    sha256: sha256(body),
    captured_at: new Date().toISOString(),
  };
}

async function run() {
  const captures = [];
  const failures = [];
  for (const source of SOURCES) {
    try {
      captures.push(await fetchSource(source));
    } catch (error) {
      failures.push({ id: source.id, url: source.url, error: error.message });
    }
  }

  const captureById = new Map(captures.map((x) => [x.id, x]));
  const records = Object.entries(COMPATIBILITY).map(([model, series]) => {
    const supporting = SOURCES.filter((s) => s.models.includes(model))
      .map((s) => captureById.get(s.id))
      .filter(Boolean);

    return {
      part_number: model,
      manufacturer: 'PARKER RACOR',
      family: 'TURBINE_SERIES',
      compatible_element_series: series,
      authority: 'PARKER_RACOR_OFFICIAL',
      source_urls: supporting.map((x) => x.url),
      source_artifact_hashes: supporting.map((x) => x.sha256),
      evidence_status: supporting.length ? 'VERIFIED_SOURCE_CAPTURE' : 'REVIEW_REQUIRED',
      cross_references: [],
      equipment: [],
      captured_at: new Date().toISOString(),
    };
  });

  const output = {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    authority: 'PARKER_RACOR_OFFICIAL',
    source_policy: 'ET9_PRIMARY',
    captures,
    failures,
    records,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({
    output: path.relative(ROOT, OUTPUT),
    captures: captures.length,
    failures: failures.length,
    records: records.length,
  }, null, 2));

  if (!captures.length) process.exitCode = 2;
  return output;
}

if (require.main === module) {
  run().catch((error) => {
    console.error('[parker-racor-turbine-scraper] failed', error.stack || error.message);
    process.exit(1);
  });
}

module.exports = { SOURCES, COMPATIBILITY, fetchSource, run };
