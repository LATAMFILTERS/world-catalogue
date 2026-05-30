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


import re as _re

# Ruido a descartar
_SKIP_BRANDS = {
    "USD", "PRIVACY", "DONALDSON", "WHEN", "AS", "AN", "WE", "SEARCH",
    "TYPE", "CHOOSE", "START", "ADVANCED", "COPYRIGHT", "REPLACEMENT",
    "COACH",  # "COACH GUARD" → multi-word; manejado abajo
}
_SKIP_CODE_RE = _re.compile(r'^\d+\.\d+$')     # precios: 25.79
_PART_RE      = _re.compile(r'^[A-Z0-9][A-Z0-9\-/\.]{2,}$')


def _is_code(tok: str) -> bool:
    return bool(_PART_RE.match(tok)) and not _SKIP_CODE_RE.match(tok)


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

        # El sitio lista cross-refs como texto plano: "BRAND CODE\nBRAND CODE\n..."
        # Los items con link "Buy from Amazon" dividen brand y code en líneas distintas.
        # Estrategia: obtener texto línea a línea, limpiar, parear brand+code.

        text = soup.get_text(separator="\n")

        # Cortar solo la sección de cross-refs (entre "replacement oil filters" y "When you click")
        m_start = _re.search(r'replacement oil filters\s*\n', text, _re.IGNORECASE)
        m_end   = _re.search(r'When you click on links', text, _re.IGNORECASE)
        if m_start and m_end:
            text = text[m_start.end():m_end.start()]

        lines = [l.strip() for l in text.splitlines()]
        lines = [_re.sub(r'\s+Buy from.*', '', l, flags=_re.IGNORECASE).strip() for l in lines]
        lines = [l for l in lines if l and l.upper() not in ("BUY", "FROM", "AMAZON", "EBAY")]

        pending_brand = None
        for line in lines:
            tokens = line.split()
            if not tokens:
                continue

            upper_tokens = [t.upper() for t in tokens]

            # Caso A: línea con 1 token — puede ser código huérfano o marca sola
            if len(tokens) == 1:
                tok = upper_tokens[0]
                if _is_code(tok) and pending_brand:
                    # código huérfano → usar marca anterior
                    result.setdefault(pending_brand, [])
                    if tok not in result[pending_brand]:
                        result[pending_brand].append(tok)
                elif not _is_code(tok) and tok not in _SKIP_BRANDS:
                    pending_brand = tok   # marca sola → esperar código siguiente
                continue

            # Caso B: última token es el código, el resto es la marca
            last = upper_tokens[-1]
            if _is_code(last) and not _SKIP_CODE_RE.match(last):
                code  = last
                brand = " ".join(upper_tokens[:-1]).strip(" .,:-")
                # Limpiar suffixes de precio inline (raro)
                brand = _re.sub(r'\s+\d+\.\d+$', '', brand).strip()
                if not brand or brand.split()[0] in _SKIP_BRANDS:
                    continue
                if "DONALDSON" in brand:
                    pending_brand = None
                    continue
                # Normalizar
                brand = _re.sub(r'[\s/]+', '_', brand)
                result.setdefault(brand, [])
                if code not in result[brand]:
                    result[brand].append(code)
                pending_brand = brand
            else:
                pending_brand = None

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


def test_one(part: str, debug: bool = False):
    url = BASE_URL.format(part=part.upper())
    r = SESSION.get(url, timeout=30)
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text(separator="\n")

    if debug:
        with open(f"debug_{part}.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print(f"HTML text guardado en debug_{part}.txt")
        return

    crossrefs = fetch_crossrefs(part)
    print(f"\n=== {part} ===")
    if crossrefs:
        for brand, codes in sorted(crossrefs.items()):
            print(f"  {brand:20} {codes}")
    else:
        print("  (sin resultados — revisar HTML)")
        # Mostrar primeras 80 líneas para diagnóstico
        print("\n--- Primeras 80 líneas del texto ---")
        for i, l in enumerate(text.splitlines()[:80], 1):
            print(f"  {i:3}: {l}")


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

    if argv[0] == "--debug":
        test_one(argv[1] if len(argv) > 1 else "P552100", debug=True)
    elif argv[0] == "--test":
        test_one(argv[1] if len(argv) > 1 else "P552100")
    else:
        for cat in argv:
            process_category(cat)
