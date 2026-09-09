'use strict';

require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');

const MIGRATION = '100_RACOR_SEPARATOR_SEARCH_IDENTITY_REPAIR';
const VERIFIED_AT = '2026-09-09T02:45:00.000Z';

const SKU_MAP = [
  ['EF91851', 'ES91851'],
  ['EF91852', 'ES91852'],
  ['EF91853', 'ES91853'],
  ['EF91854', 'ES91854'],
  ['EF91855', 'ES91855'],
  ['EF91856', 'ES91856'],
  ['EF91857', 'ES91857'],
  ['EF91858', 'ES91858'],
  ['EF91859', 'ES91859'],
];

const R90_TARGETS = [
  {
    sku: 'ES91854', codigoBase: 'P551854', racor: 'R90S', micron: 2,
    officialUrl: 'https://shop.donaldson.com/store/en-us/product/P551854/prod100231',
    invalidUnverifiedRefs: ['LFF8063', 'SN909002'],
  },
  {
    sku: 'ES91855', codigoBase: 'P551855', racor: 'R90T', micron: 10,
    officialUrl: 'https://shop.donaldson.com/store/en-us/product/P551855/74418',
    invalidUnverifiedRefs: ['96293', 'LFF8957', 'SN909010', 'Z366'],
  },
  {
    sku: 'ES91856', codigoBase: 'P551856', racor: 'R90P', micron: 30,
    officialUrl: 'https://shop.donaldson.com/store/en-us/product/P551856/74419',
    invalidUnverifiedRefs: ['FI111593X', 'LFF5766', 'SN909030'],
  },
];

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex');
}

function filterReferenceArray(value, blockedCodes) {
  const blocked = new Set(blockedCodes.map(norm));
  if (!Array.isArray(value)) return [];
  return value.filter((item) => !blocked.has(norm(item?.code || item?.reference)));
}

function hasReference(value, code, manufacturer) {
  const targetCode = norm(code);
  const targetManufacturer = norm(manufacturer);
  return (Array.isArray(value) ? value : []).some((item) =>
    norm(item?.code || item?.reference) === targetCode &&
    (!targetManufacturer || norm(item?.manufacturer || item?.brand) === targetManufacturer)
  );
}

