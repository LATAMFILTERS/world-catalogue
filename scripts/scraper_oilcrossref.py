"""
scraper_oilcrossref.py — Cross-reference entre marcas de filtros
Fuente: https://www.oilfilter-crossreference.com/convert/DONALDSON/{part}

La página renderiza con JavaScript → usa Playwright (headless).

Uso:
    python scraper_oilcrossref.py lube
    python scraper_oilcrossref.py hydraulic
    python scraper_oilcrossref.py lube hydraulic
    python scraper_oilcrossref.py --test P552100
    python scraper_oilcrossref.py --debug P552100   # guarda HTML crudo
"""

import json, time, random, logging, os, sys, re
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("scraper_oilcrossref.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

BASE_URL = "https://www.oilfilter-crossreference.com/convert/DONALDSON/{part}"
PAUSE    = (4, 9)

# Ruido a descartar
_SKIP_BRANDS = {
    "USD", "PRIVACY", "DONALDSON", "WHEN", "AS", "AN", "WE", "SEARCH",
    "TYPE", "CHOOSE", "START", "ADVANCED", "COPYRIGHT", "REPLACEMENT",
}
_SKIP_CODE_RE = re.compile(r'^\d+[\.,]\d+$')        # precios: 25.79
_PART_RE      = re.compile(r'^[A-Z0-9][A-Z0-9\-/\.]{2,}$')


def _is_code(tok: str) -> bool:
    return bool(_PART_RE.match(tok)) and not _SKIP_CODE_RE.match(tok)


def _parse_text(text: str) -> dict:
    result = {}

    # Estrategias de corte en orden de preferencia
    start_pos = 0
    for pattern in [
        r'general reference only[^\n]*\n',
        r'for Donaldson [A-Z0-9]+\.?\s*\n',
        r'replacement oil filters\s*\n',
    ]:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            start_pos = m.end()
            break

    end_pos = len(text)
    for pattern in [
        r'When you click on links',
        r'Replacement oil filters.*on Amazon',
        r'Search oil filter',
        r'Type an oil filter',
        r'Copyright\s*©',
    ]:
        m = re.search(pattern, text[start_pos:], re.IGNORECASE)
        if m:
            end_pos = start_pos + m.start()
            break

    section = text[start_pos:end_pos]

    lines = [l.strip() for l in section.splitlines()]
    lines = [re.sub(r'\s+Buy from.*', '', l, flags=re.IGNORECASE).strip() for l in lines]
    lines = [l for l in lines if l and len(l) < 80
             and l.upper() not in ("BUY", "FROM", "AMAZON", "EBAY", "")]

    pending_brand = None
    for line in lines:
        tokens = line.split()
        if not tokens:
            continue
        upper = [t.upper() for t in tokens]

        if len(tokens) == 1:
            tok = upper[0]
            if _is_code(tok) and pending_brand:
                result.setdefault(pending_brand, [])
                if tok not in result[pending_brand]:
                    result[pending_brand].append(tok)
            elif not _is_code(tok) and tok not in _SKIP_BRANDS:
                pending_brand = tok
            continue

        last = upper[-1]
        if _is_code(last) and not _SKIP_CODE_RE.match(last):
            code  = last
            brand = " ".join(upper[:-1]).strip(" .,:-()")
            brand = re.sub(r'\s+\d+[\.,]\d+$', '', brand).strip()
            if not brand or any(w in _SKIP_BRANDS for w in brand.split()[:1]):
                continue
            if "DONALDSON" in brand:
                pending_brand = None
                continue
            brand = re.sub(r'[\s/]+', '_', brand)
            result.setdefault(brand, [])
            if code not in result[brand]:
                result[brand].append(code)
            pending_brand = brand
        else:
            pending_brand = None

    return result


def _make_context(pw):
    return pw.chromium.launch_persistent_context(
        user_data_dir=os.path.join(os.path.expanduser("~"), ".donaldson_profile"),
        channel="chrome",
        headless=True,
        locale="en-US",
        viewport={"width": 1366, "height": 768},
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        args=["--disable-blink-features=AutomationControlled"],
        ignore_default_args=["--enable-automation"],
    )


def fetch_crossrefs_page(page, part: str) -> dict:
    url = BASE_URL.format(part=part.upper())
    try:
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        # Esperar a que el ul.compat-list tenga al menos 1 link
        try:
            page.wait_for_function(
                "() => document.querySelectorAll('ul.compat-list li a[href*=\"/convert/\"]').length > 0",
                timeout=15000
            )
        except PWTimeout:
            pass
        time.sleep(1)

        return page.evaluate(_EXTRACT_JS)
    except Exception as e:
        logging.warning(f"  ERROR {part}: {e}")
        return {}


def process_category(pw, name: str):
    results_file  = f"donaldson_{name}_results.json"
    progress_file = f"donaldson_{name}_crossref_progress.json"

    if not Path(results_file).exists():
        logging.error(f"No existe {results_file}")
        return

    with open(results_file, encoding="utf-8") as f:
        products = json.load(f)

    try:
        with open(progress_file, encoding="utf-8") as f:
            progress = json.load(f)
    except FileNotFoundError:
        progress = {}

    context = _make_context(pw)
    page    = context.new_page()
    total   = len(products)
    done    = 0
    new_    = 0

    for i, prod in enumerate(products, 1):
        part = prod.get("part_number", "").upper()
        if not part:
            continue

        if part in progress:
            prod["brand_crossrefs"] = progress[part]
            done += 1
            logging.info(f"[{i}/{total}] {part} — cache ({len(progress[part])} marcas)")
            continue

        logging.info(f"[{i}/{total}] {part} …")
        crossrefs = fetch_crossrefs_page(page, part)
        prod["brand_crossrefs"] = crossrefs
        progress[part] = crossrefs

        brands      = list(crossrefs.keys())
        total_codes = sum(len(v) for v in crossrefs.values())
        logging.info(f"  ✅ {part} → {len(brands)} marcas | {total_codes} códigos")

        tmp = progress_file + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(progress, f, ensure_ascii=False, indent=2)
        os.replace(tmp, progress_file)

        new_ += 1
        time.sleep(random.uniform(*PAUSE))

    context.close()

    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    logging.info(f"\n=== {name.upper()} COMPLETO: {total} prods | {done} cache | {new_} nuevos ===")


_EXTRACT_JS = """() => {
    const result = {};
    const links = document.querySelectorAll('ul.compat-list li a[href*="/convert/"]');
    for (const a of links) {
        const parts = a.getAttribute('href').split('/convert/');
        if (parts.length < 2) continue;
        const segments = parts[1].split('/');
        if (segments.length < 2) continue;
        const brand = decodeURIComponent(segments[0]).toUpperCase().replace(/-FILTER$/i,'').trim();
        const code  = decodeURIComponent(segments[1]).toUpperCase().trim();
        if (!brand || !code || brand === 'DONALDSON') continue;
        if (!result[brand]) result[brand] = [];
        if (!result[brand].includes(code)) result[brand].push(code);
    }
    return result;
}"""


def test_one(part: str, debug: bool = False):
    with sync_playwright() as pw:
        context = _make_context(pw)
        page    = context.new_page()
        url     = BASE_URL.format(part=part.upper())
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        try:
            page.wait_for_function(
                "() => document.querySelectorAll('ul.compat-list li a[href*=\"/convert/\"]').length > 0",
                timeout=15000
            )
        except PWTimeout:
            pass
        time.sleep(1)
        crossrefs = page.evaluate(_EXTRACT_JS)
        context.close()

    print(f"\n=== {part} ===")
    if crossrefs:
        for brand, codes in sorted(crossrefs.items()):
            print(f"  {brand:25} {codes}")
    else:
        print("  (sin resultados — ul.compat-list vacío o no encontrado)")


if __name__ == "__main__":
    argv = sys.argv[1:]

    if not argv:
        print("Uso:")
        print("  python scraper_oilcrossref.py lube")
        print("  python scraper_oilcrossref.py hydraulic")
        print("  python scraper_oilcrossref.py lube hydraulic")
        print("  python scraper_oilcrossref.py --test P552100")
        print("  python scraper_oilcrossref.py --debug P552100")
        sys.exit(0)

    if argv[0] == "--debug":
        test_one(argv[1] if len(argv) > 1 else "P552100", debug=True)
    elif argv[0] == "--test":
        test_one(argv[1] if len(argv) > 1 else "P552100")
    elif "--retry-zeros" in argv:
        # Borra del cache los productos que quedaron con {} para re-procesarlos
        cats = [a for a in argv if not a.startswith("--")]
        for cat in cats:
            pf = f"donaldson_{cat}_crossref_progress.json"
            if Path(pf).exists():
                with open(pf, encoding="utf-8") as f:
                    prog = json.load(f)
                before = len(prog)
                prog = {k: v for k, v in prog.items() if v}  # quitar vacíos
                after = len(prog)
                with open(pf, "w", encoding="utf-8") as f:
                    json.dump(prog, f, ensure_ascii=False, indent=2)
                print(f"{cat}: {before - after} entradas vacías eliminadas del cache ({after} quedan)")
        with sync_playwright() as pw:
            for cat in cats:
                process_category(pw, cat)
    else:
        cats = [a for a in argv if not a.startswith("--")]
        with sync_playwright() as pw:
            for cat in cats:
                process_category(pw, cat)
