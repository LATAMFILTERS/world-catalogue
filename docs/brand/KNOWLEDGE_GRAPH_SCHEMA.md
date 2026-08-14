# ELIMFILTERS KNOWLEDGE GRAPH SCHEMA

Status: Canonical

## Entity hierarchy

Brand → Engineering Category → Protection System → Technology → Product Family → Application → Equipment → Industry → Technical Knowledge

## Brand node

- name: ELIMFILTERS
- category: Industrial Filtration Engineering
- positioning: Asset Protection Systems
- objective: asset protection, contamination control, reliability and availability

## Protection systems

- air-intake-airflow
- fuel-cleanliness
- lubrication
- hydraulic
- cooling-system

## Technology keys

- MACROCORE
- MICROKAPPA
- DRYCORE
- INTEKCORE
- SYNTAPORE
- TURBOCORE
- SYNTRAX
- NANOFORCE
- THERMACORE
- MARINECLEAN
- DURATECH

Canonical rule: unknown or non-registered technology keys must be rejected by ingestion and must not be emitted by public or AI-facing layers.
