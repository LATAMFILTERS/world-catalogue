# Equipment/vehicle free-text search benchmark (read-only EXPLAIN ANALYZE)

Generated: 2026-08-12T16:03:09.102Z

Reproduces the exact SQL shape of `/api/search/equipment` (server-original.js).

| Scenario | Wall ms | Exec ms | Top plan node | Rows | Shared read blocks |
|---|---|---|---|---|---|
| Freightliner + Detroit Diesel Series 60 + 2010 | 240 | 98.4 | Limit | 30 | 157 |
| Caterpillar | 237 | 151.5 | Limit | 30 | 438 |
| Volvo truck | 2565 | 2475.8 | Limit | 30 | 1419 |
| Mack | 610 | 524.3 | Limit | 30 | 23 |
| Komatsu | 146 | 59.8 | Limit | 30 | 228 |
| Toyota pickup | 1458 | 1371.0 | Limit | 30 | 8 |
| Toyota forklift | 2596 | 2510.1 | Limit | 0 | 3 |
| Nissan pickup | 2624 | 2536.5 | Limit | 0 | 7 |
| BMW | 177 | 89.4 | Limit | 30 | 0 |
| Honda | 209 | 121.8 | Limit | 30 | 4 |
| Búsqueda por motor (SERIES 60) | 131 | 29.1 | Limit | 30 | 0 |
| Búsqueda marca/modelo/año (Freightliner Cascadia 2015) | 2361 | 2267.5 | Limit | 30 | 0 |
