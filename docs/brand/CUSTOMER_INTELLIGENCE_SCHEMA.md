# CUSTOMER_INTELLIGENCE_SCHEMA

## Purpose

This document defines the Customer Intelligence data architecture of ELIMFILTERS.

The objective is to convert customer activity, distributor activity, search behavior, product demand, and asset interactions into structured market intelligence.

---

# Core Principle

Every interaction creates intelligence.

Every intelligence event increases market visibility.

Every market signal improves decision quality.

---

# Intelligence Sources

## Part Search

Examples:

- LF3620
- P550440
- EL82100

---

## OEM Searches

Examples:

- Cummins
- Caterpillar
- Volvo
- Scania

---

## Equipment Searches

Examples:

- CAT 320
- D11T
- ISX15

---

## Product Registrations

Examples:

- Warranty Registration
- Product Activation

---

## AI Interactions

Examples:

- Technical Questions
- Failure Analysis
- Product Recommendations

---

## Distributor Activity

Examples:

- Search Volume
- Territory Activity
- Opportunity Creation

---

# Core Tables

## intelligence_events

Purpose:

Store all intelligence-generating actions.

Fields:

- id
- event_type
- timestamp
- user_type
- source_platform
- country
- state
- city
- language

---

## search_events

Purpose:

Store search behavior.

Fields:

- id
- intelligence_event_id
- search_type
- search_query
- normalized_query
- result_count
- clicked_result

Search Types:

- SKU
- OEM
- Competitor
- Equipment
- Technology
- Problem

---

## ai_events

Purpose:

Store AI interactions.

Fields:

- id
- intelligence_event_id
- question
- category
- recommendation_type
- confidence_score

---

## customer_profiles

Purpose:

Store customer intelligence.

Fields:

- id
- company_name
- customer_type
- industry
- country
- territory
- first_seen
- last_seen

---

## distributor_profiles

Purpose:

Store distributor intelligence.

Fields:

- id
- company_name
- country
- territory
- status
- created_at

---

## demand_signals

Purpose:

Store product demand indicators.

Fields:

- id
- sku
- oem_reference
- search_count
- registration_count
- ai_mentions
- country
- month

---

# Intelligence Metrics

## Product Demand

Most searched SKUs.

---

## OEM Demand

Most searched OEM references.

---

## Industry Demand

Most active industries.

---

## Territory Demand

Most active regions.

---

## Distributor Demand

Most active distributors.

---

## Technology Demand

Most requested technologies.

---

# Opportunity Detection

Example:

100 searches

?

No distributor

?

Opportunity created

---

Example:

High OEM search volume

?

Low inventory

?

Market opportunity

---

Example:

Repeated AI questions

?

Knowledge gap

?

Content opportunity

---

# Strategic Outputs

Customer Intelligence

?

Market Intelligence

?

Demand Intelligence

?

Territory Intelligence

?

Growth Intelligence

---

# Future Intelligence Models

- Territory Forecasting
- Demand Forecasting
- Distributor Forecasting
- Technology Adoption Forecasting
- Asset Growth Forecasting

---

# Strategic Objective

Transform every search, question, registration, and interaction into actionable market intelligence.

---

# Governance Rule

No customer interaction should be wasted.

Every interaction must contribute to intelligence creation.
