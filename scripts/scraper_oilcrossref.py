"""
scraper_oilcrossref.py — Cross-reference entre marcas de filtros
Fuente: https://www.oilfilter-crossreference.com/convert/DONALDSON/{part}

Uso:
    python scraper_oilcrossref.py lube
    python scraper_oilcrossref.py hydraulic
    python scraper_oilcrossref.py lube hydraulic   # ambos a la vez
    python scraper_oilcrossref.py --test P552100

Lee los *_results.json de Donaldson, consulta el sitio por cada part number
y agrega el campo "brand_crossrefs": {"FLEETGUARD": ["LF3000"], "MANN": [...], ...}
Guarda progreso incremental en *_crossref_progress.json
"""

import json, time, random, logging, os, sys
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
    REQUESTS_OK = True
except ImportError:
    REQUESTS_OK = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("scraper_oilcrossref.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

BASE_URL  = "https://www.oilfilter-crossreference.com/convert/DONALDSON/{part}"
PAUSE     = (3, 7)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

SESSION = requests.Session() if REQUESTS_OK else None
if SESSION:
    SESSION.headers.update(HEADERS)


def fetch_crossrefs(part: str) -> dict:
    """
    Devuelve {"FLEETGUARD": ["LF3000", ...], "MANN": [...], ...}
    o {} si no se encontró nada.
    """
    url = BASE_URL.format(part=part.upper())
    try:
        r = SESSION.get(url, timeout=30)
        if r.status_code != 200:
            logging.warning(f"  HTTP {r.status_code} → {part}")
            return {}

        soup = BeautifulSoup(r.text, "html.parser")
        result = {}

        # Patrón 1: tabla con columnas Brand / Part Number
        for table in soup.find_all("table"):
            rows = table.find_all("tr")
            headers = [th.get_text(strip=True).upper() for th in rows[0].find_all(["th", "td"])] if rows else []
            brand_col = next((i for i, h in enumerate(headers) if "BRAND" in h or "MAKE" in h or "MANUFACTURER" in h), None)
            part_col  = next((i for i, h in enumerate(headers) if "PART" in h or "NUMBER" in h or "CODE" in h or "FILTER" in h), None)

            if brand_col is not None and part_col is not None:
                for row in rows[1:]:
                    cells = row.find_all(["td", "th"])
                    if len(cells) > max(brand_col, part_col):
                        brand = cells[brand_col].get_text(strip=True).upper().replace(" ", "_")
                        code  = cells[part_col].get_text(strip=True).upper()
                        if brand and code and brand != "DONALDSON":
                            result.setdefault(brand, [])
                            if code not in result[brand]:
                                result[brand].append(code)

        # Patrón 2: listas o divs si no hay tabla estructurada
        if not result:
            for li in soup.find_all(["li", "div", "p"]):
                text = li.get_text(separator=" ", strip=True)
                # Buscar patrón "BRAND: CODE" o "BRAND CODE"
                parts = text.split()
                if len(parts) == 2:
                    brand, code = parts[0].upper().rstrip(":"), parts[1].upper()
                    if 2 < len(brand) < 25 and 3 < len(code) < 20:
                        result.setdefault(brand, [])
                        if code not in result[brand]:
                            result[brand].append(code)

        return result

    except Exception as e:
        logging.warning(f"  ERROR {part}: {e}")
        return {}


def process_category(name: str):
    results_file  = f"donaldson_{name}_results.json"
    progress_file = f"donaldson_{name}_crossref_progress.json"

    if not Path(results_file).exists():
        logging.error(f"No existe {results_file}")
        return

    with open(results_file, encoding="utf-8") as f:
        products = json.load(f)

    # Cargar progreso
    try:
        with open(progress_file, encoding="utf-8") as f:
            progress = json.load(f)
    except FileNotFoundError:
        progress = {}   # {part_number: {brand: [codes]}}

    total = len(products)
    done  = 0
    new   = 0

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
        crossrefs = fetch_crossrefs(part)
        prod["brand_crossrefs"] = crossrefs
        progress[part] = crossrefs

        brands = list(crossrefs.keys())
        total_codes = sum(len(v) for v in crossrefs.values())
        logging.info(f"  ✅ {part} → {len(brands)} marcas | {total_codes} códigos {brands[:5]}")

        # Guardar progreso atómico
        tmp = progress_file + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(progress, f, ensure_ascii=False, indent=2)
        os.replace(tmp, progress_file)

        new += 1
        time.sleep(random.uniform(*PAUSE))

    # Guardar results actualizado
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    logging.info(f"\n=== {name.upper()} COMPLETO: {total} prods | {done} cache | {new} nuevos ===")


def test_one(part: str):
    crossrefs = fetch_crossrefs(part)
    print(f"\n=== {part} ===")
    if crossrefs:
        for brand, codes in sorted(crossrefs.items()):
            print(f"  {brand:20} {codes}")
    else:
        print("  (sin resultados — revisar HTML)")


if __name__ == "__main__":
    if not REQUESTS_OK:
        print("Instala dependencias: pip install requests beautifulsoup4")
        sys.exit(1)

    argv = sys.argv[1:]

    if not argv:
        print("Uso:")
        print("  python scraper_oilcrossref.py lube")
        print("  python scraper_oilcrossref.py hydraulic")
        print("  python scraper_oilcrossref.py lube hydraulic")
        print("  python scraper_oilcrossref.py --test P552100")
        sys.exit(0)

    if argv[0] == "--test":
        test_one(argv[1] if len(argv) > 1 else "P552100")
    else:
        for cat in argv:
            process_category(cat)
