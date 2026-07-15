# ELIMFILTERS Digital Brain — Architecture Audit

Date: 2026-07-15  
Scope: Knowledge Graph v2 phases 1–8, master manifest, routing, validators, context planning and GitHub Actions integration.

## Audit outcome

The structural architecture is implemented, but production readiness remains intentionally disabled until operational sources are connected and tested. This audit corrected defects that could either make CI fail incorrectly or permit an unsafe public context plan.

## Corrected findings

### 1. Conditional validators were treated as mandatory

The master audit previously executed the Failure Intelligence and Commercial Intelligence validators even when their generated artifacts did not exist. This caused architecture CI to fail before those pipelines had been run.

Remediation:

- separated `required_validators` from `conditional_validators`;
- added explicit prerequisites for each conditional validator;
- skipped conditional validators only when their generated inputs are absent;
- retained failure behavior when prerequisites exist but validation fails.

### 2. Command-line flags contaminated the query text

The context builder joined every command-line argument into the question, including `--visibility=...`.

Remediation:

- option arguments are now removed before constructing the query;
- the generated context validator rejects queries containing command-line flags.

### 3. Public plans could include internal operational sources

The previous public-source filter explicitly permitted PostgreSQL even though the manifest classified it as internal.

Remediation:

- every source now declares `public_projection_allowed`;
- public context plans include only explicitly permitted projections;
- PostgreSQL, Obsidian, Graphify, generated intelligence modules and commercial intelligence are blocked from public context plans;
- public-safe routes now require canonical knowledge and treat operational sources as optional server-side inputs.

### 4. Derived modules were not declared in the manifest

Routes referenced Equipment Graph and Failure Intelligence through validator exceptions rather than formal source declarations.

Remediation:

- declared Product Intelligence, Equipment Graph, OEM Graph and Failure Intelligence as generated internal sources;
- removed undeclared-source exceptions from manifest validation.

### 5. Repository contracts lacked executable syntax checks

The previous workflow assumed all referenced scripts existed and parsed correctly.

Remediation:

- added `scripts/audit-repository-contracts.mjs`;
- validates JSON contracts;
- executes `node --check` against all master and conditional validator scripts;
- verifies route source declarations;
- verifies workflow script references;
- enforces read-only workflow permissions.

### 6. Generated context packs had no independent security validation

Remediation:

- added `scripts/validate-digital-brain-context.mjs`;
- verifies source declarations and visibility;
- enforces blocked public fields;
- requires provenance and conflict disclosure;
- rejects command-line flags inside the query.

### 7. Failed workflows could lose their diagnostic artifact

Remediation:

- artifact upload now uses `if: always()`;
- a failed audit can still publish the available diagnostic output.

## Current trust boundaries

- Canonical knowledge: reviewed authority.
- PostgreSQL: operational authority, read-only by default, not connected in architecture CI.
- Obsidian: reviewed working knowledge, local or private-runner synchronization required.
- Graphify: generated navigation and semantic inference, never canonical authority.
- Commercial intelligence: confidential; no public context projection.
- Website and Part Search: public implementation layers; they consume approved projections only.

## Remaining activation work

The following are not architecture defects and cannot be marked complete without controlled operational execution:

1. connect PostgreSQL with a read-only credential;
2. export and validate real SKU, equipment, OEM and commercial datasets;
3. synchronize the private Obsidian vault;
4. regenerate Graphify after the canonical population changes;
5. run all conditional validators against generated artifacts;
6. review unresolved mappings and promote only evidence-backed entities;
7. perform end-to-end queries and compare responses with source records;
8. keep all production writes disabled until an explicit approval gate is implemented.

## Acceptance criteria

The Digital Brain can be considered operationally ready only when:

- the master GitHub workflow passes;
- all applicable conditional validators execute and pass;
- no canonical ID or relation conflicts remain;
- PostgreSQL access is verified read-only;
- public context security tests pass;
- Graphify is refreshed from the current canonical state;
- a human reviewer approves the first end-to-end evidence audit.
