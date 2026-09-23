import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  INDUSTRIAL_SKU_FORMAT,
  INDUSTRIAL_SKU_PREFIX_POLICY,
  INDUSTRIAL_RESERVED_UNAPPROVED_PATHS,
  numericPayloadFromBaseCode,
  preferredIndustrialSku,
  collisionCandidates,
  planIndustrialSkus,
} from '../product-identity/lib/industrial-sku-policy.mjs';

const pilot = JSON.parse(fs.readFileSync('config/industrial-product-pilots/coalvex-pilot-01.json','utf8'));
const preview = JSON.parse(fs.readFileSync('config/industrial-product-pilots/coalvex-pilot-01-sku-preview.json','utf8'));

test('Industrial SKU prefix board is complete and separated from HD/LD namespaces', () => {
  const expected = {
    'TC-AIR-01':'IA1','TC-AIR-02':'IA2','TC-AIR-03':'IA3',
    'TC-DUST-01':'ID1',
    'TC-NG-01':'IG1','TC-NG-02':'IG2',
    'TC-HYD-01':'IH1','TC-LUB-01':'IL1','TC-OIL-01':'IO1','TC-OIL-02':'IO2',
    'TC-WAT-01':'IW1','TC-WAT-03':'IW3','TC-WAT-04':'IW4','TC-WAT-05':'IW5',
    'TC-WAT-06':'IW6','TC-WAT-07':'IW7','TC-WAT-08':'IW8',
  };
  assert.equal(Object.keys(INDUSTRIAL_SKU_PREFIX_POLICY).length, Object.keys(expected).length);
  for (const [core,prefix] of Object.entries(expected)) {
    assert.equal(INDUSTRIAL_SKU_PREFIX_POLICY[core].prefix,prefix,core);
    assert.match(prefix,/^I[A-Z][0-9]$/);
  }
  const forbidden = new Set(['EA1','EA2','ED4','EH6','EL8','EM9','ES9','EC1','EF9','EW7','ET9','EL3','EA3','EC3','EF3']);
  for (const row of Object.values(INDUSTRIAL_SKU_PREFIX_POLICY)) assert.equal(forbidden.has(row.prefix),false,row.prefix);
});

test('EDI is reserved but blocked; oil-mist candidate has no namespace', () => {
  assert.equal(INDUSTRIAL_SKU_PREFIX_POLICY['TC-WAT-08'].prefix,'IW8');
  assert.equal(INDUSTRIAL_SKU_PREFIX_POLICY['TC-WAT-08'].minting_enabled,false);
  assert.equal(INDUSTRIAL_RESERVED_UNAPPROVED_PATHS['PARTION-OIL-MIST-CANDIDATE'].prefix,null);
  assert.equal(INDUSTRIAL_RESERVED_UNAPPROVED_PATHS['PARTION-OIL-MIST-CANDIDATE'].minting_enabled,false);
  assert.equal(preferredIndustrialSku({technologyCore:'TC-WAT-08',baseCode:'EDI1234'}).status,'STOP_REVIEW');
  assert.equal(preferredIndustrialSku({technologyCore:'PARTION-OIL-MIST-CANDIDATE',baseCode:'DF1234'}).status,'STOP_REVIEW');
});

test('numeric payload extraction reuses numbers-only last4 discipline and pads short codes', () => {
  assert.equal(numericPayloadFromBaseCode('CC3LGA7H13'),'3713');
  assert.equal(numericPayloadFromBaseCode('CS604LGH'),'0604');
  assert.equal(numericPayloadFromBaseCode('AB-11'),'0011');
  assert.equal(numericPayloadFromBaseCode('NO-DIGITS'),null);
});

test('preferred SKU is format-compatible and rejects base codes without numeric payload', () => {
  const result=preferredIndustrialSku({technologyCore:'TC-NG-01',baseCode:'CC3LG02H13'});
  assert.deepEqual(result,{status:'PREFERRED',reason:'PREFIX_PLUS_LAST4_NUMERIC_BASE_PAYLOAD',sku:'IG10213',prefix:'IG1',payload:'0213'});
  assert.match(result.sku,INDUSTRIAL_SKU_FORMAT);
  assert.equal(preferredIndustrialSku({technologyCore:'TC-NG-01',baseCode:'ABC'}).reason,'BASE_CODE_HAS_NO_NUMERIC_PAYLOAD');
});

