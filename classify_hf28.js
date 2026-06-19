const fs = require("fs");

const codes = fs.readFileSync(
  "hf_large_series.txt",
  "utf8"
).split(/\r?\n/).filter(Boolean);

const old = codes.filter(x =>
  /^HF28/.test(x)
);

console.log("HF28:", old.length);
console.log(old.join("\n"));
