#!/usr/bin/env python3
"""Fleetguard Fuel Filter Housing scraper.

Crawls the 18-page Fleetguard Fuel Processors category, then opens each
product and accepts ONLY products explicitly classified by Fleetguard as
Fuel Filter Housing / Carcasa del filtro de combustible.

Output is evidence-first and does not write PostgreSQL directly.
Canonical identity: ET9 + last 4 numeric digits; TURBOCORE™.
"""

from __future__ import annotations

import argparse
import json
import re
import time
import unicodedata
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError, sync_playwright

CATEGORY_URL = "https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-combustible/procesadores-de-combustible/0ZGPL0000000FSi4AM"
EXPECTED_PAGES = 18
BASE_URL = "https://www.fleetguard.com"
OUT_DIR = Path(__file__).parent / "Fleetguard Scraper"
TYPE_ALIASES = {
    "carcasa del filtro de combustible",
    "carcasa de filtro de combustible",
    "fuel filter housing",
}


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", value).strip().lower()


def make_et9_sku(code: str) -> str:
    digits = "".join(re.findall(r"\d", code or ""))
    if len(digits) < 4:
        raise ValueError(f"Fleetguard code has fewer than 4 digits: {code!r}")
    return f"ET9{digits[-4:]}"


def exact_housing_evidence(text: str) -> str | None:
    normalized = normalize_text(text)
    for alias in TYPE_ALIASES:
        if re.search(rf"(?<![a-z]){re.escape(alias)}(?![a-z])", normalized):
            return alias
    return None


def atomic_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def wait_render(page: Page) -> None:
    page.wait_for_load_state("domcontentloaded")
    try:
        page.wait_for_load_state("networkidle", timeout=15000)
    except PlaywrightTimeoutError:
        pass
    page.wait_for_timeout(1200)
    for _ in range(4):
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(400)
    page.evaluate("window.scrollTo(0, 0)")


def product_links(page: Page) -> list[str]:
    found = set()
    for locator in page.locator('a[href*="/product/"]').all():
        href = locator.get_attribute("href")
        if href:
            found.add(urljoin(BASE_URL, href.split("#", 1)[0]))
    return sorted(found)


def page_signature(page: Page) -> str:
    links = product_links(page)
    return "|".join(links[:5] + links[-5:])


def page_number(page: Page) -> tuple[int | None, int | None]:
    text = normalize_text(page.locator("body").inner_text())
    match = re.search(r"pagina\s+(\d+)\s+de\s+(\d+)", text)
    if not match:
        match = re.search(r"page\s+(\d+)\s+of\s+(\d+)", text)
    return (int(match.group(1)), int(match.group(2))) if match else (None, None)


def click_next(page: Page) -> bool:
    candidates = [
        'button[aria-label*="Siguiente" i]',
        'button[aria-label*="Next" i]',
        'a[aria-label*="Siguiente" i]',
        'a[aria-label*="Next" i]',
        'button[title*="Siguiente" i]',
        'button[title*="Next" i]',
    ]
    old_signature = page_signature(page)
    for selector in candidates:
        loc = page.locator(selector)
        for i in range(loc.count()):
            item = loc.nth(i)
            if not item.is_visible() or item.is_disabled():
                continue
            item.click()
            page.wait_for_timeout(500)
            wait_render(page)
            if page_signature(page) != old_signature:
                return True

    for role in ("button", "link"):
        loc = page.get_by_role(role, name=re.compile(r"^(siguiente|next)$", re.I))
        if loc.count() and loc.first.is_visible():
            loc.first.click()
            wait_render(page)
            return page_signature(page) != old_signature
    return False


def collect_category_universe(page: Page, url: str, expected_pages: int) -> dict:
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    wait_render(page)
    universe, page_log = set(), []
    for ordinal in range(1, expected_pages + 1):
        links = product_links(page)
        current, total = page_number(page)
        page_log.append({"ordinal": ordinal, "reported_page": current, "reported_total": total, "product_links": len(links)})
        universe.update(links)
        if ordinal < expected_pages and not click_next(page):
            raise RuntimeError(f"Pagination stopped at page {ordinal}; expected {expected_pages} pages")
    return {"links": sorted(universe), "pages": page_log}


