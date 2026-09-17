import axios from 'axios';
const cats={AIR:'OQ==',CABIN:'MTQ=',LUBE:'MTU=',FUEL:'NQ==',HD_OIL:'OA==',HD_AIR1:'MTA=',HD_AIR2:'MTE=',HD_CABIN:'MTI='};
for (const [k,uid] of Object.entries(cats)) {
 const q=`query { products(filter:{category_uid:{eq:"${uid}"}}, pageSize:1){total_count items{sku name}}}`;
 const r=await axios.post('https://www.fram.com/graphql',{query:q},{headers:{'content-type':'application/json','user-agent':'Mozilla/5.0'}});
 console.log(k, JSON.stringify(r.data));
}
