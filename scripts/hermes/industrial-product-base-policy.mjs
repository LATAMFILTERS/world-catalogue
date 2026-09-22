// Industrial & Process base-code authority policy.
//
// This module governs research/classification only. It does not mint an
// ELIMFILTERS SKU, write catalogue identity, or approve a product claim.
// Confirmed original-element identity outranks every family anchor.

export const INDUSTRIAL_BASE_AUTHORITY_STATUS = Object.freeze({
  ORIGINAL_BASE: 'ORIGINAL_BASE',
  FAMILY_ANCHOR_BASE: 'FAMILY_ANCHOR_BASE',
  COMPETITOR_CROSS: 'COMPETITOR_CROSS',
  SOURCE_ONLY: 'SOURCE_ONLY',
});

export const INDUSTRIAL_FAMILY_ANCHORS = Object.freeze({
  'TC-AIR-01': Object.freeze({ platform: 'AEREMIS™', family: 'General Air Filtration', anchor_brand: 'CAMFIL', commercial_base_allowed: true }),
  'TC-AIR-02': Object.freeze({ platform: 'AEREMIS™', family: 'HE-CRIVA™ — High-Efficiency / Critical Air Filtration', anchor_brand: 'CAMFIL', commercial_base_allowed: true }),
  'TC-AIR-03': Object.freeze({ platform: 'AEREMIS™', family: 'MA-TREA™ — Molecular Air Treatment', anchor_brand: 'CAMFIL', commercial_base_allowed: true }),
  'TC-DUST-01': Object.freeze({ platform: 'PARTION™', family: 'FUMEVRA™ — Fine Dust & Fume Filtration', anchor_brand: 'DONALDSON', commercial_base_allowed: true }),
  'TC-NG-01': Object.freeze({ platform: 'COALVEX™', family: 'COALERIS™ — Gas Coalescence', anchor_brand: 'PALL', commercial_base_allowed: true }),
  'TC-NG-02': Object.freeze({ platform: 'COALVEX™', family: 'Gas-Liquid Separation', anchor_brand: 'PALL', commercial_base_allowed: true }),
  'TC-HYD-01': Object.freeze({ platform: 'FLUREXIS™', family: 'HYLTRIS™ — Hydraulic Fluid Filtration', anchor_brand: 'PARKER', commercial_base_allowed: true }),
  'TC-LUB-01': Object.freeze({ platform: 'FLUREXIS™', family: 'LUBREVA™ — Industrial Lubrication Filtration', anchor_brand: 'PARKER', commercial_base_allowed: true }),
  'TC-OIL-01': Object.freeze({ platform: 'FLUREXIS™', family: 'DEWATIS™ — Oil Dehydration & Water Removal', anchor_brand: 'PALL', secondary_reference_brand: 'PARKER', commercial_base_allowed: true }),
  'TC-OIL-02': Object.freeze({ platform: 'FLUREXIS™', family: 'OILREVEX™ — Oil Condition Remediation', anchor_brand: 'PALL', commercial_base_allowed: true }),
  'TC-WAT-01': Object.freeze({ platform: 'AQUVEXIS™', family: 'Depth Filtration', anchor_brand: 'PALL', commercial_base_allowed: true }),
  'TC-WAT-03': Object.freeze({ platform: 'AQUVEXIS™', family: 'ADSOVEX™ — Adsorptive Carbon Treatment', anchor_brand: 'CALGON CARBON', commercial_base_allowed: true }),
  'TC-WAT-04': Object.freeze({ platform: 'AQUVEXIS™', family: 'MEMBRAVEX™ — Reverse Osmosis', anchor_brand: 'DUPONT FILMTEC', commercial_base_allowed: true }),
  'TC-WAT-05': Object.freeze({ platform: 'AQUVEXIS™', family: 'MEMBRAVEX™ — Ultrafiltration', anchor_brand: 'DUPONT WATER SOLUTIONS', commercial_base_allowed: true }),
  'TC-WAT-06': Object.freeze({ platform: 'AQUVEXIS™', family: 'MEMBRAVEX™ — Nanofiltration', anchor_brand: 'DUPONT FILMTEC', commercial_base_allowed: true }),
  'TC-WAT-07': Object.freeze({ platform: 'AQUVEXIS™', family: 'IONVEXA™ — Ion Exchange', anchor_brand: 'DUPONT AMBERLITE', commercial_base_allowed: true }),
  'TC-WAT-08': Object.freeze({ platform: 'AQUVEXIS™', family: 'Electrodeionization', anchor_brand: null, commercial_base_allowed: false, reason: 'Descriptive treatment path only; no ELIMFILTERS EDI equipment/product base is approved.' }),
  'PARTION-OIL-MIST-CANDIDATE': Object.freeze({ platform: 'PARTION™', family: 'Oil Mist / Coolant Mist candidate treatment path', anchor_brand: 'DONALDSON', commercial_base_allowed: false, reason: 'Research anchor only until a branded/commercial treatment family is separately approved.' }),
});

