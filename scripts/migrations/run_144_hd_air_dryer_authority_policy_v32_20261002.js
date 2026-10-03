'use strict';

require('dotenv').config();
const { Client } = require('pg');

const POLICY_VERSION = '2026-10-02-v3.2';
const FLEETGUARD_URL = 'https://www.fleetguard.com/product/AD27754';

const FUNCTION_SQL = String.raw`
CREATE OR REPLACE FUNCTION public.enforce_elimfilters_codigo_base_policy()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  duty_text text := upper(coalesce(NEW.duty, ''));
  base_norm text := upper(regexp_replace(coalesce(NEW.codigo_base, ''), '[^A-Z0-9]', '', 'g'));
  gov jsonb := coalesce(NEW.enrichment_data->'codigo_base_governance', '{}'::jsonb);
  approved_code text := coalesce(gov->>'approved_codigo_base', '');
  approved_code_norm text := upper(regexp_replace(approved_code, '[^A-Z0-9]', '', 'g'));
  approved_manufacturer text := upper(regexp_replace(coalesce(gov->>'approved_manufacturer', ''), '[^A-Z0-9]', '', 'g'));
  approved_source text := upper(coalesce(gov->>'approved_source_column', ''));
  origin_group_value text := upper(coalesce(gov->>'origin_group', ''));
  status_text text := upper(coalesce(NEW.canonical_source_status, ''));
  filter_type_text text := lower(coalesce(NEW.filter_type, ''));
  technology_norm text := upper(regexp_replace(coalesce(NEW.technology, ''), '[^A-Z0-9]', '', 'g'));
  expected_ld_brand text;
  code_digits text;
  sku_digits text;
  expected_suffix text;
BEGIN
  IF (filter_type_text = 'air_dryer' OR technology_norm = 'DRYCORE')
     AND duty_text <> 'HEAVY_DUTY' THEN
    RAISE EXCEPTION 'CATALOG_POLICY_V32: air dryer / DRYCORE SKU % must be HEAVY_DUTY', NEW.sku;
  END IF;

  IF status_text <> 'VERIFIED' THEN
    RETURN NEW;
  END IF;

  IF base_norm = '' THEN
    RAISE EXCEPTION 'CATALOG_POLICY_V32: verified SKU % requires codigo_base', NEW.sku;
  END IF;

  IF duty_text = 'HEAVY_DUTY' THEN
    IF coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS TRUE
       AND approved_manufacturer = 'DONALDSON'
       AND approved_code_norm = base_norm THEN
      RETURN NEW;
    END IF;

    IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % requires verified Donaldson authority or verified Donaldson manufacturing absence', NEW.sku;
    END IF;
    IF approved_manufacturer = 'FLEETGUARD' THEN
      IF coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE
         OR coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
        RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % Fleetguard fallback requires verified manufacturer and commercial code', NEW.sku;
      END IF;
      IF approved_source <> 'COMPETITOR_CODES' THEN
        RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % Fleetguard fallback must use COMPETITOR_CODES authority', NEW.sku;
      END IF;
    ELSE
      IF coalesce((gov->>'fleetguard_absence_verified')::boolean, false) IS NOT TRUE THEN
        RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % OEM fallback requires verified Fleetguard manufacturing absence', NEW.sku;
      END IF;
      IF coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE
         OR coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN
        RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % OEM fallback requires verified manufacturer and commercial code', NEW.sku;
      END IF;
      IF approved_source <> 'OEM_CODES' THEN
        RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % final fallback must be OEM_CODES', NEW.sku;
      END IF;
    END IF;

    IF approved_code_norm = '' OR approved_code_norm <> base_norm THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
    END IF;
    code_digits := regexp_replace(approved_code, '[^0-9]', '', 'g');
    IF length(code_digits) < 4 THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % approved fallback code needs at least four numeric digits', NEW.sku;
    END IF;
    expected_suffix := right(code_digits, 4);
    sku_digits := regexp_replace(coalesce(NEW.sku,''), '[^0-9]', '', 'g');
    IF right(sku_digits, 4) <> expected_suffix THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: HD SKU % must end in % from approved commercial code %', NEW.sku, expected_suffix, approved_code;
    END IF;
    RETURN NEW;
  END IF;

  IF duty_text = 'LIGHT_DUTY' THEN
    IF origin_group_value NOT IN ('EUROPEAN','NON_EUROPEAN') THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % requires explicit origin_group EUROPEAN or NON_EUROPEAN', NEW.sku;
    END IF;

    SELECT upper(regexp_replace(p.canonical_brand, '[^A-Z0-9]', '', 'g'))
    INTO expected_ld_brand
    FROM ld_catalog.ld_canonical_source_policy p
    WHERE upper(p.origin_group) = origin_group_value
      AND p.active = true;

    IF expected_ld_brand IS NULL THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: no active LD canonical source policy for origin_group %', origin_group_value;
    END IF;
    IF coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % requires verified canonical manufacturer authority', NEW.sku;
    END IF;
    IF approved_manufacturer <> expected_ld_brand THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % origin_group % requires canonical manufacturer %, got %', NEW.sku, origin_group_value, expected_ld_brand, approved_manufacturer;
    END IF;
    IF approved_code_norm = '' OR approved_code_norm <> base_norm THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V32: LD SKU % codigo_base must equal approved_codigo_base', NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'CATALOG_POLICY_V32: unsupported duty % for verified SKU %', NEW.duty, NEW.sku;
END;
$fn$;
`;

