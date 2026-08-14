/**
 * protection-media-registry.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Protection Media Registry — governed canonical protection media type entities.
 * Each record defines a media type as a first-class Knowledge Graph entity:
 * its filtration function, construction, operating envelope, and the Technology
 * Architectures that employ it.
 *
 * Relationship to TechnologyArchitecture:
 *   TechnologyArchitecture.protectionMedia[] describes specific instantiations.
 *   ProtectionMediaRecord describes the canonical media type those instantiations
 *   are drawn from. This registry is the authoritative source for media type
 *   definitions; TechnologyArchitecture entries are applications of these types.
 */

import { MATURITY, type ProtectionMediaRecord } from './registry-types';

export const PROTECTION_MEDIA_REGISTRY: Record<string, ProtectionMediaRecord> = {

  // ── Depth Filtration Media ─────────────────────────────────────────────────

  'PM-GLASS-MICROFIBER-DEPTH': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-GLASS-MICROFIBER-DEPTH',
    name: 'Borosilicate Glass Microfiber — Depth Filtration',
    mediaFunction: 'DEPTH_FILTRATION',
    definition:
      'Wet-laid or dry-laid borosilicate glass microfiber medium providing depth filtration across a fiber matrix. Particles are captured by interception, inertial impaction, and diffusion as fluid flows through the three-dimensional fiber network. Filtration efficiency increases with loading as captured particles reduce effective pore size.',
    baseConstruction: 'Borosilicate glass fiber, wet-laid or dry-laid, non-woven sheet',
    micronRatingRange: '0.5–40 µm (Beta ratio dependent on fiber diameter and packing density)',
    operatingTempRange: '-20°C to +150°C continuous (glass fiber stable; binder dependent)',
    compatibleFluidTypes: [
      'Engine lube oil (mineral and synthetic)',
      'Hydraulic fluid (mineral, synthetic ester, phosphate ester)',
      'Diesel fuel (including biofuel blends B5–B20)',
      'Compressed air and gas streams',
    ],
    employedByTechnologyIds: [
      'TECH-MACROCORE',
      'TECH-SYNTRAX',
      'TECH-NANOFORCE',
      'TECH-TURBOCORE',
      'TECH-MARINECLEAN',
    ],
    implementsPrincipleIds: ['EP-SEP-001'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'PM-SYNTHETIC-MICROFIBER-ABSOLUTE': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-SYNTHETIC-MICROFIBER-ABSOLUTE',
    name: 'Synthetic Polyester Microfiber — Absolute-Rated',
    mediaFunction: 'DEPTH_FILTRATION',
    definition:
      'Wet-laid synthetic polyester microfiber medium providing depth filtration with a consistent absolute particle size retention guarantee across service life. Fiber chemistry and controlled packing density produce stable pore geometry that maintains its rated particle retention from installation through end of service, unlike progressive-loading glass microfiber media where effective rating changes as loading progresses. Used where a minimum particle size guarantee is required throughout service life (HPCR fuel systems, precision hydraulics).',
    baseConstruction: 'Synthetic polyester microfiber, wet-laid, controlled fiber diameter and packing density for consistent depth retention rating',
    micronRatingRange: '3–10 µm rated (depth filtration with stable retention characteristic)',
    operatingTempRange: '-20°C to +80°C continuous (polyester thermal stability)',
    compatibleFluidTypes: [
      'Diesel fuel (all grades including VLSFO, ULSD)',
      'Hydraulic fluid (mineral)',
      'Biofuel blends B5–B20',
    ],
    employedByTechnologyIds: [
      'TECH-SYNTAPORE',

    ],
    implementsPrincipleIds: ['EP-SEP-001'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'PM-NANOFIBER-ENHANCED': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-NANOFIBER-ENHANCED',
    name: 'Nanofiber-Enhanced Glass Microfiber',
    mediaFunction: 'SURFACE_FILTRATION',
    definition:
      'Composite medium combining a borosilicate glass microfiber substrate with an electrospun nanofiber overlay layer. The nanofiber layer (fiber diameter 100–500 nm) provides consistent absolute surface filtration at 3 µm or finer without the pressure drop penalty of a purely fine-fiber depth medium. The glass substrate provides mechanical support and coarse pre-filtration.',
    baseConstruction: 'Borosilicate glass microfiber substrate + electrospun polyamide nanofiber overlay, bonded composite',
    micronRatingRange: '1–5 µm absolute (nanofiber layer determines rating)',
    operatingTempRange: '-20°C to +80°C continuous (polyamide nanofiber limit)',
    compatibleFluidTypes: [
      'Hydraulic fluid (mineral, synthetic ester)',
      'Engine lube oil',
    ],
    employedByTechnologyIds: ['TECH-NANOFORCE'],
    implementsPrincipleIds: ['EP-SEP-001', 'EP-SEP-002', 'EP-CHE-002'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  // ── Phase Separation Media ─────────────────────────────────────────────────

  'PM-COALESCING-HYDROPHILIC': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-COALESCING-HYDROPHILIC',
    name: 'Hydrophilic Coalescing Medium — Water Coalescence',
    mediaFunction: 'COALESCENCE',
    definition:
      'Glass microfiber medium with hydrophilic surface treatment designed to capture dispersed water droplets (1–100 µm) from fuel or oil streams and merge them into large settleable droplets (>100 µm) by controlled surface wetting. The hydrophilic fiber surface promotes droplet contact and coalescence; the resulting large droplets separate by gravity into the collection bowl.',
    baseConstruction: 'Borosilicate glass microfiber, surface-treated hydrophilic, radial or axial flow construction',
    micronRatingRange: '10–30 µm fuel particulate (co-function); water droplets 5 µm+ coalesced',
    operatingTempRange: '-20°C to +80°C',
    compatibleFluidTypes: [
      'Diesel fuel (all grades)',
      'Biofuel blends',
      'Lube oil (for coolant water removal)',
    ],
    employedByTechnologyIds: [
      'TECH-TURBOCORE',
      'TECH-TURBOCORE',
      'TECH-MARINECLEAN',
    ],
    implementsPrincipleIds: ['EP-PHS-001'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'PM-HYDROPHOBIC-BARRIER': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-HYDROPHOBIC-BARRIER',
    name: 'PTFE Hydrophobic Barrier — Water Repulsion Layer',
    mediaFunction: 'HYDROPHOBIC_REPULSION',
    definition:
      'Polytetrafluoroethylene (PTFE)-coated or membrane medium providing a final hydrophobic barrier that allows fuel or oil to transit while repelling water droplets. PTFE surface energy (~18 mN/m) is below the water surface tension (72 mN/m), causing water droplets to be repelled rather than transit the medium pores. Positioned downstream of the coalescing stage.',
    baseConstruction: 'PTFE membrane or PTFE-coated glass fiber substrate',
    micronRatingRange: '2–30 µm (fuel particulate co-filtration)',
    operatingTempRange: '-40°C to +120°C (PTFE stable)',
    compatibleFluidTypes: [
      'Diesel fuel',
      'Biofuel blends',
      'Light fuel oil',
    ],
    employedByTechnologyIds: [
      'TECH-TURBOCORE',
      'TECH-TURBOCORE',
      'TECH-MARINECLEAN',
    ],
    implementsPrincipleIds: ['EP-PHS-002'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  // ── Adsorption and Chemical Media ─────────────────────────────────────────

  'PM-ACTIVATED-CARBON': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-ACTIVATED-CARBON',
    name: 'Activated Carbon Adsorber',
    mediaFunction: 'ADSORPTION',
    definition:
      'Granular or impregnated activated carbon medium removing gaseous contaminants and dissolved vapors by physical adsorption onto the carbon micropore surface. Micropore volume (typically 0.3–0.6 cm³/g) determines adsorption capacity. Coconut-shell-based carbon has higher micropore volume than coal-based alternatives. Impregnation with metal salts (KI, KMnO₄) extends protection to specific chemistries (acid gases, NH₃, H₂S).',
    baseConstruction: 'Granular activated carbon (coconut shell or coal base) in annular or flat-panel cartridge',
    micronRatingRange: 'N/A — molecular / vapor phase removal',
    operatingTempRange: '5°C to +50°C (adsorption efficiency decreases above 50°C)',
    compatibleFluidTypes: [
      'Compressed air and gas streams',
      'Cabin HVAC air supply',
    ],
    employedByTechnologyIds: [
      'TECH-MICROKAPPA',
    ],
    implementsPrincipleIds: ['EP-CHE-001'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  // ── Cabin Air Media ────────────────────────────────────────────────────────

  'PM-ELECTROSTATIC-MELTBLOWN': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-ELECTROSTATIC-MELTBLOWN',
    name: 'Electrostatic Melt-Blown Polypropylene — Cabin Air Particulate',
    mediaFunction: 'DEPTH_FILTRATION',
    definition:
      'Melt-blown polypropylene nonwoven medium carrying permanent electrostatic charge imposed during manufacture (electret process). The electrostatic charge field attracts sub-micron particles toward fiber surfaces by Coulomb attraction, supplementing mechanical interception and diffusion. Achieves ISO 11155-1 Class E (>80% at 0.4 µm) or Class F efficiency at pressure drops acceptable to HVAC blower systems.',
    baseConstruction: 'Melt-blown polypropylene fiber, electret-charged, pleated in ABS or cardboard frame',
    micronRatingRange: '0.1–10 µm (ISO 11155-1 test: 0.4 µm DEHS aerosol)',
    operatingTempRange: '-30°C to +70°C (HVAC service environment)',
    compatibleFluidTypes: ['Cabin HVAC air supply'],
    employedByTechnologyIds: ['TECH-MICROKAPPA'],
    implementsPrincipleIds: ['EP-TRB-002', 'EP-SEP-001'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  // ── Drying and Chemical Delivery Media ────────────────────────────────────

  'PM-DESICCANT-SILICA-GEL': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-DESICCANT-SILICA-GEL',
    name: 'Silica Gel Desiccant — Pressure Dew Point Control to -40°C',
    mediaFunction: 'DESICCATION',
    definition:
      'Amorphous silica gel adsorbent removing water vapor from compressed air by physical adsorption in micropore surface. Achieves pressure dew point to -40°C in pressure-swing adsorption (PSA) or heatless regeneration dryer systems. Silica gel is regenerated by pressure reduction or heat at 120–180°C, returning adsorption capacity. Becomes saturated and must be regenerated before capacity exhaustion.',
    baseConstruction: 'Granular silica gel, 2–5 mm beads, in packed desiccant tower',
    micronRatingRange: 'N/A — water vapor / molecular removal',
    operatingTempRange: '5°C to +50°C inlet air (compressed air before adsorption)',
    compatibleFluidTypes: ['Compressed air and inert gas streams'],
    employedByTechnologyIds: ['TECH-DRYCORE'],
    implementsPrincipleIds: ['EP-CHE-001'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'PM-SCA-RELEASE-MATRIX': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-SCA-RELEASE-MATRIX',
    name: 'SCA Release Matrix — Supplemental Coolant Additive Delivery',
    mediaFunction: 'SCA_DELIVERY',
    definition:
      'Compressed cellulose fiber matrix impregnated with a measured dose of Supplemental Coolant Additives (SCA) — primarily nitrites, molybdates, and silicates. Coolant flow through the matrix dissolves SCA at a rate proportional to coolant flow volume and temperature, delivering SCA to the coolant circuit at a rate matched to the depletion rate. The release mechanism is self-regulating: higher flow (higher engine load) releases SCA faster, matching the higher SCA depletion rate at higher thermal stress.',
    baseConstruction: 'Compressed cellulose fiber matrix, SCA-impregnated at controlled loading (SCA units per liter cooling circuit volume)',
    micronRatingRange: 'N/A — chemical delivery; secondary particulate filtration 10–20 µm',
    operatingTempRange: '70°C to +110°C coolant circuit temperature range',
    compatibleFluidTypes: [
      'Ethylene glycol / water coolant (ASTM D3306)',
      'Extended life coolant (OAT, HOAT formulations)',
    ],
    employedByTechnologyIds: ['TECH-THERMACORE'],
    implementsPrincipleIds: [],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
      {
        version: '1.0.1',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote:
          'Queue A-07: Removed EP-CHE-001 from implementsPrincipleIds. SCA delivery is a controlled chemical release mechanism (additive management), not an adsorption phenomenon. Adsorption (EP-CHE-001) describes gas-phase or dissolved-contaminant adhesion to adsorbent surfaces — the inverse direction. SCA_DELIVERY mediaFunction captures the correct classification. No Engineering Principle in the current registry describes the controlled-release additive delivery mechanism; this is documented as Research Candidate RC-002.',
      },
    ],
  },

  // ── Structural Support Media ───────────────────────────────────────────────

  'PM-STRUCTURAL-SUPPORT': {
    entityType: 'PROTECTION_MEDIA',
    id: 'PM-STRUCTURAL-SUPPORT',
    name: 'Collapse-Resistance Structural Support Layer',
    mediaFunction: 'STRUCTURAL_SUPPORT',
    definition:
      'Non-filtering structural layer providing mechanical support to prevent filtration medium collapse under high differential pressure. Includes perforated center tubes, woven monofilament drainage layers, and support grids. Rated collapse pressure defines the maximum differential pressure the element assembly withstands without structural failure. A collapsed element releases accumulated contamination as a slug — the acute catastrophic contamination event the filter is designed to prevent.',
    baseConstruction: 'Perforated steel core tube, stainless steel woven monofilament drainage layer, or glass-filled nylon core',
    micronRatingRange: 'N/A — structural function only',
    operatingTempRange: '-40°C to +150°C (steel); -20°C to +110°C (nylon)',
    compatibleFluidTypes: [
      'Engine lube oil',
      'Hydraulic fluid',
      'Diesel fuel',
      'Compressed air',
    ],
    employedByTechnologyIds: [
      'TECH-MACROCORE',
      'TECH-SYNTRAX',
      'TECH-NANOFORCE',
    ],
    implementsPrincipleIds: [],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

} as const;

// ── Accessor functions ───────────────────────────────────────────────────────

export function getMediaByFunction(
  fn: ProtectionMediaRecord['mediaFunction']
): ProtectionMediaRecord[] {
  return Object.values(PROTECTION_MEDIA_REGISTRY).filter((m) => m.mediaFunction === fn);
}

export function getMediaForTechnology(technologyId: string): ProtectionMediaRecord[] {
  return Object.values(PROTECTION_MEDIA_REGISTRY).filter((m) =>
    m.employedByTechnologyIds.includes(technologyId)
  );
}

export function getMediaForPrinciple(principleId: string): ProtectionMediaRecord[] {
  return Object.values(PROTECTION_MEDIA_REGISTRY).filter((m) =>
    m.implementsPrincipleIds.includes(principleId)
  );
}

// Re-export type for consumers
export type { ProtectionMediaRecord } from './registry-types';
