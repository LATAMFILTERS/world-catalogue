---
type: canonical_knowledge
status: approved
knowledge_object_id: "LD-LUBE-PRESSURE-CONTROL-ARCHITECTURE"
title: "Lubrication Pressure-Control Valve Architecture"
domain: "LIGHT_DUTY_KNOWLEDGE_DOMAIN"
knowledge_content_type: "Engineering Reference"
confidence: "medium"
publication_status: approved
public_use_allowed: true
hermes_origin: true
nodal_review_required: false
catalog_write_allowed: false
cross_reference_write_allowed: false
---

# Lubrication Pressure-Control Valve Architecture

> **ELIMFILTERS CANONICAL KNOWLEDGE.** Approved for Light Duty Automotive use only. Heavy Duty values, settings and service assumptions must not be inherited from this record.

## Knowledge Position

- Domain: LIGHT_DUTY_KNOWLEDGE_DOMAIN
- Industries: Automotive
- Systems: Lube/Oil Protection Systems
- Technologies: SYNTRAX™
- Technology relation: confirmed
- Application relation: not_applicable

## Components

- Oil Pump Pressure-Regulating Valve
- Oil Filter Bypass/Relief Valve
- Anti-Drainback Valve
- Engine Oil Filter

## Technical Relationships — Validated

- The pressure-regulating valve, filter bypass valve and anti-drainback valve perform different functions and should not be treated as interchangeable components. | status: approved
- A pressure-regulating valve controls system pressure, while a filter bypass valve protects lubrication continuity when filter restriction becomes excessive. | status: approved
- An anti-drainback valve is intended to limit reverse drainage through the filter after engine shutdown where the application architecture requires it. | status: approved
- Valve presence, location and operating thresholds are application-specific and must not be inferred from a generic filter description. | status: approved

## Diagnostic Methods

- Identify which valve function is implicated before attributing abnormal pressure or delayed pressure build-up to the filter.
- Confirm the engine/filter housing architecture before applying any valve-specific conclusion.

## Shared Engineering

- [[SHARED-DIFFERENTIAL-PRESSURE|Differential Pressure]]
- [[SHARED-BYPASS|Bypass]]
- [[SHARED-FLOW-RATE|Flow Rate]]

## Evidence Trace

- EVID-FRAM-LD-PDF-04
- EVID-FRAM-LD-PDF-06

## Governance

- Canonical ELIMFILTERS engineering knowledge approved for the Light Duty domain.
- No numeric opening pressure, flow rate or service interval is universalized.
- No Heavy Duty inheritance is permitted.

## Canonical Approval

- Reviewer: ELIMFILTERS AI Engineering Validation — Domain-Specific Canonical Scope Review
- Reviewed at: 2026-09-11T13:20:00Z
- Metrics approved: 0
- Technical relationships approved: 4
- Procedures approved: 0
- Promotion gate: PASS
