const assert=require("assert");

async function test(q){

 const r=await fetch("https://part-search.elimfilters.com/api/autocomplete?q="+q);

 assert.equal(r.status,200);

 const d=await r.json();

 assert.ok(Array.isArray(d));

 assert.ok(d.length>0);

 console.log("OK",q,d.length);

}

(async()=>{

await test("LF3");
await test("EL8");
await test("P55");
await test("235");
await test("CUK");
await test("AF");

console.log("ALL TESTS PASSED");

})();
