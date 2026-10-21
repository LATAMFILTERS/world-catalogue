#!/usr/bin/env node
// HERMES — SKU proposals from finished OEM research (zero cost, no LLM).
//
// Whoever completes an OEM research case (Codex, Claude, a person) drops one
// `hermes.sku_research.v1` JSON file per equipment into <state>/sku-research/.
// This script applies the canonical codigo_base policy to every filter position
// and proposes the SKU: READY_FOR_AUTHORIZATION, ALREADY_IN_CATALOGUE,
// STOP_REVIEW or INCOMPLETE. It never writes the catalogue: Victor authorizes
// on Thursday, and creation stays in the governed catalogue process.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { normalizeCode, refsFrom, preferredSkuFromCommercialCode, planHdSkuFromVerifiedAuthorities } = require('../../lib/catalog-codigo-base-policy');

export const SCHEMA = 'hermes.sku_research.v1';
// ET9 (Parker/Racor turbines, Fleetguard processors) and kits follow operator rulings, not this generic chain.
export const PREFIXES = {
  HEAVY_DUTY: ['EA1', 'EA2', 'EC1', 'ED4', 'EF9', 'EH6', 'EL8', 'ES9', 'EW7'],
  LIGHT_DUTY: ['EA3', 'EC3', 'EL3', 'EF3']
};
const REFS = ['oem', 'donaldson', 'fleetguard', 'mann', 'fram'];
const sha = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
const refOk = (r) => Boolean(r && normalizeCode(r.code) && /^https:\/\//.test(r.evidence_url || '') && /^[a-f0-9]{64}$/i.test(r.evidence_sha256 || ''));

export function validateResearch(doc) {
  const errors = [];
  if (doc?.schema !== SCHEMA) errors.push(`schema must be ${SCHEMA}`);
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(doc?.case_id || '')) errors.push('case_id must be lowercase kebab-case');
  if (!String(doc?.equipment?.brand || '').trim() || !String(doc?.equipment?.model || '').trim()) errors.push('equipment.brand and equipment.model are required');
  if (!String(doc?.researched_by || '').trim() || Number.isNaN(Date.parse(doc?.researched_at || ''))) errors.push('researched_by and researched_at are required');
  if (!Array.isArray(doc?.positions) || !doc.positions.length) errors.push('positions must be a non-empty array');
  (doc?.positions || []).forEach((p, i) => {
    const at = `positions[${i}]`;
    if (!String(p?.position || '').trim()) errors.push(`${at}.position is required`);
    if (!PREFIXES[p?.duty]) errors.push(`${at}.duty must be HEAVY_DUTY or LIGHT_DUTY`);
    else if (!PREFIXES[p.duty].includes(p.prefix)) errors.push(`${at}.prefix ${p.prefix} is not a ${p.duty} prefix`);
    if (p?.duty === 'LIGHT_DUTY' && !['EUROPEAN', 'NON_EUROPEAN'].includes(p.origin)) errors.push(`${at}.origin must be EUROPEAN or NON_EUROPEAN`);
    if (!refOk(p?.oem)) errors.push(`${at}.oem needs code, https evidence_url and evidence_sha256`);
    for (const k of REFS.slice(1)) if (p?.[k] && !refOk(p[k])) errors.push(`${at}.${k} needs code, https evidence_url and evidence_sha256`);
  });
  return errors;
}

/**
 * sku -> codigo_base; codigo_base -> SKUs (identity); OEM code -> SKUs (cross-reference only:
 * one OEM code often sits on several SKUs, so it never proves coverage by itself).
 */
export function indexCatalogue(rows) {
  const occupied = new Map(); const byBase = new Map(); const byOem = new Map();
  const add = (map, code, sku) => { const k = normalizeCode(code); if (k && !(map.get(k) || []).includes(sku)) map.set(k, [...(map.get(k) || []), sku]); };
  for (const r of rows) {
    const sku = String(r.sku || '').trim().toUpperCase();
    if (!sku) continue;
    occupied.set(sku, r.codigo_base || '');
    add(byBase, r.codigo_base, sku);
    for (const x of refsFrom(r.oem_codes)) add(byOem, x.code, sku);
  }
  return { occupied, byBase, byOem };
}

