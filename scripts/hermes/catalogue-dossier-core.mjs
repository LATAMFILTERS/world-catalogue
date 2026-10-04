export const DOSSIER_AXES = [
  'identity',
  'technical_specs',
  'dimensions',
  'oem_codes',
  'cross_references',
  'applications'
];

export const RESOLVED_AXIS_STATUSES = new Set([
  'VERIFIED',
  'NOT_PUBLISHED_BY_SOURCE'
]);

export const HD_COMPETITOR_ONLY_BRANDS = new Set(['MANN FILTER','MANN-FILTER','FRAM']);

function brandKey(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g,' ');
}

function segment(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized === 'INDUSTRIAL_PROCESS' ? 'INDUSTRIAL' : normalized;
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value || '').trim();
}

export function normalizeDossier(raw = {}) {
  const dossier = {
    identity: raw.identity || {},
    technical_specs: raw.technical_specs || {},
    dimensions: raw.dimensions || {},
    oem_codes: raw.oem_codes || {},
    cross_references: raw.cross_references || {},
    applications: raw.applications || {},
    provenance: raw.provenance || {},
    consistency: raw.consistency || {}
  };
  return dossier;
}
export function validateAxis(name, axis = {}) {
  const status = text(axis.status).toUpperCase();
  const sourceUrls = arr(axis.source_urls).filter(Boolean);
  const records = arr(axis.records);
  const checkedSources = arr(axis.checked_sources).filter(Boolean);

  if (name === 'identity') {
    const ok = status === 'VERIFIED'
      && text(axis.manufacturer)
      && text(axis.source_code)
      && text(axis.product_type)
      && ['LIGHT_DUTY','HEAVY_DUTY','INDUSTRIAL'].includes(segment(axis.market_segment))
      && sourceUrls.length > 0;
    return { name, status, resolved:Boolean(ok), source_urls:sourceUrls, records };
  }

  if (!RESOLVED_AXIS_STATUSES.has(status)) {
    return { name, status, resolved:false, source_urls:sourceUrls, records };
  }

  if (status === 'VERIFIED') {
    return {
      name,
      status,
      resolved: sourceUrls.length > 0 && records.length > 0,
      source_urls: sourceUrls,
      records
    };
  }

  return {
    name,
    status,
    resolved: sourceUrls.length > 0 && checkedSources.length > 0,
    source_urls: sourceUrls,
    records
  };
}
export function assessDossier(raw = {}) {
  const dossier = normalizeDossier(raw);
  const axes = Object.fromEntries(
    DOSSIER_AXES.map(name => [name, validateAxis(name, dossier[name])])
  );

  const consistencyStatus = text(dossier.consistency?.status).toUpperCase();
  const conflicts = arr(dossier.consistency?.conflicts);
  const consistencyVerified = consistencyStatus === 'VERIFIED' && conflicts.length === 0;

  const provenanceSources = arr(dossier.provenance?.sources)
    .filter(x => x && text(x.url));
  const provenanceVerified = provenanceSources.length > 0;

  const unresolvedAxes = DOSSIER_AXES.filter(name => !axes[name].resolved);
  const complete = unresolvedAxes.length === 0
    && consistencyVerified
    && provenanceVerified;

  return {
    complete,
    status: complete ? 'DOSSIER_COMPLETE' : 'DOSSIER_INCOMPLETE',
    axes,
    unresolved_axes: unresolvedAxes,
    consistency_verified: consistencyVerified,
    provenance_verified: provenanceVerified,
    conflicts,
    provenance_sources: provenanceSources
  };
}

export function canPromoteCanonicalIdentity(raw = {}) {
  const assessment = assessDossier(raw);
  return assessment.complete && assessment.axes.identity.status === 'VERIFIED';
}

export function resolutionDisposition(raw = {}, options = {}) {
  const assessment = assessDossier(raw);
  const attempts = Math.max(0, Number(options.research_attempts || 0));
  const maxAttempts = Math.max(1, Number(options.max_research_attempts || 3));
  const identityVerified = assessment.axes.identity.status === 'VERIFIED' && assessment.axes.identity.resolved;
  const canonicalEligible = options.canonical_eligible !== false;
  const conflicts = assessment.conflicts.length > 0 || String(raw?.consistency?.status || '').toUpperCase() === 'CONFLICTING';

  if (identityVerified && canonicalEligible) return { action: 'CONTINUE_RESOLUTION', reason: 'IDENTITY_VERIFIED', attempts, max_attempts: maxAttempts };
  if (conflicts) return { action: 'CONTINUE_RESOLUTION', reason: 'CONFLICTING_EVIDENCE_REQUIRES_MORE_RESEARCH', attempts, max_attempts: maxAttempts };
  if (attempts < maxAttempts) return { action: 'CONTINUE_RESOLUTION', reason: 'RESEARCH_ATTEMPTS_REMAIN', attempts, max_attempts: maxAttempts };
  return {
    action: 'DISCARD_SKU',
    reason: identityVerified ? 'NO_CANONICAL_IDENTITY_AFTER_RESEARCH' : 'NO_DEFENSIBLE_IDENTITY_AFTER_RESEARCH',
    attempts,
    max_attempts: maxAttempts
  };
}

export function canonicalRoleForDossier(item = {}, raw = {}) {
  const dossier=normalizeDossier(raw);
  const brand=brandKey(dossier.identity?.manufacturer);
  const productSegment=segment(dossier.identity?.market_segment);
  const duty=segment(item.duty);
  const competitorOnly=HD_COMPETITOR_ONLY_BRANDS.has(brand);
  if(!['LIGHT_DUTY','HEAVY_DUTY','INDUSTRIAL'].includes(productSegment)) return {role:'REVIEW_REQUIRED',reason:'product-segment-unverified'};
  if(duty && productSegment!==duty) {
    if(competitorOnly && productSegment==='HEAVY_DUTY') return {role:'COMPETITOR_CODE',reason:'confirmed-hd-mann-fram-candidate-cannot-be-ld-base',duty_review_required:true,duty,product_segment:productSegment};
    return {role:'REVIEW_REQUIRED',reason:'duty-segment-mismatch',duty,product_segment:productSegment};
  }
  if(duty==='HEAVY_DUTY' && competitorOnly) return {role:'COMPETITOR_CODE',reason:'mann-fram-are-competitor-codes-in-hd'};
  if(duty==='LIGHT_DUTY' && competitorOnly) return {role:'CANONICAL_BASE',reason:'mann-fram-allowed-as-ld-codigo-base'};
  return {role:'CANONICAL_BASE',reason:'canonical-source-authority'};
}
