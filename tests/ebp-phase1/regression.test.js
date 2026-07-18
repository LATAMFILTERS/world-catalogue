'use strict';

// EBP Phase 1 — regression tests. These guard the database-level invariants
// directly (bypassing the application layer) so a future change to
// service.js/repository.js cannot silently weaken a guarantee the schema
// itself is supposed to enforce. Skips with a clear message if the database
// is unreachable.
//
// Run: node --test tests/ebp-phase1/regression.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';

test('EBP Phase 1 — regression guards', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 1 regression tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  t.after(async () => {
    await pool.end();
  });

  const suffix = Date.now().toString().slice(-8);
  const sku = `ELREG${suffix}`;

  async function insertPassport(revision, status) {
    const { rows } = await pool.query(
      `INSERT INTO ebp_engineering_passports
        (elimfilters_code, is_pre_sku_draft, product_category, product_subtype, duty, engineering_revision, status, created_by)
       VALUES ($1, TRUE, 'OIL', 'SPIN_ON', 'HEAVY_DUTY', $2, $3, 'regression-test')
       RETURNING id`,
      [sku, revision, status]
    );
    return rows[0].id;
  }

  await t.test('REGRESSION: the DB rejects a second ACTIVE passport row for the same SKU, even via direct SQL', async () => {
    await insertPassport(1, 'ACTIVE');
    await assert.rejects(
      () => insertPassport(2, 'ACTIVE'),
      (err) => {
        assert.equal(err.code, '23505'); // unique_violation
        assert.match(err.message, /uq_ebp_passports_one_active/);
        return true;
      },
      'expected the partial unique index to reject a second ACTIVE row, independent of application code'
    );
  });

  await t.test('REGRESSION: the DB rejects a duplicate (elimfilters_code, engineering_revision) pair', async () => {
    await assert.rejects(
      () => insertPassport(1, 'DRAFT'), // revision 1 already exists (ACTIVE) from the prior test
      (err) => {
        assert.equal(err.code, '23505');
        return true;
      },
      'expected the UNIQUE (elimfilters_code, engineering_revision) constraint to reject a duplicate revision number'
    );
  });

  await t.test('REGRESSION: a SUPERSEDED row does not block a new ACTIVE row (only ACTIVE is exclusive)', async () => {
    // Move the existing ACTIVE (revision 1) to SUPERSEDED, then a new
    // ACTIVE for revision 3 must succeed — proves the partial index only
    // constrains status = 'ACTIVE', not the SKU as a whole.
    await pool.query(`UPDATE ebp_engineering_passports SET status = 'SUPERSEDED' WHERE elimfilters_code = $1 AND engineering_revision = 1`, [sku]);
    const id3 = await insertPassport(3, 'ACTIVE');
    assert.ok(id3);
  });

  await t.test('REGRESSION: ebp_field_applicability_matrix rejects an applicability value outside REQUIRED/NOT_APPLICABLE', async () => {
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_field_applicability_matrix (product_category, product_subtype, field_name, applicability)
           VALUES ('REGRESSION_TEST_CATEGORY', 'REGRESSION_TEST_SUBTYPE', 'bypass_valve_applicability', 'SOMETIMES')`
        ),
      (err) => {
        assert.equal(err.code, '23514'); // check_violation
        return true;
      }
    );
  });

  await t.test('REGRESSION: ebp_passport_packaging rejects a non-positive elimfilters_target_quantity at the DB level', async () => {
    const passportId = await insertPassport(4, 'DRAFT');
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_passport_packaging (passport_id, packaging_class, individual_box_required, elimfilters_target_quantity)
           VALUES ($1, 'AUTOMOTIVE', TRUE, 0)`,
          [passportId]
        ),
      (err) => {
        assert.equal(err.code, '23514'); // check_violation
        return true;
      },
      'expected the CHECK (elimfilters_target_quantity > 0) constraint to reject a zero quantity'
    );
  });

  await t.test('REGRESSION: deleting a passport cascades to its engineering/packaging/history rows (no orphans)', async () => {
    const passportId = await insertPassport(5, 'DRAFT');
    await pool.query(
      `INSERT INTO ebp_passport_engineering (passport_id) VALUES ($1)`,
      [passportId]
    );
    await pool.query(
      `INSERT INTO ebp_passport_packaging (passport_id, packaging_class, individual_box_required, elimfilters_target_quantity)
       VALUES ($1, 'AUTOMOTIVE', TRUE, 1)`,
      [passportId]
    );
    await pool.query(
      `INSERT INTO ebp_passport_status_history (passport_id, to_status, changed_by) VALUES ($1, 'DRAFT', 'regression-test')`,
      [passportId]
    );

    await pool.query('DELETE FROM ebp_engineering_passports WHERE id = $1', [passportId]);

    const { rows: engRows } = await pool.query('SELECT 1 FROM ebp_passport_engineering WHERE passport_id = $1', [passportId]);
    const { rows: pkgRows } = await pool.query('SELECT 1 FROM ebp_passport_packaging WHERE passport_id = $1', [passportId]);
    const { rows: histRows } = await pool.query('SELECT 1 FROM ebp_passport_status_history WHERE passport_id = $1', [passportId]);
    assert.equal(engRows.length, 0);
    assert.equal(pkgRows.length, 0);
    assert.equal(histRows.length, 0);
  });

  await t.test('REGRESSION: identity_mechanism defaults to ADMIN_KEY_SHARED on both ebp_engineering_passports and ebp_passport_status_history when not supplied', async () => {
    const passportId = await insertPassport(6, 'DRAFT');
    const { rows: passportRows } = await pool.query(
      'SELECT identity_mechanism, created_by FROM ebp_engineering_passports WHERE id = $1',
      [passportId]
    );
    assert.equal(passportRows[0].identity_mechanism, 'ADMIN_KEY_SHARED');
    assert.equal(passportRows[0].created_by, 'regression-test');

    await pool.query(
      `INSERT INTO ebp_passport_status_history (passport_id, to_status, changed_by) VALUES ($1, 'DRAFT', 'regression-test')`,
      [passportId]
    );
    const { rows: historyRows } = await pool.query(
      'SELECT identity_mechanism FROM ebp_passport_status_history WHERE passport_id = $1',
      [passportId]
    );
    assert.equal(historyRows[0].identity_mechanism, 'ADMIN_KEY_SHARED');
  });

  await t.test('REGRESSION: ebp_field_applicability_matrix rejects an approval_status value outside the two ADR-0014 states', async () => {
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_field_applicability_matrix (product_category, product_subtype, field_name, applicability, approval_status)
           VALUES ('REGRESSION_TEST_CATEGORY_2', 'REGRESSION_TEST_SUBTYPE_2', 'bypass_valve_applicability', 'REQUIRED', 'RUBBER_STAMPED')`
        ),
      (err) => {
        assert.equal(err.code, '23514'); // check_violation
        return true;
      }
    );
  });

  await t.test('REGRESSION: a newly seeded applicability row defaults to PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL, never silently ENGINEERING_APPROVED', async () => {
    const { rows } = await pool.query(
      `INSERT INTO ebp_field_applicability_matrix (product_category, product_subtype, field_name, applicability)
       VALUES ($1, $2, 'bypass_valve_applicability', 'REQUIRED')
       RETURNING approval_status`,
      [`REGRESSION_TEST_CATEGORY_3_${suffix}`, `REGRESSION_TEST_SUBTYPE_3_${suffix}`]
    );
    assert.equal(rows[0].approval_status, 'PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL');
  });

  await t.test('REGRESSION: field_applicability_source defaults to an empty object, never null, on ebp_passport_engineering', async () => {
    const passportId = await insertPassport(7, 'DRAFT');
    const { rows } = await pool.query(
      `INSERT INTO ebp_passport_engineering (passport_id) VALUES ($1) RETURNING field_applicability_source`,
      [passportId]
    );
    assert.deepEqual(rows[0].field_applicability_source, {});
  });
});
