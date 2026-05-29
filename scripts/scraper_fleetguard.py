"""
scraper_fleetguard.py — Scraper de categorías Fleetguard (Cummins Filtration)

Extrae por producto: Especificaciones, Cross-References, Reemplazos/Alternativas, Equipment.
Guarda progreso después de cada producto (escritura atómica) → seguro ante apagones.

Uso:
    # Scrapear una categoría por URL:
    python scraper_fleetguard.py air-precleaners https://www.fleetguard.com/category/products/air-filtration/air-precleaners/0ZGPL0000000FSJ4A2

    # Inspeccionar DOM de un producto (para descubrir selectores):
    python scraper_fleetguard.py --inspect https://www.fleetguard.com/...

    # Testear un solo producto:
    python scraper_fleetguard.py --test https://www.fleetguard.com/product/...

Dependencias:
    pip install playwright playwright-stealth
    playwright install chrome
"""

import json
import time
import random
import logging
import os
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

try:
    from playwright_stealth import stealth_sync
    STEALTH = True
except ImportError:
    STEALTH = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("scraper_fleetguard.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".fleetguard_profile")

# Config activa (se fija en runtime)
CATEGORY_NAME = "unknown"
CATEGORY_URL  = ""
OUTPUT_FILE   = "fleetguard_unknown_results.json"
PROGRESS_FILE = "fleetguard_unknown_progress.json"

PAUSE_BETWEEN = (4, 9)

# Categorías conocidas
CATEGORIES = {
    "air-precleaners": "https://www.fleetguard.com/category/products/air-filtration/air-precleaners/0ZGPL0000000FSJ4A2",
    "air-primary":     "https://www.fleetguard.com/category/products/air-filtration/primary-air-elements",
    "air-safety":      "https://www.fleetguard.com/category/products/air-filtration/safety-air-elements",
    "lube":            "https://www.fleetguard.com/category/products/lube-filtration",
    "fuel":            "https://www.fleetguard.com/category/products/fuel-filtration",
    "hydraulic":       "https://www.fleetguard.com/category/products/hydraulic-filtration",
}


def configure(name: str, url: str):
    global CATEGORY_NAME, CATEGORY_URL, OUTPUT_FILE, PROGRESS_FILE
    CATEGORY_NAME = name
    CATEGORY_URL  = url
    OUTPUT_FILE   = f"fleetguard_{name}_results.json"
    PROGRESS_FILE = f"fleetguard_{name}_progress.json"


# ── helpers ────────────────────────────────────────────────────────────────

def rand_sleep(lo=None, hi=None):
    lo, hi = (lo, hi) if lo else PAUSE_BETWEEN
    time.sleep(random.uniform(lo, hi))


def launch_context(pw):
    return pw.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="chrome",
        headless=False,
        slow_mo=40,
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


def dismiss_popups(page):
    try:
        page.keyboard.press("Escape")
        time.sleep(0.3)
    except Exception:
        pass
    for sel in [
        "button[class*='close']", "button[aria-label='Close']",
        "button:has-text('Accept')", "button:has-text('Accept All')",
        "button:has-text('Agree')", "#onetrust-accept-btn-handler",
        "[data-testid='close-button']", ".modal-close",
    ]:
        try:
            btn = page.query_selector(sel)
            if btn and btn.is_visible():
                btn.click()
                time.sleep(0.4)
        except Exception:
            pass


def wait_for_content(page, timeout=15000):
    try:
        page.wait_for_load_state("networkidle", timeout=timeout)
    except Exception:
        pass


# ── Progress ───────────────────────────────────────────────────────────────

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"part_numbers": [], "done": [], "results": [], "started": str(datetime.now())}


def save_progress(p):
    tmp = PROGRESS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, PROGRESS_FILE)


# ── Category pagination ────────────────────────────────────────────────────

