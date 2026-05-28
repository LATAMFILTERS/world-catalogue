#!/usr/bin/env python3
"""
ELIMFILTERS Web Validation Pipeline — Option B
Stable enrichment pipeline: no ScrapeGraphAI, no LangChain.

Dependencies (pinned, no conflicts):
    pip install -r requirements.txt

Usage:
    python validate_pipeline.py
    python validate_pipeline.py --groq-key gsk_...          # Groq (fast, free tier)
    python validate_pipeline.py --openai-key sk-...         # OpenAI fallback
    python validate_pipeline.py --input path/to/file.json --limit 10 --verbose
"""

import argparse
import json
import logging
import os
import re
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
import html2text

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL    = "llama-3.1-70b-versatile"   # fast, capable, free tier
OPENAI_MODEL  = "gpt-4o-mini"

# ── Defaults ──────────────────────────────────────────────────────────────────

DEFAULT_INPUT = r"C:\Users\VICTOR ABREU\Desktop\ELIMFILTERS_ENRICHMENT_PRIORITY_100.json"
DEFAULT_OUTPUT_DIR = r"C:\Users\VICTOR ABREU\Desktop"
REQUEST_DELAY = 1.5
MAX_DDG_RESULTS = 5
REQUEST_TIMEOUT = 15

# ── Brand / Type patterns ─────────────────────────────────────────────────────

BRAND_PATTERNS: Dict[str, str] = {
    "Donaldson":  r"\bP\d{6}\b",
    "Fleetguard": r"\b(?:LF|FF|FS|AF|WF|RS)\d{3,6}\b",
    "Baldwin":    r"\b(?:BF|B|RS|PA|PF)\d{3,6}\b",
    "Mann":       r"\b(?:W|HU|C|H)\d{3,6}[A-Z]?\b",
    "Wix":        r"\b\d{5,6}\b",
}

PRODUCT_TYPE_KEYWORDS: Dict[str, List[str]] = {
    "KIT":       ["kit", "service kit", "maintenance kit", "filter kit"],
    "CARTRIDGE": ["cartridge", "element", "insert"],
    "HOUSING":   ["housing", "head", "base", "canister assembly"],
    "ACCESSORY": ["bracket", "adapter", "fitting", "gauge", "wrench", "valve"],
    "FILTER":    ["filter", "filtro", "spin-on"],
}

DONALDSON_BASE_URL = "https://shop.donaldson.com/store/en-us/product/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── Data model ────────────────────────────────────────────────────────────────

@dataclass
class ValidationResult:
    sku: str
    original_data: Dict[str, Any] = field(default_factory=dict)
    oem_codes: List[str] = field(default_factory=list)
    cross_reference_codes: List[str] = field(default_factory=list)
    equipment_applications: List[str] = field(default_factory=list)
    engine_applications: List[str] = field(default_factory=list)
    # Alternative products: same geometry, different filter media / efficiency
    # NOT cross-references — a different product that fits the same application
    alternative_products: List[Dict] = field(default_factory=list)
    product_type: str = "FILTER"
    brand: str = "Unknown"
    confidence_score: float = 0.0
    source_urls: List[str] = field(default_factory=list)
    notes: List[str] = field(default_factory=list)
    status: str = "pending"
    error: Optional[str] = None

# ── Utilities ─────────────────────────────────────────────────────────────────

def safe_get(url: str) -> Optional[requests.Response]:
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        r.raise_for_status()
        return r
    except Exception as e:
        logging.debug(f"GET {url} → {e}")
        return None


def to_text(html: str) -> str:
    h = html2text.HTML2Text()
    h.ignore_links = True
    h.ignore_images = True
    h.body_width = 0
    return h.handle(html)


def ddg_search(query: str) -> List[Dict]:
    try:
        with DDGS() as ddgs:
            return list(ddgs.text(query, max_results=MAX_DDG_RESULTS))
    except Exception as e:
        logging.warning(f"DDG '{query}' → {e}")
        return []


def detect_brand(sku: str) -> str:
    for brand, pat in BRAND_PATTERNS.items():
        if re.match(pat, sku, re.IGNORECASE):
            return brand
    return "Unknown"


def detect_product_type(text: str) -> str:
    t = text.lower()
    for ptype, kws in PRODUCT_TYPE_KEYWORDS.items():
        if any(kw in t for kw in kws):
            return ptype
    return "FILTER"


def extract_codes_from_text(text: str) -> Dict[str, List[str]]:
    """Pull part numbers grouped by brand from raw text."""
    found: Dict[str, List[str]] = {}
    for brand, pat in BRAND_PATTERNS.items():
        hits = list(set(re.findall(pat, text, re.IGNORECASE)))
        if hits:
            found[brand] = hits
    return found

