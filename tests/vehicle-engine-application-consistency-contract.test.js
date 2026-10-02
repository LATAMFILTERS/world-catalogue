'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const audit = fs.readFileSync(
  path.join(ROOT, 'scripts', 'audits', 'audit_vehicle_engine_application_consistency.js'),
  'utf8'
);
const repair = fs.readFileSync(
  path.join(ROOT, 'scripts', 'migrations', 'run_123_repair_vehicle_engine_application_consistency.js'),
  'utf8'
);
const ownershipRepair = fs.readFileSync(
  path.join(ROOT, 'scripts', 'migrations', 'run_127_repair_application_resolver_ownership.js'),
  'utf8'
);
const framGapAnalyzer = fs.readFileSync(
  path.join(ROOT, 'scripts', 'hermes', 'analyze-fram-ld-gaps.js'),
  'utf8'
);
const framReconcile = fs.readFileSync(
  path.join(ROOT, 'scripts', 'hermes', 'apply-fram-ld-reconciliations.js'),
  'utf8'
);

test('global audit remains read-only and covers governed inconsistency classes', () => {
  assert.match(audit, /readonly:\s*true/);
  for (const token of [
    'application_evidence_not_normalized',
    'application_source_identity_conflict',
    'application_source_identity_unsupported',
    'competing_skus_same_vehicle_engine_filter_type',
    'kit_component_missing_brand_application',
    'engine_string_fragmentation',
    'sku_prefix_filter_type_contradiction'
  ]) {
    assert.match(audit, new RegExp(token));
  }
  assert.doesNotMatch(audit, /\bUPDATE\s+public\./i);
  assert.doesNotMatch(audit, /\bDELETE\s+FROM/i);
});

