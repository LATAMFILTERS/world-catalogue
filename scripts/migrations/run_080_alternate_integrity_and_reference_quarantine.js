'use strict';

/**
 * Structural sanitation only. No manufacturer, equivalence, application or
 * canonical-code inference is performed.
 *
 * 1. Removes codigo_base from alternate arrays because the canonical lookup
 *    remains present in codigo_base.
 * 2. Quarantines cross-duty reference families until explicit evidence exists.
 * 3. Exposes cross-column classification conflicts without moving either value.
 * 4. Installs a monotonic guard: future writes cannot reintroduce base
 *    duplication or increase cross-column duplication.
 */

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '080_ALTERNATE_INTEGRITY_AND_REFERENCE_QUARANTINE';
const REVIEWED_REFERENCES = Object.freeze([
  '1R1808', '1R0732',
  'PH3614', 'PH3614A', 'PH3614AZ',
  'G3802', 'G3802A', 'G3802DP'
]);

const normalizeSql = (expression) =>
  `upper(regexp_replace(coalesce(${expression}, ''), '[^A-Z0-9]', '', 'g'))`;

async function scalar(client, sql) {
  const result = await client.query(sql);
  return Number(result.rows[0]?.n || 0);
}

async function applyAlternateIntegrityAndReferenceQuarantine() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = {
    migration: MIGRATION,
    absence_inferred: 0,
    classification_inferred: 0,
    applications_mutated: 0,
    codigo_base_mutated: 0,
    sku_mutated: 0,
    audit_before: {},
    audit_after: {},
  };

  try {
    await client.query('BEGIN');
    const baseNorm = normalizeSql('c.codigo_base');
    const itemNorm = normalizeSql("coalesce(x.item->>'code',x.item->>'reference')");

    report.audit_before.base_duplicates = await scalar(client, `
      SELECT count(DISTINCT c.sku) n FROM elimfilters_catalog c
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)) item
        WHERE ${normalizeSql("coalesce(item->>'code',item->>'reference')")} = ${baseNorm}
      ) OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) item
        WHERE ${normalizeSql("coalesce(item->>'code',item->>'reference')")} = ${baseNorm}
      )
    `);

    const protectedBefore = await client.query(`
      SELECT md5(string_agg(sku || ':' || md5(coalesce(equipment_applications,'[]'::jsonb)::text)
        || ':' || md5(coalesce(vehicle_applications,'[]'::jsonb)::text), '|' ORDER BY sku)) AS hash
      FROM elimfilters_catalog
    `);
    report.audit_before.application_payload_hash = protectedBefore.rows[0]?.hash || null;

    const cleaned = await client.query(`
      UPDATE elimfilters_catalog c
      SET oem_codes = coalesce((
            SELECT jsonb_agg(x.item ORDER BY x.ord)
            FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)) WITH ORDINALITY x(item,ord)
            WHERE ${itemNorm} <> ${baseNorm}
          ), '[]'::jsonb),
          competitor_codes = coalesce((
            SELECT jsonb_agg(x.item ORDER BY x.ord)
            FROM jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) WITH ORDINALITY x(item,ord)
            WHERE ${itemNorm} <> ${baseNorm}
          ), '[]'::jsonb)
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)) item
        WHERE ${normalizeSql("coalesce(item->>'code',item->>'reference')")} = ${baseNorm}
      ) OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) item
        WHERE ${normalizeSql("coalesce(item->>'code',item->>'reference')")} = ${baseNorm}
      )
      RETURNING sku
    `);
    report.catalog_rows_cleaned = cleaned.rowCount;

    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_reference_governance_queue (
        normalized_reference text PRIMARY KEY,
        status text NOT NULL,
        sku_count integer NOT NULL,
        hd_count integer NOT NULL,
        ld_count integer NOT NULL,
        filter_types jsonb NOT NULL DEFAULT '[]'::jsonb,
        reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
        first_seen_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CHECK (status IN ('EVIDENCE_REQUIRED','RESOLVED'))
      )
    `);

    await client.query(`
      CREATE OR REPLACE VIEW catalog_reference_classification_conflicts_v AS
      WITH oem AS (
        SELECT c.sku, ${normalizeSql("coalesce(x->>'code',x->>'reference')")} normalized_reference
        FROM elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)) x
      ), competitor AS (
        SELECT c.sku, ${normalizeSql("coalesce(x->>'code',x->>'reference')")} normalized_reference
        FROM elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x
      )
      SELECT DISTINCT o.sku, o.normalized_reference, 'EVIDENCE_REQUIRED'::text status
      FROM oem o JOIN competitor c USING (sku, normalized_reference)
      WHERE o.normalized_reference <> ''
    `);

    const reviewed = REVIEWED_REFERENCES.map(value => `'${value}'`).join(',');
    await client.query(`
      CREATE TEMP TABLE catalog_reference_conflicts_080 ON COMMIT DROP AS
      WITH refs AS MATERIALIZED (
        SELECT DISTINCT ${normalizeSql('r.code')} normalized_reference, r.sku
        FROM crossref_resolved_cache r
        WHERE ${normalizeSql('r.code')} <> ''
      ), direct_norm AS MATERIALIZED (
        SELECT ${normalizeSql('sku')} normalized_reference FROM elimfilters_catalog
        UNION
        SELECT ${normalizeSql('codigo_base')} FROM elimfilters_catalog
      )
      SELECT refs.normalized_reference,
        count(DISTINCT refs.sku)::int sku_count,
        count(DISTINCT refs.sku) FILTER (WHERE c.duty='HEAVY_DUTY')::int hd_count,
        count(DISTINCT refs.sku) FILTER (WHERE c.duty='LIGHT_DUTY')::int ld_count,
        to_jsonb(array_agg(DISTINCT c.filter_type ORDER BY c.filter_type)) filter_types
      FROM refs JOIN elimfilters_catalog c USING (sku)
      LEFT JOIN direct_norm d USING (normalized_reference)
      WHERE d.normalized_reference IS NULL
        AND refs.normalized_reference NOT IN (${reviewed})
      GROUP BY refs.normalized_reference
      HAVING count(DISTINCT c.duty) > 1
    `);
    await client.query(`
      UPDATE catalog_reference_governance_queue q
      SET status='RESOLVED', updated_at=now()
      WHERE status='EVIDENCE_REQUIRED'
        AND NOT EXISTS (
          SELECT 1 FROM catalog_reference_conflicts_080 c
          WHERE c.normalized_reference=q.normalized_reference
        )
    `);
    await client.query(`
      DELETE FROM catalog_reference_governance_queue
      WHERE normalized_reference IN (${reviewed})
    `);
    const queued = await client.query(`
      INSERT INTO catalog_reference_governance_queue (
        normalized_reference,status,sku_count,hd_count,ld_count,filter_types,reasons,updated_at
      )
      SELECT normalized_reference,'EVIDENCE_REQUIRED',sku_count,hd_count,ld_count,filter_types,
        '["CROSS_DUTY","OFFICIAL_EVIDENCE_REQUIRED"]'::jsonb,now()
      FROM catalog_reference_conflicts_080
      ON CONFLICT (normalized_reference) DO UPDATE SET
        status='EVIDENCE_REQUIRED', sku_count=excluded.sku_count,
        hd_count=excluded.hd_count, ld_count=excluded.ld_count,
        filter_types=excluded.filter_types, reasons=excluded.reasons, updated_at=now()
      RETURNING normalized_reference
    `);
    report.reference_families_quarantined = queued.rowCount;

    await client.query(`
      CREATE OR REPLACE FUNCTION enforce_elimfilters_alternate_integrity()
      RETURNS trigger LANGUAGE plpgsql AS $function$
      DECLARE
        base_norm text := ${normalizeSql('NEW.codigo_base')};
        new_cross_count integer := 0;
        old_cross_count integer := 0;
      BEGIN
        IF EXISTS (
          SELECT 1 FROM jsonb_array_elements(coalesce(NEW.oem_codes,'[]'::jsonb)) x
          WHERE ${normalizeSql("coalesce(x->>'code',x->>'reference')")} = base_norm
        ) OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes,'[]'::jsonb)) x
          WHERE ${normalizeSql("coalesce(x->>'code',x->>'reference')")} = base_norm
        ) THEN
          RAISE EXCEPTION 'ALTERNATE_INTEGRITY: codigo_base duplicated in alternates for SKU %', NEW.sku;
        END IF;

        IF EXISTS (
          SELECT 1 FROM jsonb_array_elements(coalesce(NEW.oem_codes,'[]'::jsonb)) x
          WHERE upper(coalesce(x->>'classification',x->>'source_type','')) IN ('AFTERMARKET','COMPETITOR')
        ) OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(coalesce(NEW.competitor_codes,'[]'::jsonb)) x
          WHERE upper(coalesce(x->>'classification',x->>'source_type','')) = 'OEM'
        ) THEN
          RAISE EXCEPTION 'ALTERNATE_INTEGRITY: explicitly classified reference stored in wrong column for SKU %', NEW.sku;
        END IF;

        SELECT count(*) INTO new_cross_count FROM (
          SELECT DISTINCT ${normalizeSql("coalesce(x->>'code',x->>'reference')")} code
          FROM jsonb_array_elements(coalesce(NEW.oem_codes,'[]'::jsonb)) x
          INTERSECT
          SELECT DISTINCT ${normalizeSql("coalesce(x->>'code',x->>'reference')")} code
          FROM jsonb_array_elements(coalesce(NEW.competitor_codes,'[]'::jsonb)) x
        ) q WHERE code <> '';

        IF TG_OP = 'INSERT' AND new_cross_count > 0 THEN
          RAISE EXCEPTION 'ALTERNATE_INTEGRITY: cross-column duplicates are forbidden for SKU %', NEW.sku;
        END IF;
        IF TG_OP = 'UPDATE' THEN
          SELECT count(*) INTO old_cross_count FROM (
            SELECT DISTINCT ${normalizeSql("coalesce(x->>'code',x->>'reference')")} code
            FROM jsonb_array_elements(coalesce(OLD.oem_codes,'[]'::jsonb)) x
            INTERSECT
            SELECT DISTINCT ${normalizeSql("coalesce(x->>'code',x->>'reference')")} code
            FROM jsonb_array_elements(coalesce(OLD.competitor_codes,'[]'::jsonb)) x
          ) q WHERE code <> '';
          IF new_cross_count > old_cross_count THEN
            RAISE EXCEPTION 'ALTERNATE_INTEGRITY: cross-column duplicates cannot increase for SKU %', NEW.sku;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $function$;
      DROP TRIGGER IF EXISTS trg_elimfilters_alternate_integrity ON elimfilters_catalog;
      CREATE TRIGGER trg_elimfilters_alternate_integrity
      BEFORE INSERT OR UPDATE OF codigo_base,oem_codes,competitor_codes ON elimfilters_catalog
      FOR EACH ROW EXECUTE FUNCTION enforce_elimfilters_alternate_integrity();
    `);

    report.audit_after.base_duplicates = await scalar(client, `
      SELECT count(DISTINCT c.sku) n FROM elimfilters_catalog c
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)) item
        WHERE ${normalizeSql("coalesce(item->>'code',item->>'reference')")} = ${baseNorm}
      ) OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) item
        WHERE ${normalizeSql("coalesce(item->>'code',item->>'reference')")} = ${baseNorm}
      )
    `);
    const protectedAfter = await client.query(`
      SELECT md5(string_agg(sku || ':' || md5(coalesce(equipment_applications,'[]'::jsonb)::text)
        || ':' || md5(coalesce(vehicle_applications,'[]'::jsonb)::text), '|' ORDER BY sku)) AS hash
      FROM elimfilters_catalog
    `);
    report.audit_after.application_payload_hash = protectedAfter.rows[0]?.hash || null;
    report.audit_after.classification_conflicts = await scalar(client,
      'SELECT count(*) n FROM catalog_reference_classification_conflicts_v');

    if (report.audit_after.base_duplicates !== 0) throw new Error('BASE_DUPLICATES_REMAIN');
    if (report.audit_before.application_payload_hash !== report.audit_after.application_payload_hash) {
      throw new Error('APPLICATION_PAYLOAD_CHANGED');
    }

    await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw Object.assign(error, { migrationReport: report });
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyAlternateIntegrityAndReferenceQuarantine()
    .then(report => console.log('[alternate-integrity-v1]', JSON.stringify(report)))
    .catch(error => {
      console.error('[alternate-integrity-v1] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = {
  MIGRATION,
  REVIEWED_REFERENCES,
  normalizeSql,
  applyAlternateIntegrityAndReferenceQuarantine,
};
