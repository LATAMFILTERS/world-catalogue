'use strict';

const {
  APPLICATION_POLICY_VERSION,
  applicationPayloadHash,
  engineApplicationsFrom,
  validateApplicationWrite,
} = require('./catalog-application-governance');

function nonEmpty(value) {
  return String(value || '').trim();
}

async function dbJsonHash(client, value) {
  const { rows } = await client.query('SELECT md5($1::jsonb::text) AS hash', [JSON.stringify(value || [])]);
  return rows[0].hash;
}

async function insertEvidence(client, {
  sku,
  kind,
  payloadHash,
  evidenceAuthority,
  sourceUrl,
  evidenceHash,
  metadata,
}) {
  await client.query(`
    INSERT INTO catalog_application_evidence (
      sku, application_kind, payload_hash, evidence_authority,
      source_url, evidence_hash, verified, verified_at, metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,true,now(),$7::jsonb)
    ON CONFLICT (sku, application_kind, payload_hash, evidence_authority)
    DO UPDATE SET
      source_url=EXCLUDED.source_url,
      evidence_hash=EXCLUDED.evidence_hash,
      verified=true,
      verified_at=now(),
      metadata=EXCLUDED.metadata
  `, [
    sku,
    kind,
    payloadHash,
    evidenceAuthority,
    sourceUrl || null,
    evidenceHash || null,
    JSON.stringify(metadata || {}),
  ]);
}

async function applyVerifiedApplications(client, params = {}) {
  if (!client || typeof client.query !== 'function') throw new Error('CATALOG_APPLICATION_GATEWAY: database client required');
  const sku = nonEmpty(params.sku);
  if (!sku) throw new Error('CATALOG_APPLICATION_GATEWAY: sku required');
  const evidence = params.evidence || {};
  const evidenceAuthority = nonEmpty(evidence.authority);
  if (!evidenceAuthority) throw new Error('CATALOG_APPLICATION_GATEWAY: evidence.authority required');

  const currentResult = await client.query(`
    SELECT sku,duty,codigo_base,equipment_applications,vehicle_applications,oem_codes,competitor_codes,enrichment_data
    FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE
  `, [sku]);
  if (currentResult.rowCount !== 1) throw new Error(`CATALOG_APPLICATION_GATEWAY: SKU not found ${sku}`);
  const current = currentResult.rows[0];

  const equipmentProvided = Object.prototype.hasOwnProperty.call(params, 'equipment_applications');
  const vehiclesProvided = Object.prototype.hasOwnProperty.call(params, 'vehicle_applications');
  if (!equipmentProvided && !vehiclesProvided) throw new Error('CATALOG_APPLICATION_GATEWAY: no application payload supplied');

  const equipment = equipmentProvided ? params.equipment_applications : (current.equipment_applications || []);
  const vehicles = vehiclesProvided ? params.vehicle_applications : (current.vehicle_applications || []);
  const candidate = { ...current, equipment_applications: equipment, vehicle_applications: vehicles };
  const shape = validateApplicationWrite(candidate, { requireEvidence: false });
  if (!shape.valid) {
    const err = new Error(`CATALOG_APPLICATION_GATEWAY_BLOCKED: ${shape.reasons.join(',')}`);
    err.validation = shape;
    throw err;
  }

  const equipmentDbHash = equipmentProvided ? await dbJsonHash(client, equipment) : null;
  const vehicleDbHash = vehiclesProvided ? await dbJsonHash(client, vehicles) : null;
  const enginesInEquipment = equipmentProvided ? engineApplicationsFrom(equipment) : [];
  const enginesInVehicle = vehiclesProvided ? engineApplicationsFrom(vehicles) : [];

  if (equipmentProvided) {
    await insertEvidence(client, {
      sku,
      kind: 'EQUIPMENT',
      payloadHash: equipmentDbHash,
      evidenceAuthority,
      sourceUrl: evidence.source_url,
      evidenceHash: evidence.evidence_hash,
      metadata: { ...evidence.metadata, normalized_payload_hash: applicationPayloadHash(equipment) },
    });
    if (enginesInEquipment.length) {
      await insertEvidence(client, {
        sku,
        kind: 'ENGINE',
        payloadHash: equipmentDbHash,
        evidenceAuthority,
        sourceUrl: evidence.source_url,
        evidenceHash: evidence.evidence_hash,
        metadata: { ...evidence.metadata, parent_kind: 'EQUIPMENT', engine_count: enginesInEquipment.length },
      });
    }
  }

  if (vehiclesProvided) {
    await insertEvidence(client, {
      sku,
      kind: 'VEHICLE',
      payloadHash: vehicleDbHash,
      evidenceAuthority,
      sourceUrl: evidence.source_url,
      evidenceHash: evidence.evidence_hash,
      metadata: { ...evidence.metadata, normalized_payload_hash: applicationPayloadHash(vehicles) },
    });
    if (enginesInVehicle.length) {
      await insertEvidence(client, {
        sku,
        kind: 'ENGINE',
        payloadHash: vehicleDbHash,
        evidenceAuthority,
        sourceUrl: evidence.source_url,
        evidenceHash: evidence.evidence_hash,
        metadata: { ...evidence.metadata, parent_kind: 'VEHICLE', engine_count: enginesInVehicle.length },
      });
    }
  }

  const oldData = current.enrichment_data && typeof current.enrichment_data === 'object' && !Array.isArray(current.enrichment_data)
    ? current.enrichment_data
    : {};
  const oldGov = oldData.application_governance && typeof oldData.application_governance === 'object' && !Array.isArray(oldData.application_governance)
    ? oldData.application_governance
    : {};
  const appGov = {
    ...oldGov,
    policy_version: APPLICATION_POLICY_VERSION,
    evidence_recorded: true,
    evidence_authority: evidenceAuthority,
    evidence_url: evidence.source_url || null,
    evidence_hash: evidence.evidence_hash || null,
    verified_at: new Date().toISOString(),
  };

  if (equipmentProvided) {
    appGov.equipment_verified = true;
    appGov.equipment_payload_hash = applicationPayloadHash(equipment);
    appGov.equipment_db_payload_hash = equipmentDbHash;
    if (enginesInEquipment.length) {
      appGov.engine_verified = true;
      appGov.engine_payload_hash = applicationPayloadHash(equipment);
      appGov.engine_db_payload_hash = equipmentDbHash;
    }
  }
  if (vehiclesProvided) {
    appGov.vehicle_verified = true;
    appGov.vehicle_payload_hash = applicationPayloadHash(vehicles);
    appGov.vehicle_db_payload_hash = vehicleDbHash;
    if (enginesInVehicle.length) {
      appGov.engine_verified = true;
      appGov.engine_payload_hash = applicationPayloadHash(vehicles);
      appGov.engine_db_payload_hash = vehicleDbHash;
    }
  }

  const nextData = { ...oldData, application_governance: appGov };
  await client.query(`
    UPDATE elimfilters_catalog
    SET equipment_applications=$1::jsonb,
        vehicle_applications=$2::jsonb,
        enrichment_data=$3::jsonb
    WHERE sku=$4
  `, [JSON.stringify(equipment), JSON.stringify(vehicles), JSON.stringify(nextData), sku]);

  return {
    sku,
    policy_version: APPLICATION_POLICY_VERSION,
    equipment_updated: equipmentProvided,
    vehicle_updated: vehiclesProvided,
    engine_relationships_verified: enginesInEquipment.length + enginesInVehicle.length,
    evidence_authority: evidenceAuthority,
  };
}

