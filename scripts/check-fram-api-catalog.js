const fs = require("fs");
const catalog = JSON.parse(fs.readFileSync(
  require("path").join(__dirname, "../scrape_reports/fram-api-catalog.json"), "utf8"
));

// Mostrar url_key de los primeros 10 CA products
const caProducts = catalog.filter(p => p.sku.toUpperCase().startsWith("CA")).slice(0, 10);
console.log("\nCA products - url_key:");
caProducts.forEach(p => {
  const urlKey = (p.custom_attributes || []).find(a => a.attribute_code === "url_key")?.value || "NO URL_KEY";
  console.log(`  ${p.sku.padEnd(12)} → ${urlKey}`);
});

// Mostrar también PH products para comparar
const phProducts = catalog.filter(p => p.sku.toUpperCase().startsWith("PH")).slice(0, 5);
console.log("\nPH products - url_key:");
phProducts.forEach(p => {
  const urlKey = (p.custom_attributes || []).find(a => a.attribute_code === "url_key")?.value || "NO URL_KEY";
  console.log(`  ${p.sku.padEnd(12)} → ${urlKey}`);
});

// Contar por prefijo
const counts = {};
catalog.forEach(p => {
  const prefix = p.sku.replace(/\d.*/, "").toUpperCase();
  counts[prefix] = (counts[prefix] || 0) + 1;
});
console.log("\nProductos por prefijo:");
Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) =>
  console.log(`  ${k.padEnd(6)} : ${v}`)
);
