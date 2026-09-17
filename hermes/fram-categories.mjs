import axios from 'axios';
const q=`query { categories(filters:{parent_id:{eq:"2"}}){items{uid name url_path children_count children{uid name url_path children_count children{uid name url_path children_count}}}}}`;
const r=await axios.post('https://www.fram.com/graphql',{query:q},{headers:{'content-type':'application/json','user-agent':'Mozilla/5.0'}});
console.log(JSON.stringify(r.data,null,2));
