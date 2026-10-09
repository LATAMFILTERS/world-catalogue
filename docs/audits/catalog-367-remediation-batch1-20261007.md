# First remediation batch: original 367-row cohort

Local date: 2026-10-07, America/Chicago. Canonical database: existing Lenovo `catalogo_elimfilters`. Detailed snapshots and official-source files remain private beside this report.

## Measured result

- Original cohort: 367 malformed identities.
- Verified and corrected: **1/367 (0.27%)**.
- Still pending: **366**, comprising **63 free targets** and **303 collision rows**.
- Final governed run218 read-only plan: zero eligible automatic remaps. Unverified identities were not renamed to improve the count.

## Applied repair

`EL80352` → `EL82352`, keeping Donaldson base `P502352` (prefix EL8 plus last four digits 2352).

Authority: [Donaldson New Products, November 2024](https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/south-africa/new-products/2024/New-Products-November-2024.pdf), page 1. It explicitly lists P502352 as a lube cartridge, beside Isuzu 1132402341, Fleetguard LF16385 and HIFI SO6129. Only product identity was certified; no model, engine or application was inferred from this document. Source bytes SHA-256: `c8c265958fb36c367085877d0bfd71b8b5aab591805faff28c65f4d8d2c598d4`.

Dry-run qualified under the existing write gateway and natural-remap evidence guard. Execute used a serializable transaction, protected the unoccupied target, saved full before-state, moved three existing dependencies (exact_part_reference, catalog_sku_certification and sanitation queue), inserted the official evidence, and rebuilt the existing derived cache. Postcheck found only the new catalogue identity, matching official ledger evidence and 12 cache records. OEM/competitor codes, applications, duty and filter type were preserved exactly.

## What the first 64 actually contain

- 53 use their own provisional ELIMFILTERS SKU as codigo_base, rather than a manufacturer reference. All 53 retain MANN and Fleetguard candidate references in brand_crossrefs, which the prior Donaldson research path did not inspect. Those references were recovered into an explicit research list; they are candidates, not certified equivalents.
- 10 remaining rows have an external reference (mostly Fleetguard-style codes), requiring official identity/fallback evidence.
- 1 row had directly verifiable Donaldson identity and was repaired above.

The internal-code pattern matches the historical resolve-orphan-skus importer: MAX suffix + 1, codigo_base = assigned SKU, raw OEM codes, brand_crossrefs and equipment_applications holding OEM parts. The 53 share creation timestamp 2026-06-24T21:32:10.990Z. This is a strong provenance lead; the current fleetguard_orphans file did not retain matching assignments, so exact per-row execution provenance remains unproven. The importer also mapped water filters to oil, and preferred Fleetguard/MANN prefixes without authority: no such classification is automatically accepted.

The official [Donaldson agriculture cross-reference guide](https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/north-america/industries-markets/F112250-ENG/Agriculture-Market-Overview.pdf) supplies research candidates for EF984003 (FF149 ↔ P550012) and EH685196 (HF35296 ↔ P550606). The original OEM/product identity and any occupied targets still require verification before merge or rename. These two are not counted resolved.

## EA15551 provenance

Repository run204, introduced in main by commit ae27de5ed1e60a90ebcb700027dfa956a0c70bdf (#823), declares EA121575/P821575 → EA15551/AF25551 because EA11575 is occupied by P541575. Its original implementation wrote verified authority flags without checking an official evidence ledger. Run214 (#835) subsequently defined the product-element code/link change from EA121575 to EA15551; it could not itself create an EH66486 link.

Current local catalogue still contains EA121575/P821575 and EA11575/P541575, but no EA15551 catalogue row. Product-element 2242 carries EA15551 and was previously linked to hydraulic EH66486/P566486. That erroneous link was quarantined earlier; it remains null. The exact subsequent mutation that produced EH66486 has not been located and is not attributed to run214.

This batch confirmed Fleetguard's exact AF25551 official product page (body and image binding), and the Donaldson agriculture guide explicitly places P821575 and AF25551 in the same cross-reference row. The PDF relationship improves the evidence; it does not certify Deere engines or live applications. Exact current Donaldson page retrieval for the occupying P541575 could not be completed with the research browser, although the official indexed product page is discoverable. EA15551 remains open; no guessed rename or model certification was applied.

## Remaining conditions

Next authority work: verify the ten external-reference rows, reconcile the 53 recovered candidate sets to original OEM identities and legitimate existing targets, finish EA15551 collision/graph provenance, and continue the 303 collision rows. Each identity requires source-bound evidence and post-repair dependency checks. A STOP_REVIEW disposition stays pending in the resolution percentage. Catalogue-wide closure remains NOT_CLOSED.
