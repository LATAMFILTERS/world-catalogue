#!/usr/bin/env python3
"""
ELIMFILTERS balanced audio overview generator.

The generator intentionally distributes topics across the complete public
portfolio instead of using any single filtration domain as a default example.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    import anthropic
    import boto3
    from botocore.client import Config
except ImportError:
    print("Install deps: pip install notebooklm-py playwright boto3 anthropic")
    sys.exit(1)

BASE = "https://elimfilters.com"

PAGES = {
    "system-air-intake": {"title": "Air Intake & Airflow Protection", "url": f"{BASE}/systems/air-intake/", "section": "system"},
    "system-fuel-cleanliness": {"title": "Fuel Cleanliness Protection", "url": f"{BASE}/systems/fuel-cleanliness/", "section": "system"},
    "system-lubrication": {"title": "Lubrication Protection", "url": f"{BASE}/systems/lubrication/", "section": "system"},
    "system-hydraulic": {"title": "Hydraulic Protection", "url": f"{BASE}/systems/hydraulic/", "section": "system"},
    "system-cooling": {"title": "Cooling System Protection", "url": f"{BASE}/systems/cooling-system/", "section": "system"},
    "technology-macrocore": {"title": "MACROCORE™", "url": f"{BASE}/technologies/macrocore/", "section": "technology"},
    "technology-microkappa": {"title": "MICROKAPPA™", "url": f"{BASE}/technologies/microkappa/", "section": "technology"},
    "technology-drycore": {"title": "DRYCORE™", "url": f"{BASE}/technologies/drycore/", "section": "technology"},
    "technology-intekcore": {"title": "INTEKCORE™", "url": f"{BASE}/technologies/intekcore/", "section": "technology"},
    "technology-syntapore": {"title": "SYNTAPORE™", "url": f"{BASE}/technologies/syntapore/", "section": "technology"},
    "technology-hydrocore": {"title": "HYDROCORE™", "url": f"{BASE}/technologies/hydrocore/", "section": "technology"},
    "technology-turbocore": {"title": "TURBOCORE™", "url": f"{BASE}/technologies/turbocore/", "section": "technology"},
    "technology-syntrax": {"title": "SYNTRAX™", "url": f"{BASE}/technologies/syntrax/", "section": "technology"},
    "technology-nanoforce": {"title": "NANOFORCE™", "url": f"{BASE}/technologies/nanoforce/", "section": "technology"},
    "technology-thermacore": {"title": "THERMACORE™", "url": f"{BASE}/technologies/thermacore/", "section": "technology"},
    "industry-agriculture": {"title": "Agriculture", "url": f"{BASE}/industries/agriculture/", "section": "industry"},
    "industry-automotive": {"title": "Automotive", "url": f"{BASE}/industries/automotive/", "section": "industry"},
    "industry-bus-coach": {"title": "Bus & Coach", "url": f"{BASE}/industries/bus-coach/", "section": "industry"},
    "industry-construction": {"title": "Construction", "url": f"{BASE}/industries/construction/", "section": "industry"},
    "industry-manufacturing": {"title": "Manufacturing", "url": f"{BASE}/industries/manufacturing/", "section": "industry"},
    "industry-marine": {"title": "Marine", "url": f"{BASE}/industries/marine/", "section": "industry"},
    "industry-mining": {"title": "Mining", "url": f"{BASE}/industries/mining/", "section": "industry"},
    "industry-oil-gas": {"title": "Oil & Gas", "url": f"{BASE}/industries/oil-gas/", "section": "industry"},
    "industry-power-generation": {"title": "Power Generation", "url": f"{BASE}/industries/power-generation/", "section": "industry"},
    "industry-railway": {"title": "Railway", "url": f"{BASE}/industries/railway/", "section": "industry"},
    "industry-truck-fleets": {"title": "Truck Fleets", "url": f"{BASE}/industries/trucks-fleets/", "section": "industry"},
    "industry-waste-municipal": {"title": "Waste & Municipal", "url": f"{BASE}/industries/waste-municipal/", "section": "industry"},
}

R2_ENDPOINT = os.environ.get("R2_ENDPOINT")
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY")
R2_BUCKET = os.environ.get("R2_BUCKET", "elimfilters-audio")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")


def get_page_content_for_audio(page_slug: str, lang: str) -> str:
    page = PAGES[page_slug]
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    lang_instruction = "in English" if lang == "en" else "en español"
    prompt = f"""Create a 3-5 minute ELIMFILTERS technical audio overview {lang_instruction} about \"{page['title']}\" using this canonical page as the subject: {page['url']}.

