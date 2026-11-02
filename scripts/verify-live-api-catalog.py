#!/usr/bin/env python3
"""Fail-closed live catalog verification; never send credentials to CRM."""
import json
import urllib.request
import urllib.error
CATALOG="https://elimfilters.com/.well-known/api-catalog"
MCP="https://crm-api.elimfilters.com/mcp"
CARD="https://elimfilters.com/.well-known/mcp/server-card.json"
def request(url, accept="application/json", data=None):
    req=urllib.request.Request(url, data=data, method="POST" if data is not None else "GET",
        headers={"Accept":accept,"Content-Type":"application/json","User-Agent":"ELIMFILTERS-API-Catalog-Audit/1.0"})
    try:
        with urllib.request.urlopen(req,timeout=20) as res:
            return res.status,res.headers.get("content-type",""),res.read(131072)
    except urllib.error.HTTPError as err:
        return err.code,err.headers.get("content-type",""),err.read(2048)
status,mime,body=request(CATALOG,"application/linkset+json")
if status!=200 or "application/linkset+json" not in mime.lower():
    raise SystemExit(f"FAIL: catalog HTTP {status}, MIME {mime}")
catalog=json.loads(body)
entries=catalog.get("linkset",[])
if len(entries)!=1 or entries[0].get("anchor")!=MCP:
    raise SystemExit("FAIL: catalog does not reference actual governed MCP endpoint")
docs=entries[0].get("service-doc",[])
if len(docs)!=1 or docs[0].get("href")!=CARD:
    raise SystemExit("FAIL: catalog missing the public MCP server card")
status,mime,body=request(CARD)
if status!=200 or "json" not in mime.lower():
    raise SystemExit(f"FAIL: public MCP server card HTTP {status}")
card=json.loads(body)
if (card.get("transport") or {}).get("endpoint")!=MCP:
    raise SystemExit("FAIL: server card's MCP transport disagrees with catalog")
probe=json.dumps({"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}).encode()
status,mime,body=request(MCP,data=probe)
if status!=401:
    raise SystemExit(f"FAIL: anonymous MCP HTTP {status}; expected 401")
print("PASS: API Catalog HTTP 200 application/linkset+json; real MCP endpoint documented; anonymous tools/list HTTP 401")
