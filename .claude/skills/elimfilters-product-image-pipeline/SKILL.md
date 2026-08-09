---
name: elimfilters-product-image-pipeline
description: Blocking fail-closed workflow for ELIMFILTERS product imagery. Uses fresh verified official manufacturer source images, live catalog SKU resolution, technology/asset resolution, validated AUTHORIZED_RENDER_PACKET PASS, phased approvals, protected-view locks, and automatic post-approval persistence.
activation: Trigger for every ELIMFILTERS filter image generation, edit, rebrand, approval, or batch workflow.
---

# ELIMFILTERS Product Image Pipeline v4.0

This skill is blocking, not advisory.

## Absolute execution rule

NO image-generation tool call is allowed directly from chat, memory, a prior render, an improvised prompt, or a manually remembered SKU.

Before every render attempt, the operator MUST complete the four-step Fleetguard protocol below and run:

`product-identity/scripts/prepare-product-render.mjs`

The executor must persist an `AUTHORIZED_RENDER_PACKET` with `status: PASS` for the exact current competitor SKU. If that packet does not exist, is stale, belongs to another SKU, lacks required evidence, or reports anything other than PASS, STOP. Do not call the image generator.

## Mandatory four-step Fleetguard Spin-On Lube protocol

### STEP 1 — CATALOG DISCOVERY REQUIRED
Open the canonical Fleetguard Spin-On Lube category:
`https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-lubricante/filtros-de-lubricante-giratorios/0ZGPL0000000FSv4AM`

Read the catalogue in rendered page order, code by code, 20 products per page, across the 46 pages. The current Fleetguard code must be discovered from this catalogue sequence. Do not inject a remembered code into the image workflow as a substitute for catalogue discovery.

### STEP 2 — CURRENT SKU PAGE + SCREENSHOT REQUIRED
Open the exact current Fleetguard SKU/product source. Resolve the highest-quality official image for that exact code and create an automated screenshot of the exact current source page/image. The screenshot path and SHA-256 are mandatory render evidence.

No screenshot = `STOP_RENDER`.
No exact current-SKU official image = `STOP_RENDER`.
Cache, prior master, prior render, another SKU, generic filters, or remembered geometry are forbidden.

### STEP 3 — GEOMETRY EXTRACTION REQUIRED
Before color, logo, SKU, technology or typography is applied, extract and persist geometry from the exact current source/screenshot.

Both visible product orientations are mandatory when present in the official source:
- vertical filter geometry;
- horizontal filter geometry.

The following geometry fields are mandatory and must be bound to the current source-image hash + screenshot hash:
- overall silhouette;
- body proportions;
- top rim;
- baseplate or open end;
- thread geometry;
- gasket geometry;
- inlet-hole count, shape and positions;
- support pattern;
- central support/perforation pattern;
- camera perspective;
- relative scale;
- composition.

CAP/BASE/THREAD/GASKET/INLET DETAILS ARE CRITICAL. The horizontal filter/open-end view must never be replaced by a generic spin-on baseplate.

Missing any required geometry evidence = `STOP_RENDER`.

### STEP 4 — ELIMFILTERS IDENTITY + RENDER REQUIRED
Only after Steps 1–3 PASS:
- resolve the homologous ELIMFILTERS SKU live from PostgreSQL/world catalogue;
- resolve filter type and technology live;
- load the exact current repository logo `frontend/public/assets/logo-elimfilters.png`;
- load the official technology asset from `frontend/public/assets/`;
- apply body `#414141`, semi-matte industrial coating;
- apply lithography `#CBCBCB`, metallic silver satin;
- use `TOTAL ASSET PROTECTION`;
- use the live-resolved ELIMFILTERS SKU;
- use the live-resolved descriptor/filter type;
- use the exact resolved technology;
- use `Powered Filtration`.

The final image transformation must preserve the source geometry. It may change paint and authorized lithography only; it must not redesign the mechanical object or create an infographic/catalog sheet.

## Required chain
`FLEETGUARD_SPINON_LUBE_CATALOG -> PAGE_POSITION_SKU -> CURRENT_SKU_PRODUCT_PAGE -> CURRENT_SKU_SCREENSHOT -> CURRENT_SKU_OFFICIAL_SOURCE_IMAGE -> HASH_BINDING -> VERTICAL_GEOMETRY -> HORIZONTAL_GEOMETRY -> CAP_BASE_THREAD_GASKET_INLET_GEOMETRY -> LIVE_DB_LOOKUP -> ELIMFILTERS_SKU -> FILTER_TYPE -> TECHNOLOGY -> OFFICIAL_LOGO_ASSET -> OFFICIAL_TECHNOLOGY_ASSET -> AUTHORIZED_RENDER_PACKET_PASS -> SOURCE_REFERENCED_IMAGE_TRANSFORMATION -> POST_RENDER_VALIDATION -> USER_APPROVAL -> ATOMIC_APPROVAL_PERSISTENCE -> R2_PUBLICATION_VERIFICATION -> PERSISTED`.

