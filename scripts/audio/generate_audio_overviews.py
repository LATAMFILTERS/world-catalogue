#!/usr/bin/env python3
"""
ELIMFILTERS Knowledge System — Audio Overview Generator
Generates podcast-style audio overviews using Google NotebookLM via notebooklm-py.

Requirements:
  pip install notebooklm-py playwright boto3 anthropic
  playwright install chromium

Usage:
  python generate_audio_overviews.py --page lube-oil-systems --lang en
  python generate_audio_overviews.py --all --lang en
  python generate_audio_overviews.py --all  # both EN + ES
"""

import argparse
import json
import os
import time
import sys
from pathlib import Path

try:
    import anthropic
    import boto3
    from botocore.client import Config
except ImportError:
    print("Install deps: pip install notebooklm-py playwright boto3 anthropic")
    sys.exit(1)

# All Knowledge System pages to generate audio for
PAGES = {
    # Standards
    "lube-oil-systems": {
        "title": "Lube Oil Filtration Systems",
        "url": "https://elimfilters.com/knowledge-system/standards/lube-oil-systems",
        "section": "standards",
    },
    "air-intake-systems": {
        "title": "Air Intake Filtration Systems",
        "url": "https://elimfilters.com/knowledge-system/standards/air-intake-systems",
        "section": "standards",
    },
    "cabin-safety-systems": {
        "title": "Cabin & Human Safety Filtration",
        "url": "https://elimfilters.com/knowledge-system/standards/cabin-safety-systems",
        "section": "standards",
    },
    "fuel-systems": {
        "title": "Fuel Filtration Systems",
        "url": "https://elimfilters.com/knowledge-system/standards/fuel-systems",
        "section": "standards",
    },
    "hydraulic-systems": {
        "title": "Hydraulic System Filtration",
        "url": "https://elimfilters.com/knowledge-system/standards/hydraulic-systems",
        "section": "standards",
    },
    "compressed-air-systems": {
        "title": "Compressed Air Systems",
        "url": "https://elimfilters.com/knowledge-system/standards/compressed-air-systems",
        "section": "standards",
    },
    # Contamination
    "diesel-water": {
        "title": "Diesel Water Contamination",
        "url": "https://elimfilters.com/knowledge-system/contamination/diesel-water",
        "section": "contamination",
    },
    "particle-wear": {
        "title": "Particle Wear in Engines",
        "url": "https://elimfilters.com/knowledge-system/contamination/particle-wear",
        "section": "contamination",
    },
    "hydraulic-system": {
        "title": "Hydraulic System Contamination",
        "url": "https://elimfilters.com/knowledge-system/contamination/hydraulic-system",
        "section": "contamination",
    },
    # Fleet
    "reducing-downtime": {
        "title": "Reducing Fleet Downtime",
        "url": "https://elimfilters.com/knowledge-system/fleet/reducing-downtime",
        "section": "fleet",
    },
    "fuel-efficiency": {
        "title": "Filtration and Fuel Efficiency",
        "url": "https://elimfilters.com/knowledge-system/fleet/fuel-efficiency",
        "section": "fleet",
    },
    "total-cost-ownership": {
        "title": "Total Cost of Ownership",
        "url": "https://elimfilters.com/knowledge-system/fleet/total-cost-ownership",
        "section": "fleet",
    },
}

# Cloudflare R2 config (set as environment variables)
R2_ENDPOINT = os.environ.get("R2_ENDPOINT")        # https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY")
R2_BUCKET = os.environ.get("R2_BUCKET", "elimfilters-audio")

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")


def get_page_content_for_audio(page_slug: str, lang: str) -> str:
    """
    Uses Claude to generate a podcast-style script from the page content.
    This is what we send to NotebookLM (or use directly with a TTS service).
    """
    page = PAGES[page_slug]
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    lang_instruction = (
        "in English" if lang == "en" else "en español (Spanish)"
    )

    prompt = f"""You are creating a podcast-style audio overview script {lang_instruction} for the ELIMFILTERS Knowledge System page about "{page['title']}".

The page covers industrial filtration engineering topics for heavy equipment fleet managers and technical engineers.

Create a 3-5 minute conversational audio overview that:
1. Opens with a brief intro (15 seconds): what this page covers and why it matters
2. Explains the core technical concept in accessible but precise language (60 seconds)
3. Covers the key failure mechanisms and operational impacts with real numbers (90 seconds)
4. Summarizes the industrial standards and ELIMFILTERS technologies that address this (60 seconds)
5. Closes with a practical takeaway for fleet managers (30 seconds)

Tone: Professional, technical, industrial — like a senior filtration engineer explaining to a fleet manager. Not marketing.
Format: Plain prose script suitable for text-to-speech. No [pause] markers or stage directions. No section headers.
Language: {lang_instruction}
Length: 400-550 words.

Write only the script text, nothing else."""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def generate_with_notebooklm(script: str, output_path: str, lang: str) -> bool:
    """
    Uses notebooklm-py to generate audio from script.
    Falls back to a simple TTS approach if NotebookLM is unavailable.
    """
    try:
        from notebooklm import NotebookLM
        nlm = NotebookLM()

        # Create a notebook with our script as source
        notebook = nlm.create_notebook(title=f"ELIMFILTERS Audio Overview")
        notebook.add_source_text(script)

        # Generate audio overview
        print(f"  Generating audio in NotebookLM ({lang})...")
        audio_url = notebook.generate_audio_overview()

        # Download the audio
        import urllib.request
        urllib.request.urlretrieve(audio_url, output_path)
        notebook.delete()
        return True

    except Exception as e:
        print(f"  NotebookLM unavailable ({e}), using Claude TTS fallback")
        return generate_with_tts_fallback(script, output_path)


