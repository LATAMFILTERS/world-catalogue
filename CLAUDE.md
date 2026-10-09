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

## Product Catalog SKU Architecture

Product identity is separated by governed domain:

- Heavy Duty: existing HD prefixes remain fixed. Canonical base priority is Donaldson → Fleetguard → verified OEM. SKU creation uses the last four numeric digits of the selected commercial code. If a verified Donaldson code resolves to an SKU already occupied by a different published product, do not append or rotate digits; evaluate the verified Fleetguard cross and derive its natural SKU. If that Fleetguard SKU also collides, evaluate a verified OEM code. If all eligible natural slots collide, fail closed with `STOP_REVIEW`.
- Light Duty: existing LD prefixes and canonical-source rules remain unchanged.
- Industrial & Process: dedicated Technology-Core prefixes are `IA1/IA2/IA3`,
  `ID1`, `IG1/IG2`, `IH1`, `IL1`, `IO1/IO2`,
  `IW1/IW3/IW4/IW5/IW6/IW7`; `IW8` is reserved but blocked while
  Electrodeionization has no approved commercial product base.

Industrial base authority must resolve before SKU planning:
`ORIGINAL_BASE > FAMILY_ANCHOR_BASE > COMPETITOR_CROSS > SOURCE_ONLY`.

Industrial preferred SKU = approved three-character Technology-Core prefix +
the last four numeric digits from the canonical base code, left-padded when
needed. Collisions use the existing sticky discriminator pattern: the first
published mapping keeps its natural slot; later distinct products use prefix +
discriminator `1..9` + last three digits, skipping occupied slots. For a new
batch with multiple products competing for one natural slot, the reviewed
publication order must be explicitly frozen before allocation; raw query/array
order is never an identity rule. If the
source has no numeric payload, the core is blocked, or collision capacity is
exhausted, fail closed with `STOP_REVIEW`.

Never reuse HD/LD prefixes for Industrial & Process. Never invent a fallback
SKU. Planning is not publication; catalogue minting remains separately gated.

Canonical detail:
- `docs/catalog/ELIMFILTERS_MASTER_CATALOG_POLICY.md`
- `docs/brand/PRODUCT_REGISTRY.md`
- `product-identity/lib/industrial-sku-policy.mjs`

## Política canónica Duty / código base (definida por Victor, 2026-10-04)
- HD: el código base es Donaldson. Si Donaldson no lo fabrica, se usa Fleetguard. Si ninguno lo fabrica, el código base es el OEM más comercial. Excepción: los ET9* son 100% Parker (esta regla no aplica).
- LD (vehículos livianos, SUV, motores diésel pequeños, pickups/camionetas): vehículos NO europeos → código base FRAM; vehículos europeos → código base MANN FILTERS.

## Sistema de prefijos SKU (definido por Victor, 2026-10-04)
- HD = prefijo + últimos 4 dígitos del código base (ejemplo: P552100 → EL82100).
- ES9 = separador de combustible, HYDROCORE. EF9 = fuel filter, SYNTAPORE. EL8 = lube/oil, SYNTRAX. EH6 = hidráulico, NANOFORCE. EW7 = refrigerante, THERMOCORE. ED4 = air dryer, DRYCORE. EA1 = filtros de aire, MACROCORE. EA2 = carcasas para filtros de aire, INTEKCORE. EC1 = filtros de cabina, MICROKAPPA.
- LD tiene solo 4 prefijos: EA3 = aire MACROCORE, EC3 = cabina MICROKAPPA, EL3 = aceite SYNTRAX, EF3 = fuel SYNTAPORE.

## Doctrina de clasificación (definida por Victor, 2026-10-04)
- Ante una etiqueta ambigua del fabricante, predominan las características físicas: purgador, vaso visor, o cartucho dentro de un elemento visor = separador de agua (ES9), aunque el fabricante lo llame "FUEL FILTER".

Caso pendiente (NO ejecutado, requiere aprobación): EF90668 y EF90669 deben renumerarse a ES91026 y ES91027 porque son separadores de agua, no fuel filters.

## Hard rules

- Resolve technology names and scopes from canonical registries only.
- Do not invent technologies, performance values, certifications or legal facts.
- Do not expose retired or unapproved technology aliases on public, computational, Knowledge Center, Part Search, SEO/GEO, metadata or structured-data surfaces.
- Keep competitor material out of ELIMFILTERS-facing content. External sources are internal evidence only for generic industry validation.
- Any product-specific service interval, performance value, efficiency, pressure, capacity or certification claim requires approved product/application evidence before public use.
- In engineering, product, validation, performance, and technical-claim contexts, artificial intelligence may be described only as mathematical/computational engineering support for evaluating demanding operating conditions; it does not replace physical validation, documented testing, or professional engineering judgment.
- In corporate leadership and governance contexts, ELIMFILTERS may accurately disclose specialized Executive AI Agents as AI-operated executive functions under the human-governed Chief Executive Office. They must never be represented as undisclosed human employees or natural persons, and agent autonomy must not be overstated.
- Public descriptions of the executive-agent model must emphasize defined responsibility, delegated authority, accountability, traceability, escalation, and human intervention rather than novelty or fictional staffing.

## Context-free ELIMFILTERS product-image entry

Any ELIMFILTERS product-image generation, edit, rebrand, approval, or publication request must activate the existing `.claude/skills/elimfilters-product-image-pipeline/SKILL.md` before any image-generation call. This applies even in a fresh conversation with no prior context.

If the request names the Branding Subagent, or otherwise asks for an ELIMFILTERS product image, the commercial authority chain is owned in sibling repository `LATAMFILTERS/elimfilters-crm` as `chief_commercial -> marketing -> branding -> branding_product_image_release_v1`. This repository remains the canonical source for SKU/product truth, official-reference acquisition, render hard gates, brand assets used by the product-image pipeline, and catalog visual writeback.

Do not ask the user to restate routine colors, logo, technology, release procedure, or per-image approval when those values resolve from the canonical catalog, Branding governance, and the authorized render packet. Fail closed only when required product identity, official mechanical reference, or mandatory evidence cannot be resolved.

## Ponytail implementation rule

Ponytail is the default code-simplification discipline for agentic changes in this repository. Apply it after understanding and tracing the real flow, never instead of analysis.

Before creating code, infrastructure, schema, scripts, workers, agents, endpoints, dependencies or configuration:

1. Ask whether the new artifact needs to exist at all.
2. Search this repository for an existing implementation and extend/reuse it when possible.
3. Check the authorized adjacent repository (`elimfilters-crm`) when the capability may already belong there.
4. Prefer language/runtime standard library and native platform features before adding abstractions.
5. Prefer already-installed dependencies before introducing another dependency.
6. Prefer the smallest implementation that satisfies the actual requirement.
7. Preserve validation, security boundaries, data-loss protections, observability and required accessibility; simplification must never remove these safeguards.
8. Do not create a temporary script when a canonical operational path already exists. If a temporary artifact is truly necessary, label it clearly and remove it after validation unless it becomes an approved maintained tool.
9. Do not create a second source of truth, scheduler, worker, runtime owner or canonical data path merely because doing so is easier locally.
10. At completion, report what was reused, what was created, why creation was necessary, and any temporary artifacts left behind.

For catalogue work specifically, reuse canonical registries, mappings, ingestion paths, evidence models and Part Search logic before adding parallel structures. Product truth remains governed by this repository's existing canonical contracts.
