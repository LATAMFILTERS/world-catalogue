'use strict';

const crypto = require('crypto');

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const OFFICIAL_LITERATURE_SOURCES = Object.freeze([
  Object.freeze({
    id: 'F111330-ENG',
    title: 'Transmission Filtration',
    url: 'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/transmission/F111330-ENG/Transmission-Filtration.pdf',
    crossReferences: Object.freeze([
      Object.freeze({
        donaldson: 'P166135',
        manufacturer: 'FLEETGUARD',
        references: Object.freeze(['HF30114', 'HF7118F', 'HF7518', 'HF7520', 'HF8318', 'HF8320']),
      }),
      Object.freeze({
        donaldson: 'P166136',
        manufacturer: 'FLEETGUARD',
        references: Object.freeze(['HF30317', 'HF7119', 'HF7119F', 'HF7519', 'HF8319']),
      }),
      Object.freeze({
        donaldson: 'P166254',
        manufacturer: 'FLEETGUARD',
        references: Object.freeze(['HF30159', 'HF7072F', 'HF7472', 'HF7473', 'HF8273', 'HF8277']),
      }),
      Object.freeze({
        donaldson: 'P166255',
        manufacturer: 'FLEETGUARD',
        references: Object.freeze(['HF30295', 'HF7074F', 'HF7474', 'HF8074', 'HF8274']),
      }),
    ]),
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
  OFFICIAL_LITERATURE_SOURCES,
  findOfficialLiteratureCrossReference,
  normalizeCode,
};
