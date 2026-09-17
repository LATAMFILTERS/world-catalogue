import axios from 'axios';
const query = `query { __schema { types { name kind } } }`;
const r = await axios.post('https://www.fram.com/graphql',{query},{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},timeout:30000});
for(const t of r.data?.data?.__schema?.types||[]) if(/Attribute|Custom/i.test(t.name||'')) console.log(t.kind,t.name);
