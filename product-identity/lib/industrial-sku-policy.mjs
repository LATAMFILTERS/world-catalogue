// Industrial & Process SKU nomenclature policy.
//
// Phase 3 authority: this module plans deterministic SKU candidates only.
// It does not write the catalogue. Catalogue minting is a separate phase.

export const INDUSTRIAL_SKU_FORMAT = /^[A-Z]{2}[0-9]{4,7}[A-Z]{0,2}$/;

export const INDUSTRIAL_SKU_PREFIX_POLICY = Object.freeze({
  'TC-AIR-01': Object.freeze({ prefix: 'IA1', label: 'GAIRFIL™ — General Air Filtration', minting_enabled: true }),
  'TC-AIR-02': Object.freeze({ prefix: 'IA2', label: 'HE-CRIVA™', minting_enabled: true }),
  'TC-AIR-03': Object.freeze({ prefix: 'IA3', label: 'MA-TREA™', minting_enabled: true }),

  'TC-DUST-01': Object.freeze({ prefix: 'ID1', label: 'FUMEVRA™', minting_enabled: true }),

  'TC-NG-01': Object.freeze({ prefix: 'IG1', label: 'COALERIS™', minting_enabled: true }),
  'TC-NG-02': Object.freeze({ prefix: 'IG2', label: 'GASLIQ™ — Gas-Liquid Separation', minting_enabled: true }),

  'TC-HYD-01': Object.freeze({ prefix: 'IH1', label: 'HYLTRIS™', minting_enabled: true }),
  'TC-LUB-01': Object.freeze({ prefix: 'IL1', label: 'LUBREVA™', minting_enabled: true }),
  'TC-OIL-01': Object.freeze({ prefix: 'IO1', label: 'DEWATIS™', minting_enabled: true }),
  'TC-OIL-02': Object.freeze({ prefix: 'IO2', label: 'OILREVEX™', minting_enabled: true }),

  'TC-WAT-01': Object.freeze({ prefix: 'IW1', label: 'Depth Filtration', minting_enabled: true }),
  'TC-WAT-03': Object.freeze({ prefix: 'IW3', label: 'ADSOVEX™', minting_enabled: true }),
  'TC-WAT-04': Object.freeze({ prefix: 'IW4', label: 'MEMBRAVEX™ / Reverse Osmosis', minting_enabled: true }),
  'TC-WAT-05': Object.freeze({ prefix: 'IW5', label: 'MEMBRAVEX™ / Ultrafiltration', minting_enabled: true }),
  'TC-WAT-06': Object.freeze({ prefix: 'IW6', label: 'MEMBRAVEX™ / Nanofiltration', minting_enabled: true }),
  'TC-WAT-07': Object.freeze({ prefix: 'IW7', label: 'IONVEXA™', minting_enabled: true }),
  'TC-WAT-08': Object.freeze({
    prefix: 'IW8',
    label: 'Electrodeionization',
    minting_enabled: false,
    reason: 'Prefix reserved only. No commercial EDI base/product is approved.',
  }),
});

export const INDUSTRIAL_RESERVED_UNAPPROVED_PATHS = Object.freeze({
  'PARTION-OIL-MIST-CANDIDATE': Object.freeze({
    prefix: null,
    minting_enabled: false,
    reason: 'No SKU namespace until the oil/coolant-mist treatment family is separately approved.',
  }),
});

