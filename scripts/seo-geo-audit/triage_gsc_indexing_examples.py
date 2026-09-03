#!/usr/bin/env python3
"""Triage detailed Google Search Console Page Indexing example exports.

This script is intentionally conservative. It does not equate a GSC exclusion
with a content defect and it never publishes or rewrites content.

Typical usage:
  python scripts/seo-geo-audit/triage_gsc_indexing_examples.py \
    --crawled gsc-crawled-not-indexed.csv \
    --discovered gsc-discovered-not-indexed.csv \
    --audit seo-geo-audit-out/seo-geo-audit.csv \
    --out-dir seo-geo-audit-out

Outputs:
  gsc-indexing-triage.csv
  gsc-indexing-semantic-candidates.csv
  gsc-indexing-triage.md
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
from urllib.parse import urlparse

BASE_HOST = "elimfilters.com"

UTILITY_PREFIXES = (
    "/contact",
    "/distributor-application",
    "/search",
    "/part-search",
    "/knowledge-center/calculators",
    "/knowledge-center/learning-paths",
    "/knowledge-center/diagrams",
    "/knowledge-center/dashboard",
    "/knowledge-center/graph",
    "/knowledge-center/coverage",
    "/knowledge-center/datasets",
)

URL_HEADERS = (
    "url",
    "URL",
    "Página",
    "Page",
    "example",
    "Example",
)


def normalized_url(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    parsed = urlparse(value)
    if not parsed.scheme:
        return ""
    host = parsed.netloc.lower().split(":")[0]
    if host not in {BASE_HOST, f"www.{BASE_HOST}"}:
        return ""
    path = parsed.path or "/"
    if path != "/" and not path.endswith("/"):
        path += "/"
    return f"https://{BASE_HOST}{path}"


def detect_url(row: dict[str, str]) -> str:
    for key in URL_HEADERS:
        if key in row:
            url = normalized_url(row.get(key, ""))
            if url:
                return url
    for value in row.values():
        url = normalized_url(value)
        if url:
            return url
    return ""


def read_examples(path: Path | None, gsc_state: str) -> list[dict[str, str]]:
    if path is None:
        return []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    out = []
    for row in rows:
        url = detect_url(row)
        if url:
            out.append({"url": url, "gsc_state": gsc_state})
    return out


def load_audit(path: Path | None) -> dict[str, dict[str, str]]:
    if path is None or not path.exists():
        return {}
    with path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    result: dict[str, dict[str, str]] = {}
    for row in rows:
        raw = row.get("url") or row.get("URL") or ""
        url = normalized_url(raw)
        if url:
            result[url] = row
    return result


def truthy(value: str) -> bool:
    return str(value or "").strip().lower() in {"1", "true", "yes", "y", "si", "sí"}


def number(row: dict[str, str], *keys: str) -> int | None:
    for key in keys:
        value = str(row.get(key, "")).strip()
        if value.isdigit():
            return int(value)
    return None


def page_type(url: str) -> str:
    path = urlparse(url).path.rstrip("/") or "/"
    if any(path == prefix or path.startswith(prefix + "/") for prefix in UTILITY_PREFIXES):
        return "purpose_driven_concise"
    return "editorial_or_entity"


def classify(example: dict[str, str], audit: dict[str, str] | None) -> tuple[str, str]:
    state = example["gsc_state"]
    url = example["url"]
    ptype = page_type(url)

    if not audit:
        return "REVIEW_LIVE_TECHNICAL_STATE", "URL is absent from the current audit; verify whether it is legacy, retired, redirected, or newly added."

    status = number(audit, "status", "status_code", "http_status")
    if status is not None and status >= 400:
        return "TECHNICAL_REPAIR", f"Current audit reports HTTP {status}; repair or intentionally retire before semantic review."

    noindex = truthy(audit.get("noindex", "")) or "noindex" in str(audit.get("robots", "")).lower()
    if noindex:
        return "EXPECTED_OR_TECHNICAL_EXCLUSION", "Current page is noindex; confirm intent rather than adding content."

    canonical = (audit.get("canonical") or audit.get("canonical_url") or "").strip()
    if canonical:
        canon = normalized_url(canonical)
        if canon and canon != url:
            return "TECHNICAL_CANONICAL_REVIEW", f"Canonical resolves to {canon}; resolve canonical intent before semantic work."

    if ptype == "purpose_driven_concise":
        return "KEEP_CONCISE_REVIEW_CONTEXT", "Purpose-driven utility/navigation page; judge usability, assumptions, provenance and structured data, not word count."

    if state == "CRAWLED_NOT_INDEXED":
        return "REVIEW_FOR_EXPANSION", "Google crawled the editorial/entity page but did not index it; eligible for evidence-led SEO/GEO/AEO semantic review."

    return "CRAWL_DISCOVERY_PRIORITY", "Google has discovered but not crawled/indexed the page; strengthen discovery/internal-link/crawl signals before assuming a semantic defect."


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--crawled", type=Path)
    parser.add_argument("--discovered", type=Path)
    parser.add_argument("--audit", type=Path)
    parser.add_argument("--out-dir", type=Path, default=Path("seo-geo-audit-out"))
    args = parser.parse_args()

    examples = read_examples(args.crawled, "CRAWLED_NOT_INDEXED") + read_examples(args.discovered, "DISCOVERED_NOT_INDEXED")
    audit = load_audit(args.audit)

    seen = set()
    rows = []
    for example in examples:
        key = (example["url"], example["gsc_state"])
        if key in seen:
            continue
        seen.add(key)
        audit_row = audit.get(example["url"])
        action, reason = classify(example, audit_row)
        rows.append({
            "url": example["url"],
            "gsc_state": example["gsc_state"],
            "page_type": page_type(example["url"]),
            "action": action,
            "reason": reason,
            "word_count": (audit_row or {}).get("word_count", ""),
        })

    args.out_dir.mkdir(parents=True, exist_ok=True)
    triage_csv = args.out_dir / "gsc-indexing-triage.csv"
    semantic_csv = args.out_dir / "gsc-indexing-semantic-candidates.csv"
    md = args.out_dir / "gsc-indexing-triage.md"

    fields = ["url", "gsc_state", "page_type", "action", "reason", "word_count"]
    with triage_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader(); writer.writerows(rows)

    semantic = [row for row in rows if row["action"] == "REVIEW_FOR_EXPANSION"]
    with semantic_csv.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader(); writer.writerows(semantic)

    counts: dict[str, int] = {}
    for row in rows:
        counts[row["action"]] = counts.get(row["action"], 0) + 1
    lines = [
        "# GSC Page Indexing example triage",
        "",
        f"Detailed URLs processed: **{len(rows)}**",
        f"Evidence-led semantic candidates: **{len(semantic)}**",
        "",
        "This triage never treats `Crawled - currently not indexed` or `Discovered - currently not indexed` as automatic proof of thin content.",
        "",
        "## Actions",
        "",
    ]
    for action, count in sorted(counts.items()):
        lines.append(f"- `{action}`: {count}")
    lines += [
        "",
        "Only `REVIEW_FOR_EXPANSION` rows should feed the existing HERMES knowledge-gap bridge. `CRAWL_DISCOVERY_PRIORITY` is a crawl/discovery problem first, not a content-padding instruction.",
    ]
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"GSC examples processed: {len(rows)}")
    print(f"Semantic candidates: {len(semantic)}")
    print(triage_csv)
    print(semantic_csv)
    print(md)


if __name__ == "__main__":
    main()
