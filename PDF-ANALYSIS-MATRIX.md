# MATRIZ DE ANÁLISIS DE PDFs - ELIMFILTERS CATALOG

## ESTADO ACTUAL: ❌ NADA PROCESADO

### PROBLEMA ACTUAL
- Railway endpoint creado pero CSV import FALLA
- Error: "req.body.csvData.split is not a function"
- Payload JSON mal formateado

---

## PDFs DISPONIBLES - CROSS-REFERENCES

### Alta Prioridad (Extraer PRIMERO)
| # | Archivo | Tamaño | Estado | Método |
|---|---------|--------|--------|--------|
| 1 | donaldson Cross Ref.pdf | 0.77 MB | ❌ CSV generado pero NO importado | Tabula → CSV |
| 2 | Cross Reference Donaldson.pdf | 0.58 MB | ⏸️ Pendiente | Tabula → CSV |
| 3 | Fleetguard_CrossRef_Part01.pdf | 1.53 MB | ⏸️ Pendiente | Tabula → CSV |
| 4 | Fleetguard_CrossRef_Part02-17.pdf | 1 MB c/u | ⏸️ Pendiente | Tabula → CSV |
| 5 | EMAM_Baldwin_Extreme_Performance...Form368.pdf | 0.56 MB | ⏸️ Pendiente | Tabula → CSV |

### Media Prioridad (Procesar DESPUÉS)
| # | Archivo | Tamaño | Razón |
|---|---------|--------|-------|
| 6 | mann-filter-cross-reference-list-2024-26.pdf | 26 MB | Muy grande - procesar por secciones |
| 7 | LT19457D-fleetguard cross reference.pdf | 16 MB | Muy grande - procesar por secciones |

---

## PLAN DE ACCIÓN - ORDEN CORRECTO

### PASO 1: ARREGLAR ENDPOINT (AHORA)
```javascript
// Fix: Controller debe recibir string, no objeto
const lines = req.body.csvData.split('\n'); // ❌ FALLA
```

**Acción:** Arreglar import.controller.js para manejar JSON correctamente

### PASO 2: PROBAR CON CSV EXISTENTE
- Archivo: `tabula-donaldson Cross Ref.csv` (3,428 líneas)
- Acción: Importar via endpoint arreglado
- Resultado esperado: X filtros actualizados con cross-refs

### PASO 3: SI FUNCIONA → EXTRAER MÁS PDFs
- Usar Tabula Desktop en PDFs #2-5
- Importar CSVs uno por uno
- Validar en MongoDB

### PASO 4: PDFs GRANDES (#6-7)
- Dividir en secciones con Tabula
- Procesar por partes

---

## DECISIÓN TÉCNICA

❌ **NO usar Node.js pdfjs-dist**
   - Requiere canvas nativo (DOMMatrix error)
   - Complicado en Windows

✅ **Usar Tabula Desktop**
   - Ya funcionó para Donaldson
   - Simple y confiable
   - Genera CSVs limpios

✅ **Railway endpoint para import**
   - Una vez arreglado, reutilizable
   - Procesa cualquier CSV similar

---

## PRÓXIMO COMANDO A EJECUTAR

1. Arreglar controller (recibir string correctamente)
2. Testar con payload-fixed.json
3. Si funciona → continuar con más PDFs

---
Estado: 2026-02-14 19:47
Siguiente: Fix controller
