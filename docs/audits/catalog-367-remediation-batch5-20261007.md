# ELIMFILTERS: recuperación de identidad Scania

Verificación del lote original: 2026-10-08T04:48:32.533Z.

**10 de los 367 pendientes originales resueltos; 357 pendientes: 296 colisiones y 61 identidades por confirmar.** Se resolvió el 2,72% del lote original pendiente. No es el porcentaje del catálogo completo.

EF984004 → **EF90628**, base comercial y referencia canónica Donaldson **P550628**, estado VERIFIED.

El registro original tenía el código interno como base y referencia canónica, el OEM Scania 1873018 en sus referencias históricas y el alternativo Fleetguard FF5683. La página oficial Fleetguard FF5683 relaciona exactamente SCANIA/1873018. El catálogo oficial Donaldson Truck & Bus, página PDF 999, relaciona 1873018 con P550628 en las dos primeras columnas de la misma fila. P788729, visible más adelante en esa línea extraída, pertenece a otro par de columnas y no se utilizó. La referencia Donaldson y el destino EF90628 no colisionan, por lo que corresponde utilizar Donaldson según la prioridad autorizada.

PDF oficial: https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/catalogs/industries-markets/truck-bus/emea/f116002/Truck-Bus-Catalogue.pdf

Fleetguard oficial: https://www.fleetguard.com/product/FF5683

La operación se validó primero en una transacción revertida y se aplicó después en una transacción serializable. Cuatro registros dependientes se trasladaron; no quedaron referencias al SKU anterior en las tablas existentes comprobadas. Se guardaron la fila anterior completa, las dependencias anteriores y los hashes de ambos documentos de evidencia. Se reconstruyó el índice de búsqueda y se conservaron tipo, duty, OEM y aplicaciones existentes. La evidencia recupera identidad de producto: no certifica motores ni aplicaciones.

El catálogo permanece abierto y el objetivo de cero pendientes sigue activo.
