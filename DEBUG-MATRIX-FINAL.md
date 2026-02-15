# MATRIZ DEBUG FINAL - PAYLOAD JSON ISSUE

## PROBLEMA IDENTIFICADO
1. ✅ CSV tiene 3,429 líneas (verificado en PowerShell)
2. ✅ Regex funciona en PowerShell (3 matches en línea 3)
3. ❌ payload.json tiene BOM (Byte Order Mark)
4. ❌ payload-clean.json creado pero csvData no es string

---

## ROOT CAUSE ANALYSIS

### CONVERSIÓN JSON EN POWERSHELL
```powershell
$obj = @{ csvData = $csv }
$json = $obj | ConvertTo-Json -Compress
```

**PROBLEMA POTENCIAL:**
- ConvertTo-Json puede escapar caracteres especiales
- CSV con saltos de línea puede crear objeto complejo
- Compress puede romper formato

### VERIFICACIONES NECESARIAS

#### CHECK 1: ¿Qué tipo es csvData?
```powershell
$content = Get-Content "payload-clean.json" -Raw
$obj = $content | ConvertFrom-Json
$obj.csvData.GetType().FullName
# Esperado: System.String
# Si es Array/Object → PROBLEMA
```

#### CHECK 2: ¿El JSON es válido?
```powershell
Get-Content "payload-clean.json" -Raw -TotalCount 1 | Select-Object -First 500
# Debe empezar con: {"csvData":"Mfgs...
# NO debe tener: {"csvData":[... o {"csvData":{...
```

#### CHECK 3: ¿PowerShell está escapando correctamente?
```powershell
$csv = "line1\r\nline2\r\nline3"
$test = @{ data = $csv } | ConvertTo-Json
$test
# Ver si \r\n se escapa como \\r\\n
```

---

## SOLUCIONES ALTERNATIVAS

### OPCIÓN A: Usar Node.js para crear JSON
```javascript
const fs = require('fs');
const csv = fs.readFileSync('tabula-donaldson Cross Ref.csv', 'utf8');
const payload = { csvData: csv };
fs.writeFileSync('payload-node.json', JSON.stringify(payload), 'utf8');
```

### OPCIÓN B: Enviar CSV directo (no JSON)
```javascript
// Controller recibe text/csv
app.post('/import', express.text({ type: 'text/csv' }), (req, res) => {
  const csvData = req.body; // string directo
});
```

### OPCIÓN C: Base64 encode
```powershell
$csv = Get-Content "tabula-donaldson Cross Ref.csv" -Raw -Encoding UTF8
$bytes = [System.Text.Encoding]::UTF8.GetBytes($csv)
$base64 = [Convert]::ToBase64String($bytes)
$json = @{ csvDataBase64 = $base64 } | ConvertTo-Json
[System.IO.File]::WriteAllText("payload-b64.json", $json, $utf8NoBom)
```

### OPCIÓN D: Array de líneas (más simple)
```powershell
$lines = Get-Content "tabula-donaldson Cross Ref.csv" -Encoding UTF8
$json = @{ lines = $lines } | ConvertTo-Json
[System.IO.File]::WriteAllText("payload-lines.json", $json, $utf8NoBom)
```

---

## DECISIÓN - PLAN DE ACCIÓN

### PASO 1: Ejecutar CHECK 1
```powershell
cd "C:\Users\VICTOR ABREU\Desktop\ELIMFILTERS_BACKEND"
$content = Get-Content "payload-clean.json" -Raw
$obj = $content | ConvertFrom-Json
Write-Host "Tipo de csvData:" $obj.csvData.GetType().FullName
Write-Host "¿Es string?" ($obj.csvData -is [string])
```

### PASO 2: Si csvData NO es string → OPCIÓN D
Enviar array de líneas en vez de string gigante

### PASO 3: Si csvData SÍ es string → OPCIÓN A  
Usar Node.js para crear JSON (evita problemas de PowerShell)

### PASO 4: Actualizar controller según formato elegido

---

## EJECUTAR AHORA
```powershell
cd "C:\Users\VICTOR ABREU\Desktop\ELIMFILTERS_BACKEND"
$content = Get-Content "payload-clean.json" -Raw
$obj = $content | ConvertFrom-Json

Write-Host "`n📊 DIAGNÓSTICO:" -ForegroundColor Yellow
Write-Host "Tipo de csvData: $($obj.csvData.GetType().FullName)" -ForegroundColor Cyan
Write-Host "¿Es string? $($obj.csvData -is [string])" -ForegroundColor $(if ($obj.csvData -is [string]) { 'Green' } else { 'Red' })

if ($obj.csvData -is [string]) {
    Write-Host "`n✅ SOLUCIÓN: Usar OPCIÓN A (Node.js)" -ForegroundColor Green
} else {
    Write-Host "`n✅ SOLUCIÓN: Usar OPCIÓN D (Array)" -ForegroundColor Green
}
```

---
Creado: 2026-02-14 20:15
Próximo: Ejecutar diagnóstico