'use strict';

const { applicationPayloadHash } = require('./catalog-application-governance');
const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function segment(value) {
  const text = norm(value);
  if (['LD','LIGHTDUTY','AUTOMOTIVE'].includes(text)) return 'LIGHT_DUTY';
  if (['HD','HEAVYDUTY','INDUSTRIAL'].includes(text)) return 'HEAVY_DUTY';
  return null;
}
function requestedSegment(text) {
  if (/\b(?:HD|heavy[ -]?duty|pesad[oa]s?|industrial|camiones?|trucks?)\b/i.test(text)) return 'HEAVY_DUTY';
  if (/\b(?:LD|light[ -]?duty|livian[oa]s?|liger[oa]s?|autom[oó]vil|automotriz|passenger)\b/i.test(text)) return 'LIGHT_DUTY';
  return null;
}
function requestedPosition(text) {
  const patterns = { bypass: /\b(?:by[ -]?pass|derivaci[oó]n)\b/i, full_flow: /\b(?:full[ -]?flow|flujo completo)\b/i, secondary_safety: /\b(?:seguridad|safety|air secondary)\b/i, primary_outer: /\b(?:aire primario|primary air|outer)\b/i, primary_water_separator: /\b(?:separador de agua|water separator|combustible primario)\b/i, secondary_final: /\b(?:combustible secundario|final fuel|secondary fuel)\b/i, suction: /\b(?:succi[oó]n|suction)\b/i, return: /\b(?:retorno|return)\b/i };
  return Object.entries(patterns).find(([,pattern]) => pattern.test(text))?.[0] || null;
}
function yearMatches(entry, year) {
  if (!year) return true;
  const exact = String(entry.year || '').trim();
  if (Number(exact) === Number(year)) return true;
  const range = exact.match(/^(\d{4})\s*[-/]\s*(\d{4})$/);
  const from = Number(entry.year_from || entry.from_year || range?.[1]);
  const to = Number(entry.year_to || entry.to_year || range?.[2]);
  return Boolean(from && to && from <= Number(year) && to >= Number(year));
}
function applicationMatchesRequest(entry, context = {}) {
  if (!entry || typeof entry !== 'object') return false;
  const make = norm(entry.canonical_make || entry.make || entry.manufacturer || entry.brand);
  const models = [entry.canonical_model,entry.model_family,entry.model,entry.model_type,entry.equipment,entry.vehicle].map(norm).filter(Boolean);
  if (!context.brand || !context.model || make !== norm(context.brand) || !models.includes(norm(context.model))) return false;
  if (!yearMatches(entry, context.year)) return false;
  const engine = norm([entry.engine_code,entry.engine,entry.engine_model,entry.motor,entry.engine_displacement].filter(Boolean).join(' '));
  if (context.engine && !engine.includes(norm(context.engine))) return false;
  const position = norm(entry.service_role || entry.filter_position || entry.position);
  if (context.position && position !== norm(context.position)) return false;
  return true;
}
function approvedApplications(product, context = {}) {
  const duty = segment(product.duty);
  if (!duty || (context.duty && duty !== segment(context.duty))) return [];
  const matched = [];
  // Relational LD rows must carry the source and matching verified ledger entry.
  if (duty === 'LIGHT_DUTY') {
    for (const entry of product.protocol_relational_applications || []) {
      if (entry.evidence_status !== 'VERIFIED' || !entry.evidence_authority || !entry.evidence_source_url || !entry.evidence_payload_hash || !entry.evidence_checked_at || entry.ledger_verified !== true) continue;
      if (applicationMatchesRequest(entry, context)) matched.push(entry);
    }
  }
  // JSON applications are governed by the existing payload hash and evidence ledger.
  const field = duty === 'HEAVY_DUTY' ? 'equipment_applications' : 'vehicle_applications';
  const kind = duty === 'HEAVY_DUTY' ? 'EQUIPMENT' : 'VEHICLE';
  const entries = Array.isArray(product[field]) ? product[field] : [];
  const hash = applicationPayloadHash(entries);
  const ledger = (product.protocol_application_evidence || []).find(e =>
    e.application_kind === kind && e.verified === true && e.payload_hash === hash && e.evidence_authority && e.source_url && e.verified_at);
  if (ledger) for (const entry of entries) {
    if (applicationMatchesRequest(entry, context)) matched.push({ ...entry, evidence_status: 'VERIFIED', evidence_authority: ledger.evidence_authority, evidence_source_url: ledger.source_url });
  }
  return matched;
}
function qualifyApplicationProduct(product, context) {
  const apps = approvedApplications(product, context);
  if (!apps.length) return null;
  if (!context.duty && new Set(apps.map(a => segment(a.duty) || segment(product.duty))).size !== 1) return null;
  return { ...product, validated_applications: apps, protocol_claim: 'APPLICATION_CONFIRMED', protocol_application_context: context };
}
function approvedApplicationsForDisplay(product) {
  const field = segment(product.duty) === 'HEAVY_DUTY' ? 'equipment_applications' : 'vehicle_applications';
  const kind = field === 'equipment_applications' ? 'EQUIPMENT' : 'VEHICLE';
  const entries = Array.isArray(product[field]) ? product[field] : [];
  const hash = applicationPayloadHash(entries);
  return (product.protocol_application_evidence || []).some(e => e.application_kind === kind && e.verified === true && e.payload_hash === hash && e.evidence_authority && e.source_url && e.verified_at) ? entries : [];
}
module.exports = { norm, segment, requestedSegment, requestedPosition, yearMatches, applicationMatchesRequest, approvedApplications, qualifyApplicationProduct, approvedApplicationsForDisplay };
