#!/usr/bin/env python3
"""Intent-aware triage for short pages found by the production SEO/GEO audit.

This script does not change the production audit or hide low word counts. It reads
`seo-geo-audit.csv`, isolates pages below a configurable threshold, and separates
pages that are expected to be concise because their primary job is transactional,
navigational, interactive, or visual from editorial/entity pages that should be
reviewed for substantive expansion.

Usage:
    python3 scripts/seo-geo-audit/triage_short_pages.py \
        seo-geo-audit-out/seo-geo-audit.csv \
        --threshold 250 \
        --out-dir seo-geo-audit-out

Outputs:
    short-pages-triage.csv
    short-pages-triage.md
"""

from __future__ import annotations

import argparse
import csv
import os
import urllib.parse
from collections import Counter
from dataclasses import dataclass


@dataclass(frozen=True)
class PurposeRule:
    label: str
    action: str
    reason: str
    prefixes: tuple[str, ...] = ()
    exact_paths: tuple[str, ...] = ()

    def matches(self, path: str) -> bool:
        if path in self.exact_paths:
            return True
        return any(path == prefix or path.startswith(prefix + "/") for prefix in self.prefixes)


# These rules intentionally stay narrow. A page is exempted from editorial
# expansion only when its primary user intent is clearly not article-like.
PURPOSE_RULES = (
    PurposeRule(
        label="transactional",
        action="KEEP_CONCISE",
        reason="Primary intent is contact, application, or another conversion task; do not add filler solely to hit a word-count target.",
        exact_paths=("/contact", "/distributor-application"),
    ),
    PurposeRule(
        label="search_tool",
        action="KEEP_CONCISE",
        reason="Search/results interfaces should optimize task completion, not editorial length.",
        prefixes=("/search", "/part-search"),
    ),
    PurposeRule(
        label="calculator_tool",
        action="KEEP_CONCISE_REVIEW_CONTEXT",
        reason="Calculator pages are interactive tools. Keep concise unless instructions, assumptions, units, evidence boundaries, or interpretation guidance are missing.",
        prefixes=("/knowledge-center/calculators",),
    ),
    PurposeRule(
        label="learning_navigation",
        action="KEEP_CONCISE_REVIEW_CONTEXT",
        reason="Learning paths are structured navigation. Expand only when the sequence lacks a clear objective, audience, prerequisites, or outcome.",
        prefixes=("/knowledge-center/learning-paths",),
    ),
    PurposeRule(
        label="visual_reference",
        action="KEEP_CONCISE_REVIEW_CONTEXT",
        reason="Diagram pages are visual engineering references. Add text only when needed to explain scope, interpretation, standards, or limitations.",
        prefixes=("/knowledge-center/diagrams",),
    ),
    PurposeRule(
        label="data_or_dashboard",
        action="KEEP_CONCISE_REVIEW_CONTEXT",
        reason="Dashboards, graphs, coverage views, and datasets are data interfaces. Judge them on interpretability and provenance rather than raw word count.",
        prefixes=(
            "/knowledge-center/dashboard",
            "/knowledge-center/graph",
            "/knowledge-center/coverage",
            "/knowledge-center/datasets",
        ),
    ),
)


def normalize_path(url: str) -> str:
    path = urllib.parse.urlparse(url).path or "/"
    return path.rstrip("/") or "/"


def classify(path: str) -> tuple[str, str, str]:
    for rule in PURPOSE_RULES:
        if rule.matches(path):
            return rule.label, rule.action, rule.reason
    return (
        "editorial_or_entity",
        "REVIEW_FOR_EXPANSION",
        "Indexable editorial/entity page is short enough to merit human review for missing definitions, operating context, evidence boundaries, FAQs, standards, or relationships.",
    )


