const data = require("./duplicates_detailed.json");

const clearDelete = [];
const review = [];

for (const row of data) {
  if (
    row.oem === 0 &&
    row.cross === 0 &&
    row.equip === 0
  ) {
    clearDelete.push(row);
  } else {
    review.push(row);
  }
}

console.log("DELETE:", clearDelete.length);
console.log("REVIEW:", review.length);
