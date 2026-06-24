const fs = require("fs");

const sample = JSON.parse(
  fs.readFileSync("C:\\mann\\mann_enriched.jsonl","utf8")
    .split(/\r?\n/)
    .find(x => x.trim())
);

console.log(Object.keys(sample));

