const fs = require("fs");

const brands = {};

for(const line of fs.readFileSync(
"C:\\Users\\VICTOR ABREU\\OneDrive\\Documents\\New project\\mann_oem_clean_v2_output\\mann_oem_clean_v2_context.jsonl",
"utf8"
).split(/\r?\n/)){

 if(!line.trim()) continue;

 const p = JSON.parse(line);

 for(const oem of (p.oem_records || [])){
   brands[oem.oem_brand] = (brands[oem.oem_brand] || 0) + 1;
 }
}

console.table(
 Object.entries(brands)
  .sort((a,b)=>b[1]-a[1])
  .slice(0,100)
);
