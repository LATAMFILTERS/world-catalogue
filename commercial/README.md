# ELIMFILTERS Commercial Pattern Engine — Phase 1

This directory introduces the first operational layer for ELIMFILTERS commercial learning.

The goal is not to give AI unrestricted commercial authority. The goal is to let agents execute repetitive, governed actions, record outcomes, and improve the pattern from measured results.

## Operating principle

1. Victor authorizes activation of a commercial market/account policy.
2. Agents execute only actions allowed by policy.
3. Every action produces a structured event.
4. Outcomes update measurable market/account metrics.
5. Patterns are adjusted only from evidence.
6. Exceptions and high-risk decisions are escalated.

## Phase 1 market sequence

Paraguay is the laboratory market. Uruguay is the reproducibility test. Argentina is the first scale test.

Progression is gate-based, not date-based.

## Boundaries

- HERMES remains the industry-intelligence system.
- OBSIDIAN/Nodal Center remains the knowledge and relationship layer.
- Commercial state is kept separate from canonical technical knowledge.
- No autonomous territorial exclusivity, credit extension, contract acceptance, exceptional discount, or below-floor pricing.
- No bulk outreach until contact quality and workflow quality have been validated on a small batch.

## Files

- `config/market-rollout.json`: geographic sequence and readiness gates.
- `config/authority-policy.json`: what agents may and may not do autonomously.
- `state/market-state.json`: current pilot state.
- `schemas/commercial-event.schema.json`: event contract for logs.
- `logs/events.jsonl`: append-only commercial event stream.

The next implementation layer will consume these files from the CRM/account-agent service.