def click_detail_sections(page: Page) -> None:
    wanted = re.compile(r"oem cross reference|referencia cruzada oem|application|aplicacion|equipment|equipo", re.I)
    for button in page.get_by_role("button").all():
        try:
            label = (button.inner_text() or "").strip()
            if label and wanted.search(normalize_text(label)) and button.is_visible():
                button.click()
                page.wait_for_timeout(300)
        except Exception:
            continue


def heading_classification(page: Page) -> str | None:
    for tag in ("h1", "h2", "h3", "h4"):
        for heading in page.locator(tag).all_inner_texts():
            normalized = normalize_text(heading)
            if normalized in TYPE_ALIASES:
                return normalized
    return None


def extract_tables(page: Page) -> list[list[list[str]]]:
    tables = []
    for table in page.locator("table").all():
        rows = []
        for row in table.locator("tr").all():
            cells = [re.sub(r"\s+", " ", c).strip() for c in row.locator("th,td").all_inner_texts()]
            if cells:
                rows.append(cells)
        if rows:
            tables.append(rows)
    return tables


def extract_spec_pairs(tables: list) -> dict:
    pairs = {}
    for table in tables:
        for row in table:
            if len(row) == 2 and row[0] and row[1] and len(row[0]) < 100:
                pairs.setdefault(row[0], row[1])
    return pairs


def extract_code(page: Page, url: str, body_text: str) -> str:
    for heading in page.locator("h1,h2").all_inner_texts():
        candidate = heading.strip().upper()
        if re.fullmatch(r"[A-Z0-9-]{4,20}", candidate) and re.search(r"\d", candidate):
            return candidate
    slug = url.rstrip("/").split("/")[-1].upper()
    if re.fullmatch(r"[A-Z0-9-]{4,20}", slug) and re.search(r"\d", slug):
        return slug
    match = re.search(r"\b(?:FH\d{4,6}[A-Z]*|\d{7}[A-Z]?)\b", body_text.upper())
    if not match:
        raise ValueError(f"Could not resolve Fleetguard part code from {url}")
    return match.group(0)