async function applyVerifiedRelationalVehicleApplications(client, params = {}) {
  if (!client || typeof client.query !== 'function') throw new Error('CATALOG_APPLICATION_GATEWAY: database client required');
  const sku = nonEmpty(params.sku);
  if (!sku) throw new Error('CATALOG_APPLICATION_GATEWAY: sku required');
  const evidence = params.evidence || {};
  const authority = nonEmpty(evidence.authority);
  const sourceUrl = nonEmpty(evidence.source_url);
  const sourceHash = nonEmpty(evidence.evidence_hash);
  if (!authority || !sourceUrl || !sourceHash) {
    throw new Error('CATALOG_APPLICATION_GATEWAY: relational application evidence authority/source_url/evidence_hash required');
  }
  const applications = Array.isArray(params.applications) ? params.applications : [];
  if (!applications.length) throw new Error('CATALOG_APPLICATION_GATEWAY: applications required');

  const catalogResult = await client.query(
    'SELECT sku,duty,codigo_base FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE',
    [sku]
  );
  if (catalogResult.rowCount !== 1) throw new Error(`CATALOG_APPLICATION_GATEWAY: SKU not found ${sku}`);
  const catalog = catalogResult.rows[0];
  const duty = String(catalog.duty || '').toUpperCase();
  const applicationKind = duty === 'HEAVY_DUTY' ? 'EQUIPMENT' : 'VEHICLE';
  const results = [];

  for (const raw of applications) {
    const make = nonEmpty(raw.make);
    const model = nonEmpty(raw.model);
    const year = Number(raw.year) || null;
    const yearFrom = Number(raw.year_from || raw.year) || null;
    const yearTo = Number(raw.year_to || raw.year) || null;
    const engine = nonEmpty(raw.engine || raw.engine_code);
    const displacement = nonEmpty(raw.engine_displacement || raw.displacement);
    if (!make || !model || !yearFrom || !yearTo) {
      throw new Error('CATALOG_APPLICATION_GATEWAY: relational application make/model/year required');
    }
    if (yearFrom > yearTo) throw new Error('CATALOG_APPLICATION_GATEWAY: year_from cannot exceed year_to');

    const governedPayload = [{
      make,
      model,
      equipment: `${make} ${model}`,
      type: nonEmpty(raw.type) || 'TRUCK',
      engine: [engine, displacement].filter(Boolean).join(' ').trim(),
      year: year ? String(year) : '',
      year_from: String(yearFrom),
      year_to: String(yearTo),
    }];
    const shapeCandidate = {
      duty,
      equipment_applications: applicationKind === 'EQUIPMENT' ? governedPayload : [],
      vehicle_applications: applicationKind === 'VEHICLE' ? governedPayload : [],
      enrichment_data: {},
    };
    const shape = validateApplicationWrite(shapeCandidate, { requireEvidence: false });
    if (!shape.valid) {
      const err = new Error(`CATALOG_APPLICATION_GATEWAY_BLOCKED: ${shape.reasons.join(',')}`);
      err.validation = shape;
      throw err;
    }

    const payloadHash = await dbJsonHash(client, governedPayload);
    const sourceSku = nonEmpty(raw.source_sku || params.source_sku);
    if (!sourceSku) throw new Error('CATALOG_APPLICATION_GATEWAY: source_sku required');

    const upsert = await client.query(`
      INSERT INTO ld_catalog.ld_vehicle_applications (
        elimfilters_sku, source_sku, make, model_family, model_type, year, engine_code,
        source_origin, market_code, platform_code, canonical_make, canonical_model,
        model_variant, year_from, year_to, engine_displacement, fuel_type, filter_position,
        evidence_status, evidence_source_url, evidence_checked_at,
        evidence_authority, evidence_source_hash, evidence_payload_hash
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        'VERIFIED',$19,now(),$20,$21,$22
      )
      ON CONFLICT (elimfilters_sku, make, model_family, model_type, year)
      DO UPDATE SET
        source_sku=EXCLUDED.source_sku,
        engine_code=EXCLUDED.engine_code,
        source_origin=EXCLUDED.source_origin,
        market_code=EXCLUDED.market_code,
        platform_code=EXCLUDED.platform_code,
        canonical_make=EXCLUDED.canonical_make,
        canonical_model=EXCLUDED.canonical_model,
        model_variant=EXCLUDED.model_variant,
        year_from=EXCLUDED.year_from,
        year_to=EXCLUDED.year_to,
        engine_displacement=EXCLUDED.engine_displacement,
        fuel_type=EXCLUDED.fuel_type,
        filter_position=EXCLUDED.filter_position,
        evidence_status='VERIFIED',
        evidence_source_url=EXCLUDED.evidence_source_url,
        evidence_checked_at=now(),
        evidence_authority=EXCLUDED.evidence_authority,
        evidence_source_hash=EXCLUDED.evidence_source_hash,
        evidence_payload_hash=EXCLUDED.evidence_payload_hash
      RETURNING id
    `, [
      sku,
      sourceSku,
      make,
      model,
      nonEmpty(raw.model_type) || `${nonEmpty(raw.platform) || ''} ${displacement} ${nonEmpty(raw.fuel_type) || ''}`.trim(),
      year ? String(year) : `${yearFrom}-${yearTo}`,
      engine,
      nonEmpty(raw.source_origin) || 'GOVERNED_APPLICATION_EVIDENCE',
      nonEmpty(raw.market) || null,
      nonEmpty(raw.platform) || null,
      make,
      model,
      nonEmpty(raw.model_variant) || null,
      yearFrom,
      yearTo,
      displacement || null,
      nonEmpty(raw.fuel_type) || null,
      nonEmpty(raw.filter_position) || null,
      sourceUrl,
      authority,
      sourceHash,
      payloadHash,
    ]);

    const applicationId = upsert.rows[0].id;
    await insertEvidence(client, {
      sku,
      kind: applicationKind,
      payloadHash,
      evidenceAuthority: authority,
      sourceUrl,
      evidenceHash: sourceHash,
      metadata: {
        ...(evidence.metadata || {}),
        relational_application_id: applicationId,
        market: nonEmpty(raw.market) || null,
        platform: nonEmpty(raw.platform) || null,
        model,
        year_from: yearFrom,
        year_to: yearTo,
        engine: engine || null,
        engine_displacement: displacement || null,
        filter_position: nonEmpty(raw.filter_position) || null,
        source_sku: sourceSku,
      },
    });
    if (engine || displacement) {
      await insertEvidence(client, {
        sku,
        kind: 'ENGINE',
        payloadHash,
        evidenceAuthority: authority,
        sourceUrl,
        evidenceHash: sourceHash,
        metadata: {
          ...(evidence.metadata || {}),
          relational_application_id: applicationId,
          parent_kind: applicationKind,
          engine: engine || null,
          engine_displacement: displacement || null,
        },
      });
    }

    results.push({
      id: applicationId,
      sku,
      make,
      model,
      year_from: yearFrom,
      year_to: yearTo,
      engine: engine || null,
      evidence_payload_hash: payloadHash,
      application_kind: applicationKind,
    });
  }

  return {
    sku,
    duty,
    application_kind: applicationKind,
    verified_applications: results.length,
    evidence_authority: authority,
    applications: results,
  };
}

module.exports = {
  dbJsonHash,
  insertEvidence,
  applyVerifiedApplications,
  applyVerifiedRelationalVehicleApplications,
};
