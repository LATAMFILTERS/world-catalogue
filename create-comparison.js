const fs = require("fs");

const donaldson = JSON.parse(fs.readFileSync("donaldson_parsed.json", "utf8"));

// Mapeo ELIMFILTERS ↔ Donaldson (basado en tipo filtro)
const mapping = {
  "LUBE FILTER, SPIN-ON FULL FLOW": "DURATECH™ / SINTRAX™ / NANOFORCE™",
  "LUBE FILTER, SPIN-ON COMBINATION": "SYNTEPORE™",
  "HYDRAULIC FILTER, CARTRIDGE": "INTEKCORE™",
  "LUBE FILTER": "DURATECH™",
  "AIR FILTER": "MACROCORE™",
  "FUEL FILTER": "SYNTEPORE™",
  "CABIN FILTER": "MICROKAPPA™",
};

const comparison = {
  timestamp: new Date().toISOString(),
  donaldson_products: donaldson.total_products,
  elimfilters_mapping: [],
};

// Extraer tipos únicos
const uniqueParts = new Set();
donaldson.products.forEach(p => {
  if (p.partNumbers[0]) uniqueParts.add(p.partNumbers[0]);
});

const partList = Array.from(uniqueParts).sort();

console.log(`\n📊 DONALDSON vs ELIMFILTERS COMPARISON`);
console.log(`🔍 ${partList.length} part numbers únicos encontrados\n`);

partList.forEach((part, idx) => {
  const productData = donaldson.products.find(p => p.partNumbers.includes(part));
  const context = productData?.context || "";
  
  let filterType = "UNKNOWN";
  let elimequiv = "REVIEW MANUAL";
  
  Object.entries(mapping).forEach(([dtype, elim]) => {
    if (context.toUpperCase().includes(dtype.toUpperCase())) {
      filterType = dtype;
      elimequiv = elim;
    }
  });

  comparison.elimfilters_mapping.push({
    index: idx + 1,
    donaldson_part: part,
    filter_type: filterType,
    elimfilters_equivalent: elimequiv,
    url: `https://shop.donaldson.com/store/product/${part}/`,
  });

  console.log(`${idx + 1}. P${part.replace(/^P/, "")} → ${elimequiv}`);
});

fs.writeFileSync("comparison_donaldson_elimfilters.json", JSON.stringify(comparison, null, 2));
console.log(`\n✅ Comparación guardada → comparison_donaldson_elimfilters.json`);