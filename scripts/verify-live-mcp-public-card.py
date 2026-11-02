#!/usr/bin/env python3
"""Production checks: public metadata and private MCP authorization. No credentials used."""
import json
import urllib.error
import urllib.request

CARD = "https://elimfilters.com/.well-known/mcp/server-card.json"
MCP = "https://crm-api.elimfilters.com/mcp"
def request(url, *, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return res.status, res.headers.get("content-type", ""), res.read(131073)
    except urllib.error.HTTPError as exc:
        return exc.code, exc.headers.get("content-type", ""), exc.read(4096)

card_errors = []
status, ctype, payload = request(CARD, headers={"Accept": "application/json"})
if status != 200 or "json" not in ctype.lower() or len(payload) > 131072:
    card_errors.append(f"public card status={status}, content-type={ctype}, bytes={len(payload)}")
else:
    try:
        card = json.loads(payload)
        info = card.get("serverInfo") or {}
        if info.get("name") != "elimfilters-governed-operations" or info.get("version") != "1.0.0":
            card_errors.append("card identity/version mismatch")
        if (card.get("transport") or {}).get("endpoint") != MCP:
            card_errors.append("card MCP transport endpoint mismatch")
        if (card.get("authentication") or {}).get("required") is not True:
            card_errors.append("card missing required authentication declaration")
    except (ValueError, AttributeError) as exc:
        card_errors.append(f"invalid public card JSON: {type(exc).__name__}")
if not card_errors:
    print("PASS: public card HTTP 200, JSON, identity, endpoint, authentication requirement")
else:
    for msg in card_errors:
        print("FAIL: " + msg)
    # Safe diagnostic: compare only status and content type from direct Render origin.
    origin_status, origin_type, _ = request(
        "https://elimfilters-frontend.onrender.com/.well-known/mcp/server-card.json",
        headers={"Accept": "application/json"})
    print(f"DIAGNOSTIC: Render origin card status={origin_status}, content-type={origin_type}")

probe=json.dumps({"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}).encode()
status, ctype, body = request(MCP, data=probe, headers={
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "ELIMFILTERS-MCP-Anonymous-Deny-Audit/1.0",
})
if status != 401:
    print(f"FAIL: MCP anonymous tools/list returned HTTP {status}, expected 401")
    card_errors.append(f"MCP anonymous access HTTP {status} instead of 401")
else:
    print("PASS: MCP anonymous tools/list rejected HTTP 401; no token sent")
if card_errors:
    raise SystemExit(1)
