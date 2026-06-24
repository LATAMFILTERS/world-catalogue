const fs = require("fs");

let oem = 0;
let refs = 0;

for(const line of fs.readFileSync(
"C:\\Users\\VICTOR ABREU\\OneDrive\\Documents\\New project\\mann_oem_clean_v2_output\\mann_oem_clean_v2_context.jsonl",
"utf8"
).split(/\r?\n/)){

 if(!line.trim()) continue;

 const p = JSON.parse(line);

 oem += (p.oem_records || []).length;
 refs += (p.references || []).length;
}

console.log({
 OEM_RELATIONS:oem,
 CROSS_REFERENCE_RELATIONS:refs
});
