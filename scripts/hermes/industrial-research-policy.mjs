import { INDUSTRIAL_BASE_CODE_RESEARCH_POLICY, formatIndustrialFamilyAnchorsForPrompt } from './industrial-product-base-policy.mjs';

// Shared HERMES industrial-research guardrails.
// This is descriptive research routing policy only. It does not grant
// publication, technology, application or catalogue authority.

export const INDUSTRIAL_AIR_RESEARCH_POLICY = `
INDUSTRIAL AIR TREATMENT BOUNDARY
- Distinguish solid particulate from liquid-droplet aerosol before assigning an ELIMFILTERS treatment path.
- Dry dust, fume and particle-dominant oil-bearing particulate may be evaluated against PARTION™ / FUMEVRA™ when the dominant duty is particle capture.
- Liquid oil mist, coolant mist, metalworking-fluid aerosol and droplet-dominant machining smoke are not automatically FUMEVRA™. Evaluate droplet capture, coalescence, drainage, liquid loading, airflow, media compatibility and final discharge condition.
- Mixed solid-liquid aerosol duties require phase-dominance analysis and may require staged treatment. If the dominant phase or treatment mechanism is unresolved, do not confirm a branded technology; keep the relationship unconfirmed and route it for engineering review.
- Do not treat the word "aerosol" by itself as proof of either particulate or liquid-mist duty.
`;

export const INDUSTRIAL_PROCESS_ROUTING_POLICY = `
INDUSTRIAL & PROCESS ROUTING
- Start from carrier medium, contaminant phase, treatment objective, operating envelope and required downstream condition. Never route from a familiar filter shape or competitor product name alone.
- AEREMIS™: industrial air treatment. General particulate -> descriptive General Air Filtration; high-efficiency/critical-air particulate -> HE-CRIVA™ when validated; molecular gases/vapors/odors -> MA-TREA™ when adsorption or other approved molecular media is validated.
- PARTION™: process-generated solid dust and fume particulate -> FUMEVRA™ when particle-dominant duty is validated. Liquid oil/coolant mist remains an unbranded treatment path until separately approved.
- COALVEX™: industrial process gas conditioning. Fine liquid aerosol requiring media coalescence and drainage -> COALERIS™ when validated; free liquid, large droplets or bulk carryover -> descriptive Gas-Liquid Separation.
- FLUREXIS™: industrial liquid conditioning. Solid particulate in hydraulic fluid -> HYLTRIS™; solid contamination/wear debris in industrial lubrication -> LUBREVA™; water in oil -> DEWATIS™ only after water state and fluid compatibility are established; oil degradation/varnish chemistry -> OILREVEX™ only after fluid analysis identifies the remediation target.
- AQUVEXIS™: industrial water treatment. Suspended solids -> Depth Filtration; qualified dissolved-organic/residual-oxidant adsorption -> ADSOVEX™; RO/NF/UF membrane separation -> MEMBRAVEX™; ion exchange -> IONVEXA™; EDI remains a descriptive polishing path after suitable upstream treatment.
- Mixed contaminant mechanisms may require staged treatment and more than one family. If the mechanism is unresolved, keep the technology relationship unconfirmed and request engineering review.
- ELIMFILTERS commercial scope defaults to validated media and replacement elements. Collectors, air handlers, pressure vessels, separators, skids, pumps, fans, ductwork, reservoirs, piping, controls, complete membrane trains and complete EDI systems are application context unless a separate approved system scope explicitly says otherwise.
- Do not convert source equipment architecture or source-specific numeric performance into an ELIMFILTERS product claim.
`;

export const DEEP_TECHNICAL_LIBRARY_POLICY = `
OFFICIAL TECHNICAL LIBRARY / CASE-STUDY RESEARCH
- When an official manufacturer technical-article or case-study index is supplied, do not stop at the index title or marketing summary.
- Follow the relevant individual same-domain article or case-study pages during research and extract the actual process, contaminant, filtration mechanism, operating conditions, element/media architecture, maintenance behavior, measured outcomes and limitations that are explicitly supported.
- Treat case-study numeric results as application-specific evidence, not universal product claims.
- Prefer official technical PDFs, product documentation, standards and test-method context when a claim requires engineering verification.
- Preserve competitor identity as internal provenance; public-safe wording must be neutral and non-proprietary.
`;

export const HERMES_INDUSTRIAL_RESEARCH_POLICY =
  `${INDUSTRIAL_PROCESS_ROUTING_POLICY}\n${INDUSTRIAL_BASE_CODE_RESEARCH_POLICY}\nAPPROVED INDUSTRIAL FAMILY ANCHORS\n${formatIndustrialFamilyAnchorsForPrompt()}\n${INDUSTRIAL_AIR_RESEARCH_POLICY}\n${DEEP_TECHNICAL_LIBRARY_POLICY}`;
