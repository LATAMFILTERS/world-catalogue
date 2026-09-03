#!/usr/bin/env python3
"""Detect likely search-intent collisions across current Knowledge Center families.

Input is the production audit CSV emitted by audit.py. This tool does not
change content, canonicals, robots directives, or sitemaps. It ranks pairs for
human review only.

Families reviewed:
- /knowledge-center/engineering/
- /knowledge-center/engineering-reference/
- /knowledge-center/standards/
- /knowledge-center/glossary/
- /knowledge-center/problems/

Usage:
  python3 scripts/seo-geo-audit/detect_intent_collisions.py \
    --audit seo-geo-audit-out/seo-geo-audit.csv \
    --out-dir seo-geo-audit-out
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path
from urllib.parse import urlparse

FAMILY_PREFIXES = {
    "engineering": "/knowledge-center/engineering/",
    "engineering-reference": "/knowledge-center/engineering-reference/",
    "standards": "/knowledge-center/standards/",
    "glossary": "/knowledge-center/glossary/",
    "problems": "/knowledge-center/problems/",
}

STOPWORDS = {
    "a", "an", "and", "application", "applications", "by", "center", "definition",
    "engineering", "elimfilters", "for", "filtration", "guide", "in", "knowledge",
    "of", "on", "reference", "system", "systems", "technical", "the", "to", "with",
}

# Some overlaps are structurally valid and should not be interpreted as a
# recommendation to merge. The pair still appears, but its review reason makes
# the intended ownership distinction explicit.
VALID_ROLE_PAIRS = {
    frozenset(("glossary", "standards")): "definition_vs_formal_standard",
    frozenset(("glossary", "problems")): "definition_vs_failure_analysis",
    frozenset(("glossary", "engineering-reference")): "definition_vs_application_reference",
    frozenset(("standards", "engineering-reference")): "formal_standard_vs_application_reference",
}


def family_for(path: str) -> str | None:
    for family, prefix in FAMILY_PREFIXES.items():
        if path.startswith(prefix):
            return family
    return None


def normalize_text(text: str) -> set[str]:
    tokens = re.findall(r"[a-z0-9]+", (text or "").lower())
    return {t for t in tokens if len(t) > 1 and t not in STOPWORDS}


def normalized_slug(path: str) -> set[str]:
    slug = path.rstrip("/").rsplit("/", 1)[-1]
    return normalize_text(slug.replace("-", " "))


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def containment(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / min(len(a), len(b))


def load_rows(path: Path) -> list[dict]:
    rows = []
    with path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            parsed = urlparse(row.get("url", ""))
            family = family_for(parsed.path)
            if not family:
                continue
            if row.get("indexable_html", "").lower() not in ("true", "1"):
                continue
            if row.get("status") not in ("200", 200):
                continue
            row = dict(row)
            row["path"] = parsed.path
            row["family"] = family
            rows.append(row)
    return rows


def pair_score(a: dict, b: dict) -> tuple[float, dict]:
    title_a = normalize_text(a.get("title", ""))
    title_b = normalize_text(b.get("title", ""))
    desc_a = normalize_text(a.get("meta_description", ""))
    desc_b = normalize_text(b.get("meta_description", ""))
    slug_a = normalized_slug(a["path"])
    slug_b = normalized_slug(b["path"])

    title_j = jaccard(title_a, title_b)
    title_c = containment(title_a, title_b)
    desc_j = jaccard(desc_a, desc_b)
    slug_j = jaccard(slug_a, slug_b)
    slug_c = containment(slug_a, slug_b)

    # Title and slug ownership dominate; description similarity is supportive.
    score = 0.38 * title_j + 0.22 * title_c + 0.18 * slug_j + 0.12 * slug_c + 0.10 * desc_j
    return score, {
        "title_jaccard": title_j,
        "title_containment": title_c,
        "slug_jaccard": slug_j,
        "slug_containment": slug_c,
        "description_jaccard": desc_j,
    }


def classify(score: float, metrics: dict, family_a: str, family_b: str) -> tuple[str, str]:
    valid_role = VALID_ROLE_PAIRS.get(frozenset((family_a, family_b)))
    exactish_slug = metrics["slug_containment"] >= 0.95
    very_close_title = metrics["title_containment"] >= 0.80

    if valid_role and score >= 0.42:
        return "ROLE_OVERLAP_REVIEW", valid_role
    if score >= 0.68 or (exactish_slug and very_close_title):
        return "HIGH_COLLISION_REVIEW", "likely_competing_intent"
    if score >= 0.48:
        return "MEDIUM_COLLISION_REVIEW", "possible_competing_intent"
    return "LOW", "distinct_or_weak_overlap"


def detect(rows: list[dict]) -> list[dict]:
    findings = []
    for i, a in enumerate(rows):
        for b in rows[i + 1:]:
            if a["family"] == b["family"] and a["url"] == b["url"]:
                continue
            score, metrics = pair_score(a, b)
            classification, reason = classify(score, metrics, a["family"], b["family"])
            if classification == "LOW":
                continue
            findings.append({
                "classification": classification,
                "reason": reason,
                "score": f"{score:.3f}",
                "family_a": a["family"],
                "url_a": a["url"],
                "title_a": a.get("title", ""),
                "family_b": b["family"],
                "url_b": b["url"],
                "title_b": b.get("title", ""),
                **{k: f"{v:.3f}" for k, v in metrics.items()},
                "action": "REVIEW_ONLY",
            })
    order = {"HIGH_COLLISION_REVIEW": 0, "MEDIUM_COLLISION_REVIEW": 1, "ROLE_OVERLAP_REVIEW": 2}
    return sorted(findings, key=lambda x: (order[x["classification"]], -float(x["score"]), x["url_a"], x["url_b"]))


def write_outputs(findings: list[dict], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = out_dir / "current-intent-collisions.csv"
    md_path = out_dir / "current-intent-collisions.md"

    fields = [
        "classification", "reason", "score", "family_a", "url_a", "title_a",
        "family_b", "url_b", "title_b", "title_jaccard", "title_containment",
        "slug_jaccard", "slug_containment", "description_jaccard", "action",
    ]
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(findings)

    counts = {}
    for finding in findings:
        counts[finding["classification"]] = counts.get(finding["classification"], 0) + 1

    lines = [
        "# Current Knowledge Center Intent Collision Review",
        "",
        "Heuristic review of current, indexable production URLs only. This report never authorizes an automatic canonical, redirect, noindex, merge, or deletion.",
        "",
        "## Counts",
        "",
    ]
    for key in ("HIGH_COLLISION_REVIEW", "MEDIUM_COLLISION_REVIEW", "ROLE_OVERLAP_REVIEW"):
        lines.append(f"- {key}: {counts.get(key, 0)}")
    lines += ["", "## Highest-priority pairs", ""]
    for finding in findings[:25]:
        lines.append(
            f"- **{finding['classification']}** ({finding['score']}) — "
            f"{finding['url_a']} ↔ {finding['url_b']} — {finding['reason']}"
        )
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    args = parser.parse_args()

    findings = detect(load_rows(args.audit))
    write_outputs(findings, args.out_dir)
    print(f"Intent collision review pairs: {len(findings)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
