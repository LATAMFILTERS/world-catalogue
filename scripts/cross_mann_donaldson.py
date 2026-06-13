#!/usr/bin/env python3
"""
cross_mann_donaldson.py
=======================
Cruza MANN OEM numbers con OEM codes de productos Donaldson.
Resultado: tabla mann_donaldson_matches (ejecutado server-side via API).

Uso:
    python cross_mann_donaldson.py [--segment HD|LD|MIXED]
"""

import json
import sys
import urllib.request
import urllib.error

API_BASE = "https://elimfilters-search-pro.onrender.com"
API_KEY  = "elim2026"


def api_post(path, payload, timeout=300):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(
        f"{API_BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    segment = None
    if "--segment" in sys.argv:
        idx = sys.argv.index("--segment")
        segment = sys.argv[idx + 1].upper()

    label = f" [{segment}]" if segment else " [ALL]"
    print(f"Building mann_donaldson_matches{label} (server-side)...")

    payload = {"key": API_KEY}
    if segment:
        payload["segment"] = segment

    try:
        result = api_post("/api/oem/build-donaldson-matches", payload)
    except urllib.error.HTTPError as e:
        print(f"ERROR {e.code}: {e.read().decode()}")
        sys.exit(1)

    if not result.get("success"):
        print(f"ERROR: {result.get('error')}")
        sys.exit(1)

    print(f"\n✅ mann_donaldson_matches created")
    print(f"   Total rows           : {int(result['total']):,}")
    print(f"   Unique MANN parts    : {int(result['mann_u']):,}")
    print(f"   Unique DON parts     : {int(result['don_u']):,}")


if __name__ == "__main__":
    main()
