import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlToMarkdown } from './index.mjs';

const pages = [
  'https://elimfilters.com/es/knowledge-center/',
  'https://elimfilters.com/pt/knowledge-center/',
  'https://elimfilters.com/knowledge-center/',
  'https://elimfilters.com/es/knowledge-center/engineering/compressed-air-dryer-selection/',
  'https://elimfilters.com/pt/knowledge-center/engineering/compressed-air-dryer-selection/',
];
const get = async url => {
  const res=await fetch(url,{headers:{'User-Agent':'ELIMFILTERS-markdown-audit/1.0','Accept':'text/html'}});
  const html=await res.text();
  return {res,html};
};
for(const url of pages) test('live fidelity '+new URL(url).pathname, async () => {
  const {res,html}=await get(url);
  assert.equal(res.status,200,'page must be available');
  assert.match(res.headers.get('content-type')||'',/text\/html/i,'origin HTML');
  assert.match(html,/<main\b/i,'main present');
  const md=htmlToMarkdown(html,url);
  const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
  const plain=s=>s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  const headings=[...main.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(m=>plain(m[1])).filter(Boolean);
  const rows=[...main.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)];
  const images=[...main.matchAll(/<img\b[^>]*>/gi)];
  assert.ok(md.length>300,'Markdown must not be nearly empty');
  assert.ok(headings.length>0,'page needs heading evidence');
  for(const heading of headings.slice(0,12)) assert.ok(md.includes(heading),'missing heading: '+heading);
  if(rows.length)assert.match(md,/\|[^|\n]+\|/,'tables must remain structured');
  if(images.length)assert.match(md,/!\[[^\]]*\]\(https?:\/\//,'images must remain referenced');
  assert.doesNotMatch(md,/<(?:main|section|table|script|img)\b/i,'no raw structural tags');
  console.log(JSON.stringify({url,status:res.status,htmlBytes:html.length,markdownChars:md.length,headings:headings.length,tableRows:rows.length,images:images.length,markdownPreview:md.slice(0,200)}));
});
