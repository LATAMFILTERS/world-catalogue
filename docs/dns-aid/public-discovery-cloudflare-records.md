# DNS-AID public-discovery publication (Cloudflare)

Publish **only after** `https://elimfilters.com/.well-known/agent-registry.json`
and `https://elimfilters.com/.well-known/public-discovery-agent.json` return
HTTP 200 and the registry lists `public-discovery` only.

Add records in the existing Cloudflare **elimfilters.com** zone:

| Type | Name | Value / Target | Priority | Parameters |
|---|---|---|---|---|
| TXT | `_index._agents` | `agents=public-discovery:https` | — | DNS only |
| SVCB | `_public-discovery._https._agents` | `elimfilters.com` | 1 | `alpn=h2`, `port=443` if supported |

Do not replace the existing `_index._agents` SVCB; the new TXT RR can
coexist at the same owner name. Never publish private CRM agents or MCP tokens.

Following DNSSEC validation for both records (resolver AD=true), run
`node scripts/audit-dns-aid-readonly.mjs`. The public registry stays
`dnsAidAdvertised:false` until signed DNS records are observed. That flag
requires a **separate** reviewed publication after verification.

Public endpoint `https://elimfilters.com/.well-known/public-discovery-agent.json`
is a static HTTPS resource discovery document, **not** a callable A2A/MCP
agent. DNS does not encode the URL path: the registry and advertised document
supply it.
