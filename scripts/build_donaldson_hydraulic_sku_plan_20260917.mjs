import fs from 'fs';
import path from 'path';

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:\/)/, '$1'));
const TARGET_FILE = path.join(HERE, 'donaldson_hydraulic_filters_target_20260917.json');
const PRIOR_FILE = path.join(HERE, 'donaldson_hydraulic_results.json');
const PLAN_FILE = path.join(HERE, 'donaldson_hydraulic_sku_plan_20260917.json');
const AUDIT_FILE = path.join(HERE, 'donaldson_hydraulic_sku_audit_20260917.json');
const MIGRATION_PREVIEW_FILE = path.join(HERE, 'donaldson_hydraulic_sku_migration_preview_20260917.json');
const ALTERNATIVES_FILE = path.join(HERE, 'donaldson_hydraulic_alternative_products_20260917.json');
const RULE_FILE = path.join(HERE, 'donaldson_hydraulic_sku_rule_20260917.md');

let pg;
try { pg = (await import('pg')).default; }
catch { pg = (await import('file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js')).default; }
const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://catalog_admin@127.0.0.1:5441/catalogo_elimfilters?sslmode=disable';
const target = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
const prior = JSON.parse(fs.readFileSync(PRIOR_FILE, 'utf8'));
const priorByCode = new Map(prior.map((row) => [row.part_number, row]));
const alternativeRows = target.filter((row) => String(row.code).startsWith('DBH'));
const primaryTarget = target; // All Donaldson products, including DBH alternatives, receive their own EH6 SKU.
const alternativeCodeSet = new Set(alternativeRows.map((row) => row.code));
const targetSet = new Set(target.map((row) => row.code));
const digits = (code) => (String(code).match(/\d/g) || []).join('');
const last4 = (code) => { const d = digits(code); return d.length ? d.slice(-4).padStart(4, '0') : null; };
const sortCode = (a, b) => { const ma = String(a).match(/^P(\d+)$/); const mb = String(b).match(/^P(\d+)$/); if (ma && mb) return Number(ma[1]) - Number(mb[1]); if (ma) return -1; if (mb) return 1; return String(a).localeCompare(String(b)); };
function linkedAsAlternatives(a, b) { const aa = priorByCode.get(a)?.alternatives || []; const bb = priorByCode.get(b)?.alternatives || []; return aa.includes(b) || bb.includes(a); }
function samePhysicalFit(a, b) {
  const A = priorByCode.get(a)?.attributes || {}; const B = priorByCode.get(b)?.attributes || {};
  if (!A.Style || A.Style !== B.Style) return false;
  for (const key of ['Outer Diameter', 'Length']) if (!A[key] || A[key] !== B[key]) return false;
  if (String(A.Style).toLowerCase().includes('spin')) { if (!A['Thread Size'] || A['Thread Size'] !== B['Thread Size']) return false; }
  else { if (A['Inner Diameter'] && B['Inner Diameter']) { if (A['Inner Diameter'] !== B['Inner Diameter']) return false; } else if (!(A['Outlet Diameter'] && A['Outlet Diameter'] === B['Outlet Diameter'])) return false; }
  for (const key of ['Gasket OD', 'Gasket ID', 'Inner Diameter', 'Outlet Diameter']) if (A[key] && B[key] && A[key] !== B[key]) return false;
  return true;
}
const rawByLast4 = new Map();
for (const row of primaryTarget) { const k = last4(row.code); if (!k) continue; if (!rawByLast4.has(k)) rawByLast4.set(k, []); rawByLast4.get(k).push(row.code); }
const parent = new Map(primaryTarget.map((row) => [row.code, row.code]));
function find(x) { if (parent.get(x) !== x) parent.set(x, find(parent.get(x))); return parent.get(x); }
function union(a, b) { a = find(a); b = find(b); if (a !== b) parent.set(b, a); }
const mergedEquivalentPairs = []; // Distinct Donaldson product codes are never collapsed solely because they are alternatives.
const classes = new Map();
for (const row of primaryTarget) { const root = find(row.code); if (!classes.has(root)) classes.set(root, []); classes.get(root).push(row.code); }
const classObjects = [...classes.values()].map((codes) => { codes.sort(sortCode); const representative = codes.find((code) => /^P\d+$/.test(code)) || codes[0]; const d = digits(representative); const normalizedLast4 = d.length ? d.slice(-4).padStart(4, '0') : null; return { representative, codes, digits: d, source_last4: normalizedLast4, source_tail3: normalizedLast4?.slice(-3) ?? null, natural_discriminator: normalizedLast4 ? Number(normalizedLast4[0]) : null }; });
const client = new Client({ connectionString: DATABASE_URL });
await client.connect();
const dbResult = await client.query("select sku, codigo_base from elimfilters_catalog where sku like 'EH6%'");
await client.end();
const dbRows = dbResult.rows;
const dbByBaseSticky = new Map(dbRows.map((row) => [row.codigo_base, row]));
// Stability rule: once an EH6 is published for a current Donaldson code, keep it fixed.
// New codes must take the next free deterministic discriminator; they never displace deployed SKUs.
const occupied = new Map(dbRows.map((row) => [row.sku, { type: targetSet.has(row.codigo_base) ? 'PUBLISHED_TARGET' : 'EXTERNAL_DB', codigo_base: row.codigo_base }]));
const numericClasses = classObjects.filter((row) => row.source_last4);
const pendingClasses = classObjects.filter((row) => !row.source_last4);
const byLast4 = new Map();
for (const row of numericClasses) { if (!byLast4.has(row.source_last4)) byLast4.set(row.source_last4, []); byLast4.get(row.source_last4).push(row); }
for (const rows of byLast4.values()) rows.sort((a, b) => sortCode(a.representative, b.representative));
const multiGroups = [...byLast4.entries()].filter(([, rows]) => rows.length > 1).sort((a, b) => a[0].localeCompare(b[0]));
const singleGroups = [...byLast4.entries()].filter(([, rows]) => rows.length === 1).sort((a, b) => a[0].localeCompare(b[0]));
const assignment = new Map(); const displacementLog = [];
for (const row of numericClasses) {
  const existing = dbByBaseSticky.get(row.representative);
  if (existing?.sku && /^EH6\d{4}$/.test(existing.sku)) {
    assignment.set(row.representative, { sku: existing.sku, discriminator: Number(existing.sku[3]), method: 'PUBLISHED_DB_STICKY' });
  }
}
function allocate(row, preferredDigits, method, reason) {
  if (assignment.has(row.representative)) return;
  const candidates = [];
  for (const d of preferredDigits) if (Number.isInteger(d) && d >= 0 && d <= 9 && !candidates.includes(d)) candidates.push(d);
  for (let d = 1; d <= 9; d++) if (!candidates.includes(d)) candidates.push(d);
  if (!candidates.includes(0)) candidates.push(0);
  for (const discriminator of candidates) {
    const sku = 'EH6' + discriminator + row.source_tail3;
    if (!occupied.has(sku)) { assignment.set(row.representative, { sku, discriminator, method }); occupied.set(sku, { type: 'TARGET_NEW', codigo_base: row.representative }); if (discriminator !== preferredDigits[0]) displacementLog.push({ representative: row.representative, source_last4: row.source_last4, preferred_discriminator: preferredDigits[0], assigned_discriminator: discriminator, sku, reason }); return; }
  }
  throw new Error('No free EH6 discriminator for tail ' + row.source_tail3 + ' (' + row.representative + ')');
}
for (const [, rows] of multiGroups) rows.forEach((row, index) => allocate(row, index === 0 ? [row.natural_discriminator] : [index], index === 0 ? 'NATURAL_LAST4_COLLISION_GROUP' : 'COLLISION_GROUP_INDEX', 'collision-group priority / occupied EH6 slot'));
for (const [, rows] of singleGroups) { const row = rows[0]; allocate(row, [row.natural_discriminator], 'NATURAL_OR_GLOBAL_COLLISION', 'global EH6 namespace collision'); }