async function applyRacorSeparatorSearchIdentityRepair() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(`
      SELECT sku
      FROM public.elimfilters_catalog
      WHERE sku = ANY($1::text[])
    `, [SKU_MAP.map(([, newSku]) => newSku)]);

    const currentSkus = new Set(existing.rows.map((row) => row.sku));
    const activeMap = SKU_MAP.filter(([, newSku]) => currentSkus.has(newSku));

    let updatedCacheRows = 0;
    for (const [oldSku, newSku] of activeMap) {
      const result = await client.query(`
        UPDATE public.crossref_resolved_cache
        SET sku = $2
        WHERE sku = $1
          AND EXISTS (
            SELECT 1
            FROM public.elimfilters_catalog c
            WHERE c.sku = $2
          )
      `, [oldSku, newSku]);
      updatedCacheRows += result.rowCount;
    }

    const governed = [];
    for (const target of R90_TARGETS) {
      const current = await client.query(`
        SELECT sku,codigo_base,duty,filter_type,technology,micron_rating,
               oem_codes,competitor_codes,enrichment_data,donalDson_url
        FROM public.elimfilters_catalog
        WHERE sku=$1
        FOR UPDATE
      `, [target.sku]);
      if (current.rowCount !== 1) throw new Error(`R90_TARGET_MISSING ${target.sku}`);
      const row = current.rows[0];
      if (norm(row.codigo_base) !== norm(target.codigoBase)) {
        throw new Error(`R90_BASE_MISMATCH ${target.sku}: ${row.codigo_base}`);
      }
      if (row.duty !== 'HEAVY_DUTY' || String(row.filter_type || '').toLowerCase() !== 'separator') {
        throw new Error(`R90_CLASSIFICATION_MISMATCH ${target.sku}`);
      }

      const cleanedOem = filterReferenceArray(row.oem_codes, target.invalidUnverifiedRefs);
      let cleanedCompetitor = filterReferenceArray(row.competitor_codes, target.invalidUnverifiedRefs);
      if (!hasReference(cleanedCompetitor, target.racor, 'RACOR')) {
        cleanedCompetitor = [
          ...cleanedCompetitor,
          { manufacturer: 'RACOR', code: target.racor, source: 'RACOR_CATALOG_VERIFIED' },
        ];
      }

      const evidenceRecord = {
        sku: target.sku,
        codigo_base: target.codigoBase,
        authority: 'DONALDSON',
        manufacturer: 'DONALDSON',
        source_url: target.officialUrl,
        evidence_kind: 'OFFICIAL_PRODUCT_PAGE',
        verification_method: 'EXACT_OFFICIAL_DONALDSON_PRODUCT_PAGE_REVIEW',
        verified_at: VERIFIED_AT,
        product_class: 'FUEL_WATER_SEPARATOR_SPIN_ON',
        racor_reference: target.racor,
        micron: target.micron,
      };
      const evidenceHash = stableHash(evidenceRecord);
      const currentGovernance = row.enrichment_data?.codigo_base_governance || {};
      const governance = {
        ...currentGovernance,
        policy_version: '2026-08-19-v3.1',
        state: 'CANONICAL_VERIFIED',
        required_authority: 'VERIFIED_DONALDSON',
        primary_manufacturer_verified: true,
        approved_manufacturer: 'DONALDSON',
        approved_codigo_base: target.codigoBase,
        current_codigo_base: target.codigoBase,
        evidence_authority: 'OFFICIAL_DONALDSON_SHOP',
        evidence_kind: 'OFFICIAL_PRODUCT_PAGE',
        evidence_url: target.officialUrl,
        evidence_hash: evidenceHash,
        evidence_hash_kind: 'CANONICAL_EVIDENCE_RECORD_SHA256',
        verification_method: evidenceRecord.verification_method,
        verified_at: VERIFIED_AT,
      };
      delete governance.donaldson_absence_verified;

      const enrichmentData = {
        ...(row.enrichment_data || {}),
        codigo_base_governance: governance,
        racor_identity_repair: {
          reference: target.racor,
          verified_at: VERIFIED_AT,
          removed_unverified_references: target.invalidUnverifiedRefs,
          official_donaldson_url: target.officialUrl,
        },
      };

      await client.query(`
        INSERT INTO public.catalog_codigo_base_evidence (
          sku,evidence_kind,authority,manufacturer,reference_code,
          normalized_reference,source_url,evidence_hash,verified_at,metadata
        ) VALUES ($1,'OFFICIAL_PRODUCT_PAGE','DONALDSON','DONALDSON',$2,$3,$4,$5,$6,$7::jsonb)
        ON CONFLICT DO NOTHING
      `, [
        target.sku,
        target.codigoBase,
        norm(target.codigoBase),
        target.officialUrl,
        evidenceHash,
        VERIFIED_AT,
        JSON.stringify({
          controlled_migration: MIGRATION,
          canonical_evidence_record: evidenceRecord,
          evidence_hash_kind: 'CANONICAL_EVIDENCE_RECORD_SHA256',
        }),
      ]);

      await client.query(`
        UPDATE public.elimfilters_catalog
        SET oem_codes=$2::jsonb,
            competitor_codes=$3::jsonb,
            donaldson_url=$4,
            enrichment_data=$5::jsonb
        WHERE sku=$1
      `, [
        target.sku,
        JSON.stringify(cleanedOem),
        JSON.stringify(cleanedCompetitor),
        target.officialUrl,
        JSON.stringify(enrichmentData),
      ]);

      await client.query(`
        UPDATE public.catalog_codigo_base_sanitation_queue
        SET current_codigo_base=$2,
            governance_state='CANONICAL_VERIFIED',
            required_authority='VERIFIED_DONALDSON',
            status='RESOLVED',
            last_error=NULL,
            updated_at=now()
        WHERE sku=$1
      `, [target.sku, target.codigoBase]);

      governed.push({ sku: target.sku, codigo_base: target.codigoBase, racor: target.racor });
    }

    const verification = await client.query(`
      SELECT code, sku, manufacturer
      FROM public.crossref_resolved_cache
      WHERE code = ANY($1::text[])
      ORDER BY code, sku
    `, [[
      'R60S','R60T','R60P',
      'R90S','R90T','R90P',
      'R120S','R120T','R120P'
    ]]);

    const expectedByCode = new Map([
      ['R60S','ES91851'], ['R60T','ES91852'], ['R60P','ES91853'],
      ['R90S','ES91854'], ['R90T','ES91855'], ['R90P','ES91856'],
      ['R120S','ES91857'], ['R120T','ES91858'], ['R120P','ES91859'],
    ]);

    for (const row of verification.rows) {
      const expected = expectedByCode.get(row.code);
      if (expected && row.sku !== expected) {
        throw new Error(`RACOR_SEARCH_IDENTITY_MISMATCH ${row.code}: expected ${expected}, got ${row.sku}`);
      }
    }

    await client.query('COMMIT');
    return {
      migration: MIGRATION,
      updated_cache_rows: updatedCacheRows,
      governed_r90_targets: governed,
      verified_references: verification.rows,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyRacorSeparatorSearchIdentityRepair()
    .then((report) => console.log('[racor-separator-search-identity-repair]', JSON.stringify(report)))
    .catch((error) => {
      console.error('[racor-separator-search-identity-repair] failed', error);
      process.exit(1);
    });
}

module.exports = { MIGRATION, R90_TARGETS, applyRacorSeparatorSearchIdentityRepair };