Portfolio-balance rules are mandatory:
- Stay centered on the named subject. Do not turn the episode into a hydraulic-filtration episode unless the named subject itself is hydraulic.
- Do not use hydraulic systems as the default example.
- When examples are useful, choose examples from the named industry, system or technology first.
- Across ELIMFILTERS, recognize the five core systems: air intake, fuel cleanliness, lubrication, hydraulic and cooling.
- Recognize the ten canonical technologies: MACROCORE™, MICROKAPPA™, DRYCORE™, INTEKCORE™, SYNTAPORE™, HYDROCORE™, TURBOCORE™, SYNTRAX™, NANOFORCE™ and THERMACORE™.
- Do not invent test results, certifications, service intervals or performance numbers.
- Standards may be mentioned only where applicable and with qualified wording.
- Do not mention competitor brands in public-facing script text.

Structure:
1. Explain what the subject is and why it matters operationally.
2. Explain the relevant contamination, flow, thermal, material or maintenance mechanisms.
3. Connect the subject only to the ELIMFILTERS systems/technologies that are genuinely relevant.
4. Give practical implications for engineers, fleet managers or asset owners.
5. Close with a concise technical takeaway.

Tone: professional, technical, industrial, no AI hype and no marketing exaggeration.
Format: plain prose for text-to-speech; no headings or stage directions.
Length: 400-550 words.
Write only the script."""
    response = client.messages.create(model="claude-haiku-4-5-20251001", max_tokens=900, messages=[{"role": "user", "content": prompt}])
    return response.content[0].text


def generate_with_notebooklm(script: str, output_path: str, lang: str) -> bool:
    try:
        from notebooklm import NotebookLM
        nlm = NotebookLM()
        notebook = nlm.create_notebook(title="ELIMFILTERS Audio Overview")
        notebook.add_source_text(script)
        print(f"  Generating audio in NotebookLM ({lang})...")
        audio_url = notebook.generate_audio_overview()
        import urllib.request
        urllib.request.urlretrieve(audio_url, output_path)
        notebook.delete()
        return True
    except Exception as exc:
        print(f"  NotebookLM unavailable ({exc}), saving script only")
        with open(output_path.replace(".mp3", ".txt"), "w") as handle:
            handle.write(script)
        return False


def upload_to_r2(local_path: str, key: str) -> str:
    if not all([R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY]):
        print("  R2 credentials not set. File saved locally only.")
        return ""
    s3 = boto3.client("s3", endpoint_url=R2_ENDPOINT, aws_access_key_id=R2_ACCESS_KEY, aws_secret_access_key=R2_SECRET_KEY, config=Config(signature_version="s3v4"))
    with open(local_path, "rb") as handle:
        s3.upload_fileobj(handle, R2_BUCKET, key, ExtraArgs={"ContentType": "audio/mpeg", "ACL": "public-read"})
    return f"https://pub-audio.elimfilters.com/{key}"


def process_page(page_slug: str, lang: str, output_dir: Path) -> dict:
    page = PAGES[page_slug]
    filename = f"{page_slug}-{lang}.mp3"
    local_path = output_dir / filename
    print(f"\n[{page_slug}] {page['title']} ({lang.upper()})")
    if local_path.exists():
        return {"slug": page_slug, "lang": lang, "status": "skipped"}
    script = get_page_content_for_audio(page_slug, lang)
    success = generate_with_notebooklm(script, str(local_path), lang)
    if not success:
        return {"slug": page_slug, "lang": lang, "status": "script_only"}
    url = upload_to_r2(str(local_path), filename)
    return {"slug": page_slug, "lang": lang, "status": "done", "url": url}


def main():
    parser = argparse.ArgumentParser(description="Generate balanced ELIMFILTERS audio overviews")
    parser.add_argument("--page")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--section", choices=["system", "technology", "industry"])
    parser.add_argument("--lang", choices=["en", "es", "both"], default="both")
    parser.add_argument("--output", default="./audio_output")
    args = parser.parse_args()
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    langs = ["en", "es"] if args.lang == "both" else [args.lang]
    if args.page:
        pages_to_process = [args.page]
    elif args.section:
        pages_to_process = [slug for slug, page in PAGES.items() if page["section"] == args.section]
    elif args.all:
        pages_to_process = list(PAGES.keys())
    else:
        print("Specify --page, --section or --all")
        sys.exit(1)
    if not ANTHROPIC_API_KEY:
        print("Error: ANTHROPIC_API_KEY not set")
        sys.exit(1)
    results = []
    for page_slug in pages_to_process:
        if page_slug not in PAGES:
            print(f"Unknown page: {page_slug}")
            continue
        for lang in langs:
            results.append(process_page(page_slug, lang, output_dir))
            time.sleep(2)
    with open(output_dir / "manifest.json", "w") as handle:
        json.dump(results, handle, indent=2)


if __name__ == "__main__":
    main()
