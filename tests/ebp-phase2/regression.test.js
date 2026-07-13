'use strict';

// EBP Phase 2 — regression tests. These guard the database-level invariants
// directly (bypassing the application layer) so a future change to
// service.js/repository.js cannot silently weaken a guarantee the schema
// itself is supposed to enforce. Skips with a clear message if the database
// is unreachable.
//
// Run: node --test tests/ebp-phase2/regression.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ebp_phase1_test';

test('EBP Phase 2 — regression guards', async (t) => {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.log(`[SKIP] EBP Phase 2 regression tests — cannot reach ${DATABASE_URL}: ${err.message}`);
    await pool.end();
    return;
  }

  t.after(async () => {
    await pool.end();
  });

  // Snapshot Phase 1 / catalog / technologies row counts up front — Phase 1's
  // own regression suite legitimately leaves rows behind (e.g. created_by =
  // 'regression-test'), so the correct check is "unchanged by this test
  // file's run", never "globally zero".
  const passportCountBefore = await pool.query('SELECT COUNT(*) FROM ebp_engineering_passports');
  const catalogCountBefore = await pool.query('SELECT COUNT(*) FROM elimfilters_catalog');
  const technologiesCountBefore = await pool.query('SELECT COUNT(*) FROM technologies');

  // manufacturer_code must match the ambiguity-free alphabet (no 0/1/I/O —
  // ADR-0015), so raw timestamp digits can't be used directly for test
  // codes. Map a numeric counter into that same 32-char alphabet instead.
  const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let codeCounter = Date.now() % 1000000;
  function nextTestSuffix() {
    codeCounter += 1;
    let n = codeCounter;
    let out = '';
    for (let i = 0; i < 3; i += 1) {
      out = CODE_ALPHABET[n % CODE_ALPHABET.length] + out;
      n = Math.floor(n / CODE_ALPHABET.length);
    }
    return out;
  }
  const suffix = Date.now().toString().slice(-8);

  async function insertManufacturer(code, overrides = {}) {
    const { rows } = await pool.query(
      `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, created_by)
       VALUES ($1, $2, $3, $4, 'regression-test')
       RETURNING *`,
      [code, overrides.legal_name || `Regression Mfr ${suffix}`, overrides.country_code || 'CN', overrides.timezone || 'Asia/Shanghai']
    );
    return rows[0];
  }

  // ── manufacturer_code: case-insensitive uniqueness, format, immutability ──

  await t.test('REGRESSION: manufacturer_code is UNIQUE — a duplicate code is rejected at the DB level', async () => {
    const code = `EFM-R${nextTestSuffix()}`;
    await insertManufacturer(code);
    await assert.rejects(
      () => insertManufacturer(code, { legal_name: 'Duplicate Attempt' }),
      (err) => {
        assert.equal(err.code, '23505'); // unique_violation
        return true;
      }
    );
  });

  await t.test('REGRESSION: manufacturer_code rejects a lowercase variant — the CHECK constraint enforces canonical case (ADR-0015)', async () => {
    await assert.rejects(
      () => insertManufacturer(`efm-r${nextTestSuffix()}`, { legal_name: 'Lowercase Attempt' }),
      (err) => {
        assert.equal(err.code, '23514'); // check_violation
        return true;
      }
    );
  });

  await t.test('REGRESSION: manufacturer_code rejects ambiguous characters 0/1/I/O outside the alphabet', async () => {
    await assert.rejects(
      () => insertManufacturer('EFM-A0B1', { legal_name: 'Ambiguous Chars' }),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  await t.test('REGRESSION: manufacturer_code rejects the wrong length/format entirely', async () => {
    await assert.rejects(
      () => insertManufacturer('EFM-AB', { legal_name: 'Too Short' }),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  await t.test('REGRESSION: manufacturer_code is immutable — an UPDATE attempt is rejected by the trigger, even via direct SQL', async () => {
    const code = `EFM-B${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    await assert.rejects(
      () => pool.query('UPDATE ebp_manufacturers SET manufacturer_code = $1 WHERE id = $2', [`EFM-Z${nextTestSuffix()}`, mfr.id]),
      (err) => {
        assert.match(err.message, /manufacturer_code is immutable/);
        return true;
      }
    );
  });

  await t.test('REGRESSION: updating other columns on the same row still succeeds (trigger only blocks manufacturer_code changes)', async () => {
    const code = `EFM-U${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows } = await pool.query('UPDATE ebp_manufacturers SET legal_name = $1 WHERE id = $2 RETURNING legal_name', ['Renamed Legally', mfr.id]);
    assert.equal(rows[0].legal_name, 'Renamed Legally');
  });

  // ── country_code format ─────────────────────────────────────────────────

  await t.test('REGRESSION: country_code rejects a lowercase or non-2-letter value', async () => {
    await assert.rejects(
      () => insertManufacturer(`EFM-C${nextTestSuffix()}`, { country_code: 'cn' }),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  // ── status CHECK + default ──────────────────────────────────────────────

  await t.test('REGRESSION: ebp_manufacturers rejects a status value outside the six-state enum', async () => {
    const code = `EFM-S${nextTestSuffix()}`;
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_manufacturers (manufacturer_code, legal_name, country_code, timezone, status, created_by)
           VALUES ($1, 'Bad Status', 'CN', 'Asia/Shanghai', 'APPROVED', 'regression-test')`,
          [code]
        ),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  await t.test('REGRESSION: a newly inserted manufacturer defaults to CANDIDATE, never a further-along status', async () => {
    const code = `EFM-D${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    assert.equal(mfr.status, 'CANDIDATE');
  });

  // ── contacts: at most one active primary (partial unique index) ────────

  await t.test('REGRESSION: the DB rejects a second active primary contact, even via direct SQL', async () => {
    const code = `EFM-P${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    await pool.query(
      `INSERT INTO ebp_manufacturer_contacts (manufacturer_id, full_name, email, is_primary, is_active)
       VALUES ($1, 'First Primary', 'first@example.com', TRUE, TRUE)`,
      [mfr.id]
    );
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_manufacturer_contacts (manufacturer_id, full_name, email, is_primary, is_active)
           VALUES ($1, 'Second Primary', 'second@example.com', TRUE, TRUE)`,
          [mfr.id]
        ),
      (err) => {
        assert.equal(err.code, '23505');
        assert.match(err.message, /uq_ebp_mfr_contacts_one_active_primary/);
        return true;
      }
    );
  });

  await t.test('REGRESSION: an inactive primary does not block a new active primary (partial index only constrains is_primary AND is_active)', async () => {
    const code = `EFM-Q${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    await pool.query(
      `INSERT INTO ebp_manufacturer_contacts (manufacturer_id, full_name, email, is_primary, is_active)
       VALUES ($1, 'Old Primary', 'old@example.com', TRUE, FALSE)`,
      [mfr.id]
    );
    const { rows } = await pool.query(
      `INSERT INTO ebp_manufacturer_contacts (manufacturer_id, full_name, email, is_primary, is_active)
       VALUES ($1, 'New Primary', 'new@example.com', TRUE, TRUE) RETURNING id`,
      [mfr.id]
    );
    assert.ok(rows[0].id);
  });

  await t.test('REGRESSION: contact email format is CHECKed at the DB level', async () => {
    const code = `EFM-E${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    await assert.rejects(
      () => pool.query(`INSERT INTO ebp_manufacturer_contacts (manufacturer_id, full_name, email) VALUES ($1, 'Bad Email', 'not-an-email')`, [mfr.id]),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  // ── locations: composite FK guarantees ──────────────────────────────────

  await t.test('REGRESSION: the composite FK rejects a certification location_id that belongs to a different manufacturer', async () => {
    const codeA = `EFM-L${nextTestSuffix()}`;
    const codeB = `EFM-M${nextTestSuffix()}`;
    const mfrA = await insertManufacturer(codeA);
    const mfrB = await insertManufacturer(codeB);
    const { rows: locRows } = await pool.query(
      `INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone)
       VALUES ($1, 'FACTORY', 'CN', 'Asia/Shanghai') RETURNING id`,
      [mfrA.id]
    );
    const locationOfA = locRows[0].id;

    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_manufacturer_certifications (manufacturer_id, location_id, certification_code, issuing_body, issued_on)
           VALUES ($1, $2, 'ISO9001', 'TUV', CURRENT_DATE)`,
          [mfrB.id, locationOfA]
        ),
      (err) => {
        assert.equal(err.code, '23503'); // foreign_key_violation
        return true;
      },
      'expected the composite FK (location_id, manufacturer_id) to reject a location belonging to a different manufacturer'
    );
  });

  await t.test('REGRESSION: cascade delete of a manufacturer removes its locations, contacts, certifications, capabilities, qualifications (no orphans)', async () => {
    const code = `EFM-X${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows: locRows } = await pool.query(
      `INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone) VALUES ($1, 'FACTORY', 'CN', 'Asia/Shanghai') RETURNING id`,
      [mfr.id]
    );
    const locationId = locRows[0].id;
    await pool.query(`INSERT INTO ebp_manufacturer_contacts (manufacturer_id, full_name, email) VALUES ($1, 'Contact', 'contact@example.com')`, [mfr.id]);
    await pool.query(
      `INSERT INTO ebp_manufacturer_certifications (manufacturer_id, location_id, certification_code, issuing_body, issued_on) VALUES ($1, $2, 'ISO9001', 'TUV', CURRENT_DATE)`,
      [mfr.id, locationId]
    );
    await pool.query(
      `INSERT INTO ebp_manufacturer_capabilities (manufacturer_id, location_id, capability_type, capability_value) VALUES ($1, $2, 'LAB', '{"has_lab": true}')`,
      [mfr.id, locationId]
    );
    const { rows: qualRows } = await pool.query(
      `INSERT INTO ebp_manufacturer_qualifications (manufacturer_id, location_id, product_category, product_subtype) VALUES ($1, $2, 'OIL', 'SPIN_ON') RETURNING id`,
      [mfr.id, locationId]
    );
    await pool.query(
      `INSERT INTO ebp_manufacturer_qualification_conditions (qualification_id, condition_type, parameters) VALUES ($1, 'MAX_HEIGHT_MM', '{"max_mm": 200}')`,
      [qualRows[0].id]
    );

    await pool.query('DELETE FROM ebp_manufacturers WHERE id = $1', [mfr.id]);

    const checks = await Promise.all([
      pool.query('SELECT 1 FROM ebp_manufacturer_locations WHERE manufacturer_id = $1', [mfr.id]),
      pool.query('SELECT 1 FROM ebp_manufacturer_contacts WHERE manufacturer_id = $1', [mfr.id]),
      pool.query('SELECT 1 FROM ebp_manufacturer_certifications WHERE manufacturer_id = $1', [mfr.id]),
      pool.query('SELECT 1 FROM ebp_manufacturer_capabilities WHERE manufacturer_id = $1', [mfr.id]),
      pool.query('SELECT 1 FROM ebp_manufacturer_qualifications WHERE manufacturer_id = $1', [mfr.id]),
      pool.query('SELECT 1 FROM ebp_manufacturer_qualification_conditions WHERE qualification_id = $1', [qualRows[0].id]),
    ]);
    checks.forEach((r) => assert.equal(r.rows.length, 0));
  });

  // ── certifications: status CHECK + effective-status view (ADR-0019) ────

  await t.test('REGRESSION: ebp_manufacturer_certifications rejects a status value outside the five-state enum', async () => {
    const code = `EFM-F${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_manufacturer_certifications (manufacturer_id, certification_code, issuing_body, issued_on, status)
           VALUES ($1, 'ISO9001', 'TUV', CURRENT_DATE, 'PROBABLY_FINE')`,
          [mfr.id]
        ),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  await t.test('REGRESSION: the effective-status view reports EXPIRED for a VERIFIED cert whose expires_on has passed', async () => {
    const code = `EFM-G${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows } = await pool.query(
      `INSERT INTO ebp_manufacturer_certifications (manufacturer_id, certification_code, issuing_body, issued_on, expires_on, status)
       VALUES ($1, 'ISO9001', 'TUV', '2015-01-01', '2016-01-01', 'VERIFIED') RETURNING id`,
      [mfr.id]
    );
    const { rows: viewRows } = await pool.query('SELECT status, effective_status FROM ebp_manufacturer_certifications_effective WHERE id = $1', [rows[0].id]);
    assert.equal(viewRows[0].status, 'VERIFIED');
    assert.equal(viewRows[0].effective_status, 'EXPIRED');
  });

  await t.test('REGRESSION: the effective-status view leaves a non-expired VERIFIED cert as VERIFIED', async () => {
    const code = `EFM-H${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows } = await pool.query(
      `INSERT INTO ebp_manufacturer_certifications (manufacturer_id, certification_code, issuing_body, issued_on, expires_on, status)
       VALUES ($1, 'ISO9001', 'TUV', '2024-01-01', '2099-01-01', 'VERIFIED') RETURNING id`,
      [mfr.id]
    );
    const { rows: viewRows } = await pool.query('SELECT effective_status FROM ebp_manufacturer_certifications_effective WHERE id = $1', [rows[0].id]);
    assert.equal(viewRows[0].effective_status, 'VERIFIED');
  });

  await t.test('REGRESSION: the effective-status view never reclassifies a non-VERIFIED status (e.g. REJECTED stays REJECTED regardless of expiry)', async () => {
    const code = `EFM-J${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows } = await pool.query(
      `INSERT INTO ebp_manufacturer_certifications (manufacturer_id, certification_code, issuing_body, issued_on, expires_on, status)
       VALUES ($1, 'ISO9001', 'TUV', '2015-01-01', '2016-01-01', 'REJECTED') RETURNING id`,
      [mfr.id]
    );
    const { rows: viewRows } = await pool.query('SELECT effective_status FROM ebp_manufacturer_certifications_effective WHERE id = $1', [rows[0].id]);
    assert.equal(viewRows[0].effective_status, 'REJECTED');
  });

  // ── qualifications: status CHECK, condition_type CHECK ──────────────────

  await t.test('REGRESSION: ebp_manufacturer_qualifications rejects a status value outside the five-state enum', async () => {
    const code = `EFM-K${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows: locRows } = await pool.query(
      `INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone) VALUES ($1, 'FACTORY', 'CN', 'Asia/Shanghai') RETURNING id`,
      [mfr.id]
    );
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_manufacturer_qualifications (manufacturer_id, location_id, product_category, product_subtype, status)
           VALUES ($1, $2, 'OIL', 'SPIN_ON', 'APPROVED_FOREVER')`,
          [mfr.id, locRows[0].id]
        ),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  await t.test('REGRESSION: ebp_manufacturer_qualification_conditions rejects a condition_type outside the fixed enum (ADR-0017)', async () => {
    const code = `EFM-N${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows: locRows } = await pool.query(
      `INSERT INTO ebp_manufacturer_locations (manufacturer_id, location_type, country_code, timezone) VALUES ($1, 'FACTORY', 'CN', 'Asia/Shanghai') RETURNING id`,
      [mfr.id]
    );
    const { rows: qualRows } = await pool.query(
      `INSERT INTO ebp_manufacturer_qualifications (manufacturer_id, location_id, product_category, product_subtype) VALUES ($1, $2, 'OIL', 'SPIN_ON') RETURNING id`,
      [mfr.id, locRows[0].id]
    );
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_manufacturer_qualification_conditions (qualification_id, condition_type, parameters)
           VALUES ($1, 'FREE_TEXT_CONDITION', '{"anything": true}')`,
          [qualRows[0].id]
        ),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  // ── capabilities: capability_type CHECK, review_status CHECK ────────────

  await t.test('REGRESSION: ebp_manufacturer_capabilities rejects a capability_type outside the fixed enum', async () => {
    const code = `EFM-V${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    await assert.rejects(
      () =>
        pool.query(
          `INSERT INTO ebp_manufacturer_capabilities (manufacturer_id, capability_type, capability_value)
           VALUES ($1, 'TELEPORTATION', '{}')`,
          [mfr.id]
        ),
      (err) => {
        assert.equal(err.code, '23514');
        return true;
      }
    );
  });

  await t.test('REGRESSION: a newly declared capability defaults to DECLARED, never VERIFIED', async () => {
    const code = `EFM-W${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    const { rows } = await pool.query(
      `INSERT INTO ebp_manufacturer_capabilities (manufacturer_id, capability_type, capability_value)
       VALUES ($1, 'LANGUAGE', '{"languages": ["en", "zh"]}') RETURNING review_status`,
      [mfr.id]
    );
    assert.equal(rows[0].review_status, 'DECLARED');
  });

  // ── status history: append-only, never mutated ──────────────────────────

  await t.test('REGRESSION: status history rows are never updated by anything other than a fresh INSERT — each transition is a new row', async () => {
    const code = `EFM-Y${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    await pool.query(
      `INSERT INTO ebp_manufacturers_status_history (manufacturer_id, from_status, to_status, declared_actor) VALUES ($1, 'CANDIDATE', 'UNDER_REVIEW', 'regression-test')`,
      [mfr.id]
    );
    await pool.query(
      `INSERT INTO ebp_manufacturers_status_history (manufacturer_id, from_status, to_status, declared_actor) VALUES ($1, 'UNDER_REVIEW', 'QUALIFIED', 'regression-test')`,
      [mfr.id]
    );
    const { rows } = await pool.query('SELECT from_status, to_status FROM ebp_manufacturers_status_history WHERE manufacturer_id = $1 ORDER BY changed_at ASC', [mfr.id]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].to_status, 'UNDER_REVIEW');
    assert.equal(rows[1].to_status, 'QUALIFIED');
  });

  await t.test('REGRESSION: identity_mechanism defaults to ADMIN_KEY_SHARED on ebp_manufacturers and ebp_manufacturers_status_history when not supplied', async () => {
    const code = `EFM-T${nextTestSuffix()}`;
    const mfr = await insertManufacturer(code);
    assert.equal(mfr.identity_mechanism, 'ADMIN_KEY_SHARED');

    const { rows } = await pool.query(
      `INSERT INTO ebp_manufacturers_status_history (manufacturer_id, to_status, declared_actor) VALUES ($1, 'CANDIDATE', 'regression-test') RETURNING identity_mechanism`,
      [mfr.id]
    );
    assert.equal(rows[0].identity_mechanism, 'ADMIN_KEY_SHARED');
  });

  // ── Phase 1 / catalog / technologies remain untouched by Phase 2 activity ──

  await t.test('REGRESSION: none of the above Phase 2 activity changed ebp_engineering_passports, elimfilters_catalog, or technologies row counts', async () => {
    const passportCountAfter = await pool.query('SELECT COUNT(*) FROM ebp_engineering_passports');
    const catalogCountAfter = await pool.query('SELECT COUNT(*) FROM elimfilters_catalog');
    const technologiesCountAfter = await pool.query('SELECT COUNT(*) FROM technologies');
    assert.equal(passportCountAfter.rows[0].count, passportCountBefore.rows[0].count);
    assert.equal(catalogCountAfter.rows[0].count, catalogCountBefore.rows[0].count);
    assert.equal(technologiesCountAfter.rows[0].count, technologiesCountBefore.rows[0].count);
  });
});
