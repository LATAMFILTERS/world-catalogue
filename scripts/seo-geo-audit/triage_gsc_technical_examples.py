#!/usr/bin/env python3
"""Triage detailed GSC Page Indexing technical-exception exports.

This script is conservative and read-only. It cross-checks historical GSC
examples against the current production SEO audit so stale Search Console
states are not treated as current defects.

Supported states:
- NOT_FOUND_404
- DUPLICATE_NO_CANONICAL
- BLOCKED_ROBOTS
- REDIRECT_ERROR
- SERVER_ERROR_5XX

Outputs:
- gsc-technical-triage.csv
- gsc-technical-triage.md
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
from urllib.parse import urlparse

BASE_HOST = "elimfilters.com"
URL_HEADERS = ("url", "URL", "Página", "Page", "example", "Example")


def normalized_url(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"}:
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


def read_examples(path: Path | None, state: str) -> list[dict[str, str]]:
    if path is None or not path.exists():
        return []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    return [
        {"url": url, "gsc_state": state}
        for row in rows
        if (url := detect_url(row))
    ]


def load_audit(path: Path) -> dict[str, dict[str, str]]:
    if not path.exists():
        return {}
    with path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    result = {}
    for row in rows:
        url = normalized_url(row.get("url") or row.get("URL") or "")
        if url:
            result[url] = row
    return result


def as_int(row: dict[str, str], *keys: str) -> int | None:
    for key in keys:
        value = str(row.get(key, "")).strip()
        if value.isdigit():
            return int(value)
    return None


def classify(example: dict[str, str], audit: dict[str, str] | None) -> tuple[str, str]:
    state = example["gsc_state"]
    url = example["url"]

    if not audit:
        return "HISTORICAL_OR_OUTSIDE_CURRENT_SITEMAP", "URL is absent from the current production sitemap audit; verify retirement/redirect intent before changing code."

    status = as_int(audit, "status", "status_code", "http_status")
    canonical = (audit.get("canonical") or audit.get("canonical_url") or "").strip()
    canonical_url = normalized_url(canonical) if canonical else ""
    robots = str(audit.get("robots") or audit.get("robots_meta") or "").lower()
    error = str(audit.get("error") or "").strip()
    redirect_chain = str(audit.get("redirect_chain") or audit.get("chain") or "").strip()

    if state == "NOT_FOUND_404":
        if status == 404:
            return "CURRENT_404_REVIEW", "URL still returns 404. Decide whether it is intentionally retired or needs a redirect/restoration."
        if status and 200 <= status < 400:
            return "RESOLVED_SINCE_GSC_SNAPSHOT", f"Current audit returns HTTP {status}; historical GSC 404 is no longer a live defect."
        return "TECHNICAL_RECHECK", f"Current audit status is {status or 'unknown'}; recheck live behavior."

    if state == "DUPLICATE_NO_CANONICAL":
        if status == 200 and canonical_url == url:
            return "RESOLVED_SELF_CANONICAL", "Current page is 200 with a self-canonical; historical duplicate-without-canonical signal appears resolved."
        if status == 200 and canonical_url and canonical_url != url:
            return "CANONICAL_INTENT_REVIEW", f"Current page canonicalizes to {canonical_url}; verify that consolidation is intentional."
        if status and status >= 300:
            return "REDIRECT_OR_RETIREMENT_REVIEW", f"Current status is HTTP {status}; duplicate signal may have been replaced by redirect/retirement behavior."
        return "CURRENT_CANONICAL_DEFECT", "Current page does not expose a usable canonical signal."

    if state == "BLOCKED_ROBOTS":
        if "noindex" in robots:
            return "NOINDEX_INTENT_REVIEW", "Current page is explicitly noindex; confirm this exclusion is intentional."
        if status == 200:
            return "RESOLVED_OR_ROBOTS_RECHECK", "Current page is reachable; verify current robots.txt rule before changing page content."
        return "TECHNICAL_RECHECK", f"Current status is {status or 'unknown'}; inspect robots and live response together."

    if state == "REDIRECT_ERROR":
        if status == 200 and not error:
            return "RESOLVED_SINCE_GSC_SNAPSHOT", "Current audit reaches a successful page without a redirect error."
        if error:
            return "CURRENT_REDIRECT_DEFECT", f"Current audit reports {error}."
        if status and 300 <= status < 400:
            return "REDIRECT_CHAIN_REVIEW", f"Current audit still reports HTTP {status}; inspect redirect chain: {redirect_chain or 'not recorded'}."
        return "TECHNICAL_RECHECK", f"Current status is {status or 'unknown'}; recheck redirect behavior."

    if state == "SERVER_ERROR_5XX":
        if status and 500 <= status <= 599:
            return "CURRENT_5XX_REPAIR", f"Current production audit still reports HTTP {status}."
        if status and 200 <= status < 500:
            return "RESOLVED_SINCE_GSC_SNAPSHOT", f"Current audit returns HTTP {status}; historical 5xx appears resolved."
        return "TECHNICAL_RECHECK", "Current status is unavailable; inspect live availability before code changes."

    return "REVIEW", "Unrecognized state; review manually."


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--not-found", type=Path)
    parser.add_argument("--duplicate", type=Path)
    parser.add_argument("--robots", type=Path)
    parser.add_argument("--redirect-error", type=Path)
    parser.add_argument("--server-error", type=Path)
    parser.add_argument("--audit", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, default=Path("seo-geo-audit-out"))
    args = parser.parse_args()

    examples = []
    examples += read_examples(args.not_found, "NOT_FOUND_404")
    examples += read_examples(args.duplicate, "DUPLICATE_NO_CANONICAL")
    examples += read_examples(args.robots, "BLOCKED_ROBOTS")
    examples += read_examples(args.redirect_error, "REDIRECT_ERROR")
    examples += read_examples(args.server_error, "SERVER_ERROR_5XX")
    audit = load_audit(args.audit)

    seen = set()
    rows = []
    for example in examples:
        key = (example["url"], example["gsc_state"])
        if key in seen:
            continue
        seen.add(key)
        action, reason = classify(example, audit.get(example["url"]))
        rows.append({"url": example["url"], "gsc_state": example["gsc_state"], "action": action, "reason": reason})

    args.out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = args.out_dir / "gsc-technical-triage.csv"
    md_path = args.out_dir / "gsc-technical-triage.md"
    fields = ["url", "gsc_state", "action", "reason"]
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    counts: dict[str, int] = {}
    for row in rows:
        counts[row["action"]] = counts.get(row["action"], 0) + 1
    lines = ["# GSC technical exception triage", "", f"Detailed URLs processed: **{len(rows)}**", "", "## Actions", ""]
    lines.extend(f"- `{action}`: {count}" for action, count in sorted(counts.items()))
    lines += ["", "Historical GSC states are never treated as current defects without confirmation from the production audit."]
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Technical GSC examples processed: {len(rows)}")
    print(csv_path)
    print(md_path)


if __name__ == "__main__":
    main()
