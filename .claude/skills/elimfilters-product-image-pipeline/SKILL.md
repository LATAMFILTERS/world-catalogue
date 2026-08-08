---
name: elimfilters-product-image-pipeline
description: Blocking fail-closed workflow for ELIMFILTERS product imagery. Uses fresh verified official manufacturer source images, live catalog SKU resolution, technology/asset resolution, validated manifest PASS, phased approvals, and protected-view locks.
activation: Trigger for every ELIMFILTERS filter image generation, edit, rebrand, approval, or batch workflow.
---

# ELIMFILTERS Product Image Pipeline v2.6

This skill is blocking, not advisory.

## Absolute execution rule

No image generation/edit is allowed unless a persisted render manifest has `manifest_status: PASS`.

Required chain:
`OFFICIAL_MANUFACTURER_PAGE -> CURRENT_SKU_PRODUCT_PAGE -> AUTOMATED_OFFICIAL_SOURCE_ACQUISITION -> SOURCE_HASH/EVIDENCE -> GEOMETRY_SIGNATURE -> LIVE_DB_LOOKUP -> SKU -> FILTER_TYPE -> TECHNOLOGY -> OFFICIAL_BINARY_ASSETS -> MANIFEST_PASS -> PHASE_1 -> USER_APPROVAL -> PHASE_2 -> USER_APPROVAL -> PHASE_3 -> USER_APPROVAL -> SAVE_JSON_AND_MASTER -> STORE_APPROVED_RENDER`.

Never infer, remember, copy, or hardcode SKU/technology to bypass a failed gate.

## Mandatory executable gates

1. `OFFICIAL_SOURCE_REQUIRED`: run `acquire-manufacturer-source.mjs` against the current official product page. It must verify manufacturer host + current part number, resolve/download the current official product image, persist bytes + SHA-256, and create an automated audit screenshot.
2. `FRESH_SOURCE_REQUIRED`: no cache, no prior render/master geometry, no other SKU source.
3. `DATABASE_SKU_REQUIRED`: run `resolve-competitor-sku.mjs` against `world_catalogue.elimfilters_catalog`; exactly one match.
4. `TECHNOLOGY_ASSET_REQUIRED`: run `resolve-technology-asset.mjs`; technology must derive from live catalog filter type/technology and resolve to exactly one official asset under `frontend/public/assets/`.
5. `LOGO_ASSET_REQUIRED`: official `frontend/public/assets/logo-elimfilters.png` must exist as binary.
6. `MANIFEST_PASS_REQUIRED`: run `build-render-manifest.mjs`, then validation/preflight.
7. `PHASE_APPROVAL_REQUIRED`: no phase advance without explicit user approval.
8. `PROTECTED_VIEW_LOCK_REQUIRED`: single-view fixes use localized scope; opposite approved view is immutable.
9. `RESULT_LINEAGE_REQUIRED`: application-level lineage must include current source evidence/hash/binding, DB result, technology/assets, output gen ID, and post-render geometry/artwork PASS. `edit_op:null` by itself is not a failure.

Any failed gate disables image generation. Do not substitute a simulated image.

## Screenshot policy

A manually supplied screenshot is not required for normal automated production. The source acquisition script creates a real browser screenshot automatically as audit evidence. Geometry authority is the exact verified official product image from the current manufacturer product page.

## State machine
`SOURCE_LOCKED -> GEOMETRY_APPROVED -> PAINT_LITHO_APPROVED -> FINAL_APPROVED`.

## Phase 1 — geometry only
Use the fresh current manufacturer source. Preserve silhouette, proportions, seams, rim, baseplate/open-end geometry, thread, gasket, inlet-hole/support pattern, central support/perforation pattern, perspective, orientation, relative scale, crop and composition. No ELIMFILTERS paint/lithography.

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

## Authority
Canonical machine contract: `product-identity/pipelines/manufacturer-source-rebrand.v2.json`.
Canonical hard gates: `product-identity/pipelines/render-hard-gates.v1.json`.
Operational authority: `product-identity/PIPELINE_PRODUCT_IMAGE_AUTHORITY.md`.
