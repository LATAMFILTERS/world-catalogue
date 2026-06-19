---
title: ELIMFILTERS SKU Nomenclature
type: taxonomy
tags: [sku, architecture, part-numbers, catalog]
---

# ELIMFILTERS SKU Nomenclature Architecture

La arquitectura de códigos (SKU) de ELIMFILTERS es un sistema de taxonomía técnica y de precisión diseñado para identificar de forma inmediata el dominio de fluido, la aplicación (Heavy Duty vs Light Duty) y el origen cruzado del componente dentro del Sistema de Protección de Activos.

## Prefijos de Dominio por Carga Operativa

El sistema de códigos inicia siempre con un prefijo alfanumérico (3 caracteres) que indica el tipo de elemento y el nivel de exigencia (Heavy Duty o Light Duty).

### HEAVY DUTY (HD) - Maquinaria Pesada, Minería, Transporte y Marina
Para equipos que operan bajo condiciones extremas, los prefijos son:
* **`EA1`** (Air Filter): Filtros de aire primarios y secundarios.
* **`EL8`** (Oil/Lube Filter): Filtros de aceite/lubricante.
* **`EF9`** (Fuel Filter): Filtros de combustible estándar.
* **`ES9`** (Fuel Filter Separator): Filtros separadores de agua y combustible.
* **`EH6`** (Hydraulic Filter): Filtros hidráulicos de alta presión.
* **`EC1`** (Cabin Filter): Filtros de cabina y aire acondicionado.
* **`EW7`** (Coolant Filter): Filtros de agua/refrigerante.
* **`ED4`** (Air Dryer Filter): Filtros secadores de aire (sistemas neumáticos).
* **`EA2`** (Housings): Carcasas y bases portafiltros (Tecnología INTEKCORE).
* **`ET9`** (Turbinas): Turbinas separadoras (Serie FH/FG) y sus elementos de recambio.

### LIGHT DUTY (LD) - Automotriz, Flotillas Ligeras y Pickups
Para vehículos comerciales ligeros y del sector automotriz, los prefijos son:
* **`EA3`** (Air Filter): Filtros de aire automotrices.
* **`EL3`** (Oil Filter): Filtros de aceite automotrices.
* **`EF3`** (Fuel Filter): Filtros de combustible automotrices.
* **`EC3`** (Cabin Filter): Filtros de cabina automotrices.

---

## Sistemas Comerciales Consolidados

Para soluciones de consolidación de inventario y kits completos:
* **`DUR` (DURATECH):** Kits completos de protección de activos (incluye todos los elementos necesarios para el mantenimiento de un activo específico).
* **`MAR` (MARINECLEAN):** Sistemas o elementos específicos desarrollados exclusivamente para el ambiente marítimo de alta salinidad.

---

## Arquitectura de Construcción del SKU (Base Numbering)

El cuerpo numérico del SKU (lo que sigue al prefijo) se construye de forma estandarizada utilizando **exclusivamente los últimos 4 dígitos** del código base del líder referencial de cada sector.

### Regla General de Construcción
1. **Línea Heavy Duty (HD):** El prefijo HD se complementa con los últimos 4 dígitos del código de **Donaldson**. 
   * *Ejemplo HD:* Si el código Donaldson es `P551348`, el SKU ELIMFILTERS será **`EL8-1348`**.
2. **Línea Light Duty (LD):** El prefijo LD se complementa con los últimos 4 dígitos del código de **Mann Filters**.
   * *Ejemplo LD:* Si el código Mann es `W 712/94` (asumiendo que los últimos dígitos clave son 1294 o similares según la estructura Mann), el SKU ELIMFILTERS se formará como **`EL3-XXXX`** usando los últimos 4 dígitos base.

### Excepción de Especialidad (OEM / Aftermarket Origin)
Si ni Mann Filters ni Donaldson fabrican el componente requerido:
* Se tomará el código base del **fabricante de origen**.
* Si la pieza solo es provista por el fabricante original de la máquina (OEM), se usan los últimos 4 dígitos del **código OEM**.
* Si la pieza proviene de un desarrollador especializado de repuestos (Aftermarket), se usarán los últimos 4 dígitos de ese código de **Aftermarket**.

---

## Directiva Comercial y Técnica
**Ningún asesor de ELIMFILTERS debe hablar en códigos completos de la competencia.** 
El cliente debe identificar que los códigos `EA1`, `EL8`, `EA3` no son meros filtros, sino la asignación de ingeniería precisa de ELIMFILTERS para su activo específico, utilizando los últimos 4 dígitos referenciales solo como un puente cognitivo transitorio.