def scrape_detail(page: Page, url: str) -> dict:
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    wait_render(page)
    click_detail_sections(page)
    body_text = page.locator("body").inner_text()
    classification = heading_classification(page)
    accepted = classification in TYPE_ALIASES
    code = extract_code(page, url, body_text)
    tables = extract_tables(page)
    return {
        "url": page.url,
        "codigo_base": code,
        "accepted": accepted,
        "classification": classification,
        "sku": make_et9_sku(code) if accepted else None,
        "technology": "TURBOCORE™" if accepted else None,
        "filter_type": "fuel" if accepted else None,
        "sub_type": "Fuel Filter Housing" if accepted else None,
        "specs": extract_spec_pairs(tables),
        "tables": tables,
        "raw_text": body_text,
        "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def collision_report(records: list[dict]) -> list[dict]:
    by_sku: dict[str, set[str]] = {}
    for row in records:
        if row.get("accepted") and row.get("sku"):
            by_sku.setdefault(row["sku"], set()).add(row["codigo_base"])
    return [
        {"sku": sku, "codigo_base": sorted(codes)}
        for sku, codes in sorted(by_sku.items())
        if len(codes) > 1
    ]


def import_row(row: dict) -> dict:
    return {
        "sku": row["sku"],
        "codigo_base": row["codigo_base"],
        "filter_type": "fuel",
        "technology": "TURBOCORE™",
        "duty": "HEAVY_DUTY",
        "installation_type": "Fuel Filter Housing",
        "sub_type": "Fuel Filter Housing",
        "specs": row.get("specs", {}),
        "oem_codes": [],
        "competitor_codes": [],
        "source_url": row["url"],
        "enrichment_data": {
            "fleetguard_classification": row.get("classification"),
            "fleetguard_tables": row.get("tables", []),
            "scraped_at": row.get("scraped_at"),
        },
    }


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=CATEGORY_URL)
    parser.add_argument("--pages", type=int, default=EXPECTED_PAGES)
    parser.add_argument("--headed", action="store_true", help="Show Chromium while scraping")
    parser.add_argument("--fresh", action="store_true", help="Discard saved progress and recrawl")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    progress_path = OUT_DIR / "fleetguard_fuel-housings_progress.json"
    results_path = OUT_DIR / "fleetguard_fuel-housings_results.json"
    import_path = OUT_DIR / "fleetguard_fuel-housings_import_ready.jsonl"
    audit_path = OUT_DIR / "fleetguard_fuel-housings_audit.json"

    progress = {"source_url": args.url, "expected_pages": args.pages, "links": [], "pages": [], "done": []}
    results: dict[str, dict] = {}
    if not args.fresh:
        if progress_path.exists():
            progress.update(json.loads(progress_path.read_text(encoding="utf-8")))
        if results_path.exists():
            results.update(json.loads(results_path.read_text(encoding="utf-8")))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.headed)
        page = browser.new_page(viewport={"width": 1440, "height": 1200}, locale="es-ES")
        page.set_default_timeout(15000)

        if not progress.get("links"):
            category = collect_category_universe(page, args.url, args.pages)
            progress["links"] = category["links"]
            progress["pages"] = category["pages"]
            atomic_json(progress_path, progress)
            print(f"Category universe: {len(progress['links'])} unique product links across {args.pages} pages")

        done = set(progress.get("done", []))
        for index, url in enumerate(progress["links"], start=1):
            if url in done:
                continue
            try:
                row = scrape_detail(page, url)
                results[url] = row
                progress.setdefault("done", []).append(url)
                atomic_json(results_path, results)
                atomic_json(progress_path, progress)
                status = "HOUSING" if row["accepted"] else "excluded"
                print(f"[{index}/{len(progress['links'])}] {status}: {row['codigo_base']} -> {row.get('sku') or '-'}")
            except Exception as exc:
                results[url] = {"url": url, "accepted": False, "error": str(exc), "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
                atomic_json(results_path, results)
                print(f"[{index}/{len(progress['links'])}] ERROR {url}: {exc}")

        browser.close()

    rows = list(results.values())
    accepted = sorted((r for r in rows if r.get("accepted")), key=lambda r: r["sku"])
    errors = [r for r in rows if r.get("error")]
    collisions = collision_report(accepted)

    complete = len(progress.get("done", [])) == len(progress.get("links", []))
    pages_complete = len(progress.get("pages", [])) == args.pages
    audit = {
        "source_url": args.url,
        "expected_pages": args.pages,
        "pages_complete": pages_complete,
        "page_log": progress.get("pages", []),
        "category_unique_products": len(progress.get("links", [])),
        "processed": len(progress.get("done", [])),
        "accepted_fuel_filter_housings": len(accepted),
        "excluded_non_housings": len([r for r in rows if not r.get("accepted") and not r.get("error")]),
        "errors": errors,
        "collisions": collisions,
        "import_ready": complete and pages_complete and not errors and not collisions,
        "rule": "ET9 + last 4 numeric digits of Fleetguard code; suffix letters retained only in codigo_base; TURBOCORE™",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    atomic_json(audit_path, audit)

    if audit["import_ready"]:
        write_jsonl(import_path, [import_row(row) for row in accepted])
    elif import_path.exists():
        import_path.unlink()

    print(json.dumps({k: v for k, v in audit.items() if k not in {"page_log", "errors"}}, ensure_ascii=False, indent=2))
    if not audit["import_ready"]:
        print("NOT IMPORT READY: resolve pagination/errors/collisions first.")
        return 2
    print(f"IMPORT READY: {len(accepted)} verified Fleetguard Fuel Filter Housings")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
