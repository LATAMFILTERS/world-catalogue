const fs = require("fs");

const sample = JSON.parse(
  fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8")
    .split(/\r?\n/)
    .find(x => x.trim())
);

console.log(JSON.stringify(sample,null,2));