# ── Donaldson page scraper ────────────────────────────────────────────────────

def scrape_donaldson(part_code: str) -> Dict:
    url = f"{DONALDSON_BASE_URL}{part_code}"
    resp = safe_get(url)
    out: Dict[str, Any] = {
        "url": url, "found": False,
        "cross_refs": [], "oem_codes": [], "equipment": [], "specs": {},
        "product_type": "FILTER", "raw_text": "",
    }
    if not resp:
        return out

    soup = BeautifulSoup(resp.text, "html.parser")
    full_text = soup.get_text(" ", strip=True)
    out["raw_text"] = full_text[:3000]
    out["found"] = True
    out["product_type"] = detect_product_type(full_text)

    # Cross-references
    for label in soup.find_all(string=re.compile(r"cross.?ref|interchange|replaces", re.I)):
        parent = label.find_parent()
        if parent:
            container = parent.find_next_sibling() or parent.parent
            if container:
                codes = re.findall(r"\b[A-Z]{1,3}\d{4,8}\b", container.get_text())
                out["cross_refs"].extend(codes)

    # OEM codes
    for label in soup.find_all(string=re.compile(r"OEM|original.?equip", re.I)):
        parent = label.find_parent()
        if parent:
            container = parent.find_next_sibling() or parent.parent
            if container:
                codes = re.findall(r"\b[A-Z0-9]{4,15}\b", container.get_text())
                out["oem_codes"].extend(codes)

    # Equipment / applications
    for label in soup.find_all(string=re.compile(r"equipment|application|vehicle|engine", re.I)):
        parent = label.find_parent()
        if parent:
            container = parent.find_next_sibling()
            if container:
                for item in container.find_all(["li", "tr", "div"])[:60]:
                    text = item.get_text(" ", strip=True)
                    if 4 < len(text) < 120:
                        out["equipment"].append(text)

    # Technical specs from tables
    for row in soup.find_all("tr"):
        cells = row.find_all(["th", "td"])
        if len(cells) >= 2:
            k = cells[0].get_text(strip=True)
            v = cells[1].get_text(strip=True)
            if k and v and len(k) < 60:
                out["specs"][k] = v

    return out

# ── OpenAI structured extraction ──────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are a filtration engineering data extraction assistant. Extract structured filter product data from the provided text.