function normalizeCore(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeSourceCode(value) {
  return String(value || '').trim().toUpperCase();
}

export function getIndustrialSkuPrefix(technologyCore) {
  return INDUSTRIAL_SKU_PREFIX_POLICY[normalizeCore(technologyCore)] || null;
}

export function numericPayloadFromBaseCode(baseCode) {
  const digits = normalizeSourceCode(baseCode).replace(/\D/g, '');
  if (!digits) return null;
  return digits.length >= 4 ? digits.slice(-4) : digits.padStart(4, '0');
}

export function preferredIndustrialSku({ technologyCore, baseCode } = {}) {
  const policy = getIndustrialSkuPrefix(technologyCore);
  if (!policy) {
    return { status: 'STOP_REVIEW', reason: 'UNAPPROVED_TECHNOLOGY_CORE', sku: null };
  }
  if (policy.minting_enabled !== true) {
    return { status: 'STOP_REVIEW', reason: 'SKU_MINTING_NOT_APPROVED_FOR_CORE', sku: null, prefix: policy.prefix };
  }
  const payload = numericPayloadFromBaseCode(baseCode);
  if (!payload) {
    return { status: 'STOP_REVIEW', reason: 'BASE_CODE_HAS_NO_NUMERIC_PAYLOAD', sku: null, prefix: policy.prefix };
  }
  const sku = `${policy.prefix}${payload}`;
  if (!INDUSTRIAL_SKU_FORMAT.test(sku)) {
    return { status: 'STOP_REVIEW', reason: 'SKU_FORMAT_REJECTED', sku: null, prefix: policy.prefix };
  }
  return { status: 'PREFERRED', reason: 'PREFIX_PLUS_LAST4_NUMERIC_BASE_PAYLOAD', sku, prefix: policy.prefix, payload };
}

export function collisionCandidates({ technologyCore, baseCode } = {}) {
  const preferred = preferredIndustrialSku({ technologyCore, baseCode });
  if (preferred.status !== 'PREFERRED') return [];
  const last3 = preferred.payload.slice(-3);
  const out = [];
  for (let discriminator = 1; discriminator <= 9; discriminator += 1) {
    out.push(`${preferred.prefix}${discriminator}${last3}`);
  }
  return out;
}

export function planIndustrialSkus(candidates = [], { occupiedSkus = [], publicationOrderLocked = false } = {}) {
  const occupied = new Set([...occupiedSkus].map((value) => String(value || '').trim().toUpperCase()).filter(Boolean));
  const seenIdentity = new Set();
  const result = [];

  // A collision decision is identity governance: when a batch contains
  // multiple new products competing for one preferred slot, array order must
  // never become an accidental business rule. The caller must explicitly
  // attest that candidate order is the reviewed/frozen publication order.
  const preferredCounts = new Map();
  for (const candidate of candidates) {
    const technologyCore = normalizeCore(candidate?.technology_core ?? candidate?.technologyCore);
    const baseCode = normalizeSourceCode(candidate?.source_code ?? candidate?.baseCode);
    const preferred = preferredIndustrialSku({ technologyCore, baseCode });
    if (preferred.status === 'PREFERRED') {
      preferredCounts.set(preferred.sku, (preferredCounts.get(preferred.sku) || 0) + 1);
    }
  }
  const hasInBatchCollision = [...preferredCounts.values()].some((count) => count > 1);
  if (hasInBatchCollision && publicationOrderLocked !== true) {
    return candidates.map((candidate) => ({
      ...candidate,
      planned_sku: null,
      sku_status: 'STOP_REVIEW',
      sku_reason: 'COLLISION_ALLOCATION_ORDER_NOT_FROZEN',
    }));
  }

  for (const candidate of candidates) {
    const technologyCore = normalizeCore(candidate?.technology_core ?? candidate?.technologyCore);
    const sourceBrand = String(candidate?.source_brand ?? candidate?.sourceBrand ?? '').trim().toUpperCase();
    const baseCode = normalizeSourceCode(candidate?.source_code ?? candidate?.baseCode);
    const identityKey = `${technologyCore}|${sourceBrand}|${baseCode}`;

    if (!technologyCore || !sourceBrand || !baseCode) {
      result.push({ ...candidate, planned_sku: null, sku_status: 'STOP_REVIEW', sku_reason: 'INCOMPLETE_CANONICAL_BASE_IDENTITY' });
      continue;
    }
    if (seenIdentity.has(identityKey)) {
      result.push({ ...candidate, planned_sku: null, sku_status: 'STOP_REVIEW', sku_reason: 'DUPLICATE_CANONICAL_BASE_IDENTITY_IN_BATCH' });
      continue;
    }
    seenIdentity.add(identityKey);

    const preferred = preferredIndustrialSku({ technologyCore, baseCode });
    if (preferred.status !== 'PREFERRED') {
      result.push({ ...candidate, planned_sku: null, sku_status: 'STOP_REVIEW', sku_reason: preferred.reason });
      continue;
    }

    if (!occupied.has(preferred.sku)) {
      occupied.add(preferred.sku);
      result.push({
        ...candidate,
        planned_sku: preferred.sku,
        sku_status: 'PLANNED',
        sku_reason: preferred.reason,
        sku_method: 'NATURAL_LAST4',
        sku_prefix: preferred.prefix,
      });
      continue;
    }

    const alternatives = collisionCandidates({ technologyCore, baseCode });
    const free = alternatives.find((sku) => !occupied.has(sku));
    if (!free) {
      result.push({
        ...candidate,
        planned_sku: null,
        sku_status: 'STOP_REVIEW',
        sku_reason: 'INDUSTRIAL_PREFIX_COLLISION_NAMESPACE_EXHAUSTED',
        sku_prefix: preferred.prefix,
      });
      continue;
    }

    occupied.add(free);
    result.push({
      ...candidate,
      planned_sku: free,
      sku_status: 'PLANNED',
      sku_reason: 'PREFERRED_SLOT_OCCUPIED',
      sku_method: 'COLLISION_INDEX_PLUS_LAST3',
      sku_prefix: preferred.prefix,
    });
  }

  return result;
}

export const INDUSTRIAL_SKU_POLICY_TEXT = `
INDUSTRIAL & PROCESS SKU NOMENCLATURE v1
- Industrial SKUs use a dedicated I* namespace and never reuse HD or LD prefixes.
- Prefixes are technology-core scoped: IA1/IA2/IA3, ID1, IG1/IG2, IH1, IL1, IO1/IO2, IW1/IW3/IW4/IW5/IW6/IW7. IW8 is reserved but blocked until EDI commercial scope is approved.
- The canonical base identity must already pass Industrial base-code authority governance before SKU planning begins.
- Preferred SKU = approved 3-character Industrial prefix + last four numeric digits extracted from the canonical base code; 1–3 digits are left-padded with zeros.
- Letters and punctuation from the external base code are never treated as ELIMFILTERS product identity. The complete external brand/code remains in canonical-source fields.
- If two distinct products in the same Industrial prefix prefer the same last-four payload, the first published mapping keeps the natural slot. Later distinct products use prefix + collision discriminator 1..9 + the last three numeric digits, skipping occupied slots.
- Published mappings are sticky: a later discovery never displaces an existing Industrial SKU. A first-publication batch containing collisions must freeze its reviewed publication order before allocation; array/input order is never allowed to become an accidental identity rule.
- If a base code has no numeric payload, the core has no approved prefix, minting is blocked, or all collision slots are occupied, STOP_REVIEW. Never hash, truncate letters into pseudo-numbers, or invent a fallback SKU.
- SKU format must remain compatible with the catalogue constraint ^[A-Z]{2}[0-9]{4,7}[A-Z]{0,2}$.
- Planning does not write the catalogue. Catalogue minting requires the separate approved publication phase.
`;
