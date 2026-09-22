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

export const DEEP_TECHNICAL_LIBRARY_POLICY = `
OFFICIAL TECHNICAL LIBRARY / CASE-STUDY RESEARCH
- When an official manufacturer technical-article or case-study index is supplied, do not stop at the index title or marketing summary.
- Follow the relevant individual same-domain article or case-study pages during research and extract the actual process, contaminant, filtration mechanism, operating conditions, element/media architecture, maintenance behavior, measured outcomes and limitations that are explicitly supported.
- Treat case-study numeric results as application-specific evidence, not universal product claims.
- Prefer official technical PDFs, product documentation, standards and test-method context when a claim requires engineering verification.
- Preserve competitor identity as internal provenance; public-safe wording must be neutral and non-proprietary.
`;

export const HERMES_INDUSTRIAL_RESEARCH_POLICY =
  `${INDUSTRIAL_AIR_RESEARCH_POLICY}\n${DEEP_TECHNICAL_LIBRARY_POLICY}`;
