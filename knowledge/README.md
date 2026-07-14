# ELIMFILTERS Canonical Knowledge

This directory contains governed knowledge used by Obsidian, Graphify, Claude Code, the website, and future database synchronization.

## Structure

```text
knowledge/
├── entities/          canonical approved and review-stage entities
├── templates/         Obsidian-compatible note templates
├── schemas/           machine-readable validation schemas
└── README.md
```

## Rules

- Only files under `knowledge/entities/` may become canonical entities.
- Every entity must use a template and pass `node scripts/validate-knowledge-v2.mjs`.
- Working notes, generated reports, and Graphify output are not canonical.
- Do not copy production catalogue records here in bulk.
- Do not store API keys, credentials, customer pricing, or confidential personal data.

## Folder convention

```text
knowledge/entities/
├── technologies/
├── systems/
├── industries/
├── product-families/
├── standards/
├── failure-modes/
├── contaminants/
├── evidence/
└── sources/
```

## Review workflow

1. Create or update a note from a template.
2. Keep `status: draft` while evidence is incomplete.
3. Link evidence using canonical IDs.
4. Run the validator.
5. Review technical and brand implications.
6. Promote to `status: approved` only when evidence and ownership are clear.

## Source authority

See `docs/knowledge-graph/PHASE_1_CANONICAL_KNOWLEDGE_IMPLEMENTATION.md` for the full authority hierarchy.
