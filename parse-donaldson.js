const fs = require("fs");

const markdown = fs.readFileSync("donaldson_catalog.md", "utf8");

const products = [];
const lines = markdown.split("\n");

lines.forEach((line, i) => {
  // Detectar part numbers: P123456, LF1234, AF5678
  const partMatch = line.match(/\b([PLB][0-9]{5,6}|LF\d{4,6}|AF\d{4,6})\b/g);
  
  if (partMatch) {
    const product = {
      partNumbers: partMatch,
      line: line.trim(),
      context: lines.slice(Math.max(0, i-2), Math.min(lines.length, i+3)).join(" "),
    };
    products.push(product);
  }
});

const output = {
  timestamp: new Date().toISOString(),
  source: "Donaldson Shop",
  total_products: products.length,
  products: products.slice(0, 50), // Primeros 50
};

fs.writeFileSync("donaldson_parsed.json", JSON.stringify(output, null, 2));
console.log(`✅ ${products.length} productos extraídos → donaldson_parsed.json`);