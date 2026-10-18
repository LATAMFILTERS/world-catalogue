# Fleetguard fallback resolver: case-bound review

91 active products have a Fleetguard commercial base accepted by the current `deriveCodigoBaseGovernance` rules, yet their base codes return no rows in the current v7 resolver. The view admits a catalog base only through `primary_manufacturer_verified`; these rows instead carry the separately approved fallback flags. Do not set the primary-manufacturer flag to true to work around this distinction.

The archived current-row diagnostic selects 90 cases with matching complete canonical code, active status, Fleetguard VERIFIED source, official Fleetguard product URL and stored SHA256 evidence identifier. ED47754 is excluded because its canonical-evidence fields do not meet that additional test. The existing URL validator is unchanged; localized recorded URLs are inspected only in the private diagnostic and are not newly approved for production use by this PR. Historical evidence is not recertified by a successful URL-shape check.

`lib/case-bound-resolver-preview.js` generates a SELECT-only review candidate. It preserves the original primary verification path and every other resolver branch, adding an explicit reviewed SKU/base/full-row fingerprint alternative at the existing projection. The manifest is bounded, rejects duplicate ownership and unsafe literals, and refuses changed/unexpected view definitions. Any catalog-row change invalidates its reviewed match. PostgreSQL md5 is only a full-row change detector; SHA256 records archive/SQL identities. This is deliberately unsuitable as a broad or permanent approval mechanism.

No installer, DDL, catalog update, certification update, URL-validator change or migration226 is included. The manifest lists only review identifiers, source URLs and hashes; complete catalog snapshots remain in private evidence. It does not authorize manufacturing absence, equivalence, regional origin, certification or future row versions.

## Verification

- 22 targeted tests pass: preview generator, existing Fleetguard evidence checks and current base-governance policy.
- Live READ ONLY transaction using this generator: 0 existing matches versus 90 candidate matches, exactly one correct SKU and Fleetguard manufacturer per complete base.
- A negative fingerprint simulation must exclude the changed case; no production record is changed to run it.
- Case manifest and source-view SHA are included for review. Production v7 and the ledger remain unchanged; no pending products are counted as closed.

## Before an installation proposal

Independently review the case evidence and localized URL semantics, source-artifact availability, current manual holds, all base ownership conflicts and the live view revision. Design a reviewed durable approval mechanism rather than installing this frozen preview blindly. Provide full definition/dependency backup with SHA256, tested restoration, native certification evaluations, full resolver-diff checks and product/301 verification. Mandatory GitHub review still applies. This PR is diagnostic infrastructure and a concrete bounded candidate for that review, not the production fix.