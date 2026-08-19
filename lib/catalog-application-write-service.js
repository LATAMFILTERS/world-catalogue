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

module.exports = {
  dbJsonHash,
  insertEvidence,
  applyVerifiedApplications,
};
