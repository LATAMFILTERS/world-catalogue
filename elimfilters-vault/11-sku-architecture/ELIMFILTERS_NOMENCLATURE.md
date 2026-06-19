---
title: ELIMFILTERS SKU Nomenclature
type: taxonomy
tags: [sku, architecture, part-numbers, catalog]
---

# ELIMFILTERS SKU Nomenclature Architecture

La arquitectura de códigos (SKU) de ELIMFILTERS no es una simple numeración secuencial; es un sistema de taxonomía técnica diseñado para identificar inmediatamente el dominio de fluido, la aplicación y la jerarquía del producto dentro del Sistema de Protección de Activos.

## Prefijos de Dominio (Fluid Domain Prefixes)

El sistema de códigos inicia siempre con un prefijo alfabético (generalmente 2 letras) que indica de inmediato el tipo de elemento a proteger.

* **`EA` (Elimfilters Air):** Sistemas de Admisión de Aire (Primarios y Secundarios). *Defensa contra desgaste abrasivo por Sílice.*
* **`EO` (Elimfilters Oil):** Sistemas de Lubricación (Aceite de motor, transmisión). *Control de hollín, metales de desgaste y degradación de aceite.*
* **`EF` (Elimfilters Fuel):** Sistemas de Inyección de Combustible (Diésel, Gasolina). *Defensa HPCR contra agua emulsionada y partículas submicrónicas.*
* **`EH` (Elimfilters Hydraulic):** Sistemas Hidráulicos y de Alta Presión. *Control de tolerancias críticas en válvulas y bombas.*
* **`EC` (Elimfilters Cabin):** Sistemas de Aire Acondicionado / Cabina. *Protección respiratoria del operador (PM2.5).*
* **`EW` (Elimfilters Water / Coolant):** Sistemas de Refrigeración. *Tratamiento químico anticorrosivo.*

## Prefijos de Sistemas y Ensambles (Housing & Assembly Prefixes)

Cuando el componente no es un repuesto consumible (elemento), sino una estructura, housing o ensamble completo:

* **`EAF` (Elimfilters Air Filter):** Ensambles completos de filtración de aire (carcasas).
* **`EFH` (Elimfilters Fuel Housing):** Turbinas separadoras de agua (Serie FH/FG) y bases portafiltros.

## Prefijos de Sistemas Comerciales Consolidados

Para soluciones de consolidación de inventario y kits completos:

* **`DUR` (DURATECH):** Kits completos de protección de activos (Ej: DUR-1000 que incluye EA, EO, EF, EH para un activo específico).
* **`MAR` (MARINECLEAN):** Sistemas o elementos específicos desarrollados exclusivamente para el ambiente marítimo de alta salinidad.

## Arquitectura del Número de Base (Base Numbering)

El cuerpo numérico del SKU (los dígitos que siguen al prefijo) generalmente está diseñado bajo dos metodologías:
1. **Nomenclatura Cruzada Homologada (Cross-Reference Alignment):** Para facilitar la transición desde el status quo del cliente, el número base suele hacer eco de los estándares industriales globales (Fleetguard, Donaldson, Baldwin). Ej: Si el mercado conoce la aplicación como *AF25270*, nuestro SKU es **EA-25270**.
2. **Nomenclatura Propietaria de Precisión (Precision Engineering Code):** Para desarrollos internos de tecnologías patentadas (como elementos MACROCORE o NANOFORCE especializados), se utiliza una codificación métrica secuencial.

### Clasificación de Carga Operativa: Heavy Duty (HD) vs Light Duty (LD)
La construcción del SKU varía estructuralmente dependiendo del nivel de exigencia operativa del activo:

* **Heavy Duty (HD) - Maquinaria Pesada, Minería, Transporte y Marina:**
  * **Construcción:** Se utilizan los prefijos estándar (`EA`, `EO`, `EF`, `EH`) seguidos de la nomenclatura cruzada industrial pesada (basada en Fleetguard, Donaldson, Baldwin o números de parte de fabricantes como CAT/Cummins/John Deere).
  * **Ejemplo HD:** `EA-25270` (donde 25270 hace eco a un filtro de aire de alta capacidad para un camión pesado o tractor).

* **Light Duty (LD) - Automotriz, Flotillas Ligeras y Pickups:**
  * **Construcción:** Se utilizan los prefijos estándar (`EA`, `EO`, `EF`, `EC`) pero la base numérica se alínea con los estándares del mercado automotriz (generalmente ecos de WIX, Fram, o los últimos dígitos del OEM de Toyota/Ford/Nissan). Para evitar colisiones numéricas con la línea HD, los códigos LD suelen tener estructuras numéricas más cortas o específicas del mercado automotriz.
  * **Ejemplo LD:** `EO-51348` (haciendo eco a un filtro de aceite estándar de alto flujo para motores de vehículos ligeros o pickups).

### Estructura de Sufijos (Suffix Modifiers)
Si un elemento posee características especiales o modificaciones de medio filtrante:
* **`-S` (Synthetic):** Medio 100% sintético (Ej: NANOFORCE).
* **`-M` (Microglass):** Medio de fibra de vidrio para aplicaciones hidráulicas absolutas.
* **`-K` (Kit):** Indica que la caja incluye empaques, orings u otros accesorios críticos para la instalación hermética.

## Directiva Comercial y Técnica

**Ningún técnico, ingeniero o asesor comercial de ELIMFILTERS debe hablar en códigos de la competencia.** 
La transición cognitiva del cliente ocurre en el momento en que deja de referirse a sus repuestos con códigos de otras marcas y empieza a utilizar el sistema de taxonomía de ELIMFILTERS (`EA`, `EO`, `EF`). Al usar nuestra nomenclatura, el cliente reconoce a ELIMFILTERS como el Arquitecto de su Sistema de Protección de Activos.
