import axios from 'axios';
const query = `query {
  products(filter:{sku:{eq:"CA8142"}},pageSize:1) {
    items {
      sku name url_key description { html } short_description { html }
      categories { uid name url_path }
      custom_attributesV2 {
        items {
          code __typename
          ... on AttributeValue { value }
          ... on AttributeSelectedOptions { selected_options { label value } }
        }
      }
    }
  }
}`;
const r=await axios.post('https://www.fram.com/graphql',{query},{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},timeout:30000});
console.log(JSON.stringify(r.data,null,2));
