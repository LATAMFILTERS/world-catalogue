# Application presentation and inherited applications audit
Date: 2026-10-04 UTC

## Implemented behavior
Part Search preserves product identity and OEM/competitor references, labels references as requiring technical review, and distinguishes search uniqueness from compatibility validation.
Applications require a verified catalog_application_evidence row for the same SKU and application kind, a nonempty source_url and evidence_hash, and payload_hash matching md5 of the current PostgreSQL JSONB text. The returned payload must also equal that catalog payload; transformed payloads are withheld conservatively.
Missing evidence or a failed lookup withholds applications. No catalog rows, base codes, reference relationships, certification states or evidence histories are mutated.
Recorded certification state and audited_at are exposed as historical audit information, not a fresh certification.
The same response guard applies to /api/search, /api/search/equipment and /api/search/vin. Existing strict part-number resolution and family isolation are preserved.
UI uses explicit pending-validation wording and indicates a recorded BLOCKED SKU.

## Reuse and minimal additions
Reused the active express response wrapper, PostgreSQL pool, certification table, application evidence table, reference quarantine loader and scheduled Lenovo service task.
Added one presentation helper and four regression tests. Added an explicit --runtime-only startup option to reload installed governance without running data migrations during this presentation-only deployment. Default startup remains unchanged.
The existing runner accepts an optional RuntimeOnly switch; its default and scheduled task action were restored after restart. Render remains a bridge.
Existing uncommitted work was preserved; this branch contains only these additions.

## Verification
Four regression tests pass: blocked/unverified payloads; exact verified payload versus changed payload; failed evidence lookup and nested unidentified applications; separate vehicle evidence.
Syntax checks pass for the helper, runtime wrapper, startup file and embedded UI JavaScript.
Live first deployment checks of six rejected-base-promotion SKUs return their identity, recorded BLOCKED state, SEARCH_RESULT_ONLY and zero unverified equipment applications:
EH68277 withheld 8; EH68318 489; EH68319 489; EH68320 489; EH68936 465; EH68944 22.
No base promotion is implied by an observed cross-reference.
The deployment had a brief interruption when Windows denied changing a task action after stopping the service. Recovery reused the existing task, and its original action remained unchanged.

## Group 1: EH66235 inheritance
Eight SKUs each carry eight identical historical applications (64 SKU/application relationships).
Current PostgreSQL payload hash: 4e9d160a877b417ba099c0f13fb54db0.
Every SKU has zero matching evidence rows meeting the complete publication criteria.
Seven targets record EH66235 as their inheritance origin; EH66235 is the source.

| SKU | Current base | Official reference consulted | Application disposition |
| --- | --- | --- | --- |
| EH66234 | P566234 | https://shop.donaldson.com/store/en-us/product/P566234/37330 | Evidence required |
| EH66235 | P566235 | https://shop.donaldson.com/store/en-us/product/P566235/37331 | Evidence required |
| EH66237 | P566237 | https://shop.donaldson.com/store/fr-fr/product/P566237/37333 | Evidence required |
| EH66254 | P566254 | https://shop.donaldson.com/store/en-us/product/P566254/37350 | Evidence required |
| EH66255 | P566255 | https://shop.donaldson.com/store/en-us/product/P566255/37351 | Evidence required |
| EH66256 | P566256 | https://shop.donaldson.com/store/fr-us/product/P566256/37352?_requestid=7077096 | Evidence required |
| EH66257 | P566257 | https://shop.donaldson.com/store/en-us/product/P566257/37353 | Evidence required |
| EH68277 | HF8277 | No verifiable official application source obtained | Evidence required |

Historical applications in each payload: Chevrolet PRIZM 2002; Toyota COROLLA 2002; Toyota TERCEL 1999; Toyota CELICA 1990; Toyota MR2 1989; Toyota CAMRY 1986; Geo PRIZM 1997; Geo NOVA 1988. Engine strings remain preserved in the database.
The official Donaldson pages identify hydraulic cartridges. Retrieved content does not substantiate these eight applications. This absence is not treated as exhaustive proof of incompatibility; no deletion or negative technical certification was made.
Next evidence must establish each target SKU/base and exact equipment/model, engine, year and filter position. An inherited source record or shared code is insufficient.

## Subsequent review groups
Prioritize EH66502 (11 inherited targets, includes three rejected-base-promotion SKUs), EH65153 (includes EH68936), and EH68944 separately because it lacks the inheritance marker.
Then review the largest remaining hydraulic groups: EH60455 (27 targets), EH66230 (21), EH66244 (7), EH66706 (6). Counts are inheritance targets, excluding the source SKU, and do not indicate invalidity.
Total inherited population remains 552 targets. This audit has not individually certified all OEM/competitor links or completed all inherited applications.
