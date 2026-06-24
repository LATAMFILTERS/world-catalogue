#!/usr/bin/env python3
"""
ELIMFILTERS Competitive Intelligence Ingestion Pipeline
Extracts structured intel from NotebookLM notebooks and pushes to Hermes.

Usage:
  # Ingest a notebook by ID
  python ingest_intel.py --notebook "MY NOTEBOOK TITLE"

  # Ingest raw text/URL manually
  python ingest_intel.py --text "Donaldson announces new DuraMax..." --brand donaldson

  # Ingest a PDF
  python ingest_intel.py --pdf ~/Downloads/fleetguard_catalog_2026.pdf --brand fleetguard

  # List current intel in Hermes
  python ingest_intel.py --list

Setup:
  pip install notebooklm-py playwright requests PyMuPDF
  playwright install chromium
  export HERMES_API=https://your-render-app.onrender.com
  export INTEL_ADMIN_KEY=elim2026intel  # or your custom key
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

import requests

HERMES_API = os.environ.get("HERMES_API", "http://localhost:8080")
INTEL_ADMIN_KEY = os.environ.get("INTEL_ADMIN_KEY")
HEADERS = {"x-intel-key": INTEL_ADMIN_KEY, "Content-Type": "application/json"}


def ensure_table():
    r = requests.post(f"{HERMES_API}/api/intel/migrate", timeout=10)
    if r.status_code == 200:
        print("✓ Intel table ready")
    else:
        print(f"⚠ Migrate failed: {r.text}")


def extract_and_ingest(raw_text: str, source_url: str = None, brand: str = None, source_type: str = "manual"):
    """Send raw text to Hermes for Claude extraction, then ingest results."""
    print(f"  Extracting intel ({len(raw_text)} chars)...")
    r = requests.post(
        f"{HERMES_API}/api/intel/extract",
        json={"raw_text": raw_text, "source_url": source_url, "brand": brand, "admin_key": INTEL_ADMIN_KEY},
        timeout=30,
    )
    if r.status_code != 200:
        print(f"  ✗ Extraction failed: {r.text}")
        return []

    extracted = r.json().get("extracted", [])
    print(f"  ✓ Extracted {len(extracted)} intelligence items")

    ingested = []
    for item in extracted:
        resp = requests.post(
            f"{HERMES_API}/api/intel/ingest",
            headers=HEADERS,
            json={
                "source_type": source_type,
                "brand": item.get("brand", brand or "general"),
                "category": item.get("category", "market"),
                "title": item["title"],
                "summary": item["summary"],
                "raw_content": raw_text[:2000],
                "source_url": source_url,
                "priority": item.get("priority", 5),
            },
            timeout=10,
        )
        if resp.status_code == 200:
            print(f"  ✓ Ingested: [{item.get('brand','?').upper()}] {item['title']}")
            ingested.append(item)
        else:
            print(f"  ✗ Ingest failed: {resp.text}")
    return ingested


def ingest_from_notebooklm(notebook_title: str):
    """Extract all Q&A and summaries from a NotebookLM notebook."""
    try:
        from notebooklm import NotebookLM
    except ImportError:
        print("notebooklm-py not installed: pip install notebooklm-py playwright")
        sys.exit(1)

    print(f"Connecting to NotebookLM notebook: '{notebook_title}'...")
    nlm = NotebookLM()

    # Find notebook by title
    notebooks = nlm.list_notebooks()
    target = next((n for n in notebooks if notebook_title.lower() in n.title.lower()), None)
    if not target:
        print(f"Notebook not found. Available notebooks:")
        for n in notebooks:
            print(f"  - {n.title}")
        sys.exit(1)

    notebook = nlm.get_notebook(target.id)

    # Extract content: summary + Q&A
    print("  Extracting notebook overview...")
    overview = notebook.get_overview() or ""

    print("  Generating Q&A from notebook...")
    qa_text = ""
    questions = [
        "What are the key product specifications and changes?",
        "What pricing or market positioning changes are mentioned?",
        "What technical standards or certifications are referenced?",
        "What are the implications for the filtration market?",
        "What competitive advantages or weaknesses are mentioned?",
    ]
    for q in questions:
        try:
            answer = notebook.ask(q)
            qa_text += f"Q: {q}\nA: {answer}\n\n"
            time.sleep(1)
        except Exception as e:
            print(f"  ⚠ Q&A failed for '{q}': {e}")

    full_text = f"NOTEBOOK OVERVIEW:\n{overview}\n\nQ&A ANALYSIS:\n{qa_text}"

    brand_hint = None
    for brand in ["donaldson", "fleetguard", "mann", "wix", "baldwin"]:
        if brand in notebook_title.lower() or brand in overview.lower():
            brand_hint = brand
            break

    return extract_and_ingest(
        raw_text=full_text,
        source_url=f"notebooklm://notebook/{target.id}",
        brand=brand_hint,
        source_type="notebooklm",
    )


def ingest_from_pdf(pdf_path: str, brand: str = None):
    """Extract text from PDF and ingest."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("PyMuPDF not installed: pip install PyMuPDF")
        sys.exit(1)

    print(f"Extracting PDF: {pdf_path}")
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    print(f"  Extracted {len(text)} chars from {doc.page_count} pages")
    return extract_and_ingest(
        raw_text=text[:8000],  # First 8000 chars
        source_url=f"file://{Path(pdf_path).name}",
        brand=brand,
        source_type="pdf",
    )


