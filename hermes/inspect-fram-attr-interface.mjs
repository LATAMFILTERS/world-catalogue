import axios from 'axios';
const query = `query {
  a: __type(name:"AttributeValueInterface") { fields { name type { kind name ofType { kind name } } } possibleTypes { name } }
  b: __type(name:"AttributeValue") { fields { name type { kind name ofType { kind name } } } }
  c: __type(name:"AttributeSelectedOptions") { fields { name type { kind name ofType { kind name } } } }
}`;
const r = await axios.post('https://www.fram.com/graphql',{query},{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},timeout:30000});
console.log(JSON.stringify(r.data?.data,null,2));
