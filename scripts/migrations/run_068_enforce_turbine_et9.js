'use strict';

/**
 * Canonical turbine SKU enforcement.
 *
 * Governance:
 *   - Every turbine housing/assembly and every 2010/2020/2040 replacement
 *     element belongs to the ET9 SKU family.
 *   - TURBOCORE™ is the only technology for those turbine records.
 *   - Legacy non-ET9 aliases must never be returned as catalog products.
 *
 * Safety:
 *   - Runs in one transaction.
 *   - Only deterministic element mappings are auto-renamed.
 *   - Explicit legacy aliases are mapped only when a canonical ET9 target
 *     already exists.
 *   - Any unresolved turbine-like non-ET9 row aborts the migration instead
 *     of guessing.
 */

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('CATALOG_DATABASE_URL or DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const EXPLICIT_ALIASES = new Map([
  ['EF92020', 'ET92020T'],
]);

function normalize(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function collectCodes(row) {
  const values = [row.codigo_base];
  for (const field of ['competitor_codes', 'oem_codes']) {
    const arr = Array.isArray(row[field]) ? row[field] : [];
    for (const item of arr) {
      if (typeof item === 'string') values.push(item);
      else if (item && typeof item === 'object') values.push(item.code || item.reference || item.part_number || item.partNumber);
    }
  }
  return values.map(normalize).filter(Boolean);
}

function turbineVariantFromCodes(row) {
  const variants = new Set();
  for (const code of collectCodes(row)) {
    const m = code.match(/^(2010|2020|2040)(PM|SM|TM)/);
    if (!m) continue;
    const letter = m[2] === 'PM' ? 'P' : m[2] === 'SM' ? 'S' : 'T';
    variants.add(`ET9${m[1]}${letter}`);
  }
  return variants.size === 1 ? [...variants][0] : null;
}

function isTurbineLike(row) {
  if (/^ET9/i.test(String(row.sku || ''))) return true;
  if (String(row.technology || '').toUpperCase() === 'TURBOCORE™') return true;
  const codes = collectCodes(row);
  return codes.some(code =>
    /^(2010|2020|2040)(PM|SM|TM)/.test(code) ||
    /^(500|900|1000)(FG|FH|FE|FF)/.test(code)
  );
}

async function remapDependencies(client, oldSku, newSku) {
  const mappings = [
    ['exact_part_reference', 'sku'],
    ['kit_components', 'filter_sku'],
    ['product_element', 'elimfilters_sku'],
    ['product_model', 'elimfilters_sku'],
  ];

  for (const [table, column] of mappings) {
    const exists = await client.query(
      `SELECT to_regclass($1) AS relation`,
      [`public.${table}`]
    );
    if (!exists.rows[0]?.relation) continue;

    await client.query(
      `UPDATE ${table} SET ${column} = $1 WHERE ${column} = $2`,
      [newSku, oldSku]
    );
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`
      SELECT sku, codigo_base, filter_type, duty, technology,
             competitor_codes, oem_codes, description
      FROM elimfilters_catalog
      ORDER BY sku
    `);

    const bySku = new Map(rows.map(row => [String(row.sku || '').toUpperCase(), row]));
    const turbineRows = rows.filter(isTurbineLike);
    const nonCanonical = turbineRows.filter(row => !/^ET9/i.test(String(row.sku || '')));

    const plan = [];
    const unresolved = [];

    for (const row of nonCanonical) {
      const oldSku = String(row.sku || '').toUpperCase();
      let target = EXPLICIT_ALIASES.get(oldSku) || turbineVariantFromCodes(row);

      if (!target) {
        unresolved.push({ sku: row.sku, codigo_base: row.codigo_base, reason: 'ambiguous_or_missing_variant' });
        continue;
      }

      const targetRow = bySku.get(target);
      if (!targetRow) {
        unresolved.push({ sku: row.sku, codigo_base: row.codigo_base, target, reason: 'canonical_target_missing' });
        continue;
      }

      plan.push({ oldSku: row.sku, target });
    }

    console.log(JSON.stringify({
      turbine_rows: turbineRows.length,
      canonical_et9_rows: turbineRows.length - nonCanonical.length,
      noncanonical_turbine_rows: nonCanonical.length,
      safe_alias_remaps: plan,
      unresolved
    }, null, 2));

    if (unresolved.length) {
      throw new Error(`Aborting: ${unresolved.length} turbine-like rows require evidence before mutation`);
    }

    for (const { oldSku, target } of plan) {
      await remapDependencies(client, oldSku, target);
      await client.query('DELETE FROM elimfilters_catalog WHERE sku = $1', [oldSku]);
      console.log(`[turbine-et9] removed legacy alias ${oldSku}; canonical=${target}`);
    }

    await client.query(`
      UPDATE elimfilters_catalog
      SET technology = 'TURBOCORE™'
      WHERE sku LIKE 'ET9%'
        AND technology IS DISTINCT FROM 'TURBOCORE™'
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION enforce_turbine_et9_sku()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      DECLARE
        evidence text;
      BEGIN
        evidence := upper(
          coalesce(NEW.codigo_base, '') || ' ' ||
          coalesce(NEW.description, '') || ' ' ||
          coalesce(NEW.competitor_codes::text, '') || ' ' ||
          coalesce(NEW.oem_codes::text, '')
        );

        IF upper(coalesce(NEW.technology, '')) = 'TURBOCORE™'
           OR evidence ~ '(^|[^A-Z0-9])(2010|2020|2040)(PM|SM|TM)'
           OR evidence ~ '(^|[^A-Z0-9])(500|900|1000)(FG|FH|FE|FF)'
        THEN
          IF NEW.sku !~ '^ET9' THEN
            RAISE EXCEPTION 'Turbine catalog records must use canonical ET9 SKU family; received %', NEW.sku;
          END IF;
          NEW.technology := 'TURBOCORE™';
        END IF;

        RETURN NEW;
      END;
      $$
    `);

    await client.query('DROP TRIGGER IF EXISTS trg_enforce_turbine_et9_sku ON elimfilters_catalog');
    await client.query(`
      CREATE TRIGGER trg_enforce_turbine_et9_sku
      BEFORE INSERT OR UPDATE ON elimfilters_catalog
      FOR EACH ROW EXECUTE FUNCTION enforce_turbine_et9_sku()
    `);

    const verification = await client.query(`
      SELECT sku, codigo_base, technology
      FROM elimfilters_catalog
      WHERE sku = 'EF92020'
         OR (technology = 'TURBOCORE™' AND sku !~ '^ET9')
      ORDER BY sku
    `);

    if (verification.rowCount) {
      throw new Error(`Verification failed: ${verification.rowCount} noncanonical turbine rows remain`);
    }

    await client.query('COMMIT');
    console.log('[turbine-et9] migration complete: ET9 is the exclusive turbine SKU family');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[turbine-et9]', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
