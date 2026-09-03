#!/usr/bin/env python3
"""Build governed HERMES research requests from short-page triage output.

This script does not publish or rewrite content. It converts only pages that
were classified for editorial/entity expansion into explicit knowledge-gap
research requests. Utility/tool/navigation pages are ignored.

Input: short-pages-triage.csv
Outputs:
  - hermes-knowledge-gaps.json
  - hermes-knowledge-gaps.md

The output is intentionally review-oriented. HERMES remains a research and
validation layer; canonical Knowledge Center publication still requires the
existing approval/governance path.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path
from urllib.parse import urlparse

RESEARCH_ACTION = "REVIEW_FOR_EXPANSION"


def slug_words(url: str) -> list[str]:
    path = urlparse(url).path.strip("/")
    if not path:
        return ["ELIMFILTERS page"]
    leaf = path.split("/")[-1]
    return [word for word in re.split(r"[-_]+", leaf) if word]


def page_subject(url: str) -> str:
    words = slug_words(url)
    return " ".join(word.upper() if len(word) <= 3 else word.title() for word in words)


def research_question(row: dict[str, str]) -> str:
    url = row.get("url", "").strip()
    subject = page_subject(url)
    page_type = row.get("page_type", "editorial_or_entity") or "editorial_or_entity"
    word_count = row.get("word_count", "unknown")

    return (
        f"Audit the current ELIMFILTERS page '{subject}' ({url}) as a {page_type} entity. "
        f"The production audit measured approximately {word_count} visible words, but word count alone is not a defect. "
        "Determine whether the page has a real SEO/GEO/AEO knowledge deficiency: missing direct answers, weak entity definition, "
        "missing operating or failure context, absent standards/test framework, insufficient evidence boundaries, weak relationships "
        "to filtration systems/technologies/failure modes, or missing application/diagnostic guidance. Compare all verified findings "
        "against the existing ELIMFILTERS Knowledge Center and classify the result as CREATE_NEW, UPDATE_REINFORCE, "
        "NO_MATERIAL_CHANGE, or INTERNAL_ONLY. Prefer primary technical evidence and do not add generic filler, competitor marketing, "
        "or unsupported specifications."
    )


def build_request(row: dict[str, str], index: int) -> dict:
    url = row.get("url", "").strip()
    return {
        "knowledge_gap_request_id": f"SEO_GEO_AEO_{index:03d}",
        "research_type": "ELIMFILTERS_KNOWLEDGE_GAP",
        "source_audit": "seo-geo-audit",
        "page_url": url,
        "page_type": row.get("page_type") or "editorial_or_entity",
        "triage_action": row.get("action") or RESEARCH_ACTION,
        "observed_word_count": int(row["word_count"]) if str(row.get("word_count", "")).isdigit() else None,
        "priority": "medium",
        "minimum_independent_sources": 1,
        "required_source_types": [
            "primary_technical_source",
            "standard_or_regulatory_source_when_applicable",
        ],
        "allow_competitor_sources": True,
        "allow_industry_sources": True,
        "research_question": research_question(row),
        "publication_policy": {
            "auto_publish": False,
            "requires_review": True,
            "no_word_count_padding": True,
            "public_competitor_claims_prohibited": True,
        },
    }


def load_candidates(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    return [row for row in rows if (row.get("action") or "").strip() == RESEARCH_ACTION]


def write_markdown(path: Path, requests: list[dict]) -> None:
    lines = [
        "# HERMES knowledge gaps from SEO/GEO/AEO triage",
        "",
        "Only pages classified as `REVIEW_FOR_EXPANSION` are included. Short utility, search, calculator, learning-navigation, visual-reference and data/dashboard pages are not converted into content requests.",
        "",
        "HERMES must research and classify each gap; this file is not publication approval.",
        "",
        f"Research candidates: **{len(requests)}**",
        "",
        "| # | Page | Type | Words | HERMES task |",
        "|---:|---|---|---:|---|",
    ]
    for idx, req in enumerate(requests, start=1):
        lines.append(
            f"| {idx} | `{req['page_url']}` | `{req['page_type']}` | "
            f"{req['observed_word_count'] if req['observed_word_count'] is not None else 'n/a'} | "
            "Determine real knowledge/entity/answerability gap and classify before proposing any update. |"
        )
    lines.extend([
        "",
        "## Governance",
        "",
        "- `NO_MATERIAL_CHANGE`: leave the page unchanged.",
        "- `UPDATE_REINFORCE`: propose only verified additions or corrections to the existing entity.",
        "- `CREATE_NEW`: propose a separate canonical entity only when the verified topic is materially absent.",
        "- `INTERNAL_ONLY`: retain provenance internally; do not publish.",
        "- HERMES never receives authority to publish from this bridge.",
    ])
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("triage_csv", type=Path)
    parser.add_argument("--out-dir", type=Path, default=Path("seo-geo-audit-out"))
    args = parser.parse_args()

    candidates = load_candidates(args.triage_csv)
    requests = [build_request(row, idx) for idx, row in enumerate(candidates, start=1)]

    args.out_dir.mkdir(parents=True, exist_ok=True)
    json_path = args.out_dir / "hermes-knowledge-gaps.json"
    md_path = args.out_dir / "hermes-knowledge-gaps.md"

    json_path.write_text(json.dumps({"requests": requests}, indent=2) + "\n", encoding="utf-8")
    write_markdown(md_path, requests)

    print(f"HERMES knowledge-gap candidates: {len(requests)}")
    print(json_path)
    print(md_path)


if __name__ == "__main__":
    main()
