# ELIMFILTERS CATALOG GOVERNANCE ADDENDUM
Status: APPROVED
Date: 2026-06-17

## UNIVERSOS

ELIMFILTERS opera con dos universos separados:

- HD Universe
- LD Universe

Ambos viven dentro de la misma galaxia ELIMFILTERS, pero no se mezclan.

---

## LD UNIVERSE

Master Source:

MANN-FILTER

Donaldson NO alimenta LD.

Fleetguard NO alimenta LD.

Los códigos MANN LD generan SKU ELIMFILTERS usando la regla oficial:

1. Eliminar letras.
2. Eliminar espacios.
3. Eliminar slashes.
4. Eliminar símbolos.
5. Conservar solo números.
6. Construir SKU LD según prefijo de familia.

Example:

MANN:

HU 711/51 X

Numbers:

71151

SKU:

EL851151

---

## HD UNIVERSE

Master Source:

DONALDSON

MANN HD alimenta Donaldson.

Fleetguard alimenta Donaldson.

OEM alimenta Donaldson.

Si existe homólogo Donaldson:

Donaldson gana.

Si NO existe homólogo Donaldson:

Fleetguard puede usarse como codigo_base temporal o definitivo para crear producto ELIMFILTERS, sujeto a revisión.

---

## FLEETGUARD ROLE

Fleetguard NO reemplaza a Donaldson.

Fleetguard NO reemplaza a MANN LD.

Fleetguard funciona como:

- Enrichment source
- Search alias
- Cross reference source
- Equipment enrichment source
- Engine enrichment source
- OEM enrichment source
- Gap filler when Donaldson has no equivalent

---

## SEARCH RULE

Los códigos Fleetguard jamás deben eliminarse de:

- competitor_codes
- brand_crossrefs
- cross_reference_master
- search index
- AI catalog search

Example:

LF9000

must resolve to:

EL89000

even if Fleetguard is not master source.

---

## FINAL RULE

HD:

MANN HD / Fleetguard / OEM
? Donaldson
? ELIMFILTERS

LD:

MANN LD
? ELIMFILTERS LD SKU

Donaldson does not feed LD.
Fleetguard does not feed LD.
