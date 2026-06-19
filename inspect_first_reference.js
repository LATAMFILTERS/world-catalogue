const fs = require("fs");

for(const line of fs.readFileSync(
"C:\\Users\\VICTOR ABREU\\OneDrive\\Documents\\New project\\mann_oem_clean_v2_output\\mann_oem_clean_v2_context.jsonl",
"utf8"
).split(/\r?\n/)){

 if(!line.trim()) continue;

 const p = JSON.parse(line);

 if((p.references || []).length){

   console.log(JSON.stringify(p.references[0],null,2));
   break;
 }
}
