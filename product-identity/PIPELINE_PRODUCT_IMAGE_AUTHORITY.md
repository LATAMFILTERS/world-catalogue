# ELIMFILTERS Product Image Pipeline Authority

Status: ACTIVE

Purpose: enforce source-image editing with immutable SKU geometry, phased approvals, per-view protection, and exact SKU continuity. The pipeline is not text-to-image.

## Authority order

1. Exact manufacturer image controls physical geometry.
2. Approved phase master controls later geometry/composition.
3. `world_catalogue.elimfilters_catalog` controls ELIMFILTERS SKU.
4. Cylindrical print authority controls paint/lithography.

## State machine

`SOURCE_LOCKED -> GEOMETRY_APPROVED -> PAINT_LITHO_APPROVED -> FINAL_APPROVED`

## Independent view locks

A two-filter composition contains two independently protected views: `VERTICAL_VIEW` and `HORIZONTAL_VIEW`.

Once one view is approved, later edits to the other view may not change the approved view in any way: geometry, paint, lithography, lighting, pose, position, scale, perspective, shadows, crop, or relative placement.

Scoped corrections must use a localized edit/mask. Re-rendering the whole composition for a one-view correction is invalid.

## Phase 1 — Geometry only

Use the real manufacturer source. Preserve exact silhouette, dimensions/proportions, seams, rim, baseplate, thread, gasket, hole count/shape/positions, construction details, perspective, orientation, relative scale, crop and composition. No rebrand/repaint.

Approval freezes the exact geometry master.

## Phase 2 — Paint + lithography only

Input MUST be the approved Phase 1 master.

Allowed changes only: container surface paint and authorized lithography.

Paint: `#414141`, ELIMFILTERS DARK CHARCOAL, semi-matte industrial.
Lithography: `#CBCBCB`, ELIMFILTERS LITHOGRAPHY SILVER, metallic satin.

Required hierarchy:
1. Installation Rotation Direction Marks
2. official ELIMFILTERS logo
3. TOTAL ASSET PROTECTION
4. exact DB-resolved ELIMFILTERS SKU
5. product descriptor
6. official technology artwork/name
7. Powered Filtration

## SKU continuity

The database-resolved SKU is immutable across both views and all later phases.

A reference image can donate layout, typography, spacing and hierarchy only. It may NEVER donate the SKU value.

Both vertical and horizontal views must carry the same current target SKU. A candidate containing a previous SKU, reference SKU, competitor code used as SKU, or a different SKU between views is invalid.

## Phase 3 — Micro-adjustments only

Declare `target_view` and `target_property` before edit.

If editing only horizontal lithography, vertical is a protected frozen region. If editing only vertical, horizontal is protected.

Only the requested property may change. All other pixels/features are immutable.

## Render manifest

Before every image call record:
- phase
- competitor_code
- resolved_sku for Phase 2+
- source/master image id/path
- active target view
- protected view(s)
- target property
- edit mask/scope
- prior approved protected-view master id/path
- immutable elements
- allowed changes
- official logo asset path for Phase 2+
- official technology asset path for Phase 2+
- `RENDER_INPUTS_VERIFIED=true`

Missing field = STOP.

## Tool enforcement

Every valid operation must be an edit of the exact referenced source/master. If the tool performs a new full generation, lacks source lineage, or cannot preserve the protected view, reject the result and do not present it.

## Pre-display QC

Geometry: silhouette, proportions, seams, baseplate, thread, gasket, hole pattern, perspective, relative scale, composition.

Phase 2+: exact resolved SKU on both views, official assets, charcoal/silver only, authorized hierarchy, no extra text/colors.

Scoped edit: protected view unchanged; only requested view/property changed; no geometry, paint, lighting, pose, scale, position, or artwork drift outside edit scope.

Any mismatch means rejection.

## Control cases

LF670 geometry is unique and cannot be reused.
LF3620 must use its own exact Fleetguard source geometry.
Approved EL81670 imagery may be used only as style/layout guidance; its SKU must never be copied to LF3620 or any other product.

## Claude skill

Operational enforcement: `.claude/skills/elimfilters-product-image-pipeline/SKILL.md`
