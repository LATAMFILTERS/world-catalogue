# Phase 8 — ELIMFILTERS Digital Brain Index

## Governing architecture

- `docs/knowledge-graph/PHASE_8_ELIMFILTERS_DIGITAL_BRAIN.md`

## Machine-readable governance

- `knowledge/brain/brain-manifest.json`
- `knowledge/brain/query-routes.json`

## Runtime and audit scripts

- `scripts/validate-digital-brain.mjs`
- `scripts/build-digital-brain-context.mjs`
- `scripts/audit-digital-brain.mjs`

## Master workflow

- `.github/workflows/digital-brain.yml`

## Generated artifact

```text
knowledge/generated/digital-brain/
├── context-pack.json
├── digital-brain-audit.json
└── DIGITAL_BRAIN_AUDIT.md
```

Generated files are ignored by Git and uploaded as workflow artifacts.

## Connected phases

1. Canonical Knowledge Architecture
2. Technical Entities and Evidence
3. Product Intelligence Graph
4. Equipment Graph
5. OEM Knowledge Graph
6. Failure Intelligence Graph
7. Commercial Intelligence Graph
8. Digital Brain Orchestration

## Operational boundaries

- Canonical knowledge remains the governed truth layer.
- PostgreSQL is operational authority and read-only by default.
- Obsidian remains the working knowledge environment.
- Graphify provides semantic navigation, not authority.
- Claude Code reasons and executes under the manifest and route policies.
- Website and Part Search consume approved/public-safe outputs only.
- Commercial intelligence remains confidential.
- Production writes are disabled until a separately approved deployment workflow exists.

## Phase status

Structural implementation complete. Production activation requires secure secrets, a sanitized database export or read-only connector, local/private Obsidian access, a refreshed Graphify graph and end-to-end acceptance tests.