Every filter is an individual mechanical object. Never assume cap, baseplate, thread, gasket, inlet-hole pattern, central support, overall dimensions, body proportions, or composition from another SKU, even within the same family.

Never infer, remember, copy, or hardcode SKU, technology, color, geometry, or artwork to bypass a failed gate.

## Mandatory executable gates

1. `FLEETGUARD_CATALOG_REQUIRED`: current SKU must be bound to catalogue page 1..46 and position 1..20.
2. `OFFICIAL_SOURCE_REQUIRED`: run `acquire-manufacturer-source.mjs` against the current official product page. It must verify manufacturer host + exact current part number, resolve/download the official current product image, persist bytes + SHA-256, and create an automated audit screenshot.
3. `SCREENSHOT_REQUIRED`: screenshot path + screenshot SHA-256 must exist. Best-effort screenshot is no longer sufficient for rendering.
4. `FRESH_SOURCE_REQUIRED`: no cache, prior render/master geometry, or other SKU source.
5. `CURRENT_SKU_GEOMETRY_REQUIRED`: a geometry evidence JSON bound to the current image hash + screenshot hash must contain every mandatory vertical/horizontal/cap/base/thread/gasket/inlet/support/perspective/composition field.
6. `DATABASE_SKU_REQUIRED`: run `resolve-competitor-sku.mjs` against `world_catalogue.elimfilters_catalog`; resolution must be authoritative and non-arbitrary. The returned ELIMFILTERS SKU is authoritative.
7. `TECHNOLOGY_ASSET_REQUIRED`: run `resolve-technology-asset.mjs`; technology must derive from live catalog filter type/technology and resolve to the official asset under `frontend/public/assets/`.
8. `LOGO_ASSET_REQUIRED`: official `frontend/public/assets/logo-elimfilters.png` must exist as binary. This exact current repository asset is the only ELIMFILTERS brand logo authority.
9. `AUTHORIZED_RENDER_PACKET_REQUIRED`: run `prepare-product-render.mjs` with catalogue URL/page/position and geometry-evidence path. Required status: `PASS`.
10. `IMAGE_TOOL_CALL_GATE`: image generator may be called only after reading the exact current SKU PASS packet and using the packet values. No free-form substitutions.
11. `POST_RENDER_VALIDATION_REQUIRED`: reject before presentation if SKU, technology, colors, artwork, geometry, source binding, screenshot binding, official logo, or protected views drift from packet.
12. `USER_APPROVAL_REQUIRED`: only explicit user approval creates FINAL_APPROVED state.
13. `ATOMIC_APPROVAL_PERSISTENCE_REQUIRED`: explicit approval immediately updates source JSON, production master, canonical approved PNG, R2 publication, R2 verification, master storage fields and supersession.
14. `APPROVAL_NO_MANUAL_UPLOAD_REQUIRED`: user must not be asked to manually upload an approved render when publisher is configured.

Any failed gate disables image generation. Do not substitute a simulated image, dashboard, infographic, generic filter, remembered product, or a newly invented spin-on body.

## Presentation hard rejects
A result must never be shown as a candidate if any of the following occurs:
- source screenshot missing;
- geometry evidence missing/incomplete;
- manufacturer/Fleetguard branding remains;
- body is white instead of `#414141`;
- lithography is not `#CBCBCB`;
- ELIMFILTERS logo is generated/approximated instead of repository asset;
- SKU/technology does not come from authorized packet;
- vertical or horizontal geometry changes;
- cap/base/thread/gasket/inlet pattern changes;
- infographic, spec sheet, right-side panel, QR, cross-reference table, OEM data, website, claims or unrelated text is added.

## State machine
`CATALOG_LOCKED -> SOURCE_SCREENSHOT_LOCKED -> GEOMETRY_LOCKED -> AUTHORIZED_RENDER_PACKET_PASS -> RENDER_CANDIDATE -> USER_APPROVED -> FINAL_APPROVED -> R2_PUBLISHED -> PERSISTED`.

## Approval persistence — atomic command
Explicit approval means execute immediately, in the same workflow:
1. replace/supersede prior source-image JSON;
2. replace/supersede prior production-master JSON;
3. preserve approved gen ID, SHA-256, dimensions, source/screenshot/geometry binding, logo asset SHA/path and approval timestamp;
4. persist exact approved PNG under `product-identity/approved-images/`;
5. publish through `.github/workflows/publish-approved-render-r2.yml` to `elimfilters-renders`;
6. verify R2 object exists;
7. write exact R2 key and `https://cdn.elimfilters.com/<key>` URL to master;
8. mark older same-SKU render `SUPERSEDED`;
9. only then report approval fully persisted.

## Authority
Canonical machine contract: `product-identity/pipelines/manufacturer-source-rebrand.v2.json`.
Canonical hard gates: `product-identity/pipelines/render-hard-gates.v1.json`.
Canonical executor: `product-identity/scripts/prepare-product-render.mjs`.
Canonical publisher: `.github/workflows/publish-approved-render-r2.yml`.
Operational authority: `product-identity/PIPELINE_PRODUCT_IMAGE_AUTHORITY.md`.
