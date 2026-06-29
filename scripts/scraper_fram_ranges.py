#!/usr/bin/env python3
"""
scraper_fram_ranges.py — FRAM part number ranges → WIX cross-reference
========================================================================
Iterates FRAM part number ranges (PH, CA, CF, etc.) and queries:
  https://www2.wixfilters.com/Lookup/NewCompetitor.aspx?PartNo={fram_num}

For each FRAM number that exists, captures all competitor cross-refs
including WIX equivalents. This lets us build the FRAM → WIX → Mann LD chain.

Output: C:\\mann\\fram_to_wix.jsonl
  {"fram": "PH3387A", "wix": ["51040", "51040XP"], "other": [{"brand":"SAFEWAY","code":"PH3387"}]}

Resume: C:\\mann\\fram_progress.json

Usage:
    python scraper_fram_ranges.py
    python scraper_fram_ranges.py --dry-run
    python scraper_fram_ranges.py --stats
    python scraper_fram_ranges.py --test PH3387A
    python scraper_fram_ranges.py --type oil   (only oil filters)
    python scraper_fram_ranges.py --type air
    python scraper_fram_ranges.py --type cabin
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

OUTPUT_FILE = Path(r"C:\mann\fram_to_wix.jsonl")
PROG_FILE   = Path(r"C:\mann\fram_progress.json")

URL = "https://www2.wixfilters.com/Lookup/NewCompetitor.aspx?PartNo={}"

PAUSE = 0.4   # seconds between requests

# ─── FRAM part number ranges ──────────────────────────────────────────────────
# Each entry: (prefix, start, end, suffix_variants)
# suffix_variants: list of suffixes to try after the number (e.g. ['', 'A', 'XP'])
#
# Oil spin-on:  PH2xxx–PH9xxx  (most common LD range)
# Air:          CA3xxx–CA12xxx
# Cabin:        CF8xxx–CF12xxx, CF3xxx–CF5xxx
# Fuel:         G3xxx–G12xxx
#
RANGES = {
    'oil': [
        # Core FRAM oil filter ranges (LD passenger car)
        ('PH', 2500, 2999, ['', 'A']),
        ('PH', 3000, 3999, ['', 'A', 'AFP', 'A-1']),
        ('PH', 4000, 4999, ['', 'A']),
        ('PH', 5000, 5999, ['', 'A']),
        ('PH', 6000, 6999, ['', 'A']),
        ('PH', 7000, 7999, ['', 'A']),
        ('PH', 8000, 8999, ['', 'A']),
        ('PH', 9000, 9999, ['', 'A']),
        ('PH', 10000, 12000, ['', 'A']),
        # Extended guard / ultra
        ('PH', 16000, 16999, ['', 'A']),
    ],
    'air': [
        ('CA', 3000, 4999, ['', 'A']),
        ('CA', 5000, 6999, ['', 'A']),
        ('CA', 7000, 8999, ['', 'A']),
        ('CA', 9000, 10999, ['', 'A']),
        ('CA', 11000, 12999, ['', 'A']),
    ],
    'cabin': [
        ('CF', 3000, 5999, ['', 'A']),
        ('CF', 8000, 12999, ['', 'A']),
    ],
    'fuel': [
        ('G', 3000, 4999, ['', 'A']),
        ('G', 5000, 6999, ['', 'A']),
        ('G', 8000, 9999, ['', 'A']),
        ('G', 10000, 12999, ['', 'A']),
    ],
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


def fetch_crossrefs(part_num: str) -> dict | None:
    """
    Query NewCompetitor.aspx for a part number.
    Returns {wix: [...], other: [{brand, code}, ...]} or None if not found.
    """
    url = URL.format(urllib.parse.quote(part_num))
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Referer": "https://www2.wixfilters.com/",
        })
        with urllib.request.urlopen(req, timeout=15) as r:
            html = r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        log.warning(f"  {part_num}: HTTP error — {e}")
        return None

    return _parse_page(html, part_num)


def _parse_page(html: str, part_num: str) -> dict | None:
    parser = TextExtractor()
    parser.feed(html)
    texts = [x for x in parser.data
             if len(x) > 1
             and "gtag" not in x
             and "window" not in x
             and "dataLayer" not in x
             and "function" not in x]

    # Not found
    if any("no information available" in t.lower() for t in texts):
        return None
    if any("no results" in t.lower() for t in texts):
        return None

    # Find table header
    try:
        start = next(i for i, t in enumerate(texts) if t == "Part Number")
    except StopIteration:
        return None

    data_start = start + 4  # skip: Part Number | Manufacturer | Wix Part Number | LeadTime

    STOP_TOKENS = {'FOR REFERENCE ONLY', 'APPLICATIONS ARE VERIFIED',
                   'ENTER A COMPETING', 'ADVANCED SEARCH', 'WIX CONNECT',
                   'PRODUCTS', 'WIX MOTORSPORTS', 'SITEMAP', 'WARRANTY',
                   'BACK TO FILTER LOOKUP', 'FILTER LOOK-UP'}

    wix_nums = []
    other    = []
    seen_wix = set()
    seen_other = set()

    i = data_start
    while i + 2 < len(texts):
        comp_pn = texts[i].strip().upper()
        brand   = texts[i + 1].strip().upper()
        wix_pn  = texts[i + 2].strip().upper()

        if comp_pn in STOP_TOKENS or brand in STOP_TOKENS or wix_pn in STOP_TOKENS:
            break
        # Stop on legal disclaimer text
        if len(comp_pn) > 40:
            break

        # Column 3 always has the WIX number
        if wix_pn and wix_pn not in seen_wix and len(wix_pn) <= 12:
            # WIX numbers: digits only or digits+XP/MP suffix
            clean = wix_pn.replace('XP', '').replace('MP', '')
            if clean.isdigit():
                seen_wix.add(wix_pn)
                wix_nums.append(wix_pn)

        # comp_pn + brand = other competitor cross-refs (non-WIX brands)
        key = f"{brand}|{comp_pn}"
        if (key not in seen_other and brand and comp_pn
                and len(comp_pn) <= 30
                and brand not in ('WIX', 'WIX XP', 'WIX EUROPE', 'WIX FILTERS')):
            seen_other.add(key)
            other.append({'brand': brand, 'code': comp_pn})

        i += 4

    if not wix_nums:
        return None

    # Only FRAM codes from other cross-refs
    fram_codes = [o['code'] for o in other
                  if 'FRAM' in o['brand'] and o['code'].upper().startswith(('PH', 'CA', 'CF', 'G'))]

    return {'wix': sorted(set(wix_nums)), 'fram': sorted(set(fram_codes))}


def generate_part_numbers(filter_types: list[str]) -> list[str]:
    """Generate all part numbers to query for given filter types."""
    parts = []
    for ftype in filter_types:
        for prefix, start, end, suffixes in RANGES.get(ftype, []):
            for num in range(start, end + 1):
                for suffix in suffixes:
                    parts.append(f"{prefix}{num}{suffix}")
    return parts


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


def run(filter_types: list[str], dry_run: bool = False):
    all_parts = generate_part_numbers(filter_types)
    progress  = load_progress()
    pending   = [p for p in all_parts if p not in progress]

    log.info(f"Filter types   : {', '.join(filter_types)}")
    log.info(f"Total to check : {len(all_parts):,}")
    log.info(f"Already done   : {len(progress):,}")
    log.info(f"Pending        : {len(pending):,}")

    found_total = 0
    checked     = 0

    for i, part_num in enumerate(pending, 1):
        result = fetch_crossrefs(part_num)

        # Mark as checked regardless (None = not found)
        progress[part_num] = result  # None or {wix, other}

        if dry_run:
            if result:
                log.info(f"  [{i}] {part_num} → WIX {result['wix']}")
            if i >= 10:
                log.info("  (dry-run: stopping after 10)")
                break
            time.sleep(PAUSE)
            continue

        if result:
            record = {'fram': part_num, 'wix': result['wix'], 'fram_variants': result['fram']}
            with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
            found_total += 1
            log.info(f"  [{i}/{len(pending)}] {part_num} → WIX {result['wix']}")
        elif i % 500 == 0:
            log.info(f"  [{i}/{len(pending)}] (scanning...)")

        checked += 1
        if checked % 200 == 0:
            save_progress(progress)

        time.sleep(PAUSE)

    if not dry_run:
        save_progress(progress)
        log.info(f"\n{'='*55}")
        log.info(f"FRAM Range Scan Summary")
        log.info(f"  Part numbers checked : {checked:,}")
        log.info(f"  With WIX cross-ref   : {found_total:,}")
        log.info(f"  Hit rate             : {found_total/max(checked,1)*100:.1f}%")
        log.info(f"  Output               : {OUTPUT_FILE}")


def stats():
    if not PROG_FILE.exists():
        print("No progress yet.")
        return
    with open(PROG_FILE, encoding='utf-8') as f:
        progress = json.load(f)

    from collections import Counter
    wix_found  = {k: v for k, v in progress.items() if v}
    brand_ctr  = Counter()
    wix_ctr    = Counter()

    for part, data in wix_found.items():
        for w in (data.get('wix') or []):
            wix_ctr[w] += 1
        for o in (data.get('other') or []):
            brand_ctr[o['brand']] += 1

    print(f"\nFRAM Range Scan Stats:")
    print(f"  Total scanned       : {len(progress):,}")
    print(f"  With WIX cross-ref  : {len(wix_found):,}  ({len(wix_found)/max(len(progress),1)*100:.1f}%)")
    print(f"  Unique WIX numbers  : {len(wix_ctr):,}")
    print(f"\n  Top WIX numbers (most FRAM variants):")
    for wix, count in wix_ctr.most_common(10):
        print(f"    WIX {wix:<12} {count:>4} FRAM variants")
    print(f"\n  Other brands found:")
    for brand, count in brand_ctr.most_common(10):
        print(f"    {brand:<30} {count:>5,}")


def test_single(part_num: str):
    log.info(f"Testing {part_num}...")
    result = fetch_crossrefs(part_num)
    if not result:
        print(f"\n{part_num} → NOT FOUND in WIX database")
        return
    print(f"\n{part_num} → WIX {result['wix']}")
    if result['fram']:
        print(f"  FRAM variants: {result['fram']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--type",    default="oil",
                        help="Filter types: oil,air,cabin,fuel (comma-separated, default: oil)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--stats",   action="store_true")
    parser.add_argument("--test",    default="", help="Test a single part number")
    args = parser.parse_args()

    if args.stats:
        stats()
    elif args.test:
        test_single(args.test.upper())
    else:
        ftypes = [t.strip() for t in args.type.split(',')]
        run(ftypes, dry_run=args.dry_run)
