# ELIMFILTERS CATALOG STRUCTURAL CLOSURE REPORT

Report date: 2026-10-07 (America/Chicago). Audit timestamp: 2026-10-08T02:16:57Z.

**Overall status: NOT_CLOSED.** No structural completion, manufacturer coverage, live application completeness, or database enforcement claim is made.

Repository base/main SHA: `55efd274f2013c27e388469cdaac9e1e6cd3d035`. Changes were developed in an isolated checkout; they are not merged or deployed. Database work used the existing Lenovo PostgreSQL runner and canonical `catalogo_elimfilters` database. Credentials remained in process. Private before/after snapshots and detailed research reports remain outside the repository.

## Six-phase assessment

| Phase | Result | Evidence and remaining condition |
| --- | --- | --- |
| 1. Historical identities and collision fixed point | NOT_CLOSED | Current cohort: 367 malformed identities, comprising 303 occupied targets and 64 free targets. Zero SKU renames qualified. The approximate historical 613-row cohort has not been reconciled against this cohort; no historical resolution percentage is claimed. |
| 2. Whole-catalog structural audit | AUDITED; FAIL | All 13,221 physical/active catalogue rows scanned. Portable read-only audit added. Findings remain; shared references are research candidates, not inferred equivalences. |
| 3. Special cases and dependencies | PARTIAL | EA15551's incorrect EH66486 product-element link quarantined; canonical EA15551 remains absent. Unsafe Deere mappings withdrawn from configuration. Derived-cache orphans repaired; substantive dependencies remain open. |
| 4. Deere Z900 | NOT_CLOSED | All 11 requested model identities registered from the official guide, with no inferred engine or application. Public service returned zero complete models. Source routing corrected and tested, but not deployed. |
| 5. Manufacturer completeness | BLOCKED | Official manufacturer universes have not been enumerated. Coverage denominators and percentages are UNKNOWN. No subsequent family declared closed while Donaldson identity/evidence gaps remain. |
| 6. Gateway, DB enforcement and CI | PARTIAL | Natural-remap and Fleetguard evidence gates hardened; governance tests pass. Existing DB function does not implement SKU-update or Donaldson-collision handling. Trigger presence alone is not enforcement proof. |

## Executed, bounded database changes

- Donaldson research added 217 official evidence ledger entries and enriched 216 catalogue authority records. One entry was intentionally evidence-only because its code differs from the row's base. Independent strict re-fetch validation passed 217/217 with zero unexpected mismatches. No SKU was renamed or legitimate occupied target overwritten.
- Deleted 728 derived cache records referencing nine absent SKUs. Saved before-state/hash; guarded row count and serializable transaction. Cache references now pass. This is a derived-data repair, not an identity resolution.
- Registered Z915B, Z915E, Z920M, Z925M EFI, Z925M Flex Fuel, Z930M EFI, Z930M, Z945M EFI, Z950M, Z955M EFI, and Z960M in the existing model table. Notes explicitly restrict evidence to model existence; engine and application verification remain false.
- Cleared only the incorrect EA15551 product-element link to hydraulic EH66486. Previous link and reason preserved in notes and a private snapshot. Compatibility row counts/hashes were unchanged. Status is QUARANTINED/OPEN, not fully repaired.

