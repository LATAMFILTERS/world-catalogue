# HERMES + PostgreSQL: phased integrity audit

Status: initial implementation. **No production database audit has been executed**. This branch provides a read-only host baseline only.

## Safety boundaries
- Do not run `automation/windows/run-hermes-weekly.ps1` as an audit command. It contains `git fetch`, `git reset --hard`, and `git clean` against its configured runtime checkout, and loads live secrets.
- Do not run any write gateway, migration, publication, retry, or research job against the live database as part of discovery.
- Do not expose credentials, connection URLs, secret-file contents, or PostgreSQL row contents in shared logs.
- Catalog application rows withheld by evidence guards are **not necessarily erroneous**.
- On a production PostgreSQL instance, use a dedicated SELECT-only account before issuing diagnostics. `BEGIN READ ONLY` is defense in depth, not a substitute for server-side privileges.

## Phase 1 — host/process baseline
Run from an isolated, up-to-date checkout on ELIMSERVER:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\automation\windows\audit-hermes-postgres-baseline.ps1
```

The script reports resource capacity, PostgreSQL service status and listening ports, HERMES scheduled task status and last results, presence of known paths, and runtime Git identity. No database connection occurs. Avoid storing any output that inadvertently reveals local environment details in a public repository.

Interpretation: `LastTaskResult=0` alone does not prove the requested catalog records were processed. Reconcile execution logs, checkpoint state, actual job outputs, and row-level evidence separately.

## Phase 2 — database inventory (NOT AUTOMATED)
1. Confirm the **actual** cluster, port, and database; expected candidate names include `catalogo_elimfilters` and `elimfilters_crm`, but verify rather than assume.
2. Verify a recent consistent backup, its storage destination on UGREEN, and a **successful test restore** outside production.
3. Provision a read-only PostgreSQL account with narrowly scoped SELECT rights; explicitly test INSERT/UPDATE denial in an isolated disposable test database, not production.
4. Record schema, table sizes, row counts, indexes, foreign keys, duplicate-key candidates, and evidence-governance tables with reviewed SELECT queries and statement timeouts. Avoid dumping sensitive rows.
5. Record query durations and resource cost on the primary; stop if load is abnormal.

## Phase 3 — anomaly classification
Produce distinct buckets: structural duplicates, inconsistent cross references, invalid OEM / competitor evidence, application evidence missing, published-without-evidence, and suspected product-data conflicts. Keep SKUs and source citations traceable; do not infer that evidence-guarded records are wrong.

## Phase 4 — dry-run correction
Restore the validated backup to an isolated Dell/Proxmox VM (or other independently isolated host after certification). Use separate credentials and no writable network route to the Lenovo database. Generate proposed changes with before/after evidence and a rollback plan. Do not import corrections until engineering and governance tests pass.

## Phase 5 — activation gates
Only after passing resource, backup, rollback, source-evidence, and integration checks should selected fixes be promoted through the existing `catalog-write-gateway` / `catalog-application-write-service`. Require an audit trail of each changed SKU.

## Phase 6 — Dell sizing
Estimate peak CPU/RAM from observed preflight and audit loads and from the restored catalog size. Only then determine VM sizes, disk and network needs, and whether a Dell 5060 with 16 GB is sufficient.

## Initial verified source-code concerns
- `automation/windows/run-hermes-weekly.ps1` fetches and forcibly synchronizes its runtime clone, then may proceed to live HERMES execution. This must **not** be mistaken for a safe audit runner.
- `scripts/hermes/operational-preflight.mjs` is specifically a preflight for activation, writes local reports, and does not perform PostgreSQL row auditing.
- `scripts/verify-catalog-write-boundaries.js` checks changed code paths, not historical catalog correctness.

These are code-review observations, **not evidence** of a production incident.