def collect_product_links(page, category_url: str) -> list[str]:
    """Pagina la categoría y devuelve lista de URLs de producto únicas."""
    logging.info(f"Cargando categoría: {category_url}")
    page.goto(category_url, timeout=60000, wait_until="domcontentloaded")
    time.sleep(4)
    dismiss_popups(page)
    wait_for_content(page)

    urls = set()
    pg = 1

    while True:
        wait_for_content(page)

        # Extraer links de producto de la página actual
        new_links = page.evaluate("""() => {
            const links = new Set();
            // Buscar links que parezcan páginas de producto
            document.querySelectorAll('a[href]').forEach(a => {
                const href = a.href || '';
                if (href.includes('/product/') || href.includes('/products/')) {
                    // Filtrar links de categoría o navegación
                    if (!href.includes('/category/') && href.match(/[A-Z0-9]{5,}/)) {
                        links.add(href.split('?')[0]);
                    }
                }
            });
            return Array.from(links);
        }""")

        before = len(urls)
        for u in new_links:
            urls.add(u)
        added = len(urls) - before
        logging.info(f"  Página {pg}: +{added} productos (total {len(urls)})")

        # Buscar botón "Next" / "Load More" / siguiente página
        went_next = page.evaluate("""() => {
            // Intento 1: botón "Next page" / "Next" explícito
            const selectors = [
                'a[aria-label="Next page"]',
                'a[aria-label="Next"]',
                'button[aria-label="Next page"]',
                'a.next', 'button.next',
                '[class*="pagination"] a[rel="next"]',
                '[class*="next-page"]',
            ];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el && !el.disabled && el.offsetParent) {
                    el.click(); return 'next-btn';
                }
            }

            // Intento 2: "Load More" / "Show More"
            const loadMore = Array.from(document.querySelectorAll('button, a')).find(el =>
                el.offsetParent && (
                    /load more/i.test(el.textContent) ||
                    /show more/i.test(el.textContent) ||
                    /ver más/i.test(el.textContent)
                )
            );
            if (loadMore) { loadMore.click(); return 'load-more'; }

            // Intento 3: botón numérico siguiente en paginación
            const active = document.querySelector(
                '[class*="pagination"] .active, [class*="pagination"] [aria-current="page"]'
            );
            if (active) {
                const next = active.nextElementSibling;
                if (next && next.tagName !== 'SPAN' && next.offsetParent) {
                    next.click(); return 'page-num';
                }
            }
            return false;
        }""")

        if not went_next:
            break

        pg += 1
        time.sleep(3)

    logging.info(f"Total URLs de producto encontradas: {len(urls)}")
    return list(urls)


# ── Product extraction ─────────────────────────────────────────────────────

def activate_tab(page, keywords: list[str]) -> bool:
    """Activa un tab buscando por texto (keywords). Retorna True si lo encontró."""
    clicked = page.evaluate("""(keywords) => {
        const els = Array.from(document.querySelectorAll(
            'a[role="tab"], button[role="tab"], li[role="tab"], [class*="tab"] a, [class*="tab"] button, nav a, ul.tabs li a'
        ));
        for (const el of els) {
            const text = (el.textContent || '').toLowerCase().trim();
            if (keywords.some(k => text.includes(k.toLowerCase()))) {
                el.click();
                return text;
            }
        }
        // Nuclear: buscar en TODOS los elementos clicables
        const all = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
        for (const el of all) {
            const text = (el.textContent || '').toLowerCase().trim();
            if (el.offsetParent && keywords.some(k => text.includes(k.toLowerCase()))) {
                el.click();
                return 'nuclear:' + text;
            }
        }
        return null;
    }""", keywords)

    if clicked:
        time.sleep(2)
        try:
            page.wait_for_load_state("networkidle", timeout=5000)
        except Exception:
            pass
    return bool(clicked)


def extract_specs(page) -> dict:
    """Extrae especificaciones/atributos del producto."""
    return page.evaluate("""() => {
        const specs = {};
        // Tablas de specs
        document.querySelectorAll('table tr, dl').forEach(row => {
            const cells = row.querySelectorAll('td, dt, dd');
            if (cells.length >= 2) {
                const key = cells[0].textContent.trim().replace(/:$/, '');
                const val = cells[1].textContent.trim();
                if (key && val && key.length < 80) specs[key] = val;
            }
        });
        // Listas de specs (li con dos spans, etc.)
        document.querySelectorAll('[class*="spec"], [class*="attribute"], [class*="detail"]').forEach(el => {
            const label = el.querySelector('[class*="label"], [class*="name"], dt');
            const value = el.querySelector('[class*="value"], [class*="data"], dd');
            if (label && value) {
                const k = label.textContent.trim().replace(/:$/, '');
                const v = value.textContent.trim();
                if (k && v && k.length < 80) specs[k] = v;
            }
        });
        return specs;
    }""")


def extract_cross_refs(page) -> list:
    """Extrae cross-references / OEM equivalencias."""
    return page.evaluate("""() => {
        const refs = [];
        const seen = new Set();
        // Tablas de cross-ref
        document.querySelectorAll('table tr').forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length >= 2) {
                const brand = cells[0].textContent.trim();
                const pn    = cells[1].textContent.trim();
                if (brand && pn && pn.length > 2 && !seen.has(pn)) {
                    seen.add(pn);
                    refs.push({ brand, part_number: pn });
                }
            }
        });
        // Listas de cross-ref
        document.querySelectorAll('[class*="cross"], [class*="interchange"], [class*="equiv"]').forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length < 50 && !seen.has(text)) {
                seen.add(text);
                refs.push({ brand: 'unknown', part_number: text });
            }
        });
        return refs;
    }""")


