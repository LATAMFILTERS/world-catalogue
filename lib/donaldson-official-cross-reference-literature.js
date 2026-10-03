'use strict';

const crypto = require('crypto');

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const F111330_FLEETGUARD = Object.freeze([
  ['P560971', ['HF28943']],
  ['P560972', ['HF28936', 'HF28944', 'HF35153']],
  ['P575039', ['HF35340']],
  ['P574196', ['HF35198']],
  ['P573354', ['HF35515']],
  ['P165239', ['HF35101', 'HF6342']],
  ['P166135', ['HF30114', 'HF7118F', 'HF7518', 'HF7520', 'HF8318', 'HF8320']],
  ['P166136', ['HF30317', 'HF7119', 'HF7119F', 'HF7519', 'HF8319']],
  ['P166254', ['HF30159', 'HF7072F', 'HF7472', 'HF7473', 'HF8273', 'HF8277']],
  ['P166255', ['HF30295', 'HF7074F', 'HF7474', 'HF8074', 'HF8274']],
  ['P166376', ['HF6271', 'HF6373']],
  ['P170737', ['HF28458', 'HF28758', 'HF6389']],
  ['P550951', ['HF6088', 'HF6118', 'HF6225']],
  ['P573482', ['HF35476']],
  ['P550830', ['3937557S']],
  ['P550637', ['LF637']],
  ['P165659', ['HF6587']],
  ['P170949', ['HF6590', 'HF6684']],
  ['P164381', ['HF6554', 'HF6564', 'HF6566']],
  ['P164375', ['HF6517', 'HF6552', 'HF6560']],
  ['P165569', ['HF6586']],
  ['P171298', ['HF28992']],
  ['P173521', ['HF28994']],
  ['P165705', ['HF6589']],
  ['P165675', ['HF6588']],
  ['P165877', ['HF6183', 'HF6725', 'HF6728', 'HF6732', 'HF6753', 'HF6781']],
  ['P165879', ['HF6700']],
  ['P169078', ['HF35006']],
  ['P550542', ['HF7533', 'HF7553']],
  ['P566920', ['HF6603']],
  ['P574731', ['HF6420']],
  ['P174675', ['HF28996']],
]);

const OFFICIAL_LITERATURE_SOURCES = Object.freeze([
  Object.freeze({
    id: 'F111330-ENG',
    title: 'Transmission Filtration',
    url: 'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/transmission/F111330-ENG/Transmission-Filtration.pdf',
    crossReferences: Object.freeze(
      F111330_FLEETGUARD.map(([donaldson, references]) => Object.freeze({
        donaldson,
        manufacturer: 'FLEETGUARD',
        references: Object.freeze([...references]),
      }))
    ),
  }),
]);

function findOfficialLiteratureCrossReference(donaldsonCode, currentCode) {
  const d = normalizeCode(donaldsonCode);
  const c = normalizeCode(currentCode);
  if (!d || !c) return null;

  for (const source of OFFICIAL_LITERATURE_SOURCES) {
    for (const row of source.crossReferences) {
      if (normalizeCode(row.donaldson) !== d) continue;
      const matched = row.references.find((value) => normalizeCode(value) === c);
      if (!matched) continue;
      const fingerprintPayload = [
        source.id,
        normalizeCode(row.donaldson),
        String(row.manufacturer || '').trim().toUpperCase(),
        normalizeCode(matched),
      ].join('|');
      return {
        ok: true,
        evidenceKind: 'OFFICIAL_DONALDSON_LITERATURE_CROSS_REFERENCE',
        evidenceAuthority: 'OFFICIAL_DONALDSON_LITERATURE',
        evidenceUrl: source.url,
        evidenceDocumentId: source.id,
        evidenceHash: crypto.createHash('sha256').update(fingerprintPayload).digest('hex'),
        evidenceHashKind: 'CURATED_ROW_FINGERPRINT_SHA256',
        manufacturer: row.manufacturer,
        donaldsonCode: row.donaldson,
        matchedReference: matched,
      };
    }
  }

  return null;
}

module.exports = {
  F111330_FLEETGUARD,
  OFFICIAL_LITERATURE_SOURCES,
  findOfficialLiteratureCrossReference,
  normalizeCode,
};
