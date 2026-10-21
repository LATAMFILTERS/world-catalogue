import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildSkuProposals, validateResearch, runSkuProposals } from '../../scripts/hermes/sku-proposals.mjs';

const ev = (code) => ({ code, evidence_url: `https://catalog.example.com/${code}`, evidence_sha256: 'a'.repeat(64) });
const doc = (positions) => ({ schema: 'hermes.sku_research.v1', case_id: 'kubota-rtv-x900', equipment: { brand: 'KUBOTA', model: 'RTV-X900' }, researched_by: 'Codex', researched_at: '2026-10-22T10:00:00Z', positions });
const hd = (extra) => ({ position: 'engine oil', duty: 'HEAVY_DUTY', prefix: 'EL8', oem: ev('HH164-32430'), ...extra });
const catalogue = [
  { sku: 'EL82100', codigo_base: 'P552100', oem_codes: [] },
  { sku: 'EL80123', codigo_base: 'P550123', oem_codes: [{ manufacturer: 'KUBOTA', code: 'HH150-32094' }] }
];
const one = (positions, rows = catalogue) => buildSkuProposals([{ file: 'x.json', doc: doc(positions) }], rows).proposals;

test('HD: verified Donaldson -> prefix + last 4 digits, ready for Thursday authorization', () => {
  const [p] = one([hd({ donaldson: ev('P559999') })]);
  assert.equal(p.state, 'READY_FOR_AUTHORIZATION');
  assert.equal(p.proposed_sku, 'EL89999');
  assert.equal(p.base_manufacturer, 'DONALDSON');
  assert.match(p.entity_code, /^HERMES_SKU_[0-9A-F]{12}$/);
  assert.equal(p.approval_required, true);
});

test('HD: Donaldson slot taken by another product -> verified Fleetguard; both taken -> STOP_REVIEW', () => {
  const [fg] = one([hd({ donaldson: ev('P772100'), fleetguard: ev('LF3456') })]);
  assert.equal(fg.state, 'READY_FOR_AUTHORIZATION');
  assert.equal(fg.proposed_sku, 'EL83456');
  assert.equal(fg.base_manufacturer, 'FLEETGUARD');
  const [stop] = one([hd({ donaldson: ev('P772100'), fleetguard: ev('LF2100'), oem: ev('X-2100') })]);
  assert.equal(stop.state, 'STOP_REVIEW');
  assert.equal(stop.proposed_sku, null);
  assert.ok(stop.reasons.some((r) => /SKU_COLLISION/.test(r)));
});

test('HD: a missing Donaldson or Fleetguard reference is not proof of absence', () => {
  assert.deepEqual(one([hd({})])[0].reasons, ['DONALDSON_NOT_RESEARCHED']);
  assert.deepEqual(one([hd({ donaldson_absence_verified: true })])[0].reasons, ['FLEETGUARD_NOT_RESEARCHED']);
  const [oem] = one([hd({ donaldson_absence_verified: true, fleetguard_absence_verified: true })]);
  assert.equal(oem.state, 'READY_FOR_AUTHORIZATION');
  assert.equal(oem.proposed_sku, 'EL82430');
  assert.equal(oem.base_source_column, 'OEM_CODES');
});

test('codes already in the catalogue are reported as existing coverage, not as a new SKU', () => {
  assert.equal(one([hd({ donaldson: ev('P552100') })])[0].state, 'ALREADY_IN_CATALOGUE');
  const [byOem] = one([hd({ oem: ev('HH150-32094'), donaldson: ev('P558888') })]);
  assert.equal(byOem.state, 'ALREADY_IN_CATALOGUE');
  assert.equal(byOem.proposed_sku, 'EL80123');
});

test('LD: non-European uses FRAM, European uses MANN-FILTER; OEM only when the maker does not make it', () => {
  const ld = (extra) => ({ position: 'engine oil', duty: 'LIGHT_DUTY', prefix: 'EL3', oem: ev('90915-YZZD4'), ...extra });
  assert.equal(one([ld({ origin: 'NON_EUROPEAN', fram: ev('PH4967') })])[0].proposed_sku, 'EL34967');
  assert.equal(one([ld({ origin: 'EUROPEAN', mann: ev('W 712/95') })])[0].proposed_sku, 'EL31295'); // policy: last 4 numeric digits
  assert.equal(one([ld({ origin: 'NON_EUROPEAN', fram: ev('CA10') })])[0].state, 'STOP_REVIEW'); // under 4 digits: fail closed
  assert.deepEqual(one([ld({ origin: 'NON_EUROPEAN' })])[0].reasons, ['FRAM_NOT_RESEARCHED']);
  assert.equal(one([ld({ origin: 'NON_EUROPEAN', primary_absence_verified: true })])[0].base_manufacturer, 'OEM');
});

test('two positions competing for one new SKU are held for human ordering', () => {
  const props = one([hd({ donaldson: ev('P551111') }), hd({ position: 'bypass oil', oem: ev('Z-9'), donaldson: ev('P661111') })]);
  assert.deepEqual(props.map((p) => p.state), ['STOP_REVIEW', 'STOP_REVIEW']);
  assert.ok(props[0].reasons.some((r) => /BATCH_COLLISION/.test(r)));
});

test('research files without evidence, wrong prefix or wrong duty are rejected', () => {
  const errors = validateResearch(doc([{ position: 'fuel', duty: 'HEAVY_DUTY', prefix: 'EL3', oem: { code: 'X1' } }]));
  assert.ok(errors.some((e) => /prefix EL3 is not a HEAVY_DUTY prefix/.test(e)));
  assert.ok(errors.some((e) => /oem needs code, https evidence_url/.test(e)));
  assert.ok(validateResearch(doc([hd({ prefix: 'ET9' })])).some((e) => /ET9/.test(e)));
});

test('run: reads the inbox, skips proposals Victor already decided, writes sku-proposals.json', async () => {
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-sku-'));
  fs.mkdirSync(path.join(stateRoot, 'sku-research'));
  fs.writeFileSync(path.join(stateRoot, 'sku-research', 'a.json'), JSON.stringify(doc([hd({ donaldson: ev('P559999') }), hd({ position: 'fuel', prefix: 'EF9', oem: ev('F-1'), donaldson: ev('P553333') })])));
  fs.writeFileSync(path.join(stateRoot, 'sku-research', 'bad.json'), '{not json');
  const first = await runSkuProposals({ stateRoot, loadCatalogue: async () => catalogue });
  assert.equal(first.proposals.length, 2);
  assert.equal(first.invalid.length, 1);
  fs.mkdirSync(path.join(stateRoot, 'sku-decisions'));
  fs.writeFileSync(path.join(stateRoot, 'sku-decisions', `${first.proposals[0].entity_code}.json`), '{}');
  const second = await runSkuProposals({ stateRoot, loadCatalogue: async () => catalogue });
  assert.deepEqual(second.proposals.map((p) => p.proposed_sku), ['EF93333']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(stateRoot, 'sku-proposals.json'), 'utf8')).proposals.length, 1);
});

test('the published example research file is valid', () => {
  const example = JSON.parse(fs.readFileSync(path.resolve('hermes/schemas/sku-research.v1.example.json'), 'utf8'));
  assert.deepEqual(validateResearch(example), []);
});