// First candidate whose natural SKU is free (or already carries the same code); else STOP_REVIEW.
function firstFreeSku(prefix, candidates, occupied) {
  const attempts = [];
  for (const c of candidates) {
    const sku = preferredSkuFromCommercialCode(prefix, c.code);
    if (!sku) { attempts.push({ ...c, sku: null, status: 'INVALID_NUMERIC_PAYLOAD' }); continue; }
    const taken = occupied.get(sku);
    if (!taken || normalizeCode(taken) === normalizeCode(c.code)) return { status: taken ? 'REUSE_EXISTING_SKU' : 'READY', sku, selected_manufacturer: c.manufacturer, selected_code: c.code, selected_source_column: c.source_column, attempts: [...attempts, { ...c, sku, status: taken ? 'REUSE_EXISTING_SKU' : 'AVAILABLE' }] };
    attempts.push({ ...c, sku, status: 'SKU_COLLISION', occupied_by_code: taken });
  }
  return { status: 'STOP_REVIEW', sku: null, attempts };
}

function planPosition(p, { occupied }) {
  if (p.duty === 'HEAVY_DUTY') {
    // A missing reference is never proof the manufacturer does not make the filter.
    if (!p.donaldson && p.donaldson_absence_verified !== true) return { state: 'INCOMPLETE', reasons: ['DONALDSON_NOT_RESEARCHED'] };
    const fleetguardResearched = Boolean(p.fleetguard) || p.fleetguard_absence_verified === true;
    if (!p.donaldson && !fleetguardResearched) return { state: 'INCOMPLETE', reasons: ['FLEETGUARD_NOT_RESEARCHED'] };
    return planHdSkuFromVerifiedAuthorities({ prefix: p.prefix, verifiedDonaldsonCode: p.donaldson?.code, verifiedFleetguardCode: p.fleetguard?.code,
      verifiedOemCode: fleetguardResearched ? p.oem.code : null, occupiedSkus: occupied });
  }
  const [name, primary] = p.origin === 'EUROPEAN' ? ['MANN-FILTER', p.mann] : ['FRAM', p.fram];
  if (!primary && p.primary_absence_verified !== true) return { state: 'INCOMPLETE', reasons: [`${name.replace('-', '_')}_NOT_RESEARCHED`] };
  // OEM only when the regional maker does not make it, or (MANN only) both its windows are taken.
  const oemAllowed = !primary || p.origin === 'EUROPEAN';
  return firstFreeSku(p.prefix, [
    ...(primary ? [{ manufacturer: name, code: primary.code, source_column: 'COMPETITOR_CODES' }] : []),
    ...(oemAllowed ? [{ manufacturer: 'OEM', code: p.oem.code, source_column: 'OEM_CODES' }] : [])
  ], occupied);
}

export function proposePosition(doc, p, index) {
  const samePrefix = (skus = []) => skus.filter((s) => s.startsWith(p.prefix));
  // Covered = a researched code is already the codigo_base of a SKU in the same family.
  const known = REFS.map((k) => p[k]?.code).find((code) => samePrefix(index.byBase.get(normalizeCode(code))).length);
  const plan = known ? { status: 'REUSE_EXISTING_SKU', sku: samePrefix(index.byBase.get(normalizeCode(known)))[0], selected_code: known } : planPosition(p, index);
  let state = plan.state || { READY: 'READY_FOR_AUTHORIZATION', REUSE_EXISTING_SKU: 'ALREADY_IN_CATALOGUE', STOP_REVIEW: 'STOP_REVIEW' }[plan.status];
  const reasons = plan.reasons || (plan.status === 'STOP_REVIEW'
    ? (plan.attempts || []).map((a) => `${a.manufacturer} ${a.code} -> ${a.sku || '?'}: ${a.status}${a.occupied_by_code ? ` (${a.occupied_by_code})` : ''}`).concat(plan.attempts?.length ? [] : ['NO_ELIGIBLE_VERIFIED_CODE'])
    : []);
  // The OEM code already cross-referenced on SKUs: same family = possible duplicate (human decides); other families = warning only.
  const oemSkus = index.byOem.get(normalizeCode(p.oem.code)) || [];
  const warnings = oemSkus.filter((s) => !s.startsWith(p.prefix)).length ? [`OEM ${p.oem.code} also referenced by other families: ${oemSkus.filter((s) => !s.startsWith(p.prefix)).join(', ')}`] : [];
  if (state === 'READY_FOR_AUTHORIZATION' && samePrefix(oemSkus).length) { state = 'STOP_REVIEW'; reasons.push(`POSSIBLE_DUPLICATE: OEM ${p.oem.code} already referenced by ${samePrefix(oemSkus).join(', ')}`); }
  return {
    entity_code: `HERMES_SKU_${sha(`${doc.case_id}|${p.position}|${p.oem.code}`).slice(0, 12).toUpperCase()}`,
    approval_required: true, case_id: doc.case_id, equipment: doc.equipment, position: p.position, duty: p.duty, prefix: p.prefix,
    oem_code: p.oem.code, state, proposed_sku: plan.sku || null, codigo_base: plan.selected_code || null,
    base_manufacturer: plan.selected_manufacturer || null, base_source_column: plan.selected_source_column || null, reasons, warnings,
    evidence: REFS.filter((k) => p[k]).map((k) => ({ ref: k, code: p[k].code, evidence_url: p[k].evidence_url, evidence_sha256: p[k].evidence_sha256 })),
    researched_by: doc.researched_by, researched_at: doc.researched_at
  };
}

