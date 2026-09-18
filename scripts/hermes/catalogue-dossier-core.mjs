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
