# ELIMFILTERS Asset Protection Intelligence Architecture

Status: canonical architecture definition

Brand mantra: **Safety. Reliability. Efficiency.**

## 1. Platform definition

ELIMFILTERS is organized as an Asset Protection Intelligence platform. Filtration products remain a core implementation layer, but the company architecture also includes governed knowledge, catalogue authority, technical intelligence, search, customer interaction and market-development systems.

The platform must reduce uncertainty without weakening evidence controls. No layer may invent product authority, technical evidence or publication approval.

## 2. Canonical system map

```text
ELIMFILTERS
└── Asset Protection Intelligence
    ├── HERMES — intelligence engine / external discovery
    ├── Obsidian Knowledge Vault — structured second brain
    ├── Knowledge Center — approved public knowledge
    ├── World Catalogue / PostgreSQL — product and SKU authority
    ├── Part Search — product intelligence interface
    ├── Conversation Orchestrator / Bots — governed customer interaction
    └── Web Platform — global brand and discovery surface
```

## 3. Responsibilities and hard boundaries

### HERMES

HERMES discovers, compares and routes new external evidence. It may identify gaps and catalogue candidates, but it does not become canonical merely because it found a source.

HERMES must not:
- authorize an ELIMFILTERS SKU;
- publish technical claims automatically;
- overwrite approved knowledge directly;
- bypass human/governance gates.

### Obsidian Knowledge Vault

Obsidian is the structured second brain: reviewed institutional memory, technical relationships, operating knowledge and durable context. In runtime terms, only knowledge that satisfies the approved production eligibility/lifecycle rules may be treated as authoritative customer evidence.

### World Catalogue / PostgreSQL

The catalogue is the sole product-authority layer for ELIMFILTERS SKU, applications, dimensions, technologies, OEM references, cross-references and product identity. HERMES may propose a candidate change; it may never silently convert a candidate into production catalogue truth.

### Knowledge Center

The Knowledge Center is the public surface for approved technical knowledge. It is not an independent source of truth; it publishes governed knowledge.

### Part Search

Part Search is a product intelligence interface. It resolves user intent against catalogue authority and exposes validated product relationships. It may improve discovery and presentation, but it must not invent cross-references or SKU data.

### Conversation Orchestrator / Bots

Bots combine conversation state with approved technical knowledge and catalogue evidence. The orchestrator enforces boundaries, safe degradation, gap registration and channel formatting.

### Web Platform

The web platform presents the company as a single global Asset Protection Intelligence system. It exposes capabilities without claiming that unreviewed HERMES discoveries are already approved facts.

## 4. Canonical authority matrix

| Domain | Authority | Candidate / discovery source | Public surface |
|---|---|---|---|
| ELIMFILTERS SKU | World Catalogue / PostgreSQL | HERMES Catalogue Intelligence, factory/product engineering | Part Search, product pages, bots |
| Technical evidence | Approved knowledge records / Obsidian-equivalent authority | HERMES, engineers, official sources | Knowledge Center, bots, web |
| External change detection | HERMES | Official web/OEM/standards sources | Internal review only until approved |
| Conversation state | Orchestrator memory | User messages + validated system outputs | Bots/channels |
| Brand positioning | Web/brand source | Brand governance | Home, Knowledge Center, Part Search |

## 5. Data flows

### Knowledge flow

```text
Official / trusted web sources
        ↓
HERMES discovery and comparison
        ↓
Candidate evidence / knowledge gap
        ↓
Governed review and approval
        ↓
Obsidian / approved knowledge authority
        ↓
Knowledge Center + Bots + Web
```

### Product flow

```text
Factory + product engineering + validated source data
        ↓
World Catalogue / PostgreSQL
        ↓
Part Search + Bots + Product Pages
```

### Diagnostic flow

```text
Customer symptom
        ↓
Conversation Orchestrator
        ↓
Approved knowledge + catalogue authority
        ↓
Governed answer
        ↓
Unresolved evidence gap → HERMES research candidate
```

## 6. Contract rules

1. HERMES output is candidate intelligence until governance promotes it.
2. Obsidian/approved knowledge may support technical claims only when provenance and lifecycle gates are satisfied.
3. PostgreSQL catalogue evidence is required for ELIMFILTERS SKU publication.
4. Part Search and bots consume authority; they do not create authority.
5. Web pages may describe platform capabilities, but may not expose unreviewed discoveries as facts.
6. Every unresolved diagnostic knowledge gap may be routed to HERMES without interrupting the customer response.
7. Product and knowledge publication remain independently governed.
8. Safety, Reliability and Efficiency are brand outcomes, not substitutes for technical evidence.

## 7. Repository ownership map

- `scripts/hermes/` and HERMES workflows: discovery, collection, comparison, governed catalogue intelligence.
- `services/knowledge-center-api/`: reviewed knowledge/candidate-case workflow.
- `services/knowledge-engine-runtime/`: approved production reasoning surface.
- `lib/knowledge-governance/`: runtime governance contracts and adapters.
- `lib/bot-*`: customer conversation/orchestration and catalogue integration.
- `frontend/`: global brand, Knowledge Center and product-discovery surfaces.
- `part-search/`: dedicated Part Search interface.
- `elimfilters-vault/`: structured knowledge/content assets where applicable; never treated as runtime authority without the governance path.

## 8. Public positioning

The public architecture is expressed as:

**ELIMFILTERS — Asset Protection Intelligence**

Supported by:
- engineered filtration systems;
- technical intelligence;
- governed knowledge;
- product intelligence;
- global digital support.

Brand mantra:

**Safety. Reliability. Efficiency.**

The mantra is a permanent communication principle. It does not override product specifications, standards, evidence or claims governance.

## 9. Non-duplication rule

Before creating any new HERMES, knowledge, catalogue, search or bot component, the existing service and governance layer must be checked first. New modules are justified only when an existing canonical responsibility cannot satisfy the requirement without violating its boundary.