const BRAND_ALIASES = Object.freeze({
  CAMFIL: ['CAMFIL'],
  DONALDSON: ['DONALDSON', 'DONALDSON TORIT'],
  PALL: ['PALL', 'PALL CORPORATION'],
  PARKER: ['PARKER', 'PARKER HANNIFIN'],
  'CALGON CARBON': ['CALGON CARBON', 'CALGON CARBON CORPORATION'],
  'DUPONT FILMTEC': ['DUPONT FILMTEC', 'FILMTEC'],
  'DUPONT WATER SOLUTIONS': ['DUPONT WATER SOLUTIONS'],
  'DUPONT AMBERLITE': ['DUPONT AMBERLITE', 'AMBERLITE'],
});

function norm(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function getIndustrialFamilyAnchor(technologyCore) {
  return INDUSTRIAL_FAMILY_ANCHORS[String(technologyCore || '').trim().toUpperCase()] || null;
}

export function industrialBrandMatchesAnchor(brand, anchorBrand) {
  if (!brand || !anchorBrand) return false;
  const aliases = BRAND_ALIASES[anchorBrand] || [anchorBrand];
  const target = norm(brand);
  return aliases.some((alias) => norm(alias) === target);
}

export function classifyIndustrialReference({
  technologyCore,
  brand,
  code,
  originalConfirmed = false,
  primaryEvidenceComplete = false,
  crossValidated = false,
} = {}) {
  const cleanCode = String(code || '').trim();
  if (!brand || !cleanCode) {
    return { authority_status: INDUSTRIAL_BASE_AUTHORITY_STATUS.SOURCE_ONLY, base_eligible: false, reason: 'MISSING_BRAND_OR_CODE' };
  }

  if (originalConfirmed === true) {
    return { authority_status: INDUSTRIAL_BASE_AUTHORITY_STATUS.ORIGINAL_BASE, base_eligible: true, reason: 'CONFIRMED_ORIGINAL_ELEMENT_OR_EQUIPMENT_REFERENCE' };
  }

  const anchor = getIndustrialFamilyAnchor(technologyCore);
  if (anchor?.commercial_base_allowed === true && primaryEvidenceComplete === true && industrialBrandMatchesAnchor(brand, anchor.anchor_brand)) {
    return { authority_status: INDUSTRIAL_BASE_AUTHORITY_STATUS.FAMILY_ANCHOR_BASE, base_eligible: true, reason: 'APPROVED_FAMILY_ANCHOR_WITH_PRIMARY_EVIDENCE', anchor_brand: anchor.anchor_brand };
  }

  if (crossValidated === true) {
    return { authority_status: INDUSTRIAL_BASE_AUTHORITY_STATUS.COMPETITOR_CROSS, base_eligible: false, reason: 'VALIDATED_EQUIVALENT_NOT_BASE_AUTHORITY' };
  }

  return {
    authority_status: INDUSTRIAL_BASE_AUTHORITY_STATUS.SOURCE_ONLY,
    base_eligible: false,
    reason: anchor?.commercial_base_allowed === false ? 'COMMERCIAL_BASE_NOT_APPROVED_FOR_TREATMENT_PATH' : 'INSUFFICIENT_BASE_AUTHORITY',
  };
}

export const INDUSTRIAL_BASE_CODE_RESEARCH_POLICY = `
INDUSTRIAL PRODUCT BASE-CODE AUTHORITY
- Precedence is strict: confirmed original element/equipment reference > approved family anchor > validated competitor cross-reference > source-only reference.
- ORIGINAL_BASE means primary evidence confirms the referenced element/code is the original element for the equipment, housing, vessel, collector or module. A confirmed ORIGINAL_BASE outranks the family anchor.
- FAMILY_ANCHOR_BASE is allowed only when the true original is unknown or cannot be established, the reference belongs to the approved anchor brand for the Technology Core, and the primary product evidence is complete enough to defend identity, geometry, function and technical specification.
- COMPETITOR_CROSS is an equivalence relationship only. It never becomes the base merely because it is common, dimensionally similar or appears in an interchange catalogue.
- SOURCE_ONLY means the code was observed but lacks authority to define the ELIMFILTERS base. Keep it as evidence only.
- Never promote the first code found, a supplier replacement code, an interchange code or a dimension-only match into canonical base identity.
- REIKE and other discovery suppliers are SOURCE_ONLY by default. They become ORIGINAL_BASE only when original-manufacturer status is proven by primary evidence, or FAMILY_ANCHOR_BASE only when they are the approved family anchor (currently they are not).
- Parker Par Fit and comparable interchange programmes are high-value cross-reference evidence, but an interchange code remains COMPETITOR_CROSS when another manufacturer's original element is established.
- No Industrial & Process SKU is minted by this policy. Until SKU nomenclature is separately approved, product work remains pre-SKU under the existing EBP Product Engineering Passport governance.
`;

export function formatIndustrialFamilyAnchorsForPrompt() {
  return Object.entries(INDUSTRIAL_FAMILY_ANCHORS)
    .map(([core, policy]) => {
      const anchor = policy.anchor_brand || 'NO COMMERCIAL BASE';
      const suffix = policy.commercial_base_allowed ? '' : ' [RESEARCH/DESCRIPTIVE ONLY]';
      return `- ${core}: ${policy.platform} / ${policy.family} -> ${anchor}${suffix}`;
    })
    .join('\n');
}
