'use strict';

// EBP Phase 1 — orchestration layer: validation + repository + the
// create/revise/activate/retire lifecycle, per
// docs/ebp/phases/phase-01-product-engineering-passport.md.

const validation = require('./validation');
const repository = require('./repository');

class ValidationError extends Error {
  constructor(errors) {
    super(`Validation failed: ${errors.join('; ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

async function validateAndResolve(pool, payload) {
  const idErrors = validation.validateLockedIdentification(payload);
  if (idErrors.length) throw new ValidationError(idErrors);

  if (!payload.is_pre_sku_draft) {
    const exists = await repository.skuExistsInCatalog(pool, payload.elimfilters_code);
    if (!exists) {
      throw new ValidationError([
        `elimfilters_code ${payload.elimfilters_code} does not exist in elimfilters_catalog ` +
          'and is_pre_sku_draft is not true',
      ]);
    }
  }

  const matrixRows = await repository.fetchApplicabilityMatrix(pool, payload.product_category, payload.product_subtype);
  const engineeringPayload = payload.engineering || {};
  const resolvedApplicability = validation.resolveFieldApplicability(
    matrixRows,
    engineeringPayload.field_applicability || {}
  );

  const engErrors = validation.validateEngineering(engineeringPayload, resolvedApplicability);
  if (engErrors.length) throw new ValidationError(engErrors);

  const packagingPayload = validation.applyPackagingDefaults(payload.packaging || {});
  const pkgErrors = validation.validatePackaging(packagingPayload);
  if (pkgErrors.length) throw new ValidationError(pkgErrors);

  return { resolvedApplicability, engineeringPayload, packagingPayload };
}

async function insertEngineeringAndPackaging(client, passportId, resolvedApplicability, engineeringPayload, packagingPayload) {
  await client.query(
    `INSERT INTO ebp_passport_engineering
      (passport_id, dimensions_tolerances, thread_spec, required_media, required_media_composition,
       minimum_efficiency, efficiency_particle_size_basis, beta_ratio, micron_rating, required_adhesive,
       operating_temp_min_c, operating_temp_max_c, collapse_pressure_kpa, burst_pressure_kpa,
       gasket_material, center_tube_spec, end_caps_spec,
       bypass_valve_applicability, bypass_opening_pressure_kpa, bypass_pressure_tolerance_pct,
       bypass_valve_type, bypass_valve_material,
       antidrainback_valve_applicability, antidrainback_valve_material,
       required_test_standards, field_applicability,
       manufacturer_instruction_notes, internal_engineering_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)`,
    [
      passportId,
      JSON.stringify(engineeringPayload.dimensions_tolerances || {}),
      engineeringPayload.thread_spec || null,
      engineeringPayload.required_media || null,
      engineeringPayload.required_media_composition || null,
      engineeringPayload.minimum_efficiency ?? null,
      engineeringPayload.efficiency_particle_size_basis || null,
      engineeringPayload.beta_ratio || null,
      engineeringPayload.micron_rating ?? null,
      engineeringPayload.required_adhesive || null,
      engineeringPayload.operating_temp_min_c ?? null,
      engineeringPayload.operating_temp_max_c ?? null,
      engineeringPayload.collapse_pressure_kpa ?? null,
      engineeringPayload.burst_pressure_kpa ?? null,
      engineeringPayload.gasket_material || null,
      engineeringPayload.center_tube_spec || null,
      engineeringPayload.end_caps_spec || null,
      resolvedApplicability.bypass_valve_applicability || 'NOT_APPLICABLE',
      engineeringPayload.bypass_opening_pressure_kpa ?? null,
      engineeringPayload.bypass_pressure_tolerance_pct ?? null,
      engineeringPayload.bypass_valve_type || null,
      engineeringPayload.bypass_valve_material || null,
      resolvedApplicability.antidrainback_valve_applicability || 'NOT_APPLICABLE',
      engineeringPayload.antidrainback_valve_material || null,
      JSON.stringify(engineeringPayload.required_test_standards || []),
      JSON.stringify(resolvedApplicability),
      engineeringPayload.manufacturer_instruction_notes || null,
      engineeringPayload.internal_engineering_notes || null,
    ]
  );

  await client.query(
    `INSERT INTO ebp_passport_packaging
      (passport_id, packaging_class, individual_box_required, protective_bag_required, separator_required,
       master_carton_required, elimfilters_target_quantity, target_dimensions, packaging_instructions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      passportId,
      packagingPayload.packaging_class,
      !!packagingPayload.individual_box_required,
      !!packagingPayload.protective_bag_required,
      !!packagingPayload.separator_required,
      !!packagingPayload.master_carton_required,
      packagingPayload.elimfilters_target_quantity,
      packagingPayload.target_dimensions ? JSON.stringify(packagingPayload.target_dimensions) : null,
      packagingPayload.packaging_instructions || null,
    ]
  );
}

async function createPassport(pool, payload, actor) {
  const { resolvedApplicability, engineeringPayload, packagingPayload } = await validateAndResolve(pool, payload);

  const existing = await repository.fetchLatestRevision(pool, payload.elimfilters_code);
  if (existing) {
    throw new ConflictError(
      `a Passport already exists for ${payload.elimfilters_code} (revision ${existing.engineering_revision}) — use the revisions endpoint to add a new revision`
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insert = await client.query(
      `INSERT INTO ebp_engineering_passports
        (elimfilters_code, is_pre_sku_draft, base_code, base_brand, product_category, product_subtype,
         duty, technology_code, engineering_revision, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,'DRAFT',$9)
       RETURNING id`,
      [
        payload.elimfilters_code,
        !!payload.is_pre_sku_draft,
        payload.base_code || null,
        payload.base_brand || null,
        payload.product_category,
        payload.product_subtype,
        payload.duty,
        payload.technology_code || null,
        actor,
      ]
    );
    const passportId = insert.rows[0].id;
    await insertEngineeringAndPackaging(client, passportId, resolvedApplicability, engineeringPayload, packagingPayload);
    await repository.insertStatusHistory(client, passportId, null, 'DRAFT', actor, 'created');
    await client.query('COMMIT');
    return passportId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function createRevision(pool, sku, payload, actor) {
  const latest = await repository.fetchLatestRevision(pool, sku);
  if (!latest) throw new NotFoundError(`no existing Passport for ${sku}`);

  const mergedPayload = { ...payload, elimfilters_code: sku };
  const { resolvedApplicability, engineeringPayload, packagingPayload } = await validateAndResolve(pool, mergedPayload);

  const activeRow = latest.status === 'ACTIVE' ? latest : await repository.fetchActivePassport(pool, sku);
  const nextRevision = latest.engineering_revision + 1;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insert = await client.query(
      `INSERT INTO ebp_engineering_passports
        (elimfilters_code, is_pre_sku_draft, base_code, base_brand, product_category, product_subtype,
         duty, technology_code, engineering_revision, status, supersedes_passport_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'DRAFT',$10,$11)
       RETURNING id`,
      [
        sku,
        !!mergedPayload.is_pre_sku_draft,
        mergedPayload.base_code || null,
        mergedPayload.base_brand || null,
        mergedPayload.product_category,
        mergedPayload.product_subtype,
        mergedPayload.duty,
        mergedPayload.technology_code || null,
        nextRevision,
        activeRow ? activeRow.id : null,
        actor,
      ]
    );
    const passportId = insert.rows[0].id;
    await insertEngineeringAndPackaging(client, passportId, resolvedApplicability, engineeringPayload, packagingPayload);
    await repository.insertStatusHistory(client, passportId, null, 'DRAFT', actor, 'new revision created');
    await client.query('COMMIT');
    return passportId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Atomically moves `passportId` DRAFT -> ACTIVE, and (in the same
// transaction) the prior ACTIVE revision for the same SKU, if any, to
// SUPERSEDED. Uses row locks (FOR UPDATE) so a concurrent activation can't
// produce a window with zero or two ACTIVE revisions for the same SKU.
async function activatePassport(pool, passportId, actor) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM ebp_engineering_passports WHERE id = $1 FOR UPDATE', [
      passportId,
    ]);
    const passport = rows[0];
    if (!passport) throw new NotFoundError(`Passport ${passportId} not found`);
    if (passport.status !== 'DRAFT') {
      throw new ConflictError(`Passport ${passportId} is ${passport.status}; only DRAFT can be activated`);
    }

    const { rows: activeRows } = await client.query(
      `SELECT id FROM ebp_engineering_passports WHERE elimfilters_code = $1 AND status = 'ACTIVE' FOR UPDATE`,
      [passport.elimfilters_code]
    );
    if (activeRows[0]) {
      await client.query(
        `UPDATE ebp_engineering_passports SET status = 'SUPERSEDED', superseded_at = NOW() WHERE id = $1`,
        [activeRows[0].id]
      );
      await repository.insertStatusHistory(client, activeRows[0].id, 'ACTIVE', 'SUPERSEDED', actor, `superseded by ${passportId}`);
    }

    await client.query(`UPDATE ebp_engineering_passports SET status = 'ACTIVE', activated_at = NOW() WHERE id = $1`, [
      passportId,
    ]);
    await repository.insertStatusHistory(client, passportId, 'DRAFT', 'ACTIVE', actor, 'activated');
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function retirePassport(pool, passportId, actor, reason) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM ebp_engineering_passports WHERE id = $1 FOR UPDATE', [
      passportId,
    ]);
    const passport = rows[0];
    if (!passport) throw new NotFoundError(`Passport ${passportId} not found`);
    if (!['ACTIVE', 'SUPERSEDED'].includes(passport.status)) {
      throw new ConflictError(`Passport ${passportId} is ${passport.status}; only ACTIVE or SUPERSEDED can be retired`);
    }
    await client.query(`UPDATE ebp_engineering_passports SET status = 'RETIRED' WHERE id = $1`, [passportId]);
    await repository.insertStatusHistory(client, passportId, passport.status, 'RETIRED', actor, reason || null);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  ValidationError,
  NotFoundError,
  ConflictError,
  createPassport,
  createRevision,
  activatePassport,
  retirePassport,
};
