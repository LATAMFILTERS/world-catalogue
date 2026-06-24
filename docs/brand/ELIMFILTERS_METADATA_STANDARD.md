# ELIMFILTERS_METADATA_STANDARD

## Purpose

Defines the mandatory metadata standard for all Obsidian entities.

---

# Core Principle

Every note is a node.

Every node requires metadata.

---

# Required Frontmatter

---
entity_type:
entity_code:
status:
created_at:
updated_at:
---

---

# Entity Types

technology

system

industry

problem

asset

standard

oem

equipment

product

intelligence

digital_twin

prediction

governance

---

# Status Values

ACTIVE

DEPRECATED

OBSOLETE

DRAFT

ARCHIVED

---

# Relationship Section

Every note must contain:

## Relationships

---

# Synchronization Rule

entity_code must remain unique across the entire vault.

---

# AI Rule

Only metadata-compliant notes may be synchronized into PostgreSQL and the Knowledge Graph.
