"""
download_fg_images.py — Descarga imágenes de productos Fleetguard ya scrapeados.

Lee un _results.json existente, visita cada página en Chrome y descarga la
imagen principal del producto. No requiere git pull.

Uso:
    python scripts/download_fg_images.py
    python scripts/download_fg_images.py air-primary-secondary

La categoría default es air-precleaners.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error
import logging
from datetime import datetime

from playwright.sync_api import sync_playwright

try:
    from playwright_stealth import stealth_sync
    STEALTH = True
except ImportError:
    STEALTH = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler()],
)

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
FG_DIR       = os.path.join(SCRIPT_DIR, "Fleetguard Scraper")
IMAGES_DIR   = os.path.join(FG_DIR, "images")
PROFILE_DIR  = os.path.join(os.path.expanduser("~"), ".fleetguard_profile")

SHADOW_WALK_ALL = """
function swa(root, sel, depth, out) {
    if (depth > 10) return;
    root.querySelectorAll(sel).forEach(el => out.push(el));
    root.querySelectorAll('*').forEach(n => {
        if (n.shadowRoot) swa(n.shadowRoot, sel, depth+1, out);
    });
}
"""

SKIP_TERMS = ['logo','icon','flag','sprite','blank','placeholder',
              'loading','avatar','arrow','chevron','caret','close',
              'search','cart','header','footer','nav']


def extract_image_url(page) -> str:
    return page.evaluate(f"""() => {{
        {SHADOW_WALK_ALL}
        function isSkip(s) {{
            if (!s) return true;
            const l = s.toLowerCase();
            return {json.dumps(SKIP_TERMS)}.some(t => l.includes(t));
        }}
        const imgs = [];
        swa(document, 'img', 0, imgs);
        const candidates = imgs
            .map(img => ({{
                src: img.src || img.getAttribute('src') || '',
                alt: img.alt || '',
                cls: (typeof img.className === 'string' ? img.className : '') || '',
                w: img.naturalWidth  || parseInt(img.getAttribute('width')  || '0'),
                h: img.naturalHeight || parseInt(img.getAttribute('height') || '0'),
            }}))
            .filter(c => {{
                if (!c.src || c.src.startsWith('data:')) return false;
                if (isSkip(c.src) || isSkip(c.alt) || isSkip(c.cls)) return false;
                if (c.w > 0 && c.w < 80) return false;
                return true;
            }})
            .sort((a, b) => (b.w * b.h) - (a.w * a.h));
        return candidates.length ? candidates[0].src : null;
    }}""")


def download_image(src_url: str, part_number: str):
    os.makedirs(IMAGES_DIR, exist_ok=True)
    ext = "jpg"
    path_part = src_url.split("?")[0].split("/")[-1]
    if "." in path_part:
        candidate = path_part.rsplit(".", 1)[-1].lower()
        if candidate in ("jpg", "jpeg", "png", "webp"):
            ext = "png" if candidate == "png" else ("webp" if candidate == "webp" else "jpg")

    pn_clean   = part_number.upper().replace("/", "-")
    filename   = f"{pn_clean}.{ext}"
    local_path = os.path.join(IMAGES_DIR, filename)
    public_url = f"/images/fleetguard/{filename}"

    if os.path.exists(local_path) and os.path.getsize(local_path) > 500:
        logging.info(f"    ya existe: {filename}")
        return filename, public_url

    try:
        req = urllib.request.Request(
            src_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                              "AppleWebKit/537.36 (KHTML, like Gecko) "
                              "Chrome/124.0.0.0 Safari/537.36",
                "Referer": "https://www.fleetguard.com/",
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            ct = resp.headers.get("Content-Type", "")
            if "png" in ct:
                ext = "png"; filename = f"{pn_clean}.png"
                local_path = os.path.join(IMAGES_DIR, filename)
                public_url = f"/images/fleetguard/{filename}"
            elif "webp" in ct:
                ext = "webp"; filename = f"{pn_clean}.webp"
                local_path = os.path.join(IMAGES_DIR, filename)
                public_url = f"/images/fleetguard/{filename}"
            data = resp.read()
        with open(local_path, "wb") as f:
            f.write(data)
        kb = len(data) // 1024
        logging.info(f"    ✅ {filename} ({kb} KB)")
        return filename, public_url
    except Exception as e:
        logging.warning(f"    ❌ descarga falló: {e}")
        return None, None


def run(category: str):
    results_file = os.path.join(FG_DIR, f"fleetguard_{category}_results.json")
    if not os.path.exists(results_file):
        logging.error(f"No encontrado: {results_file}")
        sys.exit(1)

    with open(results_file, encoding="utf-8") as f:
        results = json.load(f)

    pending = [r for r in results if not r.get("image_src") and r.get("url")]
    logging.info(f"Total: {len(results)} | Sin imagen: {len(pending)}")

    if not pending:
        logging.info("✅ Todas las imágenes ya descargadas.")
        return

    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="chrome",
            headless=False,
            slow_mo=40,
            locale="en-US",
            viewport={"width": 1366, "height": 768},
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"),
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        ok = 0
        for idx, prod in enumerate(results, 1):
            if prod.get("image_src"):
                continue
            url = prod.get("url", "")
            pn  = prod.get("part_number", "")
            if not url:
                continue

            logging.info(f"[{idx}/{len(results)}] {pn}")
            try:
                page.goto(url, timeout=60000, wait_until="domcontentloaded")
                time.sleep(3)
                try:
                    page.wait_for_load_state("networkidle", timeout=15000)
                except Exception:
                    pass

                src = extract_image_url(page)
                if src:
                    fname, pub = download_image(src, pn)
                    prod["image_src"] = src
                    prod["image_url"] = pub
                    if pub:
                        ok += 1
                else:
                    prod["image_src"] = None
                    prod["image_url"] = None
                    logging.warning(f"    sin imagen en DOM: {pn}")

            except Exception as e:
                logging.warning(f"    ERROR: {e}")

            # Guardar progreso después de cada producto
            with open(results_file, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=2)

            time.sleep(2)

        ctx.close()

    logging.info(f"\n✅ Completado: {ok}/{len(pending)} imágenes descargadas")
    logging.info(f"Carpeta: {IMAGES_DIR}")


if __name__ == "__main__":
    cat = sys.argv[1] if len(sys.argv) > 1 else "air-precleaners"
    run(cat)
