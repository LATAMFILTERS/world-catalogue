# ELIMFILTERS Technical Source Policy

**Version:** 1.0  
**Status:** Draft Standard  
**Owner:** ELIMFILTERS Engineering

## 1. Purpose

This policy governs external research, source selection, evidence capture, intellectual-property boundaries, contradiction handling, and promotion of research into approved ELIMFILTERS knowledge.

External sources may be used to build knowledge. They are not themselves production knowledge.

## 2. Source Priority

Sources should be prioritized in this order when relevant:

1. Applicable standards and regulatory publications.
2. Official manufacturer manuals, technical sheets, service literature, and test reports.
3. Peer-reviewed scientific and engineering publications.
4. Government, university, and recognized technical-institution publications.
5. Official industry association material.
6. Manufacturer technical bulletins and training material.
7. Reputable secondary technical references.
8. Field evidence and customer records.

Commercial pages, distributor listings, forums, and unattributed summaries shall not establish critical technical facts.

## 3. Required Source Record

Every source must have a unique record:

```yaml
source_id: SRC-<NUMBER>
title: <document title>
author_or_organization: <name>
source_type: standard | official_manual | technical_sheet | service_bulletin | paper | field_evidence | other
publisher: <name>
publication_date: null
revision: null
url_or_document_location: null
accessed_at: <date>
language: <code>
applicable_models_or_scope: []
relevant_pages_or_sections: []
rights_notes: null
reliability: primary | secondary | field
status: active | superseded | withdrawn | inaccessible
checksum_or_file_id: null
```

## 4. Claim-Level Traceability

Critical claims must point to the precise source page, table, section, figure, or evidence item supporting them.

A bibliography alone is insufficient for:

- Technical limits.
- Performance values.
- Capacities.
- Service intervals.
- Compatibility.
- Safety instructions.
- Failure mechanisms.
- Diagnostic thresholds.

## 5. Independent Corroboration

Critical generalized claims should be supported by at least two independent sources when practical.

One manufacturer source may establish facts about that manufacturer's own equipment or product, but it shall not automatically establish a universal engineering rule.

## 6. Contradictions

When sources conflict:

1. Record both claims.
2. Identify model, revision, test, market, and date differences.
3. Prefer the source applicable to the exact asset or product variant.
4. Do not average conflicting values.
5. Mark the field pending verification when the conflict cannot be resolved.
6. Escalate safety-critical conflicts to technical review.

## 7. Research by Claude Code or Other Agents

Research agents may:

- Locate and retrieve sources.
- Extract candidate facts.
- Build source records.
- Compare documents.
- Identify conflicts and missing evidence.
- Create structured drafts.

Research agents shall not:

- Approve knowledge.
- Publish directly to production.
- Convert a single brand statement into a universal rule.
- Invent missing values.
- Hide source conflicts.
- Copy protected text unnecessarily.

## 8. Copyright and Quotation

ELIMFILTERS shall store facts, structured evidence, original analysis, and limited necessary excerpts. External documents shall not be republished as ELIMFILTERS content without authorization.

Final knowledge objects must be written in original ELIMFILTERS language and retain source traceability internally.

## 9. External Brand Handling

External brands may appear in internal source records and verified cross-reference records. Customer-facing diagnostic language shall not cite or promote external brands unless the interaction specifically requires a verified cross reference or source disclosure approved by ELIMFILTERS.

## 10. Source Lifecycle

Sources must be reviewed when:

- A new revision is published.
- A document is withdrawn.
- A product or asset variant changes.
- A contradiction is discovered.
- An approved object depends on a superseded source.

Dependent knowledge objects shall be flagged automatically for review.

## 11. Production Boundary

Customer-facing assistants may retrieve only approved ELIMFILTERS knowledge objects. They may not answer directly from research notes, external websites, raw manuals, or unapproved source records.