test('collision candidates preserve prefix + discriminator + last3 and stay format-valid', () => {
  const c=collisionCandidates({technologyCore:'TC-NG-01',baseCode:'CC3LGB7H13'});
  assert.deepEqual(c,['IG11713','IG12713','IG13713','IG14713','IG15713','IG16713','IG17713','IG18713','IG19713']);
  for(const sku of c) assert.match(sku,INDUSTRIAL_SKU_FORMAT);
});

test('published/occupied preferred slot is sticky and next product takes first free collision slot', () => {
  const rows=planIndustrialSkus([
    {technology_core:'TC-NG-01',source_brand:'PALL',source_code:'CC3LGB7H13'}
  ],{occupiedSkus:['IG13713','IG11713']});
  assert.equal(rows[0].planned_sku,'IG12713');
  assert.equal(rows[0].sku_method,'COLLISION_INDEX_PLUS_LAST3');
});

test('collision namespace exhaustion fails closed without a fallback identity', () => {
  const occupied=['IG13713',...collisionCandidates({technologyCore:'TC-NG-01',baseCode:'CC3LGB7H13'})];
  const rows=planIndustrialSkus([
    {technology_core:'TC-NG-01',source_brand:'PALL',source_code:'CC3LGB7H13'}
  ],{occupiedSkus:occupied});
  assert.equal(rows[0].planned_sku,null);
  assert.equal(rows[0].sku_status,'STOP_REVIEW');
  assert.equal(rows[0].sku_reason,'INDUSTRIAL_PREFIX_COLLISION_NAMESPACE_EXHAUSTED');
});

test('a first-publication collision batch fails closed until allocation order is explicitly frozen', () => {
  const rows=planIndustrialSkus([
    {technology_core:'TC-NG-01',source_brand:'PALL',source_code:'CC3LGA7H13'},
    {technology_core:'TC-NG-01',source_brand:'PALL',source_code:'CC3LGB7H13'},
  ]);
  assert.equal(rows.length,2);
  for(const row of rows) {
    assert.equal(row.planned_sku,null);
    assert.equal(row.sku_status,'STOP_REVIEW');
    assert.equal(row.sku_reason,'COLLISION_ALLOCATION_ORDER_NOT_FROZEN');
  }
});

test('duplicate canonical base identity within one batch fails closed', () => {
  const row={technology_core:'TC-NG-01',source_brand:'PALL',source_code:'CS604LGH'};
  const rows=planIndustrialSkus([row,row],{publicationOrderLocked:true});
  assert.equal(rows[0].sku_status,'PLANNED');
  assert.equal(rows[1].sku_status,'STOP_REVIEW');
  assert.equal(rows[1].sku_reason,'DUPLICATE_CANONICAL_BASE_IDENTITY_IN_BATCH');
});

test('COALVEX pilot preview is deterministic, unique, format-valid and not minted', () => {
  const planned=planIndustrialSkus(pilot.elements,{publicationOrderLocked:true});
  assert.equal(planned.length,15);
  assert.equal(preview.mappings.length,15);
  const generated=planned.map(r=>[r.source_code,r.planned_sku,r.sku_method]);
  const frozen=preview.mappings.map(r=>[r.source_code,r.planned_sku,r.sku_method]);
  assert.deepEqual(generated,frozen);
  const skus=planned.map(r=>r.planned_sku);
  assert.equal(new Set(skus).size,15);
  for(const sku of skus) assert.match(sku,INDUSTRIAL_SKU_FORMAT);
  assert.equal(preview.catalogue_write_allowed,false);
  assert.equal(preview.rule.publication_order_locked,true);
  assert.deepEqual(preview.mappings.map(r=>r.publication_order),Array.from({length:15},(_,i)=>i+1));
  for(const row of preview.mappings) assert.equal(row.status,'PREVIEW_ONLY_NOT_MINTED');
});

test('canonical governance documents publish the same Industrial SKU namespace', () => {
  const master=fs.readFileSync('docs/catalog/ELIMFILTERS_MASTER_CATALOG_POLICY.md','utf8');
  const product=fs.readFileSync('docs/brand/PRODUCT_REGISTRY.md','utf8');
  const root=fs.readFileSync('CLAUDE.md','utf8');
  for(const text of [master,product,root]) {
    assert.match(text,/IA1/);
    assert.match(text,/IG1/);
    assert.match(text,/IH1/);
    assert.match(text,/IL1/);
    assert.match(text,/IO1/);
    assert.match(text,/IW7/);
    assert.match(text,/IW8/);
    assert.match(text,/STOP_REVIEW/);
  }
  assert.match(master,/three governed product-identity domains/i);
  assert.match(product,/first-publication batch contains a collision group/i);
  assert.match(root,/raw query\/array\s+order is never an identity rule/i);
});