def generate_with_tts_fallback(script: str, output_path: str) -> bool:
    """
    Fallback: uses a simple TTS approach.
    You can swap this for Google Cloud TTS, ElevenLabs, etc.
    """
    print("  TTS fallback: install a TTS library (gtts, elevenlabs, google-cloud-texttospeech)")
    print(f"  Script saved to: {output_path.replace('.mp3', '.txt')}")
    with open(output_path.replace(".mp3", ".txt"), "w") as f:
        f.write(script)
    return False


def upload_to_r2(local_path: str, key: str) -> str:
    """Upload MP3 to Cloudflare R2, return public URL."""
    if not all([R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY]):
        print("  R2 credentials not set. File saved locally only.")
        return ""

    s3 = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        config=Config(signature_version="s3v4"),
    )
    with open(local_path, "rb") as f:
        s3.upload_fileobj(
            f,
            R2_BUCKET,
            key,
            ExtraArgs={"ContentType": "audio/mpeg", "ACL": "public-read"},
        )
    public_url = f"https://pub-audio.elimfilters.com/{key}"
    print(f"  Uploaded: {public_url}")
    return public_url


def process_page(page_slug: str, lang: str, output_dir: Path) -> dict:
    page = PAGES[page_slug]
    filename = f"{page_slug}-{lang}.mp3"
    local_path = output_dir / filename
    r2_key = filename

    print(f"\n[{page_slug}] {page['title']} ({lang.upper()})")

    # Skip if already uploaded
    if local_path.exists():
        print(f"  Skipping: {filename} already exists locally")
        return {"slug": page_slug, "lang": lang, "status": "skipped"}

    # 1. Generate script with Claude
    print(f"  Generating script with Claude...")
    script = get_page_content_for_audio(page_slug, lang)
    print(f"  Script: {len(script.split())} words")

    # 2. Generate audio
    success = generate_with_notebooklm(script, str(local_path), lang)

    if not success:
        return {"slug": page_slug, "lang": lang, "status": "script_only"}

    # 3. Upload to R2
    url = upload_to_r2(str(local_path), r2_key)

    return {"slug": page_slug, "lang": lang, "status": "done", "url": url}


def main():
    parser = argparse.ArgumentParser(description="Generate audio overviews for Knowledge System pages")
    parser.add_argument("--page", help="Single page slug (e.g. lube-oil-systems)")
    parser.add_argument("--all", action="store_true", help="Process all pages")
    parser.add_argument("--lang", choices=["en", "es", "both"], default="both", help="Language")
    parser.add_argument("--output", default="./audio_output", help="Local output directory")
    args = parser.parse_args()

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    langs = ["en", "es"] if args.lang == "both" else [args.lang]
    pages_to_process = list(PAGES.keys()) if args.all else ([args.page] if args.page else [])

    if not pages_to_process:
        print("Specify --page <slug> or --all")
        print("\nAvailable pages:")
        for slug in PAGES:
            print(f"  {slug}")
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
            result = process_page(page_slug, lang, output_dir)
            results.append(result)
            time.sleep(2)  # Rate limiting

    # Summary
    print("\n=== Summary ===")
    done = [r for r in results if r["status"] == "done"]
    scripts = [r for r in results if r["status"] == "script_only"]
    skipped = [r for r in results if r["status"] == "skipped"]
    print(f"  Audio generated: {len(done)}")
    print(f"  Scripts only:    {len(scripts)}")
    print(f"  Skipped:         {len(skipped)}")

    # Save manifest
    manifest_path = output_dir / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nManifest saved: {manifest_path}")


if __name__ == "__main__":
    main()
