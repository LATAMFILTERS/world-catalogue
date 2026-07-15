# Knowledge Graph v2 — Phase 6: Failure Intelligence Graph

## Objective

Connect symptoms, contaminants, failure mechanisms, affected protection systems, severity, evidence, technologies and product recommendations without presenting correlation as diagnosis.

## Canonical entities

- `Symptom` — observable condition reported by an operator, technician or monitoring system.
- `FailureScenario` — governed causal hypothesis connecting one or more symptoms to contaminants, failure modes and affected systems.
- `RecommendationRule` — evidence-bounded rule that identifies technologies, inspections or product families relevant to a reviewed scenario.

Existing entities reused:

- `Contaminant`
- `FailureMode`
- `ProtectionSystem`
- `Technology`
- `ProductFamily`
- `SKU`
- `EvidenceRecord`
- `Equipment`, `Engine`, `Vehicle`

## Safety boundary

The graph provides engineering decision support. It must not state that a symptom proves a specific failure. Every scenario must carry a confidence level and evidence status.

Allowed confidence levels:

- `hypothesis`
- `plausible`
- `supported`
- `validated`
- `rejected`

Allowed severity levels:

- `low`
- `moderate`
- `high`
- `critical`

Only `validated` scenarios with canonical evidence may drive an automatic recommendation. All other scenarios must be presented as possibilities requiring inspection or testing.

## Required relationship path

```text
Symptom
→ may_indicate
FailureScenario
→ involves_contaminant
Contaminant
→ contributes_to
FailureMode
→ affects_system
ProtectionSystem
→ mitigated_by
Technology / ProductFamily / SKU
```

## Generated output

Generated failure intelligence is written to:

```text
knowledge/generated/failure-intelligence/
├── scenarios/
├── recommendations/
├── matrix.json
├── summary.json
└── unresolved.json
```

Generated output is not canonical and is excluded from Git. Canonical promotion requires evidence review.

## Completion criteria

Phase 6 is complete when:

1. canonical templates exist for symptoms, scenarios and recommendation rules;
2. the validator understands the new entity types;
3. the builder can create a traceable failure matrix from governed entities;
4. unsupported links are isolated in `unresolved.json`;
5. GitHub Actions publishes the generated matrix as an artifact;
6. no recommendation is labeled automatic unless its scenario confidence is `validated` and evidence is canonical.
