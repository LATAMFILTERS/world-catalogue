"""
apply_crossrefs.py — Merge crossref progress JSON into results file

Usage:
    python3 apply_crossrefs.py hydraulic
    python3 apply_crossrefs.py lube

Reads:  donaldson_{cat}_crossref_progress.json  (dict: part → brand_crossrefs)
Updates: donaldson_{cat}_results.json            (list of products)
Then runs generate_descriptions.py on that category.
"""

import json
import os
import sys
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

def apply(cat):
    progress_file = f"donaldson_{cat}_crossref_progress.json"
    results_file  = f"donaldson_{cat}_results.json"

    if not os.path.exists(progress_file):
        logging.error(f"Progress file not found: {progress_file}")
        sys.exit(1)
    if not os.path.exists(results_file):
        logging.error(f"Results file not found: {results_file}")
        sys.exit(1)

    with open(progress_file, encoding="utf-8") as f:
        progress = json.load(f)
    logging.info(f"Progress: {len(progress)} parts with crossrefs")

    with open(results_file, encoding="utf-8") as f:
        products = json.load(f)
    logging.info(f"Results: {len(products)} products")

    updated = 0
    for p in products:
        part = p.get("part_number", "")
        if part in progress:
            p["brand_crossrefs"] = progress[part]
            updated += 1
        elif "brand_crossrefs" not in p or p.get("brand_crossrefs") is None:
            p["brand_crossrefs"] = {}

    logging.info(f"Updated brand_crossrefs: {updated}/{len(products)}")

    tmp = results_file + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    os.replace(tmp, results_file)
    logging.info(f"Saved → {results_file}")

    # Run generate_descriptions.py on this category
    logging.info("Running generate_descriptions.py ...")
    import subprocess
    result = subprocess.run(
        [sys.executable, "generate_descriptions.py", cat],
        capture_output=False
    )
    if result.returncode != 0:
        logging.error("generate_descriptions.py failed")
        sys.exit(1)
    logging.info("Done.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 apply_crossrefs.py <category>")
        sys.exit(1)
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    apply(sys.argv[1])
