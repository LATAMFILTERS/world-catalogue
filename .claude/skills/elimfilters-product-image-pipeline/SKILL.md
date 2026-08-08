---
name: elimfilters-product-image-pipeline
description: Blocking fail-closed workflow for ELIMFILTERS product imagery. Uses fresh verified official manufacturer source images, live catalog SKU resolution, technology/asset resolution, validated AUTHORIZED_RENDER_PACKET PASS, phased approvals, and protected-view locks.
activation: Trigger for every ELIMFILTERS filter image generation, edit, rebrand, approval, or batch workflow.
---

# ELIMFILTERS Product Image Pipeline v2.9

This skill is blocking, not advisory.

## Absolute execution rule

NO image-generation tool call is allowed directly from chat, memory, a prior render, or an improvised prompt.

Before every render attempt, the operator MUST run the repository executor:

`product-identity/scripts/prepare-product-render.mjs`

The executor must persist an `AUTHORIZED_RENDER_PACKET` with `status: PASS` for the exact current competitor SKU. If that packet does not exist, is stale, belongs to another SKU, lacks required evidence, or reports anything other than PASS, STOP. Do not call the image generator.

Required chain:
`OFFICIAL_MANUFACTURER_PAGE -> CURRENT_SKU_PRODUCT_PAGE -> AUTOMATED_OFFICIAL_SOURCE_ACQUISITION -> AUTOMATED_SCREENSHOT_AUDIT -> SOURCE_HASH/EVIDENCE -> CURRENT_SKU_GEOMETRY_SIGNATURE -> LIVE_DB_LOOKUP -> ELIMFILTERS_SKU -> FILTER_TYPE -> TECHNOLOGY -> OFFICIAL_BINARY_ASSETS -> AUTHORIZED_RENDER_PACKET_PASS -> IMAGE_TRANSFORMATION -> POST_RENDER_VALIDATION -> USER_APPROVAL -> SAVE_JSON_AND_MASTER -> STORE_APPROVED_RENDER`.

Every filter is an individual mechanical object. Never assume cap, baseplate, thread, gasket, inlet-hole pattern, central support, overall dimensions, body proportions, or composition from another SKU, even within the same family.

Never infer, remember, copy, or hardcode SKU, technology, color, geometry, or artwork to bypass a failed gate.

## Mandatory executable gates

1. `OFFICIAL_SOURCE_REQUIRED`: run `acquire-manufacturer-source.mjs` against the current official product page. It must verify manufacturer host + exact current part number, resolve/download the official current product image, persist bytes + SHA-256, and create an automated audit screenshot.
2. `FRESH_SOURCE_REQUIRED`: no cache, no prior render/master geometry, no other SKU source.
3. `CURRENT_SKU_GEOMETRY_REQUIRED`: extract and record the geometry signature from the exact current source before any rendering. At minimum: body proportions, top/cap geometry, baseplate/open-end type, thread geometry, gasket geometry, inlet-hole/support pattern, central support/perforation pattern, orientation, perspective and composition.
4. `DATABASE_SKU_REQUIRED`: run `resolve-competitor-sku.mjs` against `world_catalogue.elimfilters_catalog`; exactly one exact match. The returned ELIMFILTERS SKU is authoritative.
5. `TECHNOLOGY_ASSET_REQUIRED`: run `resolve-technology-asset.mjs`; technology must derive from live catalog filter type/technology and resolve to the official asset under `frontend/public/assets/`.
6. `LOGO_ASSET_REQUIRED`: official `frontend/public/assets/logo-elimfilters.png` must exist as binary.
7. `AUTHORIZED_RENDER_PACKET_REQUIRED`: run `prepare-product-render.mjs`. Required status: `PASS`. The packet must bind manufacturer, competitor part number, source image path/hash, screenshot audit path when available, geometry signature, live DB SKU, filter type, technology, official assets, authorized colors, copy, and immutable geometry.
8. `IMAGE_TOOL_CALL_GATE`: the image generator may be called only after reading the current SKU's PASS packet and using the exact packet values. No free-form substitution is allowed.
9. `POST_RENDER_VALIDATION_REQUIRED`: reject before presentation if SKU, technology, colors, artwork, geometry, source binding, or protected views drift from the packet.
10. `USER_APPROVAL_REQUIRED`: only explicit user approval creates FINAL_APPROVED state.
11. `POST_APPROVAL_PERSISTENCE_REQUIRED`: after approval, write/update JSON/master and queue/store the approved PNG in the configured production storage.

Any failed gate disables image generation. Do not substitute a simulated image, dashboard, infographic, generic filter, or remembered product.

## Screenshot policy

A manually supplied screenshot is NOT required for normal automated production. The acquisition step must create the screenshot automatically from the current official manufacturer page. A manual screenshot may be used only as emergency evidence when explicitly authorized; it must never become the normal workflow.

The operator must not ask the user to provide screenshots SKU-by-SKU when the automated source acquisition is expected to work.

## State machine
`SOURCE_LOCKED -> AUTHORIZED_RENDER_PACKET_PASS -> RENDER_CANDIDATE -> USER_APPROVED -> FINAL_APPROVED -> PERSISTED`.

## Geometry rule — per SKU, no assumptions

Every SKU is mechanically unique until proven otherwise by the current official source. For each filter, preserve exactly what is visible in the current official source: silhouette, proportions, seams, top/cap, baseplate/open end, thread, gasket, inlet-hole count/shape/position, support/star pattern, center perforation/core, valves/retainers, perspective, orientation, relative scale, crop and composition.

A geometry match from another filter family member is NOT evidence. A visually similar thread or cap is NOT permission to reuse geometry.

## Authorized artwork — values come only from packet

The packet must resolve and lock:
- container: `#414141`, semi-matte industrial coating.
- lithography: `#CBCBCB`, metallic silver satin.
- official ELIMFILTERS logo binary.
- `TOTAL ASSET PROTECTION`.
- exact live-DB-resolved ELIMFILTERS SKU.
- live-resolved product descriptor/filter type.
- exact resolved official technology asset/name.
- `Powered Filtration`.
- approved installation rotation marks when present/authorized.

No QR, OEM/cross-reference print, specs, validation text, source URLs, claims, website, German Quality, secondary colors, generated logo, generated technology mark, arbitrary characters, or manufacturer branding in the final ELIMFILTERS render.

## Chat execution prohibition

For this project, the conversational assistant must NEVER call image generation merely because the user says "2/20", "3/20", "generate it", "next", or equivalent. Those requests mean: execute the repository protocol for that position/SKU first. Only a current `AUTHORIZED_RENDER_PACKET: PASS` unlocks the image tool.

If the assistant cannot execute or verify the repository packet in the current environment, it must STOP and report the exact failed gate. It must not generate a best-effort image.

## Approval persistence

After explicit approval:
1. create/update source-image JSON;
2. create/update production master JSON;
3. retain approved gen ID/hash/path;
4. upload/queue approved image to configured R2 production key;
5. write final storage locator back to the master;
6. mark prior visual masters for the same SKU superseded when applicable.

## Authority
Canonical machine contract: `product-identity/pipelines/manufacturer-source-rebrand.v2.json`.
Canonical hard gates: `product-identity/pipelines/render-hard-gates.v1.json`.
Canonical executor: `product-identity/scripts/prepare-product-render.mjs`.
Operational authority: `product-identity/PIPELINE_PRODUCT_IMAGE_AUTHORITY.md`.
