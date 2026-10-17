# Reviewed Fleetguard resolver admission proposal

The current v7 resolver ignores 90 previously approved Fleetguard fallback bases because it checks the primary-manufacturer flag only. This proposal preserves the primary route and adds a bounded alternative requiring the exact reviewed SKU, complete base, archived official URL and evidence SHA256, active VERIFIED Fleetguard identity, approved manufacturer/base/source column and all three existing fallback flags. Any competing catalog base owner blocks this alternative, including owners that the old eligible-only grouping would miss.

The new generator produces SELECT only. No installer, migration226, new certification, or production DDL is included. Mandatory review and an installation transaction remain required. This proposal replaces the previous diagnostic's full-row fingerprint with live authority constraints so unrelated catalog edits do not revoke search admission. A change to the reviewed evidence, base or fallback flags denies admission. It does not recertify documents from URL shape and does not manufacture Donaldson absence: it consumes the separately recorded approval.

The closed 90-case manifest from PR976 is reused. Private provenance checks reproduced every source SHA: 89 structured records from migration231 data and FF5112's original evidence payload from migration115 constants; no migration was executed. These are historical structured captures, not newly downloaded HTML.

Seven targeted generator tests pass. A new live READ ONLY SELECT yields exactly 90 correct SKU/base results and no held cases. No production view or ledger was changed. The older full-resolver diff and rollback test apply to the previous fingerprint candidate; they must be repeated for this new SQL, including negative evidence/flag/ownership cases, before any installer is proposed or run. Current semantic/manual holds and native certification controls still apply separately. These changes count as zero closures.

## Restored-database verification of this candidate

On 2026-10-17 the new SQL was tested on the October16 backup restored to a separate PostgreSQL cluster at 127.0.0.1:5497. Full multiset comparison returned zero removed results and exactly 90 added results, all reviewed owners. The complete catalog stayed identical. Transaction ROLLBACK restored the original view definition exactly; the temporary server was stopped after testing.

Negative SELECT-only simulations exclude the changed case when its evidence hash, exact source URL, or any of the three fallback flags changes. A simulated second owner also denies admission without inserting a product. Every test passed. An initial negative-test implementation timed out because it reconstructed every catalog row; the test was corrected to reconstruct only the affected row and rerun successfully. This was a test-query issue in the isolated database, not a production timeout or production change.

Private evidence: fleetguard-durable-isolated-diff-20261017.json and fleetguard-durable-ownership-negatives-20261017.json. These are integration tests of search admission and restoration; native certification, manual holds, installation controls and mandatory review remain separate. No pending item is counted as closed by these tests.
