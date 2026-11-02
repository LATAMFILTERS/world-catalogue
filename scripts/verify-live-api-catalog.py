#!/usr/bin/env python3
"""Validate the public RFC 9727 catalog and its published read-only API."""
import json
import urllib.request
import urllib.error

CATALOG="https://elimfilters.com/.well-known/api-catalog"
API="https://elimfilters.com/api/agents/public-discovery/"
def get(url,accept):
    req=urllib.request.Request(url,headers={"Accept":accept,"User-Agent":"ELIMFILTERS-API-Catalog-Audit/1.0"})
    try:
        with urllib.request.urlopen(req,timeout=20) as response:
            return response.status,response.headers.get("content-type",""),response.read(131072)
    except urllib.error.HTTPError as exc:
        return exc.code,exc.headers.get("content-type",""),exc.read(2048)
status,ctype,body=get(CATALOG,"application/linkset+json")
if status!=200 or "application/linkset+json" not in ctype.lower():
    raise SystemExit(f"FAIL: API Catalog status={status}, mime={ctype}; expected 200 application/linkset+json")
catalog=json.loads(body)
assert len(catalog["linkset"])==1
assert catalog["linkset"][0]["anchor"]==API
status,ctype,body=get(API,"application/json")
if status!=200 or "json" not in ctype.lower():
    raise SystemExit(f"FAIL: existing public API endpoint status={status} mime={ctype}")
api=json.loads(body)
if api.get("agent")!="public-discovery" or api.get("mode")!="read-only":
    raise SystemExit("FAIL: endpoint is not the expected public read-only discovery API")
print("PASS: RFC 9727 Linkset HTTP 200, correct MIME, real public read-only API HTTP 200")
