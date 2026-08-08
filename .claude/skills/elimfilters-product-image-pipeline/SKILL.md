---
name: elimfilters-product-image-pipeline
description: Mandatory fail-closed workflow for ELIMFILTERS cylindrical product imagery. Requires exact real manufacturer source imagery, immutable geometry lineage, phased approvals, catalog SKU resolution, official repository artwork assets, per-view locking, and exact edit scope. Text-to-image reconstruction is prohibited.
activation: Trigger whenever a user asks to generate, create, edit, transform, render, rebrand, approve, or automate an ELIMFILTERS filter image.
---

# ELIMFILTERS Product Image Pipeline

Mandatory and fail-closed. Never bypass a gate to make progress.

## Root rule

NEVER reconstruct a product from text. Every render must edit an exact referenced source/master image. If the image tool has no real source lineage, STOP.

## State machine

`SOURCE_LOCKED -> GEOMETRY_APPROVED -> PAINT_LITHO_APPROVED -> FINAL_APPROVED`

## View model

Every two-filter composition is treated as two independent locked views:

- `VERTICAL_VIEW`
- `HORIZONTAL_VIEW`

Each view has its own:
- geometry lock;
- lithography lock;
- approval state;
- source/master image lineage;
- immutable pixel region outside the active edit mask.

Approval of one view freezes that view. A later edit to the other view MUST NOT alter, regenerate, relight, reposition, rescale, repaint, relabel, or re-render the approved view.

## Phase 0 — SOURCE LOCK

Required:
- exact manufacturer code;
- exact manufacturer product page/direct image;
- real source image bytes physically available to image tool;
- spin-on baseplate/thread/gasket/hole pattern visible;
- upright/horizontal composition recorded.

Synthetic/recreated manufacturer imagery is prohibited.

## Phase 1 — GEOMETRY ONLY

No ELIMFILTERS branding work. Preserve exact manufacturer geometry and composition:
- silhouette;
- height/diameter ratio;
- body length;
- rims/seams;
- baseplate;
- thread;
- gasket;
- inlet-hole count/shape/positions;
- valves/construction details;
- perspective;
- orientation;
- relative scale;
- crop/composition.

User approval creates `GEOMETRY_APPROVED` and freezes the geometry master.

## Phase 2 — PAINT + LITHOGRAPHY ONLY

Prerequisite: `GEOMETRY_APPROVED`.

Input MUST be the approved geometry master. No new product generation.

Allowed changes only:
- container paint;
- authorized lithography.

Paint: `#414141` ELIMFILTERS DARK CHARCOAL, semi-matte industrial.
Lithography: `#CBCBCB` ELIMFILTERS LITHOGRAPHY SILVER, metallic satin.

Required artwork:
- official ELIMFILTERS logo binary;
- `TOTAL ASSET PROTECTION`;
- exact DB-resolved ELIMFILTERS SKU;
- approved product descriptor;
- official technology artwork/name;
- `Powered Filtration`;
- approved Installation Rotation Direction Marks.

### SKU continuity rule

The resolved SKU is established once per target product and becomes immutable for all views and all later phases.

Never copy a SKU from:
- a previous image;
- a visual reference image;
- another approved product;
- another view;
- remembered context.

Both `VERTICAL_VIEW` and `HORIZONTAL_VIEW` must print the same exact current resolved SKU for the target product.

A visual reference may control typography, spacing, hierarchy, or placement only; it may NEVER donate its SKU value.

## Phase 3 — MICRO-ADJUSTMENTS ONLY

Prerequisite: `PAINT_LITHO_APPROVED`.

Before edit, declare:
- `target_view`: `VERTICAL_ONLY`, `HORIZONTAL_ONLY`, or `BOTH`;
- `target_property`: exact property being changed.

If target is `HORIZONTAL_ONLY`, then `VERTICAL_VIEW` is a frozen protected region and must remain pixel-equivalent to the approved version.

If target is `VERTICAL_ONLY`, then `HORIZONTAL_VIEW` is frozen.

Only the requested property may change. No cumulative unsolicited changes.

Examples:
- horizontal lithography correction -> only horizontal printed surface changes;
- vertical SKU typography correction -> only vertical SKU typography changes;
- geometry, paint, lighting, pose, scale, camera, shadows, and the opposite view remain unchanged.

## Catalog gate

Resolve SKU from `world_catalogue.elimfilters_catalog` using:

`node product-identity/scripts/resolve-competitor-sku.mjs --code=<CODE> --brand=<BRAND> --duty=HEAVY_DUTY`

Exactly one match required. No inferred/manual/remembered fallback.

## Binary artwork gate

Before Phase 2, physically load:
- `frontend/public/assets/logo-elimfilters.png`;
- exact approved technology asset from `frontend/public/assets/`.

Text descriptions do not satisfy this gate.

## Render manifest

Before every image call record:
- phase;
- competitor_code;
- resolved_sku when Phase 2+;
- source/master image id/path;
- source image real=true;
- active target view;
- protected view(s);
- target property;
- edit mask/scope;
- immutable elements;
- allowed changes;
- prior approved view master id/path when one view is frozen;
- `RENDER_INPUTS_VERIFIED=true`.

Missing field = STOP.

## Tool-call enforcement

Valid operation must be an EDIT of the exact referenced source/master.

If operation is effectively new generation, if `edit_op`/source lineage is absent, or if protected view cannot be preserved, REJECT and do not present.

## Pre-display QC

Always compare candidate against current approved master.

Geometry QC:
- silhouette;
- proportions;
- baseplate;
- thread;
- gasket;
- hole pattern;
- seams;
- perspective;
- relative scale;
- composition.

Phase 2+ QC:
- current resolved SKU appears identically on both views;
- no SKU from reference/previous product leaked into image;
- official logo/technology assets;
- charcoal/silver only;
- authorized hierarchy;
- no extra text/colors.

Scoped-edit QC:
- protected view is unchanged;
- only requested view/property changed;
- no geometry, paint, lighting, position, scale, or artwork drift outside mask.

Any mismatch = reject internally.

## Control rules

LF670 geometry is unique to LF670 and cannot be reused.
LF3620 must use its own exact Fleetguard source geometry.
Approved EL81670 imagery is a style/layout reference only and must never donate its SKU to LF3620 or another product.

## Output

On success, show image with minimal commentary. On gate failure, state only the failing gate and stop.
