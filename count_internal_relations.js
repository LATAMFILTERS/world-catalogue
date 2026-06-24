const fs = require("fs");

let total = 0;

for(const line of fs.readFileSync(
"C:\\Users\\VICTOR ABREU\\OneDrive\\Documents\\New project\\mann_oem_clean_v2_output\\mann_oem_clean_v2_context.jsonl",
"utf8"
).split(/\r?\n/)){

 if(!line.trim()) continue;

 const p = JSON.parse(line);

 if((p.references || []).length){
   total++;
 }
}

console.log("SKU_WITH_INTERNAL_RELATIONS", total);
