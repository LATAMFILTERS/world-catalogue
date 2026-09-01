'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inferTechnology } = require('../lib/bot-protocol-channel-format');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

function readIfPresent(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

const cases = [
  [{ filter_type: 'Fuel Filter' }, 'SYNTAPORE™'],
  [{ filter_type: 'Primary Diesel Fuel Filter' }, 'SYNTAPORE™'],
  // Fuel technology scope is intentionally split:
  // HYDROCORE™ = approved standard non-turbine fuel/water separators.
  // TURBOCORE™ = approved FH/FG turbine-style fuel/water separation.
  // SYNTAPORE™ = plain diesel-fuel particulate filtration.
  [{ filter_type: 'Fuel Water Separator' }, 'HYDROCORE™'],
  [{ filter_type: 'Fuel Water Separator', sku: '900FH-RACOR' }, 'TURBOCORE™'],
  [{ description: 'Approved 900FH turbine fuel separator element' }, 'TURBOCORE™'],
  [{ codigo_base: '2020PM' }, 'TURBOCORE™'],
  [{ filter_type: 'Hydraulic Filter' }, 'NANOFORCE™'],
  [{ filter_type: 'Lube Oil Filter' }, 'SYNTRAX™'],
  [{ filter_type: 'Coolant Filter' }, 'THERMACORE™'],
  [{ filter_type: 'Cabin Air Filter' }, 'MICROKAPPA™'],
  [{ filter_type: 'Air Dryer Cartridge' }, 'DRYCORE™'],
  [{ filter_type: 'Air Intake Housing' }, 'INTEKCORE™'],
  [{ filter_type: 'Engine Air Filter' }, 'MACROCORE™'],
];

test('omnichannel formatter infers only current canonical technologies', () => {
  for (const [product, expected] of cases) {
    assert.equal(inferTechnology(product), expected, JSON.stringify(product));
  }
});

test('explicit governed technology takes precedence over inference', () => {
  assert.equal(
    inferTechnology({ filter_type: 'Fuel Filter', technology: 'SYNTAPORE™' }),
    'SYNTAPORE™'
  );
});

test('Facebook and Instagram route governed responses directly through the central protocol', () => {
  const facebook = read('services/facebook-bot/src/knowledge.js');
  const instagram = read('elimfilters-instagram-bot/src/worker.js');

  assert.match(facebook, /\/api\/bot\/protocol/);
  assert.match(facebook, /x-bot-protocol-key/);
  assert.doesNotMatch(facebook, /nvidia|knowledge_engine/i);

  assert.match(instagram, /queryCentralProtocol/);
  assert.match(instagram, /const responseText = protocol\.answer/);
  assert.doesNotMatch(instagram, /nvidia|knowledge_engine/i);
});

test('WhatsApp automatically prefers central protocol when its credential is provisioned', () => {
  const config = read('elimfilters-whatsapp-bot/src/config.js');
  assert.match(config, /return Boolean\(apiKey\)/);
  assert.match(config, /USE_CENTRAL_PROTOCOL/);
  assert.match(config, /useCentralProtocol: centralProtocolEnabled\(botProtocolApiKey\)/);
});

test('vendored omnichannel workers never fall through to an independent AI after central-protocol failure', () => {
  const whatsapp = read('elimfilters-whatsapp-bot/src/worker.js');
  assert.match(whatsapp, /if \(config\.useCentralProtocol\)/);
  assert.match(whatsapp, /central_protocol_failure_safe_message/);
  assert.match(whatsapp, /else \{[\s\S]*Legacy independent path/i);

  // LinkedIn and YouTube may be deployed from separate repositories and are
  // not guaranteed to be vendored into world-catalogue. Validate them here
  // only when their worker sources are actually present in this checkout;
  // absence must not make the main site deploy fail with ENOENT.
  const optionalWorkers = [
    ['LinkedIn', 'elimfilters-linkedin-bot/src/worker.js'],
    ['YouTube', 'elimfilters-youtube-bot/src/worker.js'],
  ];

  for (const [name, rel] of optionalWorkers) {
    const source = readIfPresent(rel);
    if (!source) continue;
    assert.match(source, /if \(config\.botProtocolApiKey\)/, `${name} must gate the governed central route on its credential`);
    assert.match(source, /SAFE_SUPPORT_MESSAGE/, `${name} must use a deterministic safe response on governed-protocol failure`);
    assert.match(source, /else \{[\s\S]*legacy/i, `${name} legacy reasoning must be isolated to the no-central-credential branch`);
  }
});
