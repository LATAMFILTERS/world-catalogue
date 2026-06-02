"""
collect_general_parts.py
Recolecta SOLO part numbers del catálogo general de Donaldson.
No scrapea detalles — solo paginación + extracción de links.

URL: https://shop.donaldson.com/store/en-us/search?N=4130398073&catNav=true

Output:
  scripts/general_part_numbers.json   — lista de part numbers únicos
  scripts/general_parts_progress.json — progreso (para reanudar si se interrumpe)

Usage:
  python scripts/collect_general_parts.py
  python scripts/collect_general_parts.py --reset   # borra progreso y empieza de cero
"""

import json
import logging
import os
import sys
import time
import random

from playwright.sync_api import sync_playwright

try:
    from playwright_stealth import stealth_sync
    STEALTH = True
except ImportError:
    STEALTH = False

SCRIPT_DIR    = os.path.dirname(os.path.abspath(__file__))
CATEGORY_URL  = "https://shop.donaldson.com/store/en-us/search?N=4130398073&catNav=true"
OUTPUT_FILE   = os.path.join(SCRIPT_DIR, "general_part_numbers.json")
PROGRESS_FILE = os.path.join(SCRIPT_DIR, "general_parts_progress.json")
PROFILE_DIR   = os.path.join(os.path.expanduser("~"), ".donaldson_profile")
STEP          = 20   # productos por página

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s  %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(SCRIPT_DIR, "collect_general_parts.log"), encoding="utf-8"),
        logging.StreamHandler(),
    ],
)


def rand_sleep(lo=2, hi=4):
    time.sleep(random.uniform(lo, hi))


def dismiss_popups(page):
    try:
        page.keyboard.press("Escape")
        time.sleep(0.4)
    except Exception:
        pass
    for sel in [
        "button#onetrust-accept-btn-handler",
        "button:has-text('Accept All')",
        "button:has-text('Accept')",
        "button.modal__close",
        "button[aria-label='Close']",
        "button.close",
    ]:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=600):
                btn.click()
                time.sleep(0.4)
        except Exception:
            pass


def extract_parts_from_page(page) -> list:
    """Extrae part numbers de los links de producto visibles en el DOM."""
    return page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/product/"]'))
            .map(a => {
                const href = a.getAttribute('href') || '';
                const path = href.split('/product/').pop().split('?')[0].trim();
                const slash = path.indexOf('/');
                return slash >= 0
                    ? path.slice(0, slash).toUpperCase()
                    : path.toUpperCase();
            })
            .filter(p => p.length >= 4 && !p.includes(' ') && /^[A-Z0-9]/.test(p));
    }""")


def load_progress():
    try:
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"parts": [], "last_offset": 0, "done": False}


def save_progress(p):
    tmp = PROGRESS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, PROGRESS_FILE)


def collect(page, progress):
    seen   = set(progress["parts"])
    parts  = list(progress["parts"])
    offset = progress["last_offset"]
    pg     = offset // STEP + 1
    empty  = 0

    import urllib.parse
    parsed = urllib.parse.urlparse(CATEGORY_URL)
    params = dict(urllib.parse.parse_qsl(parsed.query))
    params.pop("No", None)
    base_url = urllib.parse.urlunparse(parsed._replace(query=urllib.parse.urlencode(params)))

    while True:
        url = base_url + f"&No={offset}"
        logging.info(f"  Página {pg} (No={offset}) …")
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
        except Exception:
            pass
        time.sleep(3)
        if pg == 1:
            dismiss_popups(page)

        raw = extract_parts_from_page(page)
        added = 0
        for p in raw:
            if p not in seen:
                seen.add(p)
                parts.append(p)
                added += 1

        logging.info(f"    +{added} nuevos (total {len(parts)})")

        progress["parts"]       = parts
        progress["last_offset"] = offset
        save_progress(progress)

        if added == 0:
            empty += 1
            if empty >= 3:
                logging.info("  3 páginas vacías consecutivas — fin")
                break
        else:
            empty = 0

        offset += STEP
        pg += 1
        rand_sleep(2, 4)

        if pg > 1000:
            logging.warning("  Tope 1000 páginas — deteniendo")
            break

    return parts


def main():
    reset = "--reset" in sys.argv
    if reset:
        for f in [PROGRESS_FILE, OUTPUT_FILE]:
            if os.path.exists(f):
                os.remove(f)
                logging.info(f"  Borrado: {f}")

    progress = load_progress()
    if progress["done"]:
        logging.info(f"Ya completado: {len(progress['parts'])} parts en {OUTPUT_FILE}")
        logging.info("Usa --reset para empezar de cero.")
        return

    logging.info(f"Stealth: {'SI' if STEALTH else 'NO'}")
    logging.info(f"Perfil : {PROFILE_DIR}")
    logging.info(f"URL    : {CATEGORY_URL}")
    logging.info(f"Progreso previo: {len(progress['parts'])} parts, offset={progress['last_offset']}")

    with sync_playwright() as pw:
        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="chrome",
            headless=False,
            slow_mo=60,
            locale="en-US",
            viewport={"width": 1366, "height": 768},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )
        page = context.new_page()
        if STEALTH:
            stealth_sync(page)

        parts = collect(page, progress)
        context.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(sorted(parts), f, ensure_ascii=False, indent=2)

    progress["done"] = True
    save_progress(progress)

    logging.info(f"\n{'='*60}")
    logging.info(f"COMPLETADO: {len(parts)} part numbers únicos → {OUTPUT_FILE}")


if __name__ == "__main__":
    os.chdir(SCRIPT_DIR)
    main()
