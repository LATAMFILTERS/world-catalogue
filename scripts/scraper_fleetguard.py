#!/usr/bin/env python3
"""Fleetguard raw code scraper.

Reconstructed harness matching the interface documented in
`scripts/Fleetguard Scraper/README.md` (the original script was missing
from the repo — only its JSON output survived). The `air-precleaners`
run's output files match this schema, so the atomic progress/results
format below is kept compatible with what already exists on disk.

IMPORTANT — selectors are NOT verified against the live site.
This sandbox has no network access to fleetguard.com (outbound is
blocked by the environment's policy), so the CSS/XPath selectors below
are placeholders marked "VERIFY". Whoever runs this against the real
site must open a turbine category page in a browser, inspect the DOM,
and correct `SELECTORS` before trusting any output. Do not assume the
placeholders are correct — they exist to keep the harness runnable
end-to-end, not to guess at real markup.

Usage:
    cd scripts
    python scraper_fleetguard.py turbine "https://www.fleetguard.com/category/<real-turbine-url>"
    python scraper_fleetguard.py turbine                       # resume
    python scraper_fleetguard.py --retry-empty turbine         # re-scrape 0/0/0/0 entries
"""

import argparse
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

OUTPUT_DIR = Path(__file__).parent / "Fleetguard Scraper"

# Only air-precleaners has a known-good URL (already scraped). Add the real
# turbine category URL here (copy it from fleetguard.com, with the
# Salesforce category ID) before running the `turbine` category — do not
# guess it.
CATEGORIES = {
    "air-precleaners": "https://www.fleetguard.com/category/air-precleaners",
    "fuel-processors": "https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-combustible/procesadores-de-combustible/0ZGPL0000000FSi4AM",
}

# VERIFY every selector below against the live DOM before trusting results.
SELECTORS = {
    "product_card_link": "a.product-card__link",       # VERIFY
    "next_page_button": "button[aria-label='Next']",   # VERIFY
    "product_code": "h1.product-detail__code",          # VERIFY
    "spec_table_row": "table.product-specs tr",         # VERIFY
    "crossref_table_row": "table.cross-reference tr",   # VERIFY
    "equipment_table_row": "table.equipment-fitment tr",# VERIFY
}


def results_path(category: str) -> Path:
    return OUTPUT_DIR / f"fleetguard_{category}_results.json"


def progress_path(category: str) -> Path:
    return OUTPUT_DIR / f"fleetguard_{category}_progress.json"


def load_json(path: Path, default):
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def atomic_save(path: Path, data) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    tmp.replace(path)


def collect_product_links(page, category_url: str) -> list[str]:
    links: set[str] = set()
    page.goto(category_url, wait_until="networkidle")
    while True:
        for a in page.locator(SELECTORS["product_card_link"]).all():
            href = a.get_attribute("href")
            if href:
                links.add(href)
        next_btn = page.locator(SELECTORS["next_page_button"])
        if next_btn.count() == 0 or not next_btn.first.is_enabled():
            break
        next_btn.first.click()
        page.wait_for_load_state("networkidle")
    return sorted(links)


def scrape_product(page, url: str) -> dict:
    page.goto(url, wait_until="networkidle")
    code = page.locator(SELECTORS["product_code"]).first.text_content() or ""
    specs = {}
    for row in page.locator(SELECTORS["spec_table_row"]).all():
        cells = row.locator("td").all_text_contents()
        if len(cells) >= 2:
            specs[cells[0].strip()] = cells[1].strip()

    crossrefs = []
    for row in page.locator(SELECTORS["crossref_table_row"]).all():
        cells = row.locator("td").all_text_contents()
        if len(cells) >= 2:
            crossrefs.append({"brand": cells[0].strip(), "code": cells[1].strip()})

    equipment = []
    for row in page.locator(SELECTORS["equipment_table_row"]).all():
        cells = row.locator("td").all_text_contents()
        if cells:
            equipment.append([c.strip() for c in cells])

    return {
        "url": url,
        "codigo_base": code.strip(),
        "specs": specs,
        "cross_references": crossrefs,
        "equipment": equipment,
        "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def is_empty(entry: dict) -> bool:
    return not entry.get("codigo_base") and not entry.get("specs") \
        and not entry.get("cross_references") and not entry.get("equipment")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("category")
    parser.add_argument("url", nargs="?", help="Real category URL (required the first time for a new category)")
    parser.add_argument("--retry-empty", action="store_true", help="Re-scrape entries with no data captured")
    args = parser.parse_args()

    category_url = args.url or CATEGORIES.get(args.category)
    if not category_url:
        print(
            f"No known URL for category '{args.category}'. Pass it explicitly: "
            f"python scraper_fleetguard.py {args.category} \"<real fleetguard.com URL>\"",
            file=sys.stderr,
        )
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    progress = load_json(progress_path(args.category), {"done": [], "links": []})
    results = load_json(results_path(args.category), {})

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        if not progress["links"]:
            print(f"Collecting product links from {category_url} ...")
            progress["links"] = collect_product_links(page, category_url)
            atomic_save(progress_path(args.category), progress)
            print(f"Found {len(progress['links'])} product links.")

        done_set = set(progress["done"])
        targets = progress["links"]
        if args.retry_empty:
            targets = [u for u in targets if is_empty(results.get(u, {}))]
            print(f"Retrying {len(targets)} empty entries.")

        for url in targets:
            if url in done_set and not args.retry_empty:
                continue
            try:
                entry = scrape_product(page, url)
            except Exception as exc:  # noqa: BLE001 - keep the run alive, log and continue
                print(f"FAILED {url}: {exc}", file=sys.stderr)
                continue

            results[url] = entry
            if url not in progress["done"]:
                progress["done"].append(url)
            atomic_save(results_path(args.category), results)
            atomic_save(progress_path(args.category), progress)
            status = "empty" if is_empty(entry) else "ok"
            print(f"[{status}] {entry.get('codigo_base') or url}")

        browser.close()

    total = len(progress["links"])
    empty_count = sum(1 for e in results.values() if is_empty(e))
    print(f"\nDone: {len(progress['done'])}/{total} processed, {empty_count} empty.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