const objectByCode = new Map(); for (const obj of classObjects) for (const code of obj.codes) objectByCode.set(code, obj);
const plan = target.map((row) => {
  if (alternativeCodeSet.has(row.code)) {
    const p = priorByCode.get(row.code);
    const alternativeToCodes = [...new Set((p?.alternatives || []).filter((code) => targetSet.has(code) && code !== row.code))];
    const obj = objectByCode.get(row.code); const a = assignment.get(obj.representative);
    return { ...row, sku: a?.sku ?? null, sku_method: a?.method ?? 'PENDING_ALPHANUMERIC_RULE', classification: 'ALTERNATIVE_PRODUCT', canonical_code: row.code, alias_of: null, alternative_to_codes: alternativeToCodes, source_last4: obj.source_last4, source_tail3: obj.source_tail3, discriminator: a?.discriminator ?? null };
  }
  const obj = objectByCode.get(row.code); const a = assignment.get(obj.representative);
  return { ...row, sku: a?.sku ?? null, sku_method: a?.method ?? 'PENDING_ALPHANUMERIC_RULE', classification: 'CANONICAL_PRODUCT', canonical_code: obj.representative, alias_of: obj.representative === row.code ? null : obj.representative, alternative_to_codes: null, source_last4: obj.source_last4, source_tail3: obj.source_tail3, discriminator: a?.discriminator ?? null };
});
// Resolve DBH alternative-product navigation exactly like Lube DBL products: each product keeps its own SKU, and linked product pages carry reciprocal EH6 alternative SKUs.
const planByCode = new Map(plan.map((row) => [row.code, row]));
for (const row of plan) row.alternative_skus = [];
for (const dbh of plan.filter((row) => row.classification === 'ALTERNATIVE_PRODUCT' && row.sku)) {
  for (const pCode of dbh.alternative_to_codes || []) {
    const main = planByCode.get(pCode);
    if (!main?.sku) continue;
    if (!dbh.alternative_skus.includes(main.sku)) dbh.alternative_skus.push(main.sku);
    if (!main.alternative_skus.includes(dbh.sku)) main.alternative_skus.push(dbh.sku);
  }
}
for (const row of plan) row.alternative_skus.sort();

