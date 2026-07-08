const assert=require("assert");

async function test(q){

 const r=await fetch("https://part-search.elimfilters.com/api/search?q="+q);

 assert.equal(r.status,200);

 const d=await r.json();

 assert.ok(d.results);

 assert.ok(d.results.length>0);

 console.log("SEARCH OK",q);

}

(async()=>{

await test("LF3620");
await test("P552100");
await test("23518480");
await test("EL82100");

console.log("SEARCH TESTS PASSED");

})();
