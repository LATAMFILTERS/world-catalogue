#!/usr/bin/env python3
"""
scraper_wix_crossrefs.py
========================
Looks up WIX cross-reference numbers for all Mann LD SKUs already in
mann_master_progress.json and mann_master_gaps_progress.json.

Uses www2.wixfilters.com/Lookup/NewCompetitor.aspx (plain HTTP, no Playwright).

Output: C:\\mann\\wix_crossrefs.jsonl   — one JSON line per Mann SKU
        C:\\mann\\wix_crossrefs_progress.json — resume support

Usage:
    python scraper_wix_crossrefs.py
    python scraper_wix_crossrefs.py --dry-run   (print first 5, no write)
    python scraper_wix_crossrefs.py --stats
"""

import argparse
import json
import logging
import os
import time
import urllib.request
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

PROGRESS_FILES = [
    Path(r"C:\mann\mann_master_progress.json"),
    Path(r"C:\mann\mann_master_gaps_progress.json"),
]
OUTPUT_FILE   = Path(r"C:\mann\wix_crossrefs.jsonl")
PROG_FILE     = Path(r"C:\mann\wix_crossrefs_progress.json")
WIX_URL       = "https://www2.wixfilters.com/Lookup/NewCompetitor.aspx?PartNo={}"
PAUSE         = 0.4   # seconds between requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.data = []

    def handle_data(self, d):
        d = d.strip()
        if d:
            self.data.append(d)


def fetch_wix(sku: str) -> list[str]:
    """Return list of WIX part numbers for this competitor SKU. Empty list if none found."""
    url = WIX_URL.format(urllib.parse.quote(sku))
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
        })
        with urllib.request.urlopen(req, timeout=15) as r:
            html = r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        log.warning(f"  {sku}: HTTP error — {e}")
        return []

    parser = TextExtractor()
    parser.feed(html)
    texts = [x for x in parser.data
             if len(x) > 1
             and "gtag" not in x
             and "window" not in x
             and "dataLayer" not in x]

    # Check for "no information" response
    if any("no information available" in t.lower() for t in texts):
        return []

    # Find header row: Part Number | Manufacturer | Wix Part Number | LeadTime
    # Results start right after the 4 headers; each row = 3 values (part, mfr, wix_num)
    try:
        start = next(i for i, t in enumerate(texts) if t == "Part Number")
    except StopIteration:
        return []

    data_start = start + 4  # skip 4 header columns
    wix_numbers = []
    i = data_start
    while i + 2 < len(texts):
        candidate = texts[i + 2]
        # WIX oil filter numbers: 51xxx, 57xxx
        # WIX air filter: 46xxx, 42xxx
        # WIX cabin: 24xxx
        # WIX fuel: 33xxx
        # All are pure digits, 4-6 chars
        if candidate.isdigit() and 4 <= len(candidate) <= 7:
            if candidate not in wix_numbers:
                wix_numbers.append(candidate)
        i += 3

    return wix_numbers


def load_all_skus() -> list[str]:
    """Load all Mann LD SKUs from progress files, deduplicated."""
    seen, skus = set(), []
    for pf in PROGRESS_FILES:
        if not pf.exists():
            log.warning(f"Not found: {pf}")
            continue
        with open(pf, encoding="utf-8") as f:
            data = json.load(f)
        for sku in data:
            if sku not in seen:
                seen.add(sku)
                skus.append(sku)
    log.info(f"Total unique Mann LD SKUs: {len(skus):,}")
    return skus


def load_progress() -> dict:
    if PROG_FILE.exists():
        with open(PROG_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_progress(prog: dict):
    tmp = str(PROG_FILE) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(prog, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, str(PROG_FILE))


def run(dry_run: bool = False):
    skus     = load_all_skus()
    progress = load_progress()
    pending  = [s for s in skus if s not in progress]
    log.info(f"Already done: {len(progress):,} | Pending: {len(pending):,}")

    found_total = 0
    checked = 0

    for i, sku in enumerate(pending, 1):
        wix_nums = fetch_wix(sku)
        result = {"sku": sku, "wix": wix_nums}

        if dry_run:
            log.info(f"  [{i}] {sku} → {wix_nums}")
            if i >= 5:
                log.info("  (dry-run: stopping after 5)")
                break
            continue

        # Append to output file
        with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")

        progress[sku] = wix_nums
        found_total += len(wix_nums)
        checked += 1

        if wix_nums:
            log.info(f"  [{i}/{len(pending)}] {sku} → WIX {wix_nums}")
        elif i % 100 == 0:
            log.info(f"  [{i}/{len(pending)}] {sku} → (no match)")

        # Save progress every 50 SKUs
        if checked % 50 == 0:
            save_progress(progress)

        time.sleep(PAUSE)

    if not dry_run:
        save_progress(progress)
        log.info(f"\n{'='*55}")
        log.info(f"WIX Cross-reference Summary")
        log.info(f"  SKUs checked   : {checked:,}")
        log.info(f"  WIX matches    : {found_total:,}")
        log.info(f"  Output         : {OUTPUT_FILE}")


def stats():
    progress = load_progress()
    if not progress:
        print("No progress yet — run scraper first.")
        return
    with_wix = {k: v for k, v in progress.items() if v}
    total_wix = sum(len(v) for v in progress.values())
    print(f"\nWIX Cross-reference Stats:")
    print(f"  SKUs processed  : {len(progress):,}")
    print(f"  With WIX match  : {len(with_wix):,}")
    print(f"  Total WIX nums  : {total_wix:,}")
    if with_wix:
        sample = list(with_wix.items())[:5]
        print(f"\n  Sample matches:")
        for sku, wix in sample:
            print(f"    {sku:<20} → WIX {wix}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Test first 5 SKUs, no write")
    parser.add_argument("--stats",   action="store_true", help="Show stats from progress file")
    args = parser.parse_args()

    if args.stats:
        stats()
    else:
        run(dry_run=args.dry_run)
