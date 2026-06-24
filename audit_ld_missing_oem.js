const fs = require("fs");

const lines = fs.readFileSync(
"C:\\mann\\mann_ld_elimfilters.jsonl",
"utf8"
).trim().split("\n");

let missing = 0;

for(const line of lines){

  const p = JSON.parse(line);

  if(
      !p.oem_codes ||
      p.oem_codes.trim() === ""
  ){
      missing++;
      console.log(
        p.elim_sku,
        p.base_code
      );
  }
}

console.log("");
console.log("MISSING OEM:", missing);
