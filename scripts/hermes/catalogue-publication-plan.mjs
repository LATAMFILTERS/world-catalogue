#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { planIndustrialSkus } from '../../product-identity/lib/industrial-sku-policy.mjs';

export const PUBLISHABLE_CATALOGUE_FIELDS = new Set([
  'filter_type', 'duty', 'technology', 'dimensions', 'technical_specs',
  'equipment_applications', 'oem_codes', 'competitor_codes',
  'brand_crossrefs', 'source_identity', 'codigo_base', 'vehicle_applications'
]);
export const APPLICATION_PUBLICATION_FIELDS = new Set(['equipment_applications', 'vehicle_applications']);

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function validDate(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeSku(value) {
  return String(value || '').trim().toUpperCase();
}
function isHdCompetitorOnlyBrand(value) {
  const k=String(value||'').trim().toUpperCase().replace(/[^A-Z0-9]+/g,' ');
  return k==='MANN FILTER' || k==='FRAM';
}

function snapshotValue(product, field) {
  return field === 'filter_type' ? (product.product_family ?? null) :
    (Object.hasOwn(product, field) ? product[field] : null);
}

export function buildCataloguePublicationPlan({ bundle, catalog, generatedAt = new Date().toISOString() }) {
  const knowledge = bundle?.knowledge_candidate;
  const candidate = bundle?.catalogue_candidate;
  assert(knowledge && candidate, 'Linked knowledge and catalogue candidates are required');
  assert(bundle.research_bundle_id && bundle.research_bundle_id === knowledge.research_bundle_id && bundle.research_bundle_id === candidate.research_bundle_id,
    'research_bundle_id must match across the linked bundle');
  assert(knowledge.workflow_status === 'APPROVED', 'Knowledge candidate must be APPROVED');
  assert(knowledge.approval_required === true, 'Knowledge candidate must preserve approval_required=true');
  assert(knowledge.approved_by === 'Victor Abreu' && validDate(knowledge.approved_at), 'Victor approval is required for the knowledge candidate');
  assert(candidate.status === 'APPROVED_FOR_PUBLICATION', 'Catalogue candidate must be APPROVED_FOR_PUBLICATION');
  assert(candidate.approval?.approved_by === 'Victor Abreu' && validDate(candidate.approval?.approved_at), 'Victor approval is required for the catalogue candidate');

  const publication = candidate.publication;
  assert(publication && typeof publication === 'object', 'Explicit publication instructions are required');
  const targetSku = normalizeSku(publication.target_sku);
  assert(targetSku, 'target_sku is required; Hermes cannot assign or invent SKUs');
  const catalogItems = Array.isArray(catalog) ? catalog : (catalog?.products || []);
  const current = catalogItems.find((item) => normalizeSku(item.sku) === targetSku);
  assert(current, `target_sku ${targetSku} does not exist; new SKU creation requires a separate manual process`);

  const approvedFields = publication.approved_fields;
  const proposedValues = publication.proposed_values;
  assert(Array.isArray(approvedFields) && approvedFields.length > 0, 'approved_fields must contain at least one field');
  assert(new Set(approvedFields).size === approvedFields.length, 'approved_fields cannot contain duplicates');
  assert(proposedValues && typeof proposedValues === 'object' && !Array.isArray(proposedValues), 'proposed_values must be an object');
  assert(approvedFields.every((field) => PUBLISHABLE_CATALOGUE_FIELDS.has(field)), 'approved_fields contains a non-publishable field');
  assert(Object.keys(proposedValues).every((field) => approvedFields.includes(field)), 'proposed_values contains a field that was not approved');
  assert(approvedFields.every((field) => Object.hasOwn(proposedValues, field)), 'Every approved field must have an explicit proposed value');
  if (candidate.approval.approved_fields) {
    assert(hash([...candidate.approval.approved_fields].sort()) === hash([...approvedFields].sort()), 'Publication fields do not match the approved field list');
  }

  const currentDuty=String(current.duty||'').trim().toUpperCase();
  const proposedSource=proposedValues.source_identity||null;
  if(currentDuty==='HEAVY_DUTY' && approvedFields.includes('codigo_base')) {
    assert(approvedFields.includes('source_identity') && proposedSource, 'HEAVY_DUTY codigo_base changes require source_identity');
    assert(!isHdCompetitorOnlyBrand(proposedSource.canonical_source_brand), 'MANN-FILTER/FRAM are competitor codes in HEAVY_DUTY and cannot be canonical codigo_base');
  }

  const applicationFields = approvedFields.filter((field) => APPLICATION_PUBLICATION_FIELDS.has(field));
  const applicationEvidence = applicationFields.length ? candidate.application_evidence : null;
  if (applicationFields.length) {
    assert(applicationEvidence && typeof applicationEvidence === 'object' && !Array.isArray(applicationEvidence),
      'Application publication requires explicit application_evidence');
    assert(String(applicationEvidence.authority || '').trim(), 'Application evidence authority is required');
    assert(String(applicationEvidence.source_url || '').trim(), 'Application evidence source_url is required');
    assert(String(applicationEvidence.evidence_hash || '').trim(), 'Application evidence evidence_hash is required');
    assert((candidate.source_urls || []).includes(applicationEvidence.source_url),
      'Application evidence source_url must be present in candidate source_urls');
  }

  const operations = approvedFields.map((field) => ({
    field,
    before: snapshotValue(current, field),
    after: proposedValues[field]
  })).filter((operation) => hash(operation.before) !== hash(operation.after));
  assert(operations.length > 0, 'No catalogue change remains after comparison with the current snapshot');

  const snapshotIdentity = { sku: targetSku, values: Object.fromEntries(approvedFields.map((field) => [field, snapshotValue(current, field)])) };
  const planCore = {
    schema_version: '1.0.0', research_bundle_id: bundle.research_bundle_id,
    target_sku: targetSku, change_type: candidate.change_type,
    approval: { approved_by: candidate.approval.approved_by, approved_at: candidate.approval.approved_at, approved_fields: approvedFields },
    knowledge_approval: { approved_by: knowledge.approved_by, approved_at: knowledge.approved_at },
    snapshot_sha256: hash(snapshotIdentity), operations,
    evidence: candidate.evidence || [], source_urls: candidate.source_urls || []
  };
  if (applicationEvidence) planCore.application_evidence = applicationEvidence;
  return {
    ...planCore, generated_at: generatedAt,
    plan_sha256: hash(planCore), dry_run: true, database_write: false,
    transaction_required: true, backup_required: true, rollback_required: true
  };
}


export const INDUSTRIAL_CREATE_PLAN_TYPE = 'INDUSTRIAL_CREATE_BATCH';

function industrialElementBySource(pilot) {
  return new Map((pilot?.elements || []).map((element) => [
    `${String(element.source_brand || '').trim().toUpperCase()}|${String(element.source_code || '').trim().toUpperCase()}`,
    element,
  ]));
}

function compileIndustrialCatalogRow({ element, mapping, authorization, generatedAt }) {
  const sourceUrls = Array.isArray(element.source_urls) ? element.source_urls.filter(Boolean) : [];
  const sourceUrl = element.source_url || sourceUrls[0] || null;
  const approvedAnchorBrand = String(authorization.approved_source_brand || '').trim().toUpperCase();
  const baseGovernance = {
    authority_status: element.base_authority_status,
    base_eligible: element.base_authority_status === 'ORIGINAL_BASE' || element.base_authority_status === 'FAMILY_ANCHOR_BASE',
    technology_core: element.technology_core,
    approved_anchor_brand: element.base_authority_status === 'FAMILY_ANCHOR_BASE' ? approvedAnchorBrand : null,
    approved_source_brand: element.source_brand,
    approved_base_code: element.source_code,
    primary_evidence_complete: element.primary_evidence_complete === true,
    original_confirmed: element.original_confirmed === true,
    source_urls: sourceUrls,
    source_claim_status: element.source_claim_status,
    validation_status: element.validation_status,
  };
  const skuGovernance = {
    policy_version: 'INDUSTRIAL_SKU_NOMENCLATURE_V1_2026-09-22',
    technology_core: element.technology_core,
    planned_sku: mapping.planned_sku,
    sku_method: mapping.sku_method,
    publication_order_locked: true,
    publication_order: mapping.publication_order,
    source_preview: authorization.sku_preview,
    phase4_authorization_id: authorization.batch_id,
  };

  return {
    sku: mapping.planned_sku,
    codigo_base: element.source_code,
    filter_type: 'process_gas',
    sub_type: 'liquid_gas_coalescer',
    technology: element.elimfilters_technology || authorization.approved_technology_family,
    attachment_type: element.configuration || null,
    outer_diameter_mm: element.nominal_outer_diameter_mm ?? null,
    height_mm: element.nominal_length_mm ?? null,
    duty: authorization.approved_duty,
    oem_codes: [],
    competitor_codes: [],
    brand_crossrefs: {},
    alternatives: [],
    equipment_applications: [],
    vehicle_applications: [],
    canonical_source_brand: element.source_brand,
    canonical_source_code: element.source_code,
    canonical_source_url: sourceUrl,
    canonical_source_status: 'VERIFIED',
    canonical_verified_at: generatedAt,
    canonical_evidence: {
      phase2_pilot_id: authorization.pilot_id,
      pilot_record_id: element.pilot_record_id,
      authority_status: element.base_authority_status,
      technology_core: element.technology_core,
      evidence_scope: element.evidence_scope,
      source_urls: sourceUrls,
      primary_evidence_complete: element.primary_evidence_complete === true,
      original_confirmed: element.original_confirmed === true,
      source_claim_status: element.source_claim_status,
      validation_status: element.validation_status,
      manufacturer_declared_engineering: {
        source_product_line: element.source_product_line,
        source_product_name: element.source_product_name,
        filtration_function: element.filtration_function,
        configuration: element.configuration,
        hardware_material: element.hardware_material,
        seal_material: element.seal_material,
        nominal_outer_diameter_mm: element.nominal_outer_diameter_mm,
        nominal_length_mm: element.nominal_length_mm,
        amine_ammonia_compatible: element.amine_ammonia_compatible,
        industry: element.industry,
        application: element.application,
        gas_type: element.gas_type,
        contaminant_type: element.contaminant_type,
        product_configuration: element.product_configuration,
        solid_micron_rating: element.solid_micron_rating,
        solid_efficiency: element.solid_efficiency,
        liquid_droplet_rating: element.liquid_droplet_rating,
        liquid_removal_efficiency: element.liquid_removal_efficiency,
        outlet_liquid_content: element.outlet_liquid_content,
        temperature: element.temperature,
        media: element.media,
        drainage_media: element.drainage_media,
        core_support_material: element.core_support_material,
        end_cap_material: element.end_cap_material,
        chemical_compatibility: element.chemical_compatibility,
        test_standard: element.test_standard,
        research_gaps: element.research_gaps,
      },
      public_claim_policy: authorization.activation.public_claim_policy,
    },
    enrichment_data: {
      industrial_base_governance: baseGovernance,
      industrial_sku_governance: skuGovernance,
      industrial_claim_governance: {
        source_claim_status: element.source_claim_status,
        public_claim_policy: authorization.activation.public_claim_policy,
        performance_promoted_as_elimfilters_claim: false,
      },
    },
    catalog_active: authorization.activation.catalog_active === true,
    catalog_scope_reason: authorization.activation.scope_reason,
    catalog_scope_verified_at: generatedAt,
    is_primary: true,
  };
}

export function buildIndustrialCreateBatchPlan({
  authorization,
  pilot,
  preview,
  generatedAt = new Date().toISOString(),
} = {}) {
  assert(authorization?.schema_version === '1.0.0', 'Unsupported Industrial publication authorization schema');
  assert(authorization.authorization_type === INDUSTRIAL_CREATE_PLAN_TYPE, 'Industrial publication authorization type mismatch');
  assert(authorization.status === 'APPROVED_FOR_CATALOGUE_CREATION', 'Industrial publication authorization is not approved');
  assert(authorization.catalogue_write_allowed === true, 'Industrial catalogue write authorization is required');
  assert(authorization.approval?.approved_by === 'Victor Abreu' && validDate(authorization.approval?.approved_at),
    'Victor approval is required for Industrial catalogue creation');
  assert(authorization.batch_id && authorization.pilot_id, 'Industrial batch_id and pilot_id are required');
  assert(authorization.approved_duty === 'INDUSTRIAL_PROCESS', 'Industrial create batch must use INDUSTRIAL_PROCESS duty');
  assert(authorization.approved_technology_core === 'TC-NG-01', 'COALVEX Pilot 01 Phase 4 is limited to TC-NG-01');
  assert(String(authorization.approved_source_brand || '').trim().toUpperCase() === 'PALL',
    'COALVEX Pilot 01 Phase 4 is limited to the approved PALL family anchor');

  assert(pilot?.pilot_id === authorization.pilot_id, 'Pilot identity does not match authorization');
  assert(pilot.status === 'CLOSED_PRE_SKU_PILOT', 'Pilot must be technically closed before catalogue creation');
  assert(pilot.duty === authorization.approved_duty, 'Pilot duty does not match authorization');
  assert(pilot.technology_core === authorization.approved_technology_core, 'Pilot Technology Core does not match authorization');

  assert(preview?.pilot_id === authorization.pilot_id, 'SKU preview identity does not match authorization');
  assert(preview.phase === 'PHASE_3_SKU_NOMENCLATURE', 'SKU preview must originate from Phase 3');
  assert(preview.rule?.publication_order_locked === true, 'SKU preview publication order must be frozen');
  assert(Array.isArray(preview.mappings) && preview.mappings.length > 0, 'SKU preview mappings are required');
  assert(Array.isArray(authorization.approved_skus), 'approved_skus are required');

  const orderedPreview = [...preview.mappings].sort((a, b) => a.publication_order - b.publication_order);
  const replanned = planIndustrialSkus(pilot.elements || [], { publicationOrderLocked: true });
  assert(replanned.length === orderedPreview.length, 'Replanned Industrial SKU count differs from frozen preview');
  for (let i = 0; i < orderedPreview.length; i += 1) {
    assert(replanned[i].source_code === orderedPreview[i].source_code, `Frozen preview source order mismatch at position ${i + 1}`);
    assert(replanned[i].planned_sku === orderedPreview[i].planned_sku, `Frozen preview SKU mismatch for ${orderedPreview[i].source_code}`);
    assert(replanned[i].sku_method === orderedPreview[i].sku_method, `Frozen preview SKU method mismatch for ${orderedPreview[i].source_code}`);
  }

  const approved = [...authorization.approved_skus].sort((a, b) => a.publication_order - b.publication_order);
  assert(approved.length === orderedPreview.length, 'Authorization SKU count does not match frozen preview');
  const elements = industrialElementBySource(pilot);
  const products = [];

  for (let i = 0; i < orderedPreview.length; i += 1) {
    const mapping = orderedPreview[i];
    const approval = approved[i];
    assert(approval.publication_order === mapping.publication_order, `Approval publication order mismatch at ${i + 1}`);
    assert(normalizeSku(approval.sku) === normalizeSku(mapping.planned_sku), `Approved SKU mismatch for publication order ${mapping.publication_order}`);
    assert(String(approval.source_brand || '').trim().toUpperCase() === String(mapping.source_brand || '').trim().toUpperCase(),
      `Approved source brand mismatch for ${mapping.planned_sku}`);
    assert(String(approval.source_code || '').trim().toUpperCase() === String(mapping.source_code || '').trim().toUpperCase(),
      `Approved source code mismatch for ${mapping.planned_sku}`);
    assert(String(approval.technology_core || '').trim().toUpperCase() === String(mapping.technology_core || '').trim().toUpperCase(),
      `Approved Technology Core mismatch for ${mapping.planned_sku}`);

    const element = elements.get(`${String(mapping.source_brand || '').trim().toUpperCase()}|${String(mapping.source_code || '').trim().toUpperCase()}`);
    assert(element, `Pilot element not found for ${mapping.source_brand} ${mapping.source_code}`);
    assert(element.primary_evidence_complete === true, `Primary evidence incomplete for ${mapping.source_code}`);
    assert(element.validation_status === 'TECHNICAL_IDENTITY_VALIDATED', `Technical identity not validated for ${mapping.source_code}`);
    assert(element.base_authority_status === 'ORIGINAL_BASE' || element.base_authority_status === 'FAMILY_ANCHOR_BASE',
      `Base authority is not eligible for ${mapping.source_code}`);
    assert(String(element.source_brand || '').trim().toUpperCase() === 'PALL', `Unexpected source brand for ${mapping.source_code}`);
    assert(String(element.technology_core || '').trim().toUpperCase() === 'TC-NG-01', `Unexpected Technology Core for ${mapping.source_code}`);
    products.push(compileIndustrialCatalogRow({ element, mapping, authorization, generatedAt }));
  }

  assert(new Set(products.map((row) => row.sku)).size === products.length, 'Industrial create plan contains duplicate SKUs');
  assert(new Set(products.map((row) => `${row.canonical_source_brand}|${row.canonical_source_code}`)).size === products.length,
    'Industrial create plan contains duplicate canonical source identities');

  const planCore = {
    schema_version: '1.0.0',
    plan_type: INDUSTRIAL_CREATE_PLAN_TYPE,
    batch_id: authorization.batch_id,
    pilot_id: authorization.pilot_id,
    approval: authorization.approval,
    source_manifest: authorization.source_manifest,
    source_manifest_sha256: hash(pilot),
    sku_preview: authorization.sku_preview,
    sku_preview_sha256: hash(preview),
    authorization_sha256: hash(authorization),
    products,
  };

  return {
    ...planCore,
    generated_at: generatedAt,
    plan_sha256: hash(planCore),
    dry_run: true,
    database_write: false,
    transaction_required: true,
    backup_required: true,
    rollback_required: true,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const read = (file) => JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));

  if (args[0] === '--industrial-create') {
    const [, authorizationPath, pilotPath, previewPath,
      outputPath = 'hermes/catalogue-publication-plans/industrial-create-plan.json'] = args;
    if (!authorizationPath || !pilotPath || !previewPath) {
      console.error('Usage: node scripts/hermes/catalogue-publication-plan.mjs --industrial-create <authorization.json> <pilot.json> <preview.json> [output.json]');
      process.exit(2);
    }
    const plan = buildIndustrialCreateBatchPlan({
      authorization: read(authorizationPath),
      pilot: read(pilotPath),
      preview: read(previewPath),
    });
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
    console.log(JSON.stringify({ output: outputPath, batch_id: plan.batch_id, products: plan.products.length, dry_run: true }, null, 2));
    return;
  }

  const [bundlePath, catalogPath, outputPath = 'hermes/catalogue-publication-plans/catalogue-publication-plan.json'] = args;
  if (!bundlePath || !catalogPath) {
    console.error('Usage: node scripts/hermes/catalogue-publication-plan.mjs <linked-bundle.json> <catalog-snapshot.json> [output.json]');
    process.exit(2);
  }
  const input = read(bundlePath);
  const bundle = input.knowledge_candidate ? input : (input.bundles?.[0]);
  assert(bundle, 'Input does not contain a linked bundle');
  const plan = buildCataloguePublicationPlan({ bundle, catalog: read(catalogPath) });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, target_sku: plan.target_sku, operations: plan.operations.length, dry_run: true }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES catalogue publication plan] ${error.message}`); process.exit(1); });
}
