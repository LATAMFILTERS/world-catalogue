'use strict';
require('dotenv').config();
const {Pool}=require('pg');
const PATCHES=[
 {sku:'ET93200',ref:'3833200S',url:'https://www.fleetguard.com/product/3833200S',type:'Fuel Filter Head',obsolete:false,regions:['North America','Europe','South America','South East Asia','South Pacific'],related:[{relationship:'Used With',partNumber:'FF5206'}]},
 {sku:'ET93457',ref:'FH43457',url:'https://www.fleetguard.com/product/FH43457',type:'Fuel Filter Housing',obsolete:true,regions:[],related:[]},
];
function mergeRefs(items,p){
 const out=Array.isArray(items)?[...items]:[];
 if(!out.some(x=>String(x?.code||x?.reference||'').toUpperCase()===p.ref)) out.push({manufacturer:'FLEETGUARD',code:p.ref,classification:'AFTERMARKET',source_url:p.url});
 return out;
}
async function apply(){
 const pool=new Pool({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:1});
 const c=await pool.connect(); const report={patched:[],missing:[],errors:[]};
 try{for(const p of PATCHES){try{await c.query('begin');const q=await c.query('select * from elimfilters_catalog where sku=$1 for update',[p.sku]);if(q.rowCount!==1){await c.query('rollback');report.missing.push(p.sku);continue}
