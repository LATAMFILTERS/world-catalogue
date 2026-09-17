import axios from 'axios';
const query = `query {
  __type(name:"ProductInterface") {
    fields { name args { name type { kind name ofType { kind name } } } type { kind name ofType { kind name ofType { kind name } } } }
  }
}`;
const r = await axios.post('https://www.fram.com/graphql',{query},{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},timeout:30000});
const f=(r.data?.data?.__type?.fields||[]).find(x=>x.name==='custom_attributesV2');
console.log(JSON.stringify(f,null,2));