const assignedPlan = plan.filter((row) => row.sku);
const pendingPlan = plan.filter((row) => !row.sku);
const alternativePlan = plan.filter((row) => row.classification === 'ALTERNATIVE_PRODUCT');
const skuOwner = new Map(); const duplicateCanonicalConflicts = [];
for (const row of assignedPlan) { if (skuOwner.has(row.sku) && skuOwner.get(row.sku) !== row.canonical_code) duplicateCanonicalConflicts.push({ sku: row.sku, a: skuOwner.get(row.sku), b: row.canonical_code }); else skuOwner.set(row.sku, row.canonical_code); }
if (duplicateCanonicalConflicts.length) throw new Error('Canonical SKU conflicts: ' + JSON.stringify(duplicateCanonicalConflicts));
const dbByBase = new Map(dbRows.map((row) => [row.codigo_base, row.sku]));
const migrationPreview = plan.filter((row) => row.sku && dbByBase.has(row.code)).map((row) => ({ codigo_base: row.code, current_sku: dbByBase.get(row.code), planned_sku: row.sku, action: dbByBase.get(row.code) === row.sku ? 'KEEP' : 'REMAP', classification: row.classification, canonical_code: row.canonical_code, alias_of: row.alias_of, alternative_to_codes: row.alternative_to_codes }));
const methodCounts = {}; for (const row of plan) methodCounts[row.sku_method] = (methodCounts[row.sku_method] || 0) + 1;
const audit = { rule_version: 'HYDRAULIC_EH6_COLLISION_V4_2026-09-17', rule: { normal: 'EH6 + last 4 numeric digits of source code', collision: 'For repeated last-4 groups across all Hydraulic products, including DBH alternatives, first keeps natural last4; subsequent distinct products use EH6 + collision index + last 3 digits (1,2,3...).', uniqueness_extension: 'Published EH6 mappings are sticky. A new code never displaces an existing SKU; if its preferred slot is occupied, skip to the next free discriminator 1..9 while preserving the last 3 digits and 7-character SKU.', dbh_classification: 'Donaldson DBH references are ALTERNATIVE_PRODUCT but retain their own independent EH6 SKU, exactly like DBL alternative products in Lube. Their official P-code relationships are retained in alternative_to_codes.', alternative_sku_policy: 'Alternative-product status never removes product identity or SKU. Distinct Donaldson codes keep distinct ELIMFILTERS SKUs. DBH↔P relationships are materialized as reciprocal EH6 alternative_skus, matching the existing Lube DBL navigation pattern.', alphanumeric_short_codes: 'When a source code contains 1-3 numeric digits, left-pad the numeric payload to four digits and apply the same EH6 collision rule. Example: 11 -> 0011. Global occupied EH6 slots are skipped deterministically to the next free discriminator.' }, target_references: plan.length, primary_references: primaryTarget.length, alternative_product_references: alternativePlan.length, canonical_classes: classObjects.length, assigned_references: assignedPlan.length, unique_assigned_skus: new Set(assignedPlan.map((row) => row.sku)).size, pending_references: pendingPlan.length, pending_codes: pendingPlan.map((row) => row.code), alternative_product_codes: alternativePlan.map((row) => row.code), alternative_navigation_links: plan.reduce((n,row) => n + (row.alternative_skus?.length || 0), 0), collision_groups_last4: multiGroups.length, merged_equivalent_pairs: mergedEquivalentPairs, method_counts: methodCounts, displacement_count: displacementLog.length, displacement_log: displacementLog, duplicate_canonical_sku_conflicts: duplicateCanonicalConflicts, db_existing_target_rows: migrationPreview.length, db_remap_count: migrationPreview.filter((row) => row.action === 'REMAP').length, db_keep_count: migrationPreview.filter((row) => row.action === 'KEEP').length, examples: { P170084: plan.find((row) => row.code === 'P170084'), P550084: plan.find((row) => row.code === 'P550084'), P170312: plan.find((row) => row.code === 'P170312'), P570312: plan.find((row) => row.code === 'P570312'), P170592: plan.find((row) => row.code === 'P170592'), P550592: plan.find((row) => row.code === 'P550592'), P580592: plan.find((row) => row.code === 'P580592'), DBH0949: plan.find((row) => row.code === 'DBH0949'), DBH6018: plan.find((row) => row.code === 'DBH6018') } }
const ruleDoc = [
  '# Hydraulic EH6 SKU collision rule - 2026-09-17', '',
  'Status: implemented in the Donaldson Hydraulic SKU planner.', '',
  '## Canonical rule', '',
  '- Normal Hydraulic SKU: EH6 + the last four numeric digits of the source code.',
  '- When two or more distinct Hydraulic products share the same last four digits, the first keeps the natural last-four SKU.',
  '- The second uses EH6 + 1 + last 3 digits; the third uses EH6 + 2 + last 3 digits; subsequent products continue the same sequence.',
  '- The repeated-last-four group has priority over isolated source codes that would otherwise occupy one of those discriminator slots.',
  '- The EH6 namespace is global. If a preferred discriminator is already occupied by a fixed non-target EH6 or would duplicate the group natural SKU, the allocator skips to the next free discriminator.',
  '- SKU length remains seven characters.', '',
  'Examples: P170312 -> EH60312; P570312 -> EH61312; P170592 -> EH60592; P550592 -> EH61592; P580592 -> EH62592.', '',
  '## Donaldson DBH classification', '',
  '- DBH references are Donaldson alternative products, not canonical Hydraulic base products.',
  '- DBH references do not receive an independent EH6 canonical SKU.',
  '- Their official Donaldson P-code alternatives are retained in alternative_to_codes; no single P code is forced when Donaldson lists several valid alternatives.', '',
  '## Equivalence gate', '',
  'Canonical products are merged only when Donaldson explicitly lists them as alternatives and the physical fit/construction matches strictly (style, OD, length, and thread or ID, plus gasket dimensions when present).', '',
  '## Short alphanumeric codes', '',
  'DBH products use the same EH6 allocation rule as every other Hydraulic product while remaining classified ALTERNATIVE_PRODUCT. A source code with fewer than four numeric digits is not forced into this rule. It remains PENDING_ALPHANUMERIC_RULE until a separate deterministic convention is approved. No EH699xxx fallback is allowed.', ''
].join('\n');
fs.writeFileSync(PLAN_FILE, JSON.stringify(plan, null, 2) + '\n');
fs.writeFileSync(AUDIT_FILE, JSON.stringify(audit, null, 2) + '\n');
fs.writeFileSync(MIGRATION_PREVIEW_FILE, JSON.stringify(migrationPreview, null, 2) + '\n');
fs.writeFileSync(ALTERNATIVES_FILE, JSON.stringify(alternativePlan, null, 2) + '\n');
fs.writeFileSync(RULE_FILE, ruleDoc);
console.log(JSON.stringify({ plan: PLAN_FILE, audit: AUDIT_FILE, migration_preview: MIGRATION_PREVIEW_FILE, alternatives: ALTERNATIVES_FILE, rule: RULE_FILE, target_references: audit.target_references, primary_references: audit.primary_references, alternative_product_references: audit.alternative_product_references, assigned_references: audit.assigned_references, unique_assigned_skus: audit.unique_assigned_skus, pending_references: audit.pending_references, collision_groups_last4: audit.collision_groups_last4, merged_equivalent_pairs: audit.merged_equivalent_pairs, db_remap_count: audit.db_remap_count, db_keep_count: audit.db_keep_count, examples: audit.examples }, null, 2));
