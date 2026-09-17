import axios from 'axios';
const query=`query { __type(name:"AttributeFilterInput") { inputFields { name type { kind name ofType { kind name } } } } }`;
const r=await axios.post('https://www.fram.com/graphql',{query},{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},timeout:30000});
console.log(JSON.stringify(r.data?.data?.__type,null,2));
