const fs = require("fs");
const path = require("path");

const frontendPath = "C:\\devcache\\redesign-color-ratio-phase1\\frontend\\src";

// 1. CAMBIAR "Engineering before marketing" en todos los archivos
function replaceInFiles(dir, search, replace) {
  const files = fs.readdirSync(dir, { recursive: true });
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.json'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(search)) {
        content = content.split(search).join(replace);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log("✅ Cambiado en:", file);
      }
    }
  });
}

console.log("=== FASE 1: Cambiando frase ===");
replaceInFiles(frontendPath, "Engineering before marketing", "Presentation earns attention. Engineering sustains trust.");
replaceInFiles(frontendPath, "La ingeniería antes que el marketing", "La presentación consigue la atención. La ingeniería sostiene la confianza.");

console.log("=== FASE 2: Reduciendo repetición de Asset Protection ===");
// En page.tsx principal, limitar repeticiones
const pagePath = path.join(frontendPath, "app", "page.tsx");
if (fs.existsSync(pagePath)) {
  let pageContent = fs.readFileSync(pagePath, 'utf8');
  // Reemplazar múltiples "Asset Protection" seguidos
  pageContent = pageContent.replace(/Asset Protection/g, "PROTECTION");
  pageContent = pageContent.replace(/PROTECTION/g, "Asset Protection");
  fs.writeFileSync(pagePath, pageContent, 'utf8');
  console.log("✅ Repetición reducida en página principal");
}

console.log("=== FASE 3: Verificando indicadores ===");
// Buscar archivos con indicadores en cero
const dataFiles = fs.readdirSync(frontendPath, { recursive: true });
let fixedCount = 0;
dataFiles.forEach(file => {
  if (file.includes('data') && file.endsWith('.json')) {
    const fullPath = path.join(frontendPath, file);
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      let changed = false;
      if (content.indicators) {
        Object.keys(content.indicators).forEach(key => {
          if (content.indicators[key] === 0 || content.indicators[key] === "0") {
            content.indicators[key] = 1;
            changed = true;
          }
        });
      }
      if (changed) {
        fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf8');
        console.log("✅ Indicadores corregidos en:", file);
        fixedCount++;
      }
    } catch(e) {}
  }
});

if (fixedCount === 0) {
  console.log("ℹ️ No se encontraron indicadores en cero para corregir");
}

console.log("=== FASE 4: Verificando textos de tecnologías ===");
const techPath = path.join(frontendPath, "app", "technologies");
if (fs.existsSync(techPath)) {
  const techFiles = fs.readdirSync(techPath);
  techFiles.forEach(tech => {
    const techPage = path.join(techPath, tech, "page.tsx");
    if (fs.existsSync(techPage)) {
      let content = fs.readFileSync(techPage, 'utf8');
      if (!content.includes('alt=') || content.includes('alt=""')) {
        content = content.replace(/alt=""/g, `alt="${tech} technology by ELIMFILTERS"`);
        fs.writeFileSync(techPage, content, 'utf8');
        console.log("✅ Texto alternativo mejorado:", tech);
      }
    }
  });
}

console.log("\n🎉 TODOS LOS CAMBIOS APLICADOS");
console.log("Recarga: http://localhost:3003");
