const fs = require("fs");

const sku = new Set();
let rows = 0;

for(const line of fs.readFileSync(
"C:\\Users\\VICTOR ABREU\\OneDrive\\Documents\\New project\\mann_oem_clean_v2_output\\mann_oem_clean_v2.csv",
"utf8"
).split(/\r?\n/)){

 if(!line.trim()) continue;

 rows++;

 if(rows === 1) continue;

 const p = line.split(",");

 sku.add(p[0]);
}

console.log({
 rows: rows - 1,
 sku: sku.size
});
