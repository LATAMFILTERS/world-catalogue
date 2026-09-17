import axios from 'axios';
const query = `query {
  __type(name:"ProductInterface") {
    fields { name type { kind name ofType { kind name } } }
  }
}`;
const r = await axios.post('https://www.fram.com/graphql',{query},{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},timeout:30000});
const fields = r.data?.data?.__type?.fields || [];
for (const f of fields) {
  if (/height|width|length|weight|cross|app|dimension|category|attribute|description|url|sku|name|filter|part/i.test(f.name)) console.log(f.name);
}
console.log('FIELD_COUNT='+fields.length);
