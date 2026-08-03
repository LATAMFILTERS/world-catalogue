# ELIMFILTERS Bot Protocol Consistency Matrix

## Ownership

| Capability | Owner | Rule |
|---|---|---|
| WhatsApp webhook and Meta media download | `elimfilters-whatsapp-bot` | Channel adapter only |
| Diagnostic conversation | `world-catalogue` / Part Search endpoint | Central source of truth |
| Memory and state | `world-catalogue` | Isolated by channel + conversation |
| Filter reference extraction from text | `world-catalogue` | Never infer missing characters |
| Filter image analysis | `world-catalogue` endpoint | Vision result must enter the same validation flow |
| PostgreSQL catalog lookup | `world-catalogue` | Only validated ELIMFILTERS products may be returned |
| Final response formatting | `world-catalogue` | Channel-specific formatting after guardrails |

## Diagnostic sequence

| Step | Required data | Completion rule | Next action |
|---|---|---|---|
| 1 | Equipment | Brand, model, motor and year when applicable | Ask operating condition |
| 2 | Symptom | Exact symptom reported by customer | Ask when it occurs |
| 3 | Operating condition | Cold, hot, idle, load or other | Ask duration |
| 4 | Duration | Time since symptom began | Ask operating context |
| 5 | Operating context | Road, mining, construction, agriculture, industrial or other | Ask impact |
| 6 | Impact | Downtime, power loss, consumption, damage risk or other | Ask installed filter |
| 7 | Installed filter | Type, brand and printed reference; written or image-derived | Query catalog |
| 8 | Catalog validation | Match in `elimfilters_catalog` | Return validated SKU or catalog gap |

## Installed-filter scenarios

| Customer input | System action | Database action | Allowed response |
|---|---|---|---|
| Full written code | Normalize exact reference | Search SKU, base code and cross references | Validated ELIMFILTERS match only |
| Partial code | Ask for full printed reference | No lookup | No recommendation |
| Legible filter photo | Extract exact printed code and confidence | Search normalized reference | Confirm reading and return validated match |
| Blurred photo | Request a closer frontal photo | No lookup | No recommendation |
| Several visible codes | Present extracted candidates for confirmation | Do not select automatically | Wait for confirmation |
| Customer does not know | Continue with equipment data | Application lookup only when exact equipment is complete | No invented SKU |
| Code conflicts with equipment | Flag conflict | Do not return product as confirmed | Request VIN, ESN or exact application data |
| Multiple catalog matches | Filter by equipment, motor, year and filter type | Return only supported match(es) | Explain remaining ambiguity |
| No catalog match | Record catalog gap | `evidence.validated=false` | State that no confirmed equivalence exists |

## State-control rules

| Condition | Required behavior |
|---|---|
| New explicit problem reported | Reset only prior diagnostic fields; retain channel identity |
| Short answer to current question | Continue active diagnostic |
| Completed diagnostic followed by new symptom | Start a new diagnostic |
| Filter question answered | Do not ask it again |
| Database timeout or error | Do not convert failure into "not found"; report temporary lookup failure internally and avoid recommendation |
| Five unresolved attempts | Handoff to `support@elimfilters.com` |

## Performance boundaries

| Endpoint | Query policy |
|---|---|
| `/api/autocomplete` | Prefix search only on `sku` and `codigo_base`; maximum 8 rows; no JSONB/text cross-reference scans |
| `/api/bot/protocol` | Diagnostic and exact-reference operations only |
| `/api/bot/protocol/image` | Vision extraction followed by central protocol validation |

Any change that violates this matrix requires an explicit architectural decision before implementation.
