# CROSS_REFERENCE_CLASSIFICATION_STANDARD.md

## Propósito

Definir las reglas oficiales de clasificación para OEM, Cross References y Alternatives dentro del ecosistema ELIMFILTERS.

---

# Principio Fundamental

OEM y Cross Reference NO son lo mismo.

Un mismo código puede existir como:

* Número OEM original
* Equivalencia aftermarket
* Alternativa comercial

Cada relación debe almacenarse explícitamente.

---

# Clasificaciones Oficiales

## OEM

Representa un número de parte emitido por el fabricante original del equipo.

Ejemplos:

* Caterpillar
* Cummins
* Deutz
* John Deere
* Komatsu
* Volvo
* Scania
* Mercedes-Benz
* Mack
* DAF
* MAN
* Iveco
* Perkins
* Kubota
* JCB
* Liebherr
* Claas
* Detroit Diesel
* Hino
* Isuzu
* New Holland
* Case

relationship_type:

OEM

---

## CROSS_REFERENCE

Representa una equivalencia comercial aftermarket.

Ejemplos:

* Donaldson
* Fleetguard
* Baldwin
* WIX
* MANN-FILTER
* Mahle
* Hengst
* Bosch
* Fram
* Luber-Finer
* Sakura
* Filtron

relationship_type:

CROSS_REFERENCE

---

## ALTERNATIVE

Representa una alternativa compatible validada por ELIMFILTERS.

No implica equivalencia exacta OEM.

relationship_type:

ALTERNATIVE

---

## REVIEW_REQUIRED

Relación detectada automáticamente pero pendiente de validación.

No puede utilizarse para generar catálogos finales.

relationship_type:

REVIEW_REQUIRED

---

# Fuentes de Datos

## OEM Prioridad

1. MANN OEM
2. Donaldson OEM
3. Fleetguard OEM
4. Catálogos OEM oficiales

---

## Cross References

* oilfilter-crossreference.com
* airfilter-crossreference.com
* fuelfilter-crossreference.com
* Donaldson
* Fleetguard
* Baldwin
* WIX
* MANN

---

# Reglas de Construcción

## LD

Autoridades de referencia:

- **MANN**: Autoridad Única para el Catálogo Liviano y Europeo (`mann_catalog_ld.jsonl`).
- **FRAM**: Autoridad Única para el Catálogo Liviano y Americano (en base al catálogo WIX anexo).

---

## HD

Autoridad única:

Donaldson

Fleetguard sólo puede actuar como enriquecimiento o excepción documentada.

---

# Restricciones

Nunca convertir automáticamente:

CROSS_REFERENCE → OEM

Nunca convertir automáticamente:

ALTERNATIVE → OEM

Nunca convertir automáticamente:

REVIEW_REQUIRED → OEM

Toda promoción de categoría requiere evidencia documental.

---

# Estado Oficial ELIMFILTERS

Donaldson = HD Authority (Autoridad Única para el Catálogo Pesado e Industrial)

MANN = LD Authority (Autoridad Única para el Catálogo Liviano y Europeo)

FRAM = LD Authority (Autoridad Única para el Catálogo Liviano y Americano, en base a catálogo WIX anexo)

Fleetguard = Enrichment Layer (Capa de Enriquecimiento Secundario)

OEM ≠ Cross Reference ≠ Alternative
