# 🔍 INSTRUCCIONES PARA EXTRAER 20 PRODUCTOS DE FLEETGUARD

## ⚡ FORMA MÁS RÁPIDA (SIN INSTALACIONES)

### Paso 1: Abre la página de Fleetguard
https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE

### Paso 2: Abre la consola del navegador
- **Chrome/Edge**: `F12` → pestaña `Console`
- **Firefox**: `F12` → pestaña `Consola`

### Paso 3: Copia y pega ESTO en la consola

```javascript
javascript:(async()=>{const products=[];const seen=new Set();const pageText=document.body.innerText;const skuPattern=/([A-Z]{2}\d{4,6}[A-Z]{0,2})/g;const matches=pageText.match(skuPattern)||[];matches.forEach(sku=>{if(!seen.has(sku)&&products.length<20){seen.add(sku);products.push({sku,name:`Fleetguard ${sku}`});}});document.querySelectorAll('a').forEach(link=>{if(products.length>=20)return;const text=link.innerText.trim();const match=text.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);if(match&&!seen.has(match[1])){seen.add(match[1]);products.push({sku:match[1],name:text,url:link.href});}});console.log(`✅ Encontrados ${products.length} productos`);console.table(products);const data={timestamp:new Date().toISOString(),total:products.length,products:products};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`fleetguard-${Date.now()}.json`;a.click();console.log('✨ JSON descargado');})();
```

### Paso 4: Presiona ENTER
- Se descargará automáticamente `fleetguard-[timestamp].json`
- Mueve el archivo a: `scrape_reports/`

---

## 📋 QUÉ HACE EL SCRIPT
1. ✅ Busca todos los SKUs en la página (LF, FF, AF, FS, etc.)
2. ✅ Extrae los primeros 20 productos únicos
3. ✅ Descarga un JSON automáticamente
4. ✅ Muestra los datos en la consola

---

## 🚀 ALTERNATIVA: Usar Node.js (con Puppeteer)

Si prefieres automatizarlo:

```powershell
# Limpiar e instalar
rmdir node_modules -Recurse -Force
npm cache clean --force

# Instalar sin descargar navegador
$env:PUPPETEER_SKIP_DOWNLOAD="true"
npm install puppeteer --save

# Ejecutar
git pull origin claude/fleetguard-catalog-access-AGtUW
node scripts/scrapeFleetguard.windows.js
```

---

## 💾 DESPUÉS DE OBTENER EL JSON

1. Mueve `fleetguard-[timestamp].json` a `scrape_reports/`
2. En PowerShell:
```powershell
git add scrape_reports/
git commit -m "data: Add 20 Fleetguard products from page 1"
git push origin claude/fleetguard-catalog-access-AGtUW
```

---

## ❓ ¿QUÉ PASA SI EL SCRIPT NO DESCARGA EL JSON?

Si el botón de descarga no aparece, abre la consola y copia esto:

```javascript
// Ver los datos en la consola
console.log(JSON.stringify(products, null, 2));

// Copiar y guardar como fleetguard-products.json manualmente
```

---

**¡Listo! Ya tendrás los 20 productos en 2 minutos.**
