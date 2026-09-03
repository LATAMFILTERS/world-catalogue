# SEO/GEO/AEO → HERMES knowledge-gap bridge

This bridge converts production audit findings into governed HERMES research work without turning word count into a publication target.

## Flow

1. `audit.py` crawls production.
2. `triage_short_pages.py` separates concise purpose-driven pages from editorial/entity pages that require review.
3. `build_hermes_knowledge_gaps.py` converts only `REVIEW_FOR_EXPANSION` rows into explicit HERMES knowledge-gap research requests.
4. HERMES researches the gap using verified evidence and compares it against existing ELIMFILTERS knowledge.
5. HERMES classifies the result as `CREATE_NEW`, `UPDATE_REINFORCE`, `NO_MATERIAL_CHANGE`, or `INTERNAL_ONLY`.
6. Canonical publication remains behind the existing review/approval boundary.

## Non-negotiable rules

- Short does not mean deficient.
- Do not pad pages to satisfy an arbitrary word count.
- Utility/search/calculator/navigation/visual/data pages are not converted into content-expansion requests merely because they are concise.
- Prefer primary technical evidence and standards/regulatory sources when applicable.
- Competitor material may be used as internal provenance/research evidence but not exposed as proprietary ELIMFILTERS claims.
- HERMES cannot auto-publish.
- `NO_MATERIAL_CHANGE` means no page modification.

## Output

The bridge writes:

- `hermes-knowledge-gaps.json` — machine-readable research request queue.
- `hermes-knowledge-gaps.md` — human-readable review summary.

These files are audit/research artifacts, not approval records.
