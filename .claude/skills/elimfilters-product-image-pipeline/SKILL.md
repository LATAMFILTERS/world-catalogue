---
name: elimfilters-product-image-pipeline
description: Blocking fail-closed workflow for ELIMFILTERS product imagery. Requires real manufacturer screenshot and source image, live catalog SKU resolution, technology/asset resolution, validated manifest PASS, edit-only image lineage, phased approvals, and protected-view locks.
activation: Trigger for every ELIMFILTERS filter image generation, edit, rebrand, approval, or batch workflow.
---

# ELIMFILTERS Product Image Pipeline v2

This skill is blocking, not advisory.

## Absolute execution rule

No image generation/edit is allowed unless a persisted render manifest has `manifest_status: PASS`.

Required chain:
`MANUFACTURER_URL -> REAL_SCREENSHOT -> REAL_SOURCE_IMAGE -> LIVE_DB_LOOKUP -> SKU -> FILTER_TYPE -> TECHNOLOGY -> OFFICIAL_BINARY_ASSETS -> MANIFEST_PASS -> PHASE_1 -> USER_APPROVAL -> PHASE_2 -> USER_APPROVAL -> PHASE_3 -> USER_APPROVAL -> SAVE_JSON_AND_MASTER`.

Never infer, remember, copy, or hardcode SKU/technology to bypass a failed gate.

## Mandatory executable gates

1. `SOURCE_SCREENSHOT_REQUIRED`: run `capture-manufacturer-screenshot.mjs`; persist a real browser screenshot.
2. `SOURCE_IMAGE_REQUIRED`: run `fetch-manufacturer-image.mjs`; persist real manufacturer image bytes.
3. `DATABASE_SKU_REQUIRED`: run `resolve-competitor-sku.mjs` against `world_catalogue.elimfilters_catalog`; exactly one match.
4. `TECHNOLOGY_ASSET_REQUIRED`: run `resolve-technology-asset.mjs`; technology must derive from live catalog filter type/technology and resolve to exactly one official asset under `frontend/public/assets/`.
5. `LOGO_ASSET_REQUIRED`: official `frontend/public/assets/logo-elimfilters.png` must exist as binary.
6. `MANIFEST_PASS_REQUIRED`: run `build-render-manifest.mjs`, then `validate-render-manifest.mjs`.
7. `EDIT_ONLY_REQUIRED`: render must edit the exact source/approved master. New text-to-image generation is invalid.
8. `PHASE_APPROVAL_REQUIRED`: no phase advance without explicit user approval.
9. `PROTECTED_VIEW_LOCK_REQUIRED`: single-view fixes use localized scope; opposite approved view is immutable.
10. `RESULT_LINEAGE_REQUIRED`: after render, run `validate-render-result.mjs`; `edit_op`/source lineage missing or null => REJECT_OUTPUT.

Any failed gate disables image generation. Do not substitute a simulated image.

## State machine
`SOURCE_LOCKED -> GEOMETRY_APPROVED -> PAINT_LITHO_APPROVED -> FINAL_APPROVED`.

## Phase 1 — geometry only
Use the real manufacturer source as edit target. Preserve silhouette, proportions, seams, rim, baseplate, thread, gasket, inlet-hole count/shape/positions, valves/construction, perspective, orientation, relative scale, crop and composition. No ELIMFILTERS paint/lithography.

## Phase 2 — paint + lithography only
Prerequisite `GEOMETRY_APPROVED`. Input is the exact approved Phase-1 master.

Only allowed changes: can paint and authorized lithography.
- container: `#414141`, semi-matte industrial.
- lithography: `#CBCBCB`, metallic silver satin.
- official ELIMFILTERS logo binary.
- `TOTAL ASSET PROTECTION`.
- exact live-DB-resolved SKU.
- live-resolved product descriptor/filter type.
- exact resolved official technology asset/name.
- `Powered Filtration`.
- approved installation rotation marks.

No QR, OEM/cross-reference print, specs, claims, website, German Quality, secondary colors, generated logo, generated technology mark, or arbitrary characters.

## Phase 3 — micro-adjustments only
Declare `target_view` and `target_property`. `VERTICAL_ONLY` freezes horizontal; `HORIZONTAL_ONLY` freezes vertical. Only requested property may change. Whole-composition regeneration for a one-view correction is invalid.

## SKU and technology continuity
SKU comes only from executable DB lookup for the current competitor code. Technology comes only from that lookup/filter-type mapping plus official asset resolution. Visual references may donate layout/typography only, never SKU, technology, geometry, or product identity.

## Output enforcement
If render metadata shows `edit_op: null`, absent source lineage, changed protected view, wrong SKU/technology, wrong geometry, or extra artwork: reject internally and do not present.

## Authority
Canonical machine contract: `product-identity/pipelines/manufacturer-source-rebrand.v2.json`.
Canonical manifest schema: `product-identity/pipelines/render-manifest.schema.json`.
Operational authority: `product-identity/PIPELINE_PRODUCT_IMAGE_AUTHORITY.md`.
Legacy v1 pipeline is retired and must not be used.
