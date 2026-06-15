const axios = require('axios');
const cheerio = require('cheerio');

async function testSearch(code) {
    const searchUrl = `https://shop.donaldson.com/store/en-us/home?Ntt=${code}`;
    console.log(`Searching for: ${code} at ${searchUrl}`);
    try {
        const resp = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        console.log(`Status: ${resp.status}`);
        console.log(`Response URL: ${resp.request.res.responseUrl || 'No responseUrl redirect'}`);
        const html = resp.data;
        const $ = cheerio.load(html);
        
        let productPath = null;
        const selectors = [
            'a[href*="/product/"]',
            '.product-link',
            '.product-item a',
            'a.part-number-link'
        ];
        
        for (const selector of selectors) {
            const link = $(selector).first().attr('href');
            if (link && link.includes('/product/')) {
                productPath = link;
                break;
            }
        }
        
        if (!productPath) {
            const regex = /\/store\/[a-z]{2}-[a-z]{2}\/product\/[A-Z0-9]+\/\d+/;
            const match = html.match(regex);
            if (match) {
                productPath = match[0];
            }
        }
        
        console.log(`Found product path: ${productPath}`);
        if (productPath) {
            console.log(`Full URL: https://shop.donaldson.com${productPath}`);
        } else {
            console.log(`HTML length: ${html.length}`);
            console.log(`Page title: ${$('title').text().trim()}`);
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

testSearch('P554004');