const APPLICATION_TRIGGER_SQL = `
DROP TRIGGER IF EXISTS trg_elimfilters_application_evidence_policy ON public.elimfilters_catalog;
CREATE TRIGGER trg_elimfilters_application_evidence_policy
BEFORE INSERT OR UPDATE OF equipment_applications, vehicle_applications, duty
ON public.elimfilters_catalog
FOR EACH ROW
EXECUTE FUNCTION public.enforce_elimfilters_application_evidence_policy();
`;

const TRIGGER_SQL = `
DROP TRIGGER IF EXISTS trg_elimfilters_codigo_base_policy ON public.elimfilters_catalog;
CREATE TRIGGER trg_elimfilters_codigo_base_policy
BEFORE INSERT OR UPDATE OF sku, codigo_base, duty, filter_type, technology, competitor_codes, oem_codes, enrichment_data, canonical_source_status, canonical_source_brand, canonical_source_code
ON public.elimfilters_catalog
FOR EACH ROW
EXECUTE FUNCTION public.enforce_elimfilters_codigo_base_policy();
`;

function upsertRef(rows, next) {
  const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const key = norm(next.code);
  const out = Array.isArray(rows) ? rows.filter((r) => norm(r.code || r.reference) !== key) : [];
  out.push(next);
  return out;
}
async function main() {
  const connectionString = process.env.SEARCH_DB_URL || process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Missing SEARCH_DB_URL/CATALOG_DATABASE_URL/DATABASE_URL');
  const client = new Client({ connectionString });
  await client.connect();
  await client.query('BEGIN');
  try {
    const current = await client.query("SELECT * FROM public.elimfilters_catalog WHERE sku='EA30719' FOR UPDATE");
    const target = await client.query("SELECT sku FROM public.elimfilters_catalog WHERE sku='ED40719'");
    if (current.rowCount !== 1) throw new Error('EA30719_NOT_FOUND');
    if (target.rowCount !== 0) throw new Error('ED40719_ALREADY_EXISTS');

    await client.query('DROP TRIGGER IF EXISTS trg_elimfilters_codigo_base_policy ON public.elimfilters_catalog');
    await client.query('DROP TRIGGER IF EXISTS trg_elimfilters_application_evidence_policy ON public.elimfilters_catalog');

    const row = current.rows[0];
    const previousEvidence = row.canonical_evidence || {};
    const data = row.enrichment_data || {};
    const oldGov = data.codigo_base_governance || {};
    const competitorCodes = upsertRef(row.competitor_codes, {
      manufacturer: 'FLEETGUARD',
      code: 'AD27754',
      classification: 'AFTERMARKET',
      classification_source: 'FLEETGUARD_OFFICIAL_PRODUCT_20261002'
    });
    const governance = {
      ...oldGov,
      policy_version: POLICY_VERSION,
      state: 'VERIFY_PRIMARY_ABSENCE',
      governance_state: 'VERIFY_PRIMARY_ABSENCE',
      required_authority: 'VERIFY_DONALDSON_MANUFACTURING_ABSENCE',
      current_codigo_base: 'TB719',
      provisional_codigo_base: 'TB719',
      provisional_codigo_base_is_canonical: false,
      canonical_promotion_allowed: false,
      donaldson_absence_verified: false,
      fleetguard_candidate_verified: true,
      fleetguard_candidate_code: 'AD27754',
      fleetguard_candidate_url: FLEETGUARD_URL,
      observed_primary_candidates: [],
      observed_fleetguard_candidates: ['AD27754'],
      previous_invalid_authority: {
        manufacturer: 'MANN-FILTER',
        code: 'TB719',
        reason: 'AIR_DRYER_IS_HEAVY_DUTY_AND_HD_AUTHORITY_CHAIN_APPLIES'
      }
    };
    delete governance.primary_manufacturer_verified;
    delete governance.approved_manufacturer;
    delete governance.approved_codigo_base;
    delete governance.approved_source_column;
    delete governance.fallback_manufacturer_verified;
    delete governance.fallback_commercial_code_verified;
    delete governance.fleetguard_absence_verified;

    const oldAppGov = data.application_governance || {};
    const applicationGovernance = {
      ...oldAppGov,
      policy_version: '2026-08-19-app-v1',
      evidence_recorded: true,
      equipment_verified: true,
      equipment_payload_hash: oldAppGov.vehicle_payload_hash || null,
      equipment_db_payload_hash: oldAppGov.vehicle_db_payload_hash || null,
      engine_verified: true,
      engine_payload_hash: oldAppGov.engine_payload_hash || oldAppGov.vehicle_payload_hash || null,
      engine_db_payload_hash: oldAppGov.engine_db_payload_hash || oldAppGov.vehicle_db_payload_hash || null,
      migrated_from_vehicle_to_equipment: true,
      migrated_at: '2026-10-02T00:00:00.000Z'
    };
    delete applicationGovernance.vehicle_verified;
    delete applicationGovernance.vehicle_payload_hash;
    delete applicationGovernance.vehicle_db_payload_hash;
    const enrichment = { ...data, codigo_base_governance: governance, application_governance: applicationGovernance };
    const canonicalEvidence = {
      status: 'INVALIDATED_PENDING_HD_AUTHORITY',
      invalidated_on: '2026-10-02',
      reason: 'MANN-FILTER_CANNOT_BE_HD_CANONICAL_AUTHORITY',
      previous_mann_evidence: previousEvidence,
      fleetguard_candidate: {
        code: 'AD27754',
        source_url: FLEETGUARD_URL,
        product_type: 'Air Dryer',
        manufacturer_status: 'OFFICIAL_ACTIVE_PRODUCT'
      },
      donaldson_status: 'ABSENCE_NOT_VERIFIED'
    };
    const updated = await client.query(`
      UPDATE public.elimfilters_catalog
      SET sku = 'ED40719',
          catalog_active = false,
          duty = 'HEAVY_DUTY',
          filter_type = 'air_dryer',
          sub_type = 'Air Dryer Cartridge',
          technology = 'DRYCOREâ„¢',
          gasket_od_mm = 71.50,
          gasket_id_mm = NULL,
          canonical_source_brand = NULL,
          canonical_source_code = NULL,
          canonical_source_url = NULL,
          canonical_source_status = 'UNVERIFIED',
          canonical_verified_at = NULL,
          canonical_evidence = $1::jsonb,
          competitor_codes = $2::jsonb,
          enrichment_data = $3::jsonb,
          equipment_applications = $4::jsonb,
          vehicle_applications = '[]'::jsonb
      WHERE sku = 'EA30719'
      RETURNING sku,codigo_base,catalog_active,duty,filter_type,sub_type,technology,gasket_od_mm,gasket_id_mm,canonical_source_status
    `, [JSON.stringify(canonicalEvidence), JSON.stringify(competitorCodes), JSON.stringify(enrichment), JSON.stringify(row.vehicle_applications || [])]);
    if (updated.rowCount !== 1) throw new Error('EA30719_REMEDIATION_FAILED');

    await client.query(`
      UPDATE public.catalog_application_evidence
      SET sku='ED40719',
          application_kind = CASE WHEN application_kind='VEHICLE' THEN 'EQUIPMENT' ELSE application_kind END,
          metadata = coalesce(metadata,'{}'::jsonb) || '{"migrated_from_vehicle_to_equipment":true,"migration":"run_144"}'::jsonb
      WHERE sku='EA30719'
    `);
    await client.query("DELETE FROM public.crossref_resolved_cache WHERE sku IN ('EA30719','ED40719')");
    await client.query(`
      UPDATE public.catalog_codigo_base_evidence
      SET metadata = coalesce(metadata,'{}'::jsonb) || '{"canonical_authority_invalidated":true,"reason":"MANN_FILTER_NOT_HD_CANONICAL_AUTHORITY"}'::jsonb
      WHERE sku='ED40719' AND upper(coalesce(authority,'')) LIKE 'MANN%'
    `);
    await client.query(`
      UPDATE public.catalog_codigo_base_sanitation_queue
      SET current_codigo_base='TB719',
          governance_state='VERIFY_PRIMARY_ABSENCE',
          required_authority='VERIFY_DONALDSON_MANUFACTURING_ABSENCE',
          status='PENDING',
          last_error='DONALDSON_MANUFACTURING_ABSENCE_NOT_VERIFIED',
          updated_at=now()
      WHERE sku='ED40719'
    `);

    await client.query(FUNCTION_SQL);
    await client.query(TRIGGER_SQL);
    await client.query(APPLICATION_TRIGGER_SQL);

    await client.query('SAVEPOINT verify_mann_block');
    let mannBlocked = false;
    try {
      await client.query(`
        UPDATE public.elimfilters_catalog
        SET canonical_source_status='VERIFIED',
            canonical_source_brand='MANN-FILTER',
            canonical_source_code='TB719'
        WHERE sku='ED40719'
      `);
    } catch (error) {
      mannBlocked = /Donaldson authority|Donaldson manufacturing absence/i.test(error.message);
      await client.query('ROLLBACK TO SAVEPOINT verify_mann_block');
    }
    if (!mannBlocked) throw new Error('V32_GATE_DID_NOT_BLOCK_MANN_HD_PROMOTION');
    await client.query('RELEASE SAVEPOINT verify_mann_block');

    const verify = await client.query(`
      SELECT sku,codigo_base,catalog_active,duty,filter_type,sub_type,technology,
             gasket_od_mm,gasket_id_mm,canonical_source_brand,canonical_source_code,
             canonical_source_status,enrichment_data->'codigo_base_governance' AS governance
      FROM public.elimfilters_catalog
      WHERE sku IN ('EA30719','ED40719')
      ORDER BY sku
    `);
    if (verify.rowCount !== 1 || verify.rows[0].sku !== 'ED40719') throw new Error('POST_REMEDIATION_IDENTITY_CHECK_FAILED');
    if (verify.rows[0].catalog_active !== false) throw new Error('ED40719_MUST_BE_INACTIVE');
    if (verify.rows[0].canonical_source_status !== 'UNVERIFIED') throw new Error('ED40719_MUST_BE_UNVERIFIED');
    if (verify.rows[0].duty !== 'HEAVY_DUTY' || verify.rows[0].filter_type !== 'air_dryer') throw new Error('ED40719_CLASSIFICATION_FAILED');

    await client.query('COMMIT');
    console.log(JSON.stringify({
      policy_version: POLICY_VERSION,
      remediated: updated.rows[0],
      mann_hd_promotion_blocked: mannBlocked,
      final: verify.rows[0]
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { POLICY_VERSION, FUNCTION_SQL, TRIGGER_SQL, APPLICATION_TRIGGER_SQL, main };

