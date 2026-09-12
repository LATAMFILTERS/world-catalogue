'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

async function client() {
  return import('../scripts/hermes/lib/fram-usa-smtp-client.mjs');
}

test('CryptoJS-compatible payload uses OpenSSL Salted__ envelope', async () => {
  const { encryptCryptoJsAes } = await client();
  const payload = encryptCryptoJsAes('lookup=partlist&partno=FS8A', 'public-test-passphrase');
  const decoded = Buffer.from(payload, 'base64');
  assert.equal(decoded.subarray(0, 8).toString('ascii'), 'Salted__');
});

test('FRAM supplier is selected exactly from supplier XML', async () => {
  const { parseFramSupplier } = await client();
  const xml = '<root><name><data>Other</data><id>OTHR</id></name><name><data>Fram Filters</data><id>FRAM</id><linecode>054</linecode><brandid>BCWZ</brandid></name></root>';
  assert.deepEqual(parseFramSupplier(xml), { name: 'Fram Filters', id: 'FRAM', linecode: '054', brandid: 'BCWZ' });
});test('part list parser retains FRAM catalog identity and part key', async () => {
  const { parsePartList } = await client();
  const xml = '<ShowMeThePartsList><partlistdata><supplier>Fram Filters</supplier><part_no>FS8A</part_no><part_type>Engine Oil Filter</part_type><part_key>010739876</part_key><supplierid>5062</supplierid><smtp_brandid>FRAM</smtp_brandid><aaiabrandid>BCWZ</aaiabrandid></partlistdata></ShowMeThePartsList>';
  const [record] = parsePartList(xml);
  assert.equal(record.supplier, 'Fram Filters');
  assert.equal(record.part_number, 'FS8A');
  assert.equal(record.part_key, '010739876');
  assert.equal(record.brand_id, 'FRAM');
  assert.equal(record.aaia_brand_id, 'BCWZ');
});

test('structured FRAM parsers retain detail, application and cross records', async () => {
  const { parsePartAttributes, parseApplications, parseCrossReferences, parseTotalRecords } = await client();
  const detail = '<root totalrecords="2"><partsAttributes><attribute>Filter Type</attribute><value>Spin-On Canister</value><recno>1</recno></partsAttributes><partsAttributes><attribute>Item Level GTIN</attribute><value>0001</value><recno>2</recno></partsAttributes></root>';
  const apps = '<root totalrecords="1"><partsapps><make>TOYOTA</make><model>PRIUS</model><year>2018</year><engine>L4-1.8L</engine><parttype>Engine Oil Filter</parttype><apptype>A</apptype><Qty>1</Qty></partsapps></root>';
  const crosses = '<root totalrecords="1"><interchangepartdata><mfg>FRAM Tough Guard</mfg><comp_no>TG4967</comp_no><part_no>PH4967</part_no><part_key>1</part_key><supplier>Fram Filters</supplier><part_type>Engine Oil Filter</part_type></interchangepartdata></root>';
  assert.equal(parseTotalRecords(detail), 2);
  assert.equal(parsePartAttributes(detail)[0].value, 'Spin-On Canister');
  assert.deepEqual(parseApplications(apps)[0], { make: 'TOYOTA', model: 'PRIUS', year: '2018', engine: 'L4-1.8L', part_type: 'Engine Oil Filter', application_type: 'A', quantity: 1 });
  assert.equal(parseCrossReferences(crosses)[0].part_number, 'TG4967');
});
