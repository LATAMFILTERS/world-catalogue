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

status, ctype, payload = request(CARD, headers={"Accept": "application/json"})
if status != 200 or "json" not in ctype.lower() or len(payload) > 131072:
    raise SystemExit(f"FAIL: public card status={status}, content-type={ctype}, bytes={len(payload)}")
try:
    card=json.loads(payload)
except ValueError as exc:
    raise SystemExit(f"FAIL: invalid public card JSON: {exc}")
info=card.get("serverInfo") or {}
if info.get("name") != "elimfilters-governed-operations" or info.get("version") != "1.0.0":
    raise SystemExit("FAIL: public card does not identify the actual MCP server")
if (card.get("transport") or {}).get("endpoint") != MCP:
    raise SystemExit("FAIL: public card transport does not match actual MCP endpoint")
if not (card.get("authentication") or {}).get("required") is True:
    raise SystemExit("FAIL: card does not declare required authentication")
print("PASS: MCP public server card HTTP 200, JSON, expected identity/endpoint, auth required")

probe=json.dumps({"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}).encode()
status, ctype, body = request(MCP, data=probe, headers={
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "ELIMFILTERS-MCP-Anonymous-Deny-Audit/1.0",
})
if status != 401:
    raise SystemExit(f"FAIL: MCP anonymous tools/list returned HTTP {status}, expected 401")
print("PASS: MCP anonymous tools/list rejected HTTP 401; no token sent")
