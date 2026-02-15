# DEBUG MATRIZ - IMPORT CSV CROSS-REFERENCES

## PROBLEMA ACTUAL
Railway endpoint recibe CSV pero extrae 0 cross-references
Error: "No cross-references extracted, linesProcessed: 1"

---

## ANÁLISIS DEL PROBLEMA

### 1. FORMATO DEL CSV (VERIFICADO)
```
Línea 1: Mfgs. Our,Mfg.,Mfgs. Our,Mfg.,,Mfgs. Our,Mfg...
Línea 2: No. No.,Code,No. No.,Code,,No. No.,Code...
Línea 3: 0,,00642050......... M065030 ..... FWD,,,00811194...
```

**Patrón identificado:**
- Donaldson Part: `00642050`
- Cross-Ref: `M065030`
- Brand: `FWD`

### 2. REGEX (VERIFICADO EN POWERSHELL)
```regex
(\d+)[\.\s]+([A-Z0-9]+)\s+[\.\s]+([A-Z]+)
```
**PowerShell test:** ✅ 3 matches encontrados
**JavaScript:** ❌ Falla

### 3. PAYLOAD JSON (VERIFICADO)
- Archivo: `payload.json`
- Tamaño: 577 KB
- Formato: `{ "csvData": "contenido..." }`

### 4. LINE SPLITTING (PROBLEMA IDENTIFICADO)
**Railway logs:** `linesProcessed: 1` ❌

**Causa:** 
- Windows line endings: `\r\n`
- JavaScript split('\n'): Solo divide por `\n`
- Resultado: Todo el CSV se lee como 1 línea

**Fix aplicado:**
```javascript
split(/\r?\n/)  // Maneja \n y \r\n
```

---

## TESTS A EJECUTAR (EN ORDEN)

### TEST 1: Verificar payload localmente
```powershell
cd "C:\Users\VICTOR ABREU\Desktop\ELIMFILTERS_BACKEND"

# Ver primera línea del payload
$payload = Get-Content "payload.json" -Raw | ConvertFrom-Json
$lines = $payload.csvData -split "`r?`n"
Write-Host "Total líneas: $($lines.Length)"
Write-Host "Línea 3: $($lines[2])"
```

### TEST 2: Simular regex en Node local
```javascript
const fs = require('fs');
const payload = JSON.parse(fs.readFileSync('payload.json', 'utf8'));
const lines = payload.csvData.split(/\r?\n/);
console.log('Lines:', lines.length);
console.log('Line 3:', lines[2]);

const regex = /(\d+)[\.\s]+([A-Z0-9]+)\s+[\.\s]+([A-Z]+)/gi;
let matches = 0;
lines[2].replace(regex, () => { matches++; });
console.log('Matches in line 3:', matches);
```

### TEST 3: Railway deploy y test
```powershell
# Después de deploy
Invoke-RestMethod -Uri 'https://world-catalogue-production.up.railway.app/api/import/crossref' `
  -Method POST `
  -ContentType 'application/json; charset=utf-8' `
  -Body (Get-Content payload.json -Raw)
```

**Resultado esperado:**
```json
{
  "totalCrossRefs": ~10000,
  "processed": ~10000,
  "updated": X,
  "notFound": Y
}
```

---

## SI SIGUE FALLANDO

### ALTERNATIVA 1: Recrear payload sin BOM
```powershell
$csv = Get-Content "tabula-donaldson Cross Ref.csv" -Encoding UTF8 -Raw
$json = @{ csvData = $csv } | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText("$PWD\payload-clean.json", $json, [System.Text.UTF8Encoding]::new($false))
```

### ALTERNATIVA 2: Enviar línea por línea
```javascript
// Controller procesa array de líneas en vez de string
req.body.lines.forEach(line => { /* process */ })
```

### ALTERNATIVA 3: Base64 encoding
```powershell
$csv = Get-Content "tabula-donaldson Cross Ref.csv" -Raw -Encoding UTF8
$bytes = [System.Text.Encoding]::UTF8.GetBytes($csv)
$base64 = [Convert]::ToBase64String($bytes)
@{ csvDataBase64 = $base64 } | ConvertTo-Json | Out-File "payload-b64.json"
```

---

## DECISIÓN

1. ✅ Ejecutar TEST 1 (verificar payload local)
2. ✅ Ejecutar TEST 2 (simular en Node local)  
3. ⏸️ Esperar Railway deploy
4. ✅ Ejecutar TEST 3 (probar endpoint)
5. ❌ Si falla → ALTERNATIVA 1

---

## PRÓXIMO COMANDO
```powershell
# TEST 1
cd "C:\Users\VICTOR ABREU\Desktop\ELIMFILTERS_BACKEND"
$payload = Get-Content "payload.json" -Raw | ConvertFrom-Json
$lines = $payload.csvData -split "`r?`n"
Write-Host "Total líneas: $($lines.Length)"
Write-Host "Línea 3: $($lines[2])"
```

EJECUTA ESTO PRIMERO antes de cualquier otra cosa.

---
Creado: 2026-02-14 20:05
Estado: Debugging line split issue
