#!/usr/bin/env python3
"""
scraper_airfilter_crossref.py
=============================
Fetches cross-references for Fleetguard (and other brands) from
airfilter-crossreference.com.

URL pattern: https://www.airfilter-crossreference.com/convert/FLEETGUARD/AF25139

Output: JSONL file, one record per part number:
  {"source_brand": "FLEETGUARD", "source_code": "AF25139",
   "cross_refs": [{"brand": "DONALDSON", "code": "P527682"}, ...]}

Usage:
    # From a list of Fleetguard part numbers (text file, one per line):
    python scraper_airfilter_crossref.py --brand FLEETGUARD --codes-file C:\\mann\\fleetguard_pns.txt --out C:\\mann\\fg_crossrefs.jsonl

    # From a Fleetguard results JSON (already scraped):
    python scraper_airfilter_crossref.py --brand FLEETGUARD --from-results C:\\mann\\FleetguardScraper\\fleetguard_air-primary-secondary_results.json --out C:\\mann\\fg_crossrefs.jsonl

    # Single code test:
    python scraper_airfilter_crossref.py --brand FLEETGUARD --code AF25139

    # Resume interrupted run (skips already-saved codes):
    python scraper_airfilter_crossref.py --brand FLEETGUARD --from-results ... --out ... --resume
"""

import argparse
import json
import logging
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE_URL = "https://www.airfilter-crossreference.com/convert"
HEADERS  = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
DELAY    = 0.8   # seconds between requests (be polite)
TIMEOUT  = 20


def fetch_crossrefs(brand: str, code: str) -> list[dict]:
    """
    Fetch cross-references for a single part number.
    Returns list of {"brand": "...", "code": "..."} dicts.
    """
    url = f"{BASE_URL}/{brand.upper()}/{code.upper()}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code == 404:
            return []
        if r.status_code != 200:
            log.warning(f"  HTTP {r.status_code} for {code}")
            return []
    except requests.RequestException as e:
        log.warning(f"  Request error for {code}: {e}")
        return []

    soup = BeautifulSoup(r.text, "html.parser")

    # All cross-refs are in <li><a href="/convert/BRAND/CODE">
    refs = []
    seen = set()
    for a in soup.find_all("a", href=re.compile(r"^/convert/")):
        href = a.get("href", "")
        parts = href.strip("/").split("/")
        # /convert/BRAND/CODE → ['convert', 'BRAND', 'CODE']
        if len(parts) != 3:
            continue
        ref_brand = parts[1].strip().upper()
        ref_code  = parts[2].strip().upper()
        if not ref_brand or not ref_code:
            continue
        # Skip the source brand itself
        if ref_brand == brand.upper() and ref_code == code.upper():
            continue
        key = f"{ref_brand}|{ref_code}"
        if key not in seen:
            seen.add(key)
            refs.append({"brand": ref_brand, "code": ref_code})

    return refs


def load_codes_from_results(path: Path) -> list[str]:
    """Load part numbers from a Fleetguard scraper results JSON."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    items = data if isinstance(data, list) else data.get("results", [])
    codes = [r["part_number"].strip().upper() for r in items
             if r.get("part_number") and r.get("part_number").strip()]
    return codes


def load_codes_from_file(path: Path) -> list[str]:
    """Load part numbers from a plain text file (one per line)."""
    with open(path, encoding="utf-8") as f:
        return [line.strip().upper() for line in f if line.strip()]


def load_already_done(out_path: Path) -> set[str]:
    """Read existing output JSONL to find already-processed codes."""
    done = set()
    if not out_path.exists():
        return done
    with open(out_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                done.add(rec.get("source_code", "").upper())
            except json.JSONDecodeError:
                pass
    return done


def run(args):
    brand = args.brand.strip().upper()

    # Load codes
    if args.from_results:
        codes = load_codes_from_results(Path(args.from_results))
        log.info(f"Loaded {len(codes)} codes from {args.from_results}")
    elif args.codes_file:
        codes = load_codes_from_file(Path(args.codes_file))
        log.info(f"Loaded {len(codes)} codes from {args.codes_file}")
    elif args.code:
        codes = [args.code.strip().upper()]
    else:
        log.error("Provide --code, --codes-file, or --from-results")
        return

    out_path = Path(args.out) if args.out else None

    # Resume: skip already-done codes
    done = set()
    if args.resume and out_path:
        done = load_already_done(out_path)
        if done:
            log.info(f"Resuming — {len(done)} codes already done, skipping")

    pending = [c for c in codes if c not in done]
    log.info(f"Pending: {len(pending)} codes to fetch")

    if not pending:
        log.info("Nothing to do.")
        return

    # Single code: just print
    if args.code and not args.out:
        refs = fetch_crossrefs(brand, args.code)
        print(json.dumps({
            "source_brand": brand,
            "source_code":  args.code.upper(),
            "cross_refs":   refs,
        }, indent=2))
        return

    # Batch run
    total_found = 0
    total_empty = 0

    out_file = open(out_path, "a", encoding="utf-8") if out_path else None

    try:
        for i, code in enumerate(pending, 1):
            refs = fetch_crossrefs(brand, code)
            rec  = {
                "source_brand": brand,
                "source_code":  code,
                "cross_refs":   refs,
            }
            if refs:
                total_found += 1
            else:
                total_empty += 1

            if out_file:
                out_file.write(json.dumps(rec, ensure_ascii=False) + "\n")
                out_file.flush()

            if i % 50 == 0 or i == len(pending):
                log.info(f"  [{i}/{len(pending)}] found={total_found} empty={total_empty}  last={code} ({len(refs)} refs)")

            time.sleep(DELAY)

    finally:
        if out_file:
            out_file.close()

    log.info(f"\nDone. With cross-refs: {total_found} | Empty: {total_empty}")
    if out_path:
        log.info(f"Output → {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape airfilter-crossreference.com")
    parser.add_argument("--brand",        default="FLEETGUARD", help="Source brand (default: FLEETGUARD)")
    parser.add_argument("--code",         default="",  help="Single part number to test")
    parser.add_argument("--codes-file",   default="",  help="Text file with one part number per line")
    parser.add_argument("--from-results", default="",  help="Fleetguard scraper results JSON")
    parser.add_argument("--out",          default="",  help="Output JSONL file path")
    parser.add_argument("--resume",       action="store_true", help="Skip codes already in output file")
    args = parser.parse_args()
    run(args)
