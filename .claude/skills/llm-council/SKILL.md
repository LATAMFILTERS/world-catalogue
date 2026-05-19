# LLM Council — Multi-Perspective Decision Framework

## Purpose

When facing a strategic decision for the ELIMFILTERS project, this skill convenes five independent advisors who analyze the question from fundamentally different angles, peer-review each other, and deliver a synthesized verdict.

## Trigger Phrases

Activate with: **"council this"**, **"run the council"**, **"war room this"**, **"pressure-test this"**, or any question involving genuine tradeoffs ("should we X or Y?").

Skip for: bug fixes, factual lookups, simple implementation tasks.

## The Five Advisors

1. **The Contrarian** — Hunts for fatal flaws, unexamined risks, and reasons this will fail.
2. **The First Principles Thinker** — Strips assumptions. Reframes the problem from scratch.
3. **The Expansionist** — Finds hidden upside, adjacent opportunities, and what's being left on the table.
4. **The Outsider** — Applies fresh perspective with no ELIMFILTERS domain bias.
5. **The Executor** — Focuses only on practical feasibility and the immediate next step.

## Process (5 Stages)

### Stage 1 — Frame
Enrich the question with relevant project context: current stack, catalogue size, Railway deployment, WhatsApp integration, target market (Latin America filtration industry).

### Stage 2 — Convene
Each advisor responds independently, no hedging, no consensus-seeking. Label each section clearly:
```
[CONTRARIAN]
[FIRST PRINCIPLES]
[EXPANSIONIST]
[OUTSIDER]
[EXECUTOR]
```

### Stage 3 — Peer Review
Each advisor anonymously scores the others (1–5) and flags the strongest point and biggest blind spot from each analysis.

### Stage 4 — Synthesis (Chairman's Verdict)
Identify:
- Where advisors **agree** (high-confidence signal)
- Where advisors **clash** (the real tension to resolve)
- **Blind spots** no one addressed
- **Single recommended action** — not a menu, one concrete next step

### Stage 5 — Present
Output as clean markdown. End with exactly one next step. No menus, no "it depends."

## Output Format

```
## LLM COUNCIL — [QUESTION SUMMARY]

### [CONTRARIAN]
...

### [FIRST PRINCIPLES]
...

### [EXPANSIONIST]
...

### [OUTSIDER]
...

### [EXECUTOR]
...

---
## PEER REVIEW
...

---
## CHAIRMAN'S VERDICT
**Consensus:** ...
**Core tension:** ...
**Blind spot:** ...
**Next step:** [ONE concrete action]
```

## ELIMFILTERS Project Context (for enrichment)

- **Stack:** Next.js 14 static export + Express.js + PostgreSQL (Railway)
- **Catalogue:** 43 pages (12 industries, 12 products, 12 technologies)
- **Integrations:** WhatsApp chatbot (Twilio), Groq AI, Knowledge API
- **Market:** Latin America industrial filtration — mining, agriculture, marine, heavy equipment
- **Brand positioning:** German-grade quality, 500K+ cross-references, SYNTRAX™/NANOFORCE™ technology line
- **Branch:** `claude/create-elimfilters-manuals-iFz1q`
- **Production:** `world-catalogue-production.up.railway.app`
