# ELIMFILTERS Repository Governance for Claude Code

## Canonical brand position

ELIMFILTERS = Industrial Filtration Engineering
Strategic offering = Asset Protection Systems
Principle = The filter is the means. Asset protection is the objective.

## Five systems

1. Air Intake & Airflow Protection
2. Fuel Cleanliness Protection
3. Lubrication Protection
4. Hydraulic Protection
5. Cooling System Protection

## Approved technologies

MACROCORE™ · MICROKAPPA™ · DRYCORE™ · INTEKCORE™ · SYNTAPORE™ · HYDROCORE™ · TURBOCORE™ · SYNTRAX™ · NANOFORCE™ · THERMACORE™

### Fuel Cleanliness scope guardrail

- SYNTAPORE™ governs plain diesel-fuel particulate filtration for approved primary, secondary, spin-on and cartridge applications.
- HYDROCORE™ governs approved standard non-turbine fuel/water separator configurations, including drain and transparent-bowl applications.
- TURBOCORE™ governs approved turbine-style FH and FG fuel/water separation systems and their dedicated replacement-element architecture.
- SYNTAPORE™, HYDROCORE™ and TURBOCORE™ are distinct scopes. Never merge, alias or substitute one for another in active or public surfaces.

Specialized commercial solutions: MARINECLEAN™ · DURATECH™. These are not canonical core technology entities.

## Hybrid infrastructure — mandatory

ELIMFILTERS uses a hybrid architecture. Lenovo, GitHub, Render, Cloudflare and R2 are complementary layers, not mutually exclusive replacements.

- GitHub is the source-control and audit authority.
- Lenovo is the preferred primary execution node for continuous/private catalogue, Part Search and technical HERMES workloads.
- Render may remain a cloud runtime or failover node where justified.
- Cloudflare is the public routing/security layer.
- R2 is external storage/archive/backup where configured.

Do not delete, disable or bypass a cloud component merely because an equivalent Lenovo runtime exists. Any cutover requires explicit operator approval and verified health/failover behavior.

Read `HYBRID_RUNTIME_CONTRACT.md` before changing infrastructure, schedulers, HERMES execution, Part Search runtime, catalogue jobs, queues or deployment behavior.

## Repository boundary

This repository owns canonical catalogue/product knowledge, Part Search governance/canonicalization, technical evidence, Knowledge Center publication and technical/catalogue HERMES research.

`LATAMFILTERS/elimfilters-crm` owns commercial/operational state and execution: distributors, suppliers, requisitions, approvals, governed communications, operational agents and Command Center workflows.

Do not duplicate CRM commercial workers or recurring research loops here. Do not mutate CRM commercial tables directly from this repository except through an explicit authenticated interface/event contract.

Likewise, the CRM may consume catalogue data READ-ONLY but must not become a second canonical product master or write canonical catalogue data directly.

## HERMES execution boundary

HERMES is one logical system with separated execution domains:

- Technical HERMES (`world-catalogue`): catalogue research, technical evidence, application/product knowledge, Part Search governance and Knowledge Center publication/proposals.
- Operational HERMES (`elimfilters-crm`): distributor/supplier/commercial intelligence, approvals, recommendations, governed communication and operational workflow execution.

A capability may exist on Lenovo and cloud for resilience, but a recurring production job must have exactly one ACTIVE owner at a time. Cloud copies may be STANDBY, CI or manual/failover.

Use these labels for new runtime definitions:

- `ELIM_RUNTIME_NODE=LENOVO|RENDER|GITHUB`
- `ELIM_RUNTIME_ROLE=PRIMARY|STANDBY|CI`
- `ELIM_DOMAIN=WORLD_CATALOGUE`
- `ELIM_SCHEDULER_ENABLED=true|false`

A `STANDBY` or `CI` node must not run recurring production schedulers. Before adding a cron, worker, queue consumer or recurring research job, search both repositories and existing GitHub/Render/Lenovo execution paths to ensure the function does not already have an active owner.

## Hard rules

- Resolve technology names and scopes from canonical registries only.
- Do not invent technologies, performance values, certifications or legal facts.
- Do not expose retired or unapproved technology aliases on public, computational, Knowledge Center, Part Search, SEO/GEO, metadata or structured-data surfaces.
- Keep competitor material out of ELIMFILTERS-facing content. External sources are internal evidence only for generic industry validation.
- Any product-specific service interval, performance value, efficiency, pressure, capacity or certification claim requires approved product/application evidence before public use.
- In engineering, product, validation, performance, and technical-claim contexts, artificial intelligence may be described only as mathematical/computational engineering support for evaluating demanding operating conditions; it does not replace physical validation, documented testing, or professional engineering judgment.
- In corporate leadership and governance contexts, ELIMFILTERS may accurately disclose specialized Executive AI Agents as AI-operated executive functions under the human-governed Chief Executive Office. They must never be represented as undisclosed human employees or natural persons, and agent autonomy must not be overstated.
- Public descriptions of the executive-agent model must emphasize defined responsibility, delegated authority, accountability, traceability, escalation, and human intervention rather than novelty or fictional staffing.
