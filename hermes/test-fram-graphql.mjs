import axios from 'axios';
const query = `query {
  products(search: "", pageSize: 20, currentPage: 1) {
    total_count
    page_info { current_page total_pages page_size }
    items { sku name url_key __typename }
  }
}`;
try {
  const r = await axios.post('https://www.fram.com/graphql', { query }, {
    headers: { 'User-Agent':'Mozilla/5.0', 'Content-Type':'application/json' },
    timeout:30000
  });
  console.log('STATUS', r.status);
  console.log(JSON.stringify(r.data,null,2));
} catch (e) {
  console.log('ERR', e.response?.status, JSON.stringify(e.response?.data || e.message));
  process.exitCode = 1;
}
