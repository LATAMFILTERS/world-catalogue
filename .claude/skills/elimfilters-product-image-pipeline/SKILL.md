---
name: elimfilters-product-image-pipeline
description: Mandatory fail-closed workflow for ELIMFILTERS cylindrical product imagery. Requires exact real manufacturer source imagery, immutable geometry lineage, phased approvals, catalog SKU resolution, and official repository artwork assets. Text-to-image reconstruction is prohibited.
activation: Trigger whenever a user asks to generate, create, edit, transform, render, rebrand, approve, or automate an ELIMFILTERS filter image, especially when manufacturer imagery, a product URL, screenshot, competitor code, SKU, geometry, paint, lithography, logo, baseplate, thread, gasket, or spin-on geometry is involved.
---

# ELIMFILTERS Product Image Pipeline

This skill is mandatory and fail-closed. Do not bypass a gate to make progress.

## Root execution rule

NEVER reconstruct a product from text.

Every render must have explicit image lineage. The exact manufacturer image supplied or captured from the exact product page must be the physical geometry donor. If that image is not physically attached/referenced to the image-edit operation, STOP.

A valid manufacturer URL, screenshot description, part number, JSON record, prompt, or remembered geometry is NOT a substitute for the actual source image bytes.

## Phase state machine

Every SKU moves through these phases only:

`SOURCE_LOCKED -> GEOMETRY_APPROVED -> PAINT_LITHO_APPROVED -> FINAL_APPROVED`

No phase may silently perform work assigned to another phase.

### PHASE 0 — SOURCE LOCK

Purpose: establish the exact physical donor before any image generation/editing.

Required:
- exact manufacturer code;
- exact manufacturer product page or direct image;
- actual source image bytes physically available to the image tool;
- baseplate/thread/gasket/hole pattern visible for spin-on products;
- source composition recorded: upright view, horizontal view, relative scale, perspective and crop.

Forbidden:
- simulated screenshot;
- AI-generated manufacturer product;
- image search substitute when exact user-supplied source exists;
- geometry borrowed from another SKU;
- changing paint, lithography or brand during source lock.

If missing: `STOP_SOURCE_MISSING`.

### PHASE 1 — GEOMETRY ONLY

Purpose: validate that the exact source geometry can be preserved. This is NOT a branding phase.

Absolute rule: PHASE 1 may not redesign, recolor, relabel or rebrand the product.

The output must preserve the source manufacturer image geometry and composition exactly enough to serve as the immutable geometry master.

Locked:
- overall silhouette;
- height/diameter ratio;
- body length;
- top opening/rim;
- top and bottom seam positions;
- baseplate shape and stamped rings;
- central thread opening and thread appearance;
- gasket geometry;
- inlet-hole count;
- inlet-hole shape;
- angular positions and spacing of inlet holes;
- valves/construction features;
- upright/horizontal orientation;
- relative scale of both filters;
- camera perspective;
- crop/composition.

PHASE 1 must use the real manufacturer source as the referenced edit target. If the image tool cannot consume that source, STOP. Do not call text-to-image.

The source manufacturer paint and lithography remain unchanged during this phase unless the user explicitly requests a neutral geometry proof. Even then, geometry must come from a source-image edit, never reconstruction.

User approval of PHASE 1 creates `GEOMETRY_APPROVED` and freezes that exact image lineage for later phases.

### PHASE 2 — PAINT + LITHOGRAPHY ONLY

Prerequisite: `GEOMETRY_APPROVED`.

Input image MUST be the approved PHASE 1 geometry master, not a newly regenerated product.

Only permitted changes:
- can/container surface paint;
- authorized lithography placed on the existing can surface.

Mechanical pixels/features are immutable. Do not recreate the filter.

Paint authority:
- `ELIMFILTERS DARK CHARCOAL`
- `#414141`
- semi-matte industrial coating appearance.

Lithography authority:
- `ELIMFILTERS LITHOGRAPHY SILVER`
- `#CBCBCB`
- metallic silver satin appearance.

Required artwork:
- official ELIMFILTERS logo binary from `frontend/public/assets/logo-elimfilters.png`;
- `TOTAL ASSET PROTECTION`;
- exact database-resolved ELIMFILTERS SKU;
- approved product descriptor;
- official technology artwork/name from `frontend/public/assets/`;
- `Powered Filtration`;
- approved Installation Rotation Direction Marks;
- same artwork both sides, fitted proportionally to exact printable area.

Forbidden:
- manufacturer/competitor branding left on final ELIMFILTERS artwork;
- generated/recreated ELIMFILTERS logo;
- generated/recreated technology logo when official asset exists;
- white can when authority requires charcoal;
- black, yellow, red or other secondary lithography;
- QR;
- OEM/cross-reference text;
- technical specification panels;
- performance/service-life claims;
- website URLs;
- badges/icons;
- GERMAN QUALITY;
- arbitrary characters or generic arrows.