test('run_123 is dry-run by default and serializable', () => {
  assert.match(repair, /const APPLY = process\.argv\.includes\('--apply'\)/);
  assert.match(repair, /BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(repair, /ROLLBACK \(dry-run\)/);
});

test('run_123 never auto-resolves competing SKUs or prefix/type contradictions', () => {
  assert.match(repair, /type:'COMPETING_SKUS'/);
  assert.match(repair, /AMBIGUOUS_APPLICATION_OWNERSHIP/);
  assert.match(repair, /type:'SKU_PREFIX_FILTER_TYPE_CONTRADICTION'/);
  assert.match(repair, /REQUIRES_IDENTITY_REVIEW/);
});

test('run_123 reuses existing relational application graph instead of creating a parallel store', () => {
  assert.match(repair, /ld_catalog\.ld_vehicle_applications/);
  assert.match(repair, /public\.elimfilters_catalog/);
  assert.match(repair, /maintenance_kits/);
  assert.match(repair, /kit_components/);
  assert.doesNotMatch(repair, /CREATE TABLE/i);
});

test('run_123 never rewrites application source from public catalog identity alone', () => {
  assert.match(repair, /ld_catalog\.ld_product_catalog/);
  assert.match(repair, /APPLICATION_SOURCE_PARENT_MISMATCH/);
  assert.match(repair, /REQUIRES_EVIDENCE_REVIEW/);
  assert.doesNotMatch(repair, /REALIGN_APPLICATION_SOURCE/);
  assert.doesNotMatch(repair, /UPDATE ld_catalog\.ld_vehicle_applications/);
});

test('run_123 keeps public-only applications and kit inheritance on HOLD', () => {
  assert.match(repair, /REQUIRES_RELATIONAL_EVIDENCE/);
  assert.match(repair, /REQUIRES_PLATFORM_EVIDENCE/);
  assert.match(repair, /NO_SIBLING_APPLICATION_EVIDENCE/);
  assert.doesNotMatch(repair, /INHERIT_KIT_PLATFORM_APPLICATIONS/);
  assert.doesNotMatch(repair, /INSERT INTO ld_catalog\.ld_vehicle_applications/);
});


test('global audit classifies application source aliases instead of flagging all parent differences', () => {
  assert.match(audit, /application_source_identity_legitimate_alias/);
  assert.match(audit, /application_source_identity_conflict/);
  assert.match(audit, /application_source_identity_unsupported/);
  assert.match(audit, /CANONICAL_LD_MATCH/);
  assert.match(audit, /RESOLVER_SAME_SKU/);
  assert.match(audit, /RESOLVER_OTHER_SKU/);
  assert.doesNotMatch(audit, /application_source_identity_mismatch\s*=/);
});

test('global audit OEM display comes only from elimfilters_catalog.oem_codes', () => {
  assert.match(audit, /c\.oem_codes/);
  assert.match(audit, /function formatOemCodes\(value\)/);
  assert.match(audit, /oem:\s*formatOemCodes\(oem_codes\)/);
  assert.doesNotMatch(audit, /competitor_codes/);
  assert.doesNotMatch(audit, /['"`]DB['"`]/);
});


test('application source mismatch is governed by relational parent identity, not compact public base codes', () => {
  assert.match(audit, /JOIN ld_catalog\.ld_product_catalog p ON p\.elimfilters_sku=v\.elimfilters_sku/);
  assert.match(audit, /p\.source_sku AS expected_parent_source_sku/);
  assert.match(audit, /coalesce\(p\.source_sku/);
  assert.doesNotMatch(
    audit,
    /regexp_replace\(upper\(coalesce\(v\.source_sku,''\)\).*<> regexp_replace\(upper\(coalesce\(c\.codigo_base,''\)/s
  );
});

test('summary-only mode avoids emitting full audit payload', () => {
  assert.match(audit, /process\.argv\.includes\('--summary-only'\)/);
  assert.match(audit, /SUMMARY_ONLY/);
  assert.match(audit, /informational_summary/);
  assert.match(audit, /summary:\s*report\.summary/);
});

test('run_127 is dry-run by default and executes only with --execute', () => {
  assert.match(ownershipRepair, /const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(ownershipRepair, /BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(ownershipRepair, /ROLLBACK \(dry-run\)/);
  assert.match(ownershipRepair, /console\.log\('COMMIT'\)/);
});

test('run_127 changes only relational application ownership and preserves authority evidence', () => {
  assert.match(ownershipRepair, /UPDATE ld_catalog\.ld_vehicle_applications[\s\S]*SET elimfilters_sku=\$1/);
  assert.doesNotMatch(ownershipRepair, /SET\s+source_sku=/);
  assert.doesNotMatch(ownershipRepair, /UPDATE\s+public\.elimfilters_catalog/i);
  assert.doesNotMatch(ownershipRepair, /INSERT\s+INTO\s+ld_catalog\.ld_(?:competitor|oem|product_specifications)/i);
  assert.doesNotMatch(ownershipRepair, /UPDATE\s+ld_catalog\.ld_production_readiness/i);
});

test('run_127 holds whole authorities on type, target-platform or convergence conflicts', () => {
  assert.match(ownershipRepair, /DIRECT_OWNERSHIP_MISSING/);
  assert.match(ownershipRepair, /ld_competitor_cross_references/);
  assert.match(ownershipRepair, /competitor_part_number/);
  assert.match(ownershipRepair, /FILTER_TYPE_MISMATCH/);
  assert.match(ownershipRepair, /DUTY_MISMATCH/);
  assert.match(ownershipRepair, /PUBLIC_EVIDENCE_WOULD_BE_ORPHANED/);
  assert.match(ownershipRepair, /vehicle_json_count/);
  assert.match(ownershipRepair, /equipment_json_count/);
  assert.match(ownershipRepair, /source_duty/);
  assert.match(ownershipRepair, /target_duty/);
  assert.match(ownershipRepair, /TARGET_EXACT_EXISTS/);
  assert.match(ownershipRepair, /TARGET_PLATFORM_VARIANT/);
  assert.match(ownershipRepair, /CANDIDATE_CONVERGENCE_COLLISION/);
  assert.match(ownershipRepair, /const safeAuthorities = authorities\.filter\(a => a\.safe\)/);
  assert.match(ownershipRepair, /const heldAuthorities = authorities\.filter\(a => !a\.safe\)/);
});

test('run_127 requires a unique governed resolver owner and rechecks row identity on update', () => {
  assert.match(ownershipRepair, /r\.owner_count=1/);
  assert.match(ownershipRepair, /r\.target_sku<>v\.elimfilters_sku/);
  assert.match(ownershipRepair, /id=ANY\(\$2::int\[\]\)/);
  assert.match(ownershipRepair, /elimfilters_sku=\$3/);
  assert.match(ownershipRepair, /regexp_replace\([\s\S]*source_sku[\s\S]*\)=\$4/);
  assert.match(ownershipRepair, /row-count mismatch/);
});

test('FRAM EXISTING_DIRECT analysis measures relational application coverage', () => {
  assert.match(framGapAnalyzer, /function applicationCoverage\(/);
  assert.match(framGapAnalyzer, /ld_catalog\.ld_vehicle_applications/);
  assert.match(framGapAnalyzer, /existing_application_gap_count/);
  assert.match(framGapAnalyzer, /existing_application_gaps/);
  assert.match(framGapAnalyzer, /status:'EXISTING_DIRECT'.*applicationCoverage/s);
});

test('FRAM reconciliation can consume existing application gaps and inserts only missing application rows', () => {
  assert.match(framReconcile, /--existing-application-gaps/);
  assert.match(framReconcile, /gap\.existing_application_gaps/);
  assert.match(framReconcile, /existingAppKeys/);
  assert.match(framReconcile, /applications_already_present/);
  assert.match(framReconcile, /applications_missing/);
  assert.match(framReconcile, /evidenceAppRows\.filter\(r=>!existingAppKeys\.has\(applicationKey\(r\)\)\)/);
});


test('FRAM reconciliation holds missing public targets instead of blocking valid targets', () => {
  assert.match(framReconcile, /TARGET_NOT_IN_PUBLIC_CATALOG/);
  assert.match(framReconcile, /missing_target_authorities/);
  assert.match(framReconcile, /missing_target_skus/);
  assert.match(framReconcile, /activeEntries/);
  assert.doesNotMatch(framReconcile, /Missing targets \$\{targets\.length\}\/\$\{skus\.length\}/);
});

test('--existing-application-gaps cannot write competitor, OEM or specification rows', () => {
  assert.match(framReconcile, /const APPLICATIONS_ONLY=EXISTING_APPLICATION_GAPS;/);
  const guarded = framReconcile.match(/if\(!APPLICATIONS_ONLY\)\{([\s\S]*?)\r?\n    \}/);
  assert.ok(guarded, 'non-application inserts must sit in one if(!APPLICATIONS_ONLY) block');
  const outside = framReconcile.replace(guarded[0], '');
  for (const table of ['ld_competitor_cross_references', 'ld_oem_cross_references', 'ld_product_specifications']) {
    assert.ok(guarded[1].includes(`insertRows(client,'ld_catalog.${table}'`), `${table} insert must be guarded`);
    assert.ok(!outside.includes(`insertRows(client,'ld_catalog.${table}'`), `${table} insert escapes the applications-only guard`);
    for (const verb of ['INSERT INTO', 'UPDATE', 'DELETE FROM']) {
      assert.ok(!outside.includes(`${verb} ld_catalog.${table}`), `${verb} ${table} outside guard`);
    }
  }
  for (const table of ['public.elimfilters_catalog', 'ld_catalog.ld_product_catalog', 'ld_catalog.ld_canonical_product_identity']) {
    for (const verb of ['INSERT INTO', 'UPDATE', 'DELETE FROM']) {
      assert.ok(!framReconcile.includes(`${verb} ${table}`), `reconciliation must not ${verb} ${table}`);
    }
  }
  const appsOnlyReadiness = framReconcile.match(/APPLICATIONS_ONLY\s*\?\s*await client\.query\(`(UPDATE ld_catalog\.ld_production_readiness[^`]*)`/);
  assert.ok(appsOnlyReadiness, 'applications-only readiness update must exist');
  assert.match(appsOnlyReadiness[1], /SET has_applications=true,updated_at=now\(\)/);
  assert.doesNotMatch(appsOnlyReadiness[1], /has_oem|has_competitor|has_specifications/);
  assert.match(framReconcile, /report\.planned\.competitor=APPLICATIONS_ONLY\?0:/);
  assert.match(framReconcile, /report\.planned\.oem=APPLICATIONS_ONLY\?0:/);
  assert.match(framReconcile, /report\.planned\.specifications=APPLICATIONS_ONLY\?0:/);
});

test('one authority without direct ownership is held without aborting valid authorities', () => {
  const { partitionByDirectOwnership } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const entries = [
    { authority: 'PH3600', sku: 'EL31000', family: 'LUBE' },   // owned directly and uniquely
    { authority: 'CA9007', sku: 'EA35350', family: 'AIR' },    // no LD owner
    { authority: 'PH-8873', sku: 'EL39365', family: 'LUBE' },  // public FRAM owner is another SKU
    { authority: 'G8018', sku: 'EF33850', family: 'FUEL' },    // LD owner is another SKU
    { authority: 'CF1000', sku: 'EC30001', family: 'CABIN' }   // LD shared by two SKUs
  ];
  const ld = new Map([
    ['PH3600', ['EL31000']],
    ['PH8873', ['EL39365']],
    ['G8018', ['EF91772']],
    ['CF1000', ['EC30001', 'EC39999']]
  ]);
  const pub = new Map([['PH3600', ['EL31000']], ['PH8873', ['EL80507']]]);
  const { eligible, held } = partitionByDirectOwnership(entries, ld, pub);
  assert.deepEqual(eligible.map(e => e.authority), ['PH3600']);
  assert.deepEqual(held.map(h => [h.authority, h.sku, h.reason, h.conflicting_owners]), [
    ['CA9007', 'EA35350', 'AUTHORITY_NOT_DIRECTLY_OWNED', []],
    ['PH-8873', 'EL39365', 'AUTHORITY_NOT_DIRECTLY_OWNED', ['EL80507']],
    ['G8018', 'EF33850', 'AUTHORITY_NOT_DIRECTLY_OWNED', ['EF91772']],
    ['CF1000', 'EC30001', 'AUTHORITY_NOT_DIRECTLY_OWNED', ['EC39999']]
  ]);
  assert.doesNotMatch(framReconcile, /throw[^;]*AUTHORITY_NOT_DIRECTLY_OWNED/);
});

test('held authorities cannot contribute application inserts or readiness updates', () => {
  const at = s => {
    const i = framReconcile.indexOf(s);
    assert.ok(i >= 0, `missing: ${s}`);
    return i;
  };
  const filtered = at('activeEntries=collision.eligible;');
  assert.ok(at('partitionByDirectOwnership(activeEntries,ldOwners,publicOwners)') < at('partitionByApplicationCollision(eligible,rowsByEntry'));
  assert.ok(at('partitionByApplicationCollision(eligible,rowsByEntry') < filtered);
  assert.ok(filtered < at('const skus=[...new Set(activeEntries.map(e=>e.sku))];'));
  assert.ok(filtered < at('const plan=buildPlan(activeEntries,byAuthority);'));
  assert.ok(filtered < at('report.inserted.applications=await insertRows'));
  assert.ok(filtered < at('UPDATE ld_catalog.ld_production_readiness'));
  assert.match(framReconcile, /WHERE r\.elimfilters_sku=ANY\(\$1::text\[\]\) AND r\.has_applications IS NOT TRUE[^`]*`,\[skus\]\)/);
});

test('public competitor_codes FRAM claims participate in ownership validation', () => {
  assert.match(framReconcile, /const publicOwners=await queryPublicFramOwners\(client,auths\);/);
  const publicOwnersSql = framReconcile.match(/async function queryPublicFramOwners\(client,codes\)\{\s*return new Map\(\(await client\.query\(`([^`]*)`/);
  assert.ok(publicOwnersSql, 'publicOwners query must exist');
  assert.match(publicOwnersSql[1], /brand_crossrefs->'FRAM'/);
  assert.match(publicOwnersSql[1], /jsonb_array_elements\(CASE WHEN jsonb_typeof\(c\.competitor_codes\)='array'/);
  assert.match(publicOwnersSql[1], /coalesce\(e->>'brand',e->>'manufacturer',''\)[^=]*\)='FRAM'/);
  const { partitionByDirectOwnership } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  // CA3916: LD owner is the target, but HD EA16219 claims it in public competitor_codes.
  const { eligible, held } = partitionByDirectOwnership(
    [{ authority: 'CA3916', sku: 'EA30551', family: 'AIR' }],
    new Map([['CA3916', ['EA30551']]]),
    new Map([['CA3916', ['EA16219']]])
  );
  assert.equal(eligible.length, 0);
  assert.deepEqual([held[0].class, held[0].reason, held[0].conflicting_owners], ['HOLD_IDENTITY', 'AUTHORITY_NOT_DIRECTLY_OWNED', ['EA16219']]);
});

const appRow = (sku, make, model, year, engine) => ({
  elimfilters_sku: sku, source_sku: 'X', make, model_family: model, model_type: engine || '', year, engine_code: engine || null
});
const peer = (sku, make, model, year, engine, filter_type, ccm = null) => ({
  sku, make, model_family: model, model_type: engine || '', year, engine_code: engine, ccm, filter_type
});

test('one collision row holds the whole authority', () => {
  const { partitionByApplicationCollision } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const e = { authority: 'CA303', sku: 'EA32675', family: 'AIR' };
  const rows = [
    appRow('EA32675', 'FORD', 'MUSTANG', '86-79', 'L4-2.3L'),   // collides with EA33785 (1979-1986, 2.3L)
    appRow('EA32675', 'FORD', 'RANGER', '92-89', 'L4-2.3L'),    // safe
    appRow('EA32675', 'FORD', 'ESCORT', '90-85', 'L4-1.9L')     // safe
  ];
  const peers = [
    peer('EA33785', 'FORD', 'MUSTANG', '01/82 → 12/86', '2.3 i', 'air', '2300'),
    peer('EA33785', 'FORD', 'RANGER', '01/93 → 12/97', '2.3 i', 'air', '2300'),   // no year overlap
    peer('EL30001', 'FORD', 'ESCORT', '01/85 → 12/90', '1.9', 'oil', '1900')      // other filter type
  ];
  const { eligible, held } = partitionByApplicationCollision([e], new Map([[e, rows]]), new Map([['EA32675', 'air']]), peers);
  assert.equal(eligible.length, 0);
  assert.equal(held[0].class, 'HOLD_COLLISION');
  assert.equal(held[0].proposed_rows, 3);
  assert.equal(held[0].collision_rows, 1);
});

test('one ambiguous row holds the whole authority', () => {
  const { partitionByApplicationCollision } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const e = { authority: 'CA10086', sku: 'EA32631', family: 'AIR' };
  const safe = { authority: 'CA3717', sku: 'EA32690', family: 'AIR' };
  const rows = new Map([
    [e, [appRow('EA32631', 'HYUNDAI', 'TUCSON', '09-05', 'ALL'), appRow('EA32631', 'KIA', 'RIO', '11-06', 'L4-1.6L')]],
    [safe, [appRow('EA32690', 'KIA', 'SOUL', '13-10', 'L4-2.0L')]]
  ]);
  const peers = [peer('EA34004', 'HYUNDAI', 'TUCSON', '01/04 → 12/09', '2.0 CRDi', 'air')];
  const types = new Map([['EA32631', 'air'], ['EA32690', 'air']]);
  const { eligible, held } = partitionByApplicationCollision([e, safe], rows, types, peers);
  assert.deepEqual(eligible.map(x => x.authority), ['CA3717']);
  assert.deepEqual([held[0].authority, held[0].class, held[0].ambiguous_rows], ['CA10086', 'HOLD_AMBIGUOUS_APPLICATION', 1]);
});

test('G7315 -> EF36006 is rejected because its rows duplicate EF37315 ownership', () => {
  const { partitionByApplicationCollision } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const e = { authority: 'G7315', sku: 'EF36006', family: 'FUEL' };
  const rows = [appRow('EF36006', 'CHEVROLET', 'SILVERADO 1500', '13-07', 'V8-5.3L'), appRow('EF36006', 'GMC', 'SIERRA 1500', '13-07', 'V8-5.3L')];
  const peers = rows.map(r => peer('EF37315', r.make, r.model_family, r.year, r.engine_code, 'fuel'));
  const { eligible, held } = partitionByApplicationCollision([e], new Map([[e, rows]]), new Map([['EF36006', 'fuel']]), peers);
  assert.equal(eligible.length, 0);
  assert.deepEqual([held[0].authority, held[0].sku, held[0].class, held[0].collision_rows], ['G7315', 'EF36006', 'HOLD_COLLISION', 2]);
});

test('mutual alternatives are informational but unilateral links remain competing conflicts', () => {
  assert.match(audit, /function isMutualAlternativeGroup/);
  assert.match(audit, /if \(!aAlts\.has\(b\) \|\| !bAlts\.has\(a\)\) return false/);
  assert.match(audit, /competing_skus_mutual_alternatives/);
  assert.match(audit, /MUTUAL_FUNCTIONAL_ALTERNATIVES/);
  assert.match(audit, /competingConflicts\.push\(row\)/);
});

test('displacement prefers explicit engine/ccm and only falls back to one clear model_type value', () => {
  const { displacement } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  assert.equal(displacement('L4-1.8L', null, '2.4'), '1.8');
  assert.equal(displacement('2ZR-FE', '1798', '2.4'), '1.8');
  assert.equal(displacement('LAX', null, '2.4'), '2.4');
  assert.equal(displacement('2AZ-FE', null, '2.4 4WD (E14)'), '2.4');
  assert.equal(displacement('1ND-TV', null, '1.4 D-4D → 12/08'), '1.4');
  assert.equal(displacement('LAX', null, null), null);
  assert.equal(displacement('G4FG', null, 'Hatchback'), null);
  assert.equal(displacement('XYZ', null, '1.6 / 1.8'), null);
});

const vibe = appRow('EL36006', 'PONTIAC', 'VIBE', '10-09', 'L4-1.8L');
test('model_type displacement fallback clears 1.8 vs 2.4 and 1.8 vs 1.4 diesel', () => {
  const { classifyApplicationCollision } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const p24 = { ...peer('EL36109', 'PONTIAC', 'VIBE', '01/09 → 12/10', 'LAX', 'oil'), model_type: '2.4' };
  assert.equal(classifyApplicationCollision(vibe, 'oil', [p24]), null);
  const corolla = appRow('EL36006', 'TOYOTA', 'COROLLA', '18-09', 'L4-1.8L');
  const diesel = { ...peer('EL37120', 'TOYOTA', 'COROLLA', '04/07 → 07/14', '1ND-TV', 'oil'), model_type: '1.4 D-4D → 12/08' };
  assert.equal(classifyApplicationCollision(corolla, 'oil', [diesel]), null);
});

test('bare engine code without usable model_type stays ambiguous; matching 1.8 still collides', () => {
  const { classifyApplicationCollision } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const opaque = { ...peer('EL36109', 'PONTIAC', 'VIBE', '01/09 → 12/10', 'LAX', 'oil'), model_type: null };
  assert.equal(classifyApplicationCollision(vibe, 'oil', [opaque]), 'HOLD_AMBIGUOUS_APPLICATION');
  const same = { ...peer('EL39999', 'PONTIAC', 'VIBE', '01/09 → 12/10', '2ZR-FE', 'oil'), model_type: '1.8 VVT-i' };
  assert.equal(classifyApplicationCollision(vibe, 'oil', [same]), 'HOLD_COLLISION');
});

// Real pattern: CH10358 -> EL36006 (cartridge) and PH4967 -> EL34967 (spin-on), both FRAM-listed.
const FRAM = 'FRAM_LD_MULTI_REGION';
const iM = { ...appRow('EL36006', 'TOYOTA', 'COROLLA IM', '18-17', 'L4-1.8L'), source_sku: 'CH10358', source_origin: FRAM };
const iMPeer = { ...peer('EL34967', 'TOYOTA', 'COROLLA IM', '18-17', 'L4-1.8L', 'oil'), source_sku: 'PH4967', source_origin: FRAM };
const iMKey = 'TOYOTA|COROLLAIM|18-17|L418L';
function multiFitFacts(overrides = {}) {
  const base = {
    'EL36006|CH10358': { ldOwners: ['EL36006'], publicClaimants: [], fitments: new Set([iMKey, 'TOYOTA|PRIUS|20-10|L418L']), alternatives: new Set(), blocked: false },
    'EL34967|PH4967': { ldOwners: ['EL34967'], publicClaimants: ['EL34967'], fitments: new Set([iMKey, 'TOYOTA|PRIUSC|19-12|L415L']), alternatives: new Set(), blocked: false }
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return new Map(Object.entries(base));
}

test('FRAM multi-fit: CH10358/EL36006 vs PH4967/EL34967 is LEGITIMATE_MULTI_FIT and does not hold the authority', () => {
  const { classifyApplicationCollision, partitionByApplicationCollision, isLegitimateFramMultiFit } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const facts = multiFitFacts();
  const mf = (r, o) => isLegitimateFramMultiFit(r, o, facts);
  assert.equal(classifyApplicationCollision(iM, 'oil', [iMPeer]), 'HOLD_COLLISION', 'without the multi-fit hook it is still a collision');
  assert.equal(classifyApplicationCollision(iM, 'oil', [iMPeer], mf), 'LEGITIMATE_MULTI_FIT');
  const e = { authority: 'CH10358', sku: 'EL36006', family: 'LUBE' };
  const { eligible, held } = partitionByApplicationCollision([e], new Map([[e, [iM]]]), new Map([['EL36006', 'oil']]), [iMPeer], mf);
  assert.equal(held.length, 0);
  assert.equal(eligible[0].legitimate_multi_fit_rows, 1);
});

test('FRAM multi-fit fails closed: MANN side, shared authority, claimant conflict, non-unique owner, missing evidence, blocked', () => {
  const { classifyApplicationCollision, isLegitimateFramMultiFit } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const run = (peerRow, facts) => classifyApplicationCollision(iM, 'oil', [peerRow], (r, o) => isLegitimateFramMultiFit(r, o, facts));
  assert.equal(run({ ...iMPeer, source_origin: 'master' }, multiFitFacts()), 'HOLD_COLLISION', 'one side not FRAM-sourced');
  assert.equal(run({ ...iMPeer, source_origin: 'master', source_sku: 'W68/3' }, multiFitFacts()), 'HOLD_COLLISION', 'one side MANN');
  assert.equal(run({ ...iMPeer, source_sku: 'CH10358' }, multiFitFacts({ 'EL34967|CH10358': { ldOwners: ['EL36006'], publicClaimants: [], fitments: new Set([iMKey]), alternatives: new Set(), blocked: false } })), 'HOLD_COLLISION', 'shared FRAM authority');
  assert.equal(run(iMPeer, multiFitFacts({ 'EL34967|PH4967': { publicClaimants: ['EL34967', 'EL36006'] } })), 'HOLD_COLLISION', 'claimant conflict');
  assert.equal(run(iMPeer, multiFitFacts({ 'EL36006|CH10358': { ldOwners: ['EL36006', 'EL36013'] } })), 'HOLD_COLLISION', 'ownership not unique');
  assert.equal(run(iMPeer, multiFitFacts({ 'EL34967|PH4967': { fitments: new Set(['TOYOTA|PRIUSC|19-12|L415L']) } })), 'HOLD_COLLISION', 'missing FRAM evidence for the peer fitment');
  assert.equal(run(iMPeer, multiFitFacts({ 'EL34967|PH4967': { blocked: true } })), 'HOLD_COLLISION', 'quarantined / identity-conflicted');
});

test('FRAM multi-fit never applies to duplicate identities such as G7315 / G7315DP', () => {
  const { classifyApplicationCollision, isLegitimateFramMultiFit } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const same = new Set([iMKey, 'TOYOTA|PRIUS|20-10|L418L']);
  const identical = multiFitFacts({ 'EL36006|CH10358': { fitments: same }, 'EL34967|PH4967': { fitments: new Set(same) } });
  assert.equal(classifyApplicationCollision(iM, 'oil', [iMPeer], (r, o) => isLegitimateFramMultiFit(r, o, identical)), 'HOLD_COLLISION', 'identical FRAM fitment sets');
  const alias = multiFitFacts({ 'EL36006|CH10358': { alternatives: new Set(['PH4967']) } });
  assert.equal(classifyApplicationCollision(iM, 'oil', [iMPeer], (r, o) => isLegitimateFramMultiFit(r, o, alias)), 'HOLD_COLLISION', 'FRAM alternatives link the codes');
});

test('a multi-fit peer never masks a different colliding peer', () => {
  const { classifyApplicationCollision, isLegitimateFramMultiFit } = require('../scripts/hermes/apply-fram-ld-reconciliations.js');
  const facts = multiFitFacts();
  const mann = { ...peer('EL39999', 'TOYOTA', 'COROLLA IM', '01/17 → 12/18', '2ZR-FE', 'oil'), model_type: '1.8', source_origin: 'master', source_sku: 'W999' };
  assert.equal(classifyApplicationCollision(iM, 'oil', [iMPeer, mann], (r, o) => isLegitimateFramMultiFit(r, o, facts)), 'HOLD_COLLISION');
});

test('reconciliation main path wires the FRAM multi-fit guard from read-only facts', () => {
  assert.match(framReconcile, /v\.source_sku,v\.source_origin,v\.make/);
  assert.match(framReconcile, /loadFramMultiFitFacts\(client,multiFitPairs/);
  assert.match(framReconcile, /\(r,o\)=>isLegitimateFramMultiFit\(r,o,multiFitFacts\)/);
  const loader = framReconcile.slice(framReconcile.indexOf('async function loadFramMultiFitFacts'), framReconcile.indexOf('// Authority-level'));
  assert.doesNotMatch(loader, /INSERT|UPDATE|DELETE/);
});
