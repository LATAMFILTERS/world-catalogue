const fs = require("fs");

let oem = 0;
let refs = 0;

for(const line of fs.readFileSync(
"C:\\Users\\VICTOR ABREU\\OneDrive\\Documents\\New project\\mann_oem_clean_v2_output\\mann_oem_clean_v2_context.jsonl",
"utf8"
).split(/\r?\n/)){

 if(!line.trim()) continue;

 const p = JSON.parse(line);

 if(p.oe_numbers?.length) oem++;

 if(p.references?.length) refs++;
}

console.log({
 oem_records:oem,
 reference_records:refs
});