def ingest_from_text(text: str, source_url: str = None, brand: str = None):
    """Ingest raw text directly."""
    return extract_and_ingest(
        raw_text=text,
        source_url=source_url,
        brand=brand,
        source_type="manual",
    )


def list_intel():
    r = requests.get(f"{HERMES_API}/api/intel/list?key={INTEL_ADMIN_KEY}", timeout=10)
    if r.status_code != 200:
        print(f"Failed: {r.text}")
        return
    intel = r.json().get("intel", [])
    if not intel:
        print("No intelligence entries yet.")
        return
    print(f"\n{'ID':>4}  {'BRAND':<12} {'CATEGORY':<16} {'PRI':>3}  TITLE")
    print("-" * 80)
    for item in intel:
        active = "✓" if item["active"] else "✗"
        print(f"{item['id']:>4}  {(item['brand'] or 'general'):<12} {item['category']:<16} {item['priority']:>3} {active}  {item['title'][:50]}")
    print(f"\nTotal: {len(intel)} entries")


def main():
    parser = argparse.ArgumentParser(description="ELIMFILTERS Competitive Intelligence Ingestion")
    parser.add_argument("--notebook", help="NotebookLM notebook title to extract")
    parser.add_argument("--pdf", help="PDF file path to extract")
    parser.add_argument("--text", help="Raw text to analyze and ingest")
    parser.add_argument("--url", help="Source URL (for metadata)")
    parser.add_argument("--brand", help="Brand hint (donaldson|fleetguard|mann|wix|baldwin)")
    parser.add_argument("--list", action="store_true", help="List current intelligence entries")
    parser.add_argument("--migrate", action="store_true", help="Create/update DB table")
    args = parser.parse_args()

    if args.migrate:
        ensure_table()
        return

    if args.list:
        list_intel()
        return

    ensure_table()

    if args.notebook:
        ingest_from_notebooklm(args.notebook)
    elif args.pdf:
        ingest_from_pdf(args.pdf, brand=args.brand)
    elif args.text:
        ingest_from_text(args.text, source_url=args.url, brand=args.brand)
    else:
        parser.print_help()
        print("\nExamples:")
        print("  python ingest_intel.py --notebook 'Donaldson 2026 Catalog'")
        print("  python ingest_intel.py --pdf ~/Downloads/fleetguard.pdf --brand fleetguard")
        print("  python ingest_intel.py --text 'Mann+Hummel announced...' --brand mann")
        print("  python ingest_intel.py --list")


if __name__ == "__main__":
    main()