export function buildSkuProposals(docs, catalogueRows) {
  const index = indexCatalogue(catalogueRows);
  const proposals = []; const invalid = [];
  for (const { file, doc } of docs) {
    const errors = validateResearch(doc);
    if (errors.length) { invalid.push({ file, errors }); continue; }
    for (const p of doc.positions) proposals.push(proposePosition(doc, p, index));
  }
  // Two positions proposing the same new SKU in one batch: neither is authorizable until a human orders them.
  const counts = new Map();
  for (const p of proposals) if (p.state === 'READY_FOR_AUTHORIZATION') counts.set(p.proposed_sku, (counts.get(p.proposed_sku) || 0) + 1);
  for (const p of proposals) if (p.state === 'READY_FOR_AUTHORIZATION' && counts.get(p.proposed_sku) > 1) { p.state = 'STOP_REVIEW'; p.reasons.push(`BATCH_COLLISION: ${p.proposed_sku} proposed by ${counts.get(p.proposed_sku)} positions`); }
  return { proposals, invalid };
}

export function readResearchInbox(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const file = path.join(dir, f);
    try { return { file: f, doc: JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch (error) { return { file: f, doc: { parse_error: error.message } }; }
  });
}

export async function readCatalogueRows(env = process.env) {
  const { Pool } = require('pg');
  const connectionString = String(env.CATALOG_DATABASE_URL || '').trim();
  if (!connectionString) throw new Error('CATALOG_DATABASE_URL is required to check SKU collisions');
  const pool = new Pool({ connectionString, max: 1, ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false } });
  try { return (await pool.query('SELECT sku, codigo_base, oem_codes FROM public.elimfilters_catalog')).rows; } finally { await pool.end(); }
}

export async function runSkuProposals({ stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state', loadCatalogue = readCatalogueRows } = {}) {
  const docs = readResearchInbox(path.resolve(stateRoot, 'sku-research'));
  const decided = path.resolve(stateRoot, 'sku-decisions');
  const result = docs.length ? buildSkuProposals(docs, await loadCatalogue()) : { proposals: [], invalid: [] };
  // A proposal Victor already authorized or rejected is not asked again.
  result.proposals = result.proposals.filter((p) => !fs.existsSync(path.join(decided, `${p.entity_code}.json`)));
  const out = { generated_at: new Date().toISOString(), research_files: docs.length, ...result };
  fs.mkdirSync(path.resolve(stateRoot), { recursive: true });
  fs.writeFileSync(path.resolve(stateRoot, 'sku-proposals.json'), `${JSON.stringify(out, null, 2)}\n`);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const out = await runSkuProposals();
  const by = (s) => out.proposals.filter((p) => p.state === s).length;
  console.log(`[HERMES sku] ${JSON.stringify({ research_files: out.research_files, invalid: out.invalid.length, ready: by('READY_FOR_AUTHORIZATION'), existing: by('ALREADY_IN_CATALOGUE'), stop_review: by('STOP_REVIEW'), incomplete: by('INCOMPLETE') })}`);
}