DOMAIN RULES (critical):
- OEM_Codes: codes assigned by ORIGINAL EQUIPMENT MANUFACTURERS (Caterpillar, Cummins, John Deere, Komatsu, AGCO, Volvo, etc.)
- Cross_Reference_Codes: the SAME filter sold under a DIFFERENT brand code (P# = Donaldson, LF# = Fleetguard, B# = Baldwin, etc.)
- Alternative_Products: structurally COMPATIBLE filters with DIFFERENT filtration media or efficiency rating.
  Example: a MACROCORE (standard media) and a NANOFORCE (nanofiber media) that fit the same housing are ALTERNATIVES, not cross-references.
  Do NOT list cross-references as alternatives.
- Equipment_Applications: machine models that use this filter (e.g. "John Deere 8420", "CAT 320D")
- Engine_Applications: engine models (e.g. "Cummins ISX15", "CAT C15 ACERT")
- product_type: FILTER | CARTRIDGE | KIT | HOUSING | ACCESSORY
- brand: Donaldson | Fleetguard | Baldwin | Wix | Mann | OEM | Unknown
- confidence: 0.0–1.0 (how much real data was found and validated)

Return ONLY valid JSON — no markdown, no explanation."""

def extract_with_llm(client: "OpenAI", model: str, sku: str, page_text: str, snippets: List[str]) -> Dict:
    combined = (
        f"SKU: {sku}\n\n"
        f"PRODUCT PAGE TEXT:\n{page_text[:3000]}\n\n"
        f"WEB SEARCH SNIPPETS:\n" + "\n---\n".join(snippets[:5])
    )

    schema = {
        "oem_codes": [],
        "cross_reference_codes": [],
        "alternative_products": [],
        "equipment_applications": [],
        "engine_applications": [],
        "product_type": "FILTER",
        "brand": "Unknown",
        "confidence": 0.0,
        "notes": ""
    }

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": combined},
            ],
            temperature=0,
            max_tokens=1200,
            response_format={"type": "json_object"},
        )
        return json.loads(resp.choices[0].message.content)
    except Exception as e:
        logging.error(f"LLM extraction failed for {sku}: {e}")
        return schema

# ── Per-SKU pipeline ──────────────────────────────────────────────────────────

def process_sku(data: Dict, openai_client: Optional[Any], llm_model: str = OPENAI_MODEL) -> ValidationResult:
    sku         = data.get("ELIMFILTERS_SKU") or data.get("sku", "")
    base_code   = data.get("Donaldson_Base_Code") or data.get("codigo_base") or ""
    description = data.get("Description") or data.get("name") or ""

    r = ValidationResult(sku=sku, original_data=data, brand=detect_brand(sku))
    page_text: str = ""
    snippets: List[str] = []

    # ── Step 1: Donaldson product page ────────────────────────────────────────
    if base_code:
        logging.info(f"  Scraping Donaldson/{base_code}")
        don = scrape_donaldson(base_code)
        time.sleep(REQUEST_DELAY)
        if don["found"]:
            r.source_urls.append(don["url"])
            r.cross_reference_codes.extend(don["cross_refs"])
            r.oem_codes.extend(don["oem_codes"])
            r.equipment_applications.extend(don["equipment"][:30])
            r.product_type = don["product_type"]
            page_text = don["raw_text"]

    # ── Step 2: DuckDuckGo search ─────────────────────────────────────────────
    query = f'"{sku}" filter cross reference OEM applications'
    if base_code and base_code != sku:
        query = f'"{base_code}" filter cross reference interchange'
    logging.info(f"  DDG: {query}")
    hits = ddg_search(query)
    time.sleep(REQUEST_DELAY)

    for hit in hits:
        snippet = hit.get("body", "")
        url     = hit.get("href", "")
        snippets.append(f"[{url}]\n{snippet}")
        if url:
            r.source_urls.append(url)
        # Heuristic: pull codes from snippet text
        codes_by_brand = extract_codes_from_text(snippet)
        for codes in codes_by_brand.values():
            for code in codes:
                if code != sku:
                    r.cross_reference_codes.append(code)

    # ── Step 3: OpenAI structured extraction ──────────────────────────────────
    if openai_client and (page_text or snippets):
        logging.info(f"  LLM extraction ({llm_model})")
        ai = extract_with_llm(openai_client, llm_model, sku, page_text, snippets)
        if ai:
            r.oem_codes              = list(set(r.oem_codes + ai.get("oem_codes", [])))
            r.cross_reference_codes  = list(set(r.cross_reference_codes + ai.get("cross_reference_codes", [])))
            r.alternative_products   = ai.get("alternative_products", [])
            r.engine_applications    = ai.get("engine_applications", [])
            ea = ai.get("equipment_applications", [])
            r.equipment_applications = list(set(r.equipment_applications + ea))
            r.product_type           = ai.get("product_type", r.product_type)
            if ai.get("brand", "Unknown") != "Unknown":
                r.brand = ai["brand"]
            r.confidence_score       = float(ai.get("confidence", 0.0))
            if ai.get("notes"):
                r.notes.append(ai["notes"])
    else:
        # Heuristic confidence (no AI)
        score = 0.0
        if r.cross_reference_codes: score += 0.35
        if r.oem_codes:             score += 0.20
        if r.equipment_applications: score += 0.25
        if page_text:               score += 0.20
        r.confidence_score = round(min(score, 1.0), 2)

    # ── Cleanup ───────────────────────────────────────────────────────────────
    r.cross_reference_codes  = sorted(set(c for c in r.cross_reference_codes if c and c != sku))[:60]
    r.oem_codes              = sorted(set(c for c in r.oem_codes if c and c != sku))[:30]
    r.equipment_applications = sorted(set(r.equipment_applications))[:40]
    r.engine_applications    = sorted(set(r.engine_applications))[:20]
    r.source_urls            = list(dict.fromkeys(filter(None, r.source_urls)))[:10]

    r.status = "enriched" if r.confidence_score > 0.1 else "not_found"
    return r

# ── Report generator ──────────────────────────────────────────────────────────

def generate_report(results: List[ValidationResult], path: Path) -> None:
    total     = len(results)
    enriched  = sum(1 for r in results if r.status == "enriched")
    not_found = sum(1 for r in results if r.status == "not_found")
    errors    = sum(1 for r in results if r.status == "error")
    avg_conf  = sum(r.confidence_score for r in results) / total if total else 0

    lines = [
        "# ELIMFILTERS Web Validation Report",
        f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "\n## Summary\n",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Total SKUs | {total} |",
        f"| Enriched | {enriched} ({enriched/total*100:.1f}%) |",
        f"| Not found | {not_found} ({not_found/total*100:.1f}%) |",
        f"| Errors | {errors} |",
        f"| Avg confidence | {avg_conf:.2f} |",
        "\n## Results\n",
    ]

    for r in sorted(results, key=lambda x: x.confidence_score, reverse=True):
        lines.append(f"### {r.sku}  `{r.status}` · conf {r.confidence_score:.2f}")
        lines.append(f"- **Brand**: {r.brand}  **Type**: {r.product_type}")
        if r.cross_reference_codes:
            lines.append(f"- **Cross Refs** ({len(r.cross_reference_codes)}): "
                         f"{', '.join(r.cross_reference_codes[:12])}")
        if r.oem_codes:
            lines.append(f"- **OEM Codes** ({len(r.oem_codes)}): {', '.join(r.oem_codes[:10])}")
        if r.equipment_applications:
            lines.append(f"- **Equipment** ({len(r.equipment_applications)}): "
                         f"{'; '.join(r.equipment_applications[:5])}")
        if r.engine_applications:
            lines.append(f"- **Engines** ({len(r.engine_applications)}): "
                         f"{', '.join(r.engine_applications[:5])}")
        if r.alternative_products:
            lines.append(f"- **Alternatives** ({len(r.alternative_products)}): "
                         f"{r.alternative_products[:3]}")
        if r.source_urls:
            lines.append(f"- **Sources**: {r.source_urls[0]}")
        if r.notes:
            lines.append(f"- **Notes**: {'; '.join(r.notes)}")
        if r.error:
            lines.append(f"- **Error**: {r.error}")
        lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report → {path}")

# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    global REQUEST_DELAY

    ap = argparse.ArgumentParser(description="ELIMFILTERS Web Validation Pipeline")
    ap.add_argument("--input",      default=DEFAULT_INPUT,      help="Input JSON path")
    ap.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR, help="Output directory")
    ap.add_argument("--groq-key",   default=os.environ.get("GROQ_API_KEY"),   help="Groq API key (preferred)")
    ap.add_argument("--openai-key", default=os.environ.get("OPENAI_API_KEY"), help="OpenAI key (fallback)")
    ap.add_argument("--limit",      type=int, default=None,     help="Max SKUs to process")
    ap.add_argument("--delay",      type=float, default=REQUEST_DELAY, help="Secs between requests")
    ap.add_argument("--verbose",    action="store_true")
    args = ap.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s  %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
    )

    REQUEST_DELAY = args.delay

    # Load input
    input_path = Path(args.input)
    if not input_path.exists():
        sys.exit(f"ERROR: {input_path} not found")
    with open(input_path, encoding="utf-8") as f:
        products = json.load(f)
    if not isinstance(products, list):
        products = [products]
    if args.limit:
        products = products[:args.limit]
    print(f"Loaded {len(products)} SKUs")

    # LLM client — Groq preferred, OpenAI fallback
    openai_client = None
    llm_model = OPENAI_MODEL
    if args.groq_key and OPENAI_AVAILABLE:
        openai_client = OpenAI(api_key=args.groq_key, base_url=GROQ_BASE_URL)
        llm_model = GROQ_MODEL
        print(f"LLM: Groq ENABLED ({GROQ_MODEL})")
    elif args.openai_key and OPENAI_AVAILABLE:
        openai_client = OpenAI(api_key=args.openai_key)
        llm_model = OPENAI_MODEL
        print(f"LLM: OpenAI ENABLED ({OPENAI_MODEL})")
    else:
        print("LLM: DISABLED — heuristic mode")

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    results: List[ValidationResult] = []
    checkpoint = output_dir / "ELIMFILTERS_WEB_VALIDATION_CHECKPOINT.json"

    for i, product in enumerate(products, 1):
        sku = product.get("ELIMFILTERS_SKU") or product.get("sku") or f"row_{i}"
        print(f"[{i:>3}/{len(products)}] {sku}", end="  ", flush=True)
        try:
            r = process_sku(product, openai_client, llm_model)
            print(f"{r.status}  conf={r.confidence_score:.2f}  "
                  f"crossrefs={len(r.cross_reference_codes)}  equip={len(r.equipment_applications)}")
        except Exception as e:
            logging.error(f"FAILED {sku}: {e}", exc_info=args.verbose)
            r = ValidationResult(sku=sku, original_data=product, status="error", error=str(e))
            print(f"ERROR: {e}")
        results.append(r)

        if i % 10 == 0:
            with open(checkpoint, "w", encoding="utf-8") as f:
                json.dump([asdict(x) for x in results], f, indent=2, ensure_ascii=False)
            print(f"  ↳ checkpoint saved ({i}/{len(products)})")

    # Final outputs
    results_path = output_dir / "ELIMFILTERS_WEB_VALIDATION_RESULTS.json"
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump([asdict(r) for r in results], f, indent=2, ensure_ascii=False)
    print(f"\nResults → {results_path}")

    report_path = output_dir / "ELIMFILTERS_WEB_VALIDATION_REPORT.md"
    generate_report(results, report_path)

    enriched = sum(1 for r in results if r.status == "enriched")
    print(f"\n{'─'*50}")
    print(f"DONE  {enriched}/{len(results)} enriched  avg_conf={sum(r.confidence_score for r in results)/len(results):.2f}")


if __name__ == "__main__":
    main()