def extract_alternates(page) -> list:
    """Extrae productos alternativos / superseded by."""
    return page.evaluate("""() => {
        const alts = [];
        const seen = new Set();
        const push = pn => {
            pn = (pn || '').trim().toUpperCase();
            if (pn && pn.length >= 3 && !seen.has(pn)) {
                seen.add(pn);
                alts.push(pn);
            }
        };
        // Selectores comunes de alternativas
        document.querySelectorAll(
            '[class*="alternate"] [class*="part"], [class*="replace"] [class*="part"], ' +
            '[class*="supersede"] [class*="part"], [class*="similar"] a'
        ).forEach(el => push(el.textContent));

        // Cards de producto en sección de alternativas/reemplazos
        const sections = Array.from(document.querySelectorAll('section, div')).filter(el => {
            const t = (el.getAttribute('aria-label') || el.id || el.className || '').toLowerCase();
            return t.includes('alternate') || t.includes('replace') || t.includes('supersede');
        });
        sections.forEach(sec => {
            sec.querySelectorAll('[class*="part-number"], [data-part], h3, h4').forEach(el => push(el.textContent));
        });
        return alts;
    }""")


def extract_equipment(page) -> list:
    """Extrae equipos compatibles (aplicaciones)."""
    return page.evaluate("""() => {
        const equip = [];
        const seen = new Set();
        document.querySelectorAll(
            '[class*="application"] tr, [class*="equipment"] tr, [class*="vehicle"] tr, ' +
            '[class*="fitment"] tr, [class*="compat"] tr'
        ).forEach(row => {
            const text = row.textContent.trim().replace(/\\s+/g, ' ');
            if (text && text.length > 3 && text.length < 200 && !seen.has(text)) {
                seen.add(text);
                equip.push(text);
            }
        });
        return equip;
    }""")


def scrape_product(page, url: str) -> dict:
    result = {
        "url": url,
        "part_number": "",
        "name": "",
        "attributes": {},
        "cross_references": [],
        "alternatives": [],
        "equipment": [],
        "error": None,
        "scraped_at": str(datetime.now()),
    }

    try:
        page.goto(url, timeout=60000, wait_until="domcontentloaded")
        time.sleep(3)
        dismiss_popups(page)
        wait_for_content(page)

        # Part number y nombre
        result.update(page.evaluate("""() => {
            const pn_el = document.querySelector(
                '[class*="part-number"], [class*="partNumber"], [data-part-number], ' +
                'h1 + p, [class*="model"]'
            );
            const name_el = document.querySelector('h1, [class*="product-title"], [class*="productTitle"]');
            return {
                part_number: pn_el ? pn_el.textContent.trim().toUpperCase() : '',
                name:        name_el ? name_el.textContent.trim() : '',
            };
        }"""))

        # Si no encontró part number, intentar sacarlo de la URL
        if not result["part_number"]:
            segments = url.rstrip("/").split("/")
            for seg in reversed(segments):
                if len(seg) >= 4 and seg.replace("-", "").replace("_", "").isalnum():
                    result["part_number"] = seg.upper()
                    break

        # ── Alternativas ─────────────────────────────────────────────────
        activate_tab(page, ["alternate", "replace", "supersede", "similar"])
        result["alternatives"] = extract_alternates(page)
        logging.info(f"    alt: {len(result['alternatives'])}")

        # ── Specs / Atributos ─────────────────────────────────────────────
        activate_tab(page, ["specification", "specs", "detail", "attribute"])
        result["attributes"] = extract_specs(page)
        logging.info(f"    attr: {len(result['attributes'])}")

        # ── Cross-References ──────────────────────────────────────────────
        activate_tab(page, ["cross", "interchange", "reference", "oe", "oem"])
        result["cross_references"] = extract_cross_refs(page)
        logging.info(f"    cross: {len(result['cross_references'])}")

        # ── Equipment / Aplicaciones ──────────────────────────────────────
        activate_tab(page, ["application", "equipment", "vehicle", "fitment", "compat"])
        result["equipment"] = extract_equipment(page)
        logging.info(f"    equip: {len(result['equipment'])}")

    except PlaywrightTimeout:
        result["error"] = "timeout"
        logging.warning(f"  TIMEOUT: {url}")
    except Exception as e:
        result["error"] = str(e)
        logging.error(f"  ERROR: {url} → {e}")

    return result


# ── Inspect mode ───────────────────────────────────────────────────────────

