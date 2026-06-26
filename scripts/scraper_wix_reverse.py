#!/usr/bin/env python3
"""
scraper_wix_reverse.py — Reverse WIX lookup: WIX number → all competitor part numbers
========================================================================================
For each WIX number we already have in wix_crossrefs.jsonl, queries:
  https://www2.wixfilters.com/Lookup/WIXProduct.aspx?PartNo={wix_num}

This returns a cross-reference table: all competitor brands (FRAM, Baldwin,
Donaldson, ACDelco, Bosch, etc.) that WIX considers equivalent to that WIX number.

Result: one JSONL line per WIX number:
  {"wix": "51452", "refs": [{"brand": "FRAM", "code": "PH3387A"}, ...]}

This enriches the existing Mann LD catalog with FRAM, Baldwin, Donaldson codes
via the WIX → Mann bridge already in the DB.

Usage:
    python scraper_wix_reverse.py
    python scraper_wix_reverse.py --dry-run
    python scraper_wix_reverse.py --stats
    python scraper_wix_reverse.py --wix-num 51452   (test single number)

Input:  C:\\mann\\wix_crossrefs.jsonl
Output: C:\\mann\\wix_reverse.jsonl
Resume: C:\\mann\\wix_reverse_progress.json
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

INPUT_FILE    = Path(r"C:\mann\wix_crossrefs.jsonl")
OUTPUT_FILE   = Path(r"C:\mann\wix_reverse.jsonl")
PROG_FILE     = Path(r"C:\mann\wix_reverse_progress.json")

# NewCompetitor with WIX number — WIX maps its own numbers to competitors
WIX_REVERSE_URL = "https://www2.wixfilters.com/Lookup/NewCompetitor.aspx?PartNo={}"
WIX_COMP_URL    = WIX_REVERSE_URL

PAUSE = 0.5

# Brands to capture (filter out equipment OEMs and noise)
FILTER_BRANDS = {
    'FRAM', 'BALDWIN', 'DONALDSON', 'FLEETGUARD', 'MANN', 'MANN+HUMMEL',
    'MANN-HUMMEL', 'MANN FILTER', 'PUROLATOR', 'NAPA', 'AC DELCO', 'ACDELCO',
    'BOSCH', 'MAHLE', 'HENGST', 'SAKURA', 'LUBER-FINER', 'LUBERFINER',
    'PARKER', 'PALL', 'HYDAC', 'UFI', 'CHAMPION', 'HASTINGS', 'COOPERSFILTERS',
    'COOPERS', 'MOTORCRAFT', 'CHAMPION LABS', 'PREMIUM GUARD', 'STP',
    'CARQUEST', 'PRONTO', 'CHAMP', 'SUPERTECH', 'MOBIL 1',
}

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


def fetch_wix_reverse(wix_num: str) -> list[dict]:
    """
    Query WIX product page for a WIX number and return list of
    {brand, code} competitor cross-references.
    """
    url = WIX_REVERSE_URL.format(urllib.parse.quote(wix_num))
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Referer": "https://www2.wixfilters.com/",
        })
        with urllib.request.urlopen(req, timeout=15) as r:
            html = r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        log.warning(f"  {wix_num}: HTTP error — {e}")
        return []

    return _parse_crossref_table(html, wix_num)


def _parse_crossref_table(html: str, wix_num: str) -> list[dict]:
    """Parse the cross-reference table from WIX product/competitor page."""
    parser = TextExtractor()
    parser.feed(html)
    texts = [x for x in parser.data
             if len(x) > 1
             and "gtag" not in x
             and "window" not in x
             and "dataLayer" not in x
             and "function" not in x]

    if any("no information available" in t.lower() for t in texts):
        return []

    # Find header: "Part Number" | "Manufacturer" | "Wix Part Number"
    # or "Brand" | "Part Number" (cross-ref table format)
    refs = []
    seen = set()

    # Format 1: WIXProduct page — table: Brand | Competitor Part Number
    # Header: "Brand" then "Part Number" or "Competitor Part Number"
    brand_header_idx = None
    for i, t in enumerate(texts):
        if t.lower() in ('brand', 'manufacturer') and i + 1 < len(texts):
            next_t = texts[i + 1].lower()
            if 'part' in next_t or 'number' in next_t:
                brand_header_idx = i
                break

    if brand_header_idx is not None:
        # Count header columns
        headers = []
        j = brand_header_idx
        while j < len(texts) and len(headers) < 5:
            t = texts[j].lower()
            if any(kw in t for kw in ('brand', 'manufacturer', 'part', 'number', 'wix', 'lead')):
                headers.append(texts[j])
                j += 1
            else:
                break
        ncols = len(headers)
        data_start = brand_header_idx + ncols
        i = data_start
        while i + 1 < len(texts):
            brand = texts[i].strip().upper()
            code  = texts[i + 1].strip().upper()
            key   = f"{brand}|{code}"
            if brand and code and key not in seen:
                seen.add(key)
                refs.append({'brand': brand, 'code': code})
            i += ncols if ncols >= 2 else 2
        return refs

    # Format 2: NewCompetitor page used with WIX number — returns rows:
    # competitor_pn | manufacturer | wix_pn
    # Find "Part Number" header
    try:
        start = next(i for i, t in enumerate(texts) if t == "Part Number")
    except StopIteration:
        return []

    data_start = start + 4  # skip 4 header columns
    i = data_start
    while i + 2 < len(texts):
        comp_pn = texts[i].strip().upper()
        brand   = texts[i + 1].strip().upper()
        wix_pn  = texts[i + 2].strip().upper()
        key     = f"{brand}|{comp_pn}"
        if brand and comp_pn and wix_pn and key not in seen:
            # Only keep if wix_pn matches or brand is a known filter brand
            if wix_pn == wix_num.upper() or brand in FILTER_BRANDS:
                seen.add(key)
                refs.append({'brand': brand, 'code': comp_pn})
        i += 3

    return refs


def load_wix_numbers() -> list[str]:
    """Extract unique WIX numbers from wix_crossrefs.jsonl."""
    seen, nums = set(), []
    with open(INPUT_FILE, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                for wn in (rec.get('wix') or []):
                    wn = str(wn).strip()
                    if wn and wn not in seen:
                        seen.add(wn)
                        nums.append(wn)
            except Exception:
                pass
    log.info(f"Unique WIX numbers to query: {len(nums):,}")
    return nums


def load_progress() -> dict:
    if PROG_FILE.exists():
        with open(PROG_FILE, encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_progress(prog: dict):
    tmp = str(PROG_FILE) + ".tmp"
    with open(tmp, "w", encoding='utf-8') as f:
        json.dump(prog, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(tmp, str(PROG_FILE))


def run(dry_run: bool = False):
    wix_nums = load_wix_numbers()
    progress = load_progress()
    pending  = [w for w in wix_nums if w not in progress]
    log.info(f"Already done: {len(progress):,} | Pending: {len(pending):,}")

    found_total = 0
    checked = 0

    for i, wix_num in enumerate(pending, 1):
        refs = fetch_wix_reverse(wix_num)

        # Filter to known filter brands only
        refs_filtered = [r for r in refs if r['brand'] in FILTER_BRANDS]

        result = {"wix": wix_num, "refs": refs_filtered}

        if dry_run:
            log.info(f"  [{i}] {wix_num} → {refs_filtered}")
            if i >= 5:
                log.info("  (dry-run: stopping after 5)")
                break
            continue

        with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")

        progress[wix_num] = refs_filtered
        found_total += len(refs_filtered)
        checked += 1

        if refs_filtered:
            brands = list({r['brand'] for r in refs_filtered})
            log.info(f"  [{i}/{len(pending)}] WIX {wix_num} → {len(refs_filtered)} refs "
                     f"({', '.join(brands[:4])})")
        elif i % 200 == 0:
            log.info(f"  [{i}/{len(pending)}] WIX {wix_num} → (no refs)")

        if checked % 100 == 0:
            save_progress(progress)

        time.sleep(PAUSE)

    if not dry_run:
        save_progress(progress)
        log.info(f"\n{'='*55}")
        log.info(f"WIX Reverse Lookup Summary")
        log.info(f"  WIX numbers checked : {checked:,}")
        log.info(f"  Competitor refs found: {found_total:,}")
        log.info(f"  Output              : {OUTPUT_FILE}")


def stats():
    if not PROG_FILE.exists():
        print("No progress yet — run scraper first.")
        return
    with open(PROG_FILE, encoding='utf-8') as f:
        progress = json.load(f)

    from collections import Counter
    brand_counts = Counter()
    with_refs = 0
    for refs in progress.values():
        if refs:
            with_refs += 1
            for r in refs:
                brand_counts[r['brand']] += 1

    print(f"\nWIX Reverse Lookup Stats:")
    print(f"  WIX numbers processed: {len(progress):,}")
    print(f"  With competitor refs : {with_refs:,}")
    print(f"  Total refs           : {sum(brand_counts.values()):,}")
    print(f"\n  By brand:")
    for brand, count in brand_counts.most_common(15):
        print(f"    {brand:<25} {count:>6,}")


def test_single(wix_num: str):
    log.info(f"Testing WIX {wix_num}...")
    refs = fetch_wix_reverse(wix_num)
    print(f"\nWIX {wix_num} → {len(refs)} refs:")
    for r in refs:
        marker = "✓" if r['brand'] in FILTER_BRANDS else "·"
        print(f"  {marker} {r['brand']:<25} {r['code']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run",  action="store_true")
    parser.add_argument("--stats",    action="store_true")
    parser.add_argument("--wix-num",  default="", help="Test a single WIX number")
    args = parser.parse_args()

    if args.stats:
        stats()
    elif args.wix_num:
        test_single(args.wix_num)
    else:
        run(dry_run=args.dry_run)
