# Phase 8 — ELIMFILTERS Digital Brain

## Objective

Create one governed reasoning layer across canonical knowledge, operational catalogue data, Obsidian notes, Graphify, Claude Code, Part Search, the website, commercial intelligence and evidence.

The Digital Brain is not a new source of truth. It is an orchestration layer that selects sources, applies authority rules, builds traceable context and refuses unsupported conclusions.

## Components

1. **Canonical Knowledge** — reviewed entities under `knowledge/entities/`.
2. **Operational Data** — PostgreSQL and sanitized exports.
3. **Working Knowledge** — Obsidian and engineering notes.
4. **Semantic Navigation** — Graphify graph and community reports.
5. **Execution Agent** — Claude Code.
6. **Delivery Surfaces** — website, Part Search, APIs and commercial tools.
7. **Governance** — validators, evidence rules, authority policy and audit logs.

## Authority order

When sources conflict, use this order unless a domain-specific rule states otherwise:

1. approved canonical entity plus validated evidence;
2. current operational database record;
3. approved registry or controlled source document;
4. reviewed Obsidian note;
5. website or application implementation;
6. generated Graphify inference;
7. historical reports and unreviewed working notes.

Graphify and language-model output never override a higher-authority source.

## Security boundaries

- Public context must exclude pricing, margins, personal contact data, payment terms, credentials and confidential commercial notes.
- Commercial context is private by default.
- Database access is read-only unless a separate approved write workflow is invoked.
- Generated recommendations are advisory until their required evidence and approval level are satisfied.
- No inferred OEM equivalence, equipment compatibility or failure diagnosis may be presented as validated.

## Query lifecycle

```text
Question
→ intent classification
→ source plan
→ authority filtering
→ context pack
→ reasoning
→ confidence and evidence check
→ answer or refusal/escalation
→ audit record
```

## Standard query domains

- product selection;
- SKU and product intelligence;
- OEM and competitor cross references;
- equipment and vehicle applications;
- contamination and failure intelligence;
- technologies, systems and industries;
- standards and evidence;
- commercial opportunity and supplier intelligence;
- website/code implementation;
- knowledge coverage and inconsistency auditing.

## Completion criteria

Phase 8 is structurally complete when:

- the brain manifest validates;
- every source has an authority and sensitivity class;
- query routes are machine-readable;
- context packs preserve provenance;
- the master audit runs all canonical validators;
- confidential fields are blocked from public context;
- unresolved conflicts are reported rather than silently resolved;
- a consolidated artifact can be generated in GitHub Actions.

Population and production connection remain controlled deployment activities, not architecture changes.