def inspect_page(url: str):
    """Dumpa DOM, tabs, links de producto — para descubrir selectores."""
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        logging.info(f"Inspeccionando: {url}")
        page.goto(url, timeout=60000, wait_until="domcontentloaded")
        time.sleep(4)
        dismiss_popups(page)
        wait_for_content(page)

        info = page.evaluate("""() => {
            // Tabs encontrados
            const tabs = Array.from(document.querySelectorAll(
                'a[role="tab"], button[role="tab"], [class*="tab"] a, [class*="tab"] button, nav a, ul a'
            )).map(el => ({
                tag: el.tagName,
                text: el.textContent.trim().slice(0, 60),
                class: el.className.slice(0, 60),
                href: el.href || '',
            })).filter(t => t.text).slice(0, 30);

            // Links de producto en la página
            const productLinks = Array.from(new Set(
                Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(h => h.includes('/product') && !h.includes('/category/'))
            )).slice(0, 10);

            // Secciones principales
            const sections = Array.from(document.querySelectorAll('section, main > div')).map(el => ({
                id: el.id,
                class: el.className.slice(0, 60),
                children: el.children.length,
            })).slice(0, 20);

            // Título y part number
            const h1 = document.querySelector('h1');
            const meta = document.querySelector('[class*="part-number"], [class*="partNumber"], [data-part]');

            return { tabs, productLinks, sections,
                     title: h1 ? h1.textContent.trim() : '',
                     partNumber: meta ? meta.textContent.trim() : '' };
        }""")

        out_file = "fleetguard_inspect.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(info, f, ensure_ascii=False, indent=2)

        print(f"\n{'='*60}")
        print(f"Título       : {info.get('title')}")
        print(f"Part Number  : {info.get('partNumber')}")
        print(f"\nTabs ({len(info['tabs'])}):")
        for t in info["tabs"]:
            print(f"  [{t['tag']}] '{t['text']}' class='{t['class']}'")
        print(f"\nLinks de producto ({len(info['productLinks'])}):")
        for u in info["productLinks"]:
            print(f"  {u}")
        print(f"\nSecciones ({len(info['sections'])}):")
        for s in info["sections"]:
            print(f"  id='{s['id']}' class='{s['class']}' children={s['children']}")
        print(f"\nGuardado en: {out_file}")
        print("="*60)

        input("\nPresiona ENTER para cerrar el navegador...")
        ctx.close()


# ── Test single product ────────────────────────────────────────────────────

def test_one(url: str):
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)
        data = scrape_product(page, url)
        ctx.close()
    print(json.dumps(data, ensure_ascii=False, indent=2))


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        progress = load_progress()

        # Recolectar URLs si no lo hemos hecho aún
        if not progress["part_numbers"]:
            urls = collect_product_links(page, CATEGORY_URL)
            progress["part_numbers"] = urls
            save_progress(progress)
        else:
            urls = progress["part_numbers"]
            logging.info(f"Reanudando — {len(urls)} URLs totales")

        done_set = set(progress["done"])
        results  = progress["results"]

        pending = [u for u in urls if u not in done_set]
        logging.info(f"Pendientes: {len(pending)} / {len(urls)}")

        for idx, url in enumerate(pending, 1):
            logging.info(f"[{idx}/{len(pending)}] {url}")
            data = scrape_product(page, url)

            na = len(data["attributes"])
            nc = len(data["cross_references"])
            nl = len(data["alternatives"])
            ne = len(data["equipment"])
            st = "✅" if not data["error"] else "❌"
            logging.info(f"  {st} {data['part_number']} → {na} Attr | {nc} Cross | {nl} Alt | {ne} Equip")

            results.append(data)
            done_set.add(url)
            progress["done"]    = list(done_set)
            progress["results"] = results
            save_progress(progress)   # atomic, cada producto

            rand_sleep()

        ctx.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    logging.info(f"✅ Completo — {len(results)} productos en {OUTPUT_FILE}")


# ── CLI ────────────────────────────────────────────────────────────────────

def _usage():
    print(__doc__)

if __name__ == "__main__":
    argv = sys.argv[1:]

    if not argv or argv[0] in ("-h", "--help"):
        _usage()
        sys.exit(0)

    if argv[0] == "--inspect":
        url = argv[1] if len(argv) > 1 else ""
        if not url:
            print("ERROR: --inspect necesita una URL"); sys.exit(1)
        inspect_page(url)
        sys.exit(0)

    if argv[0] == "--test":
        url = argv[1] if len(argv) > 1 else ""
        if not url:
            print("ERROR: --test necesita una URL de producto"); sys.exit(1)
        test_one(url)
        sys.exit(0)

    # Modo normal: nombre_categoria [url]
    name = argv[0].lower()
    url  = argv[1] if len(argv) > 1 else CATEGORIES.get(name, "")
    if not url:
        print(f"ERROR: categoría '{name}' desconocida y no se dio URL")
        print(f"Categorías conocidas: {list(CATEGORIES.keys())}")
        sys.exit(1)

    configure(name, url)
    logging.info(f"Iniciando: {name} → {url}")
    main()
