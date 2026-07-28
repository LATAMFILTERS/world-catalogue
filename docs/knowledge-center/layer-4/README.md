# Layer 4 — Knowledge Engine

## Status

APPROVED_ARCHITECTURE

## Purpose

Layer 4 converts governed knowledge from Layers 1–3 into a controlled engineering reasoning system. It does not create, approve, or overwrite technical truth. It retrieves approved knowledge, evaluates evidence, ranks compatible diagnostic paths, identifies uncertainty, and produces an auditable response.

## Components

1. Knowledge Graph
2. Reasoning Engine
3. Evidence Engine
4. Diagnostic Decision Trees
5. Retrieval Engine
6. Confidence Engine
7. Response Generator

## Canonical flow

Problem intake

→ classify protection system

→ resolve technical family and product family

→ retrieve production-eligible diagnostic cases

→ compare symptoms and evidence

→ ask only required or conditional questions

→ eliminate contradicted hypotheses

→ apply STOP, ESCALATE, and VERIFY rules

→ calculate confidence and uncertainty

→ generate audience-adapted response

## Production boundary

Layer 4 may reason only from records that are production eligible or from explicitly identified user-provided evidence. Draft knowledge may be used for internal research only and must never be presented as approved ELIMFILTERS engineering guidance.

The engine may not:

- approve diagnostic cases;
- invent product compatibility;
- infer cross references without governed evidence;
- suppress contradictory evidence;
- issue a definitive conclusion when minimum evidence is missing;
- expose hidden reasoning traces.

It must provide a concise evidence summary, identified uncertainty, required next action, and escalation path when applicable.

## Interfaces

- `knowledge-graph-contract.yaml`
- `reasoning-contract.yaml`
- `retrieval-and-confidence-contract.yaml`
- Layer 3 diagnostic-case records
- Layer 2 taxonomy and templates
- Layer 1 governance and approval controls

## Implementation state

This directory defines the approved architecture and executable contracts for future implementation. It does not claim that the production engine, API, graph database, or user interface is already deployed.