Deere model source: [official Z900 maintenance guide](https://www.deere.com/assets/pdfs/common/parts-and-service/manuals-training/Z915B-Z915E-Z920M-Z925MEFI-Z925M-FLEX-FUEL-Z930M-EFI-Z930M-Z945M-EFI-Z950M-Z955M-EFI-Z960M.pdf). The locally retrieved guide's SHA-256 is `b85126eb4998e113e35209ff96163758b26dc0f5a5ca5a21b378a0a149a77e1d`.

## Identity and official-source research

Donaldson collision batches reached zero further selected research candidates. This is a research-selection fixed point, not a completed catalogue. Free-target research left all 64 rows blocked. Final run218/run219/run224/run225 plans agreed on zero eligible remaps or fallback applications.

The 303 collision rows remain divided into 216 requiring a verified Fleetguard-to-source relationship and 87 lacking the required canonical Donaldson evidence. Fleetguard research examined 323 per-row candidate codes across 91 eligible rows (252 distinct codes), producing zero qualified relationships and zero Fleetguard ledger mutations. 310 rendered candidates lacked the required Donaldson cross-reference; 13 additionally lacked exact body/image binding. These outcomes do not establish manufacturer nonproduction or exhaust all possible official documentation. Hidden tabs and additional official documents may require further research.

New gates require exact official host/product path, exact code tokens, image binding, a direct cross-reference relationship, source identity binding, timestamp, and SHA-256. Product existence alone cannot authorize equivalence. Natural remaps additionally require exact prefix/last-four target, matching official Donaldson ledger evidence, existing governance validation, and an unoccupied target including inactive identities.

## Global audit findings

Counts below are finding assertions, not distinct bad catalogue rows; multiple findings can affect one row. Dependency counts are table/SKU groups. Shared codes/bases require authority review before any identity merge.

| Classification | Assertions |
| --- | ---: |
| POLICY_VIOLATION | 11,060 |
| REQUIRES_AUTHORITY_RESEARCH | 41,292 |
| IDENTITY_COLLISION | 299 |
| DEPENDENCY_REPAIR | 4,628 |
| EVIDENCE_ANOMALY | 1,937 |
| GRAPH_CORRUPTION | 129 |
| Total | 59,345 |

Substantive references include 2,105 unique missing SKUs across 32,994 dependent rows. No identity was guessed to repair them. Remaining failures include equipment links, historical LD product catalogue, vehicle applications, OEM/competitor references, specifications and readiness. Existing kit-components, product-element catalogue references, product-model certifications and evidence-ledger references pass. The 129 remaining graph findings are air elements linked to hydraulic SKU families and need targeted review.

Evidence-anomaly assertions mean primary flags lack a complete matching ledger proof in this audit; they do not establish that no other evidence archive exists. Daily governance also fails: all 13,221 rows retain older policy metadata, and 1,452 reference-contamination flags exceed the established 1,344 baseline. Metadata was not relabelled to v4.2 without verification.

## Deere application status

Live checks made a separate public chat request for each of the 11 models, before and after registration. All returned HTTP 200 with `no_evidence`; complete models: 0/11. EFI and Flex Fuel identities remain distinct. Source changes preserve full model questions, skip part-reference preflight for those questions, route them to application lookup and clear stale engine/year context when the model changes. They have not been deployed, and routing tests are not live application evidence.

Unsafe UC16183, UC21217, MIU13224 and MIA881446 mappings were removed from active configuration while their previous values/reasons were retained for review. The EH65409/Toro decision was also withdrawn. Existing candidate mappings for M131802, M131803, AM107423, AM125424 and AM116304 require current application validation; housings/transmission and engine identity remain explicit blockers.

## Validation and next closure conditions

- Governance tests: 140 passed, zero failed.
- Additional conversation/protocol suites: 43 passed, zero failed.
- Catalogue write-boundary check: PASS. Diff whitespace check: PASS.
- Whole-catalog read-only audit: FAIL with explicit findings above; mutation count zero.
- Daily read-only governance audit: FAIL as above.
- Database runtime enforcement probes: NOT_EXECUTED. Build/deployment: NOT_EXECUTED.

Completion still requires authority-backed resolution or explicit STOP_REVIEW dispositions for the unresolved identity cohort, substantive dependency repair, targeted graph/source review, v4.2 database enforcement implementation and runtime verification, and authoritative/live completeness for all 11 Deere models. Manufacturer completeness requires a defensible official denominator. A missing search result cannot satisfy manufacturing-absence evidence. No merge, deployment, or main-SHA advancement is claimed by this report.