def read_short_pages(path: str, threshold: int) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required = {"url", "word_count"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise SystemExit(f"Missing required CSV column(s): {', '.join(sorted(missing))}")

        for row in reader:
            try:
                word_count = int(float(row.get("word_count") or 0))
            except ValueError:
                continue
            if word_count >= threshold:
                continue
            if str(row.get("indexable_html", "")).strip().lower() not in {"true", "1", "yes"}:
                continue

            path_value = normalize_path(row["url"])
            purpose, action, reason = classify(path_value)
            rows.append({
                "url": row["url"],
                "path": path_value,
                "category": row.get("category", ""),
                "word_count": str(word_count),
                "purpose": purpose,
                "recommended_action": action,
                "reason": reason,
            })

    return sorted(rows, key=lambda r: (r["recommended_action"], int(r["word_count"]), r["url"]))


def write_csv(rows: list[dict[str, str]], path: str) -> None:
    fields = [
        "url",
        "path",
        "category",
        "word_count",
        "purpose",
        "recommended_action",
        "reason",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_markdown(rows: list[dict[str, str]], threshold: int, path: str) -> None:
    actions = Counter(row["recommended_action"] for row in rows)
    purposes = Counter(row["purpose"] for row in rows)

    lines = [
        "# ELIMFILTERS — Short-page intent triage",
        "",
        f"Threshold used: **< {threshold} visible words**.",
        "",
        "A short page is not automatically a weak page. This triage separates editorial/entity pages from pages whose primary purpose is transactional, navigational, interactive, visual, or data-oriented.",
        "",
        "## Action summary",
        "",
        "| Action | Pages |",
        "|---|---:|",
    ]
    for action, count in sorted(actions.items()):
        lines.append(f"| {action} | {count} |")

    lines.extend(["", "## Purpose summary", "", "| Purpose | Pages |", "|---|---:|"])
    for purpose, count in sorted(purposes.items()):
        lines.append(f"| {purpose} | {count} |")

    review = [r for r in rows if r["recommended_action"] == "REVIEW_FOR_EXPANSION"]
    lines.extend([
        "",
        "## Editorial/entity pages to review first",
        "",
        "These are the pages where added content may improve SEO/GEO/AEO if it answers real engineering or commercial questions. Expansion should be specific, evidence-bounded, and non-duplicative.",
        "",
        "| Words | URL |",
        "|---:|---|",
    ])
    for row in review:
        lines.append(f"| {row['word_count']} | {row['url']} |")

    concise = [r for r in rows if r["recommended_action"] != "REVIEW_FOR_EXPANSION"]
    lines.extend([
        "",
        "## Purpose-driven concise pages",
        "",
        "Do not pad these pages merely to cross the threshold. Review usability, instructions, assumptions, provenance, evidence boundaries, and structured data instead.",
        "",
        "| Words | Purpose | Action | URL |",
        "|---:|---|---|---|",
    ])
    for row in concise:
        lines.append(
            f"| {row['word_count']} | {row['purpose']} | {row['recommended_action']} | {row['url']} |"
        )

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("audit_csv", help="Path to seo-geo-audit.csv")
    parser.add_argument("--threshold", type=int, default=250)
    parser.add_argument("--out-dir", default=None)
    args = parser.parse_args()

    out_dir = args.out_dir or os.path.dirname(os.path.abspath(args.audit_csv)) or "."
    os.makedirs(out_dir, exist_ok=True)

    rows = read_short_pages(args.audit_csv, args.threshold)
    csv_path = os.path.join(out_dir, "short-pages-triage.csv")
    md_path = os.path.join(out_dir, "short-pages-triage.md")
    write_csv(rows, csv_path)
    write_markdown(rows, args.threshold, md_path)

    review_count = sum(1 for r in rows if r["recommended_action"] == "REVIEW_FOR_EXPANSION")
    concise_count = len(rows) - review_count
    print(f"Short indexable pages: {len(rows)}")
    print(f"Editorial/entity review: {review_count}")
    print(f"Purpose-driven concise: {concise_count}")
    print(csv_path)
    print(md_path)


if __name__ == "__main__":
    main()
