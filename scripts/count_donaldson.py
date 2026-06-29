"""
count_donaldson.py — cuenta productos de la categoría Lube SIN scrapear.

Responde la duda 351 vs 440: pagina la categoría con y sin filtro de idioma
y reporta cuántos hay en total (raw, con duplicados) y únicos (dedup por part).

Uso:
    python count_donaldson.py

Solo recolecta links, no abre cada producto → rápido (~1-2 min).
"""

import os
import time
from playwright.sync_api import sync_playwright

try:
    from playwright_stealth import stealth_sync
    STEALTH = True
except ImportError:
    STEALTH = False

PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".donaldson_profile")

URLS = {
    "CON filtro inglés": (
        "https://shop.donaldson.com/store/en-us/search"
        "?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts"
    ),
    "SIN filtro idioma": (
        "https://shop.donaldson.com/store/en-us/search"
        "?N=426772457&catNav=true&st=parts"
    ),
}


def count_for(page, url: str):
    page.goto(url, timeout=60000, wait_until="networkidle")
    time.sleep(4)
    try:
        page.keyboard.press("Escape")
    except Exception:
        pass

    raw_total = 0           # todos los links (con duplicados)
    seen = set()            # part numbers únicos
    counter_text = ""
    pg = 1

    # Intentar leer el contador "X Results" que muestra Donaldson
    counter_text = page.evaluate("""() => {
        for (const sel of ['.resultCount','.results-count','.totalResults',
                            '[class*="resultCount"]','[class*="result-count"]']) {
            const el = document.querySelector(sel);
            if (el && el.textContent.trim()) return el.textContent.trim();
        }
        // Búsqueda por texto 'Results'
        const m = document.body.innerText.match(/([\\d,]+)\\s+Results?/i);
        return m ? m[0] : '';
    }""")

    while True:
        try:
            page.wait_for_load_state("networkidle", timeout=15000)
        except Exception:
            pass

        links = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('a[href*="/product/"]'))
                .map(a => (a.getAttribute('href')||'')
                    .split('/product/').pop().split('?')[0].split('/')[0].trim().toUpperCase())
                .filter(p => p.length >= 4 && !p.includes(' '));
        }""")

        raw_total += len(links)
        for p in links:
            seen.add(p)

        nxt = page.evaluate("""() => {
            const b = Array.from(document.querySelectorAll('a, button')).find(b =>
                b.offsetParent &&
                (b.getAttribute('aria-label') === 'Next page' ||
                 b.textContent.trim() === 'Next' ||
                 b.textContent.trim() === 'Siguiente' ||
                 b.classList.contains('next-page') ||
                 (b.parentElement && b.parentElement.classList.contains('next')))
            );
            if (b) { b.click(); return true; }
            return false;
        }""")
        if not nxt:
            break
        pg += 1
        time.sleep(2.5)

    return {
        "paginas": pg,
        "raw": raw_total,
        "unicos": len(seen),
        "contador_web": counter_text,
    }


def main():
    with sync_playwright() as pw:
        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR, channel="chrome", headless=False,
            slow_mo=40, locale="en-US", viewport={"width": 1366, "height": 768},
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"),
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )
        page = context.new_page()
        if STEALTH:
            stealth_sync(page)

        print("\n==================== CONTEO DONALDSON LUBE ====================")
        for label, url in URLS.items():
            print(f"\n→ {label}")
            r = count_for(page, url)
            print(f"   Contador web : {r['contador_web'] or '(no encontrado)'}")
            print(f"   Páginas      : {r['paginas']}")
            print(f"   Links (raw)  : {r['raw']}  (incluye duplicados por página)")
            print(f"   Part únicos  : {r['unicos']}")

        context.close()
    print("\n===============================================================")
    print("Interpretación:")
    print(" - 'Part únicos' SIN filtro vs CON filtro = efecto del idioma.")
    print(" - 'raw' mucho mayor que 'únicos' = duplicados/variantes.")
    print(" - Si el contador web ≈ raw, el 440 contaba duplicados.")


if __name__ == "__main__":
    main()
