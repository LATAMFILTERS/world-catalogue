const assert=require("assert");

// /api/search (server-original.js) has three legitimate "found a match" response
// shapes, not just a flat results[] array:
//   - results.length > 0           -> single resolved product (or top list)
//   - resolution === 'AMBIGUOUS'   -> the query code legitimately cross-references
//                                     multiple distinct SKUs at near-equal score;
//                                     results is deliberately [] and candidates
//                                     lists the matching SKUs instead
//   - mixed_duty === true          -> the code matches both a HEAVY_DUTY and a
//                                     LIGHT_DUTY product; results is deliberately
//                                     [] and hd_products/ld_products carry the split
// A query like "23518480" (a Detroit Diesel OEM code that legitimately cross-
// references 10 different SKUs in the catalog) hits the AMBIGUOUS case by design,
// so asserting on results.length alone rejects a correct, documented response.
async function test(q){

 const r=await fetch("https://part-search.elimfilters.com/api/search?q="+q);

 assert.equal(r.status,200);

 const d=await r.json();

 assert.ok(d.success, `expected success:true for ${q}, got: ${JSON.stringify(d)}`);

 const hasFlatResults = Array.isArray(d.results) && d.results.length>0;
 const isAmbiguous = d.resolution==="AMBIGUOUS" && Array.isArray(d.candidates) && d.candidates.length>0;
 const isMixedDuty = d.mixed_duty===true && (((d.hd_products||[]).length>0) || ((d.ld_products||[]).length>0));

 assert.ok(hasFlatResults || isAmbiguous || isMixedDuty, `expected a resolved match for ${q}, got: ${JSON.stringify(d)}`);

 console.log("SEARCH OK",q);

}

(async()=>{

await test("LF3620");
await test("P552100");
await test("23518480");
await test("EL82100");

console.log("SEARCH TESTS PASSED");

})();