User approval creates `PAINT_LITHO_APPROVED`.

### PHASE 3 — MICRO-ADJUSTMENTS ONLY

Prerequisite: `PAINT_LITHO_APPROVED`.

Only the explicitly requested element may change.

Mandatory scope lock before edit:
- target view: `VERTICAL_ONLY`, `HORIZONTAL_ONLY`, or `BOTH`;
- target property: e.g. `SKU_TYPOGRAPHY_ONLY`, `LITHOGRAPHY_POSITION_ONLY`, `SPACING_ONLY`.

Everything outside that scope is immutable.

Example: if user asks to change only SKU font on vertical filter, horizontal filter must remain pixel/geometry/layout-equivalent to previously approved version.

No cumulative unsolicited changes.

Explicit approval creates `FINAL_APPROVED`.

## Catalog resolution gate

Before any ELIMFILTERS artwork is placed, resolve competitor code to ELIMFILTERS SKU from `world_catalogue.elimfilters_catalog`.

Command:
`node product-identity/scripts/resolve-competitor-sku.mjs --code=<CODE> --brand=<BRAND> --duty=HEAVY_DUTY`

Rules:
- exactly one catalog-backed match required;
- zero matches -> STOP;
- conflicting matches -> STOP;
- no inferred SKU;
- no competitor-number-derived SKU;
- no remembered/manual fallback.

## Binary artwork gate

Before PHASE 2, physically load the actual repository assets into the edit operation:
- `frontend/public/assets/logo-elimfilters.png`;
- exact approved technology binary from `frontend/public/assets/`.

Text descriptions of those assets do not satisfy this gate.

If an asset cannot be physically loaded/materialized into the image operation: `STOP_ASSET_MISSING`.

## Required render manifest

Before every image-tool call, establish a render manifest containing:
- `phase`;
- `competitor_code`;
- `resolved_sku` when phase >= 2;
- `source_image_id_or_path`;
- `source_image_is_real_manufacturer=true`;
- `geometry_master_id_or_path` for phase >= 2;
- `official_logo_asset_path` for phase >= 2;
- `official_technology_asset_path` for phase >= 2;
- `edit_scope`;
- `immutable_elements`;
- `allowed_changes`;
- `RENDER_INPUTS_VERIFIED=true`.

If any field required by the current phase is missing, do not call the image tool.

## Tool-call enforcement

The image operation must be an EDIT of the exact referenced source/master image.

A call that has no usable referenced image target is invalid for this pipeline, even if the prompt says “preserve geometry”.

If the tool reports or behaves as text-to-image/new generation (`edit_op` absent/null, source image not referenced, or no source lineage), REJECT the result automatically and do not present it as a valid phase output.

## Pre-display QC

Before showing any candidate, compare against the current immutable source/master:
- silhouette;
- height/diameter ratio;
- baseplate;
- thread;
- gasket;
- hole count and positions;
- seams;
- perspective;
- relative scale and composition.

For PHASE 2+ also verify:
- exact resolved SKU;
- official logo asset;
- official technology asset;
- charcoal `#414141` container;
- silver `#CBCBCB` lithography;
- authorized hierarchy only;
- no extra text/colors.

Any mismatch = reject internally; do not present as a candidate.

## Sources of authority

Read before work:
1. `data/product-identity/authorities/cylindrical-print-layout-authority.json`
2. `product-identity/ai-media/image-generation-rules.v1.json`
3. `product-identity/brand-dna/elimfilters-brand.v1.json`
4. `product-identity/PIPELINE_PRODUCT_IMAGE_AUTHORITY.md`
5. `product-identity/pipelines/manufacturer-source-rebrand.v1.json`
6. exact SKU production/source/pilot records when applicable.

Conflict order:
- exact manufacturer image controls physical geometry;
- approved phase master controls subsequent-phase geometry/composition;
- catalog DB controls SKU;
- cylindrical authority controls ELIMFILTERS paint/lithography.

## Pilot approval gate

During pilot validation:
- never auto-approve;
- never advance on silence;
- never process next SKU before explicit approval;
- never start batch automation before user authorization.

## Fleetguard control examples

LF670: approved geometry includes the exact six-hole visible baseplate arrangement from its real Fleetguard source. That geometry must never be reused for another SKU.

LF3620: must use its own exact Fleetguard source image. LF670 geometry, hole pattern, proportions, crop, or reconstructed approximations are prohibited.

## Output language

When successful, show the image with minimal commentary. When a gate fails, state only the exact failing gate and stop. Never fill a failed gate with a simulated image.
