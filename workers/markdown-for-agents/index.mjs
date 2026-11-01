/**
 * ELIMFILTERS public HTML -> Markdown negotiation.
 * Deploy as a Cloudflare Worker route only after live tests.
 * Never changes the ordinary HTML response or fetches private catalogue data.
 */
const EXCLUDED = /^\/(?:api|admin|_next|assets|cdn-cgi|\.well-known)(?:\/|$)/i;
const HTML_ENTITIES = {amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",mdash:"—",ndash:"–",hellip:"…"};
const decode = s => s.replace(/&#(x[\da-f]+|\d+);|&([a-z]+);/gi,(_,n,k) => {
  if(n) { const cp = n[0].toLowerCase()==="x" ? parseInt(n.slice(1),16):parseInt(n,10); return cp>0&&cp<=0x10ffff?String.fromCodePoint(cp):""; }
  return HTML_ENTITIES[k.toLowerCase()] ?? `&${k};`;
});
const clean = s => decode(s.replace(/<[^>]*>/g,"")).replace(/[ \t\r]+/g," ").trim();
export function htmlToMarkdown(html, url) {
  // The origin's public HTML is the ONLY content source.
  const title = clean(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "ELIMFILTERS");
  let content = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if(!content) content = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
  content = content
    .replace(/<!--([\s\S]*?)-->/g,"")
    .replace(/<(script|style|svg|noscript|template|nav|footer|form|button)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,"")
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,(_,n,s)=>`\n\n${"#".repeat(Number(n))} ${clean(s)}\n\n`)
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi,(_,attrs,s)=>{
      const href=attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
      const label=clean(s);
      if(!href||!label||/^(?:javascript:|data:|#)/i.test(href))return label;
      try{const resolved=new URL(decode(href),url);return resolved.protocol==="https:"||resolved.protocol==="http:"?`[${label}](${resolved.href})`:label;}catch{return label;}
    })
    .replace(/<li\b[^>]*>/gi,"\n- ")
    .replace(/<\/li\s*>/gi,"\n")
    .replace(/<(?:p|div|section|article|ul|ol|blockquote|table|tr)\b[^>]*>/gi,"\n")
    .replace(/<\/(?:p|div|section|article|ul|ol|blockquote|table|tr)\s*>/gi,"\n")
    .replace(/<br\s*\/?>/gi,"\n")
    .replace(/<[^>]*>/g,"");
  content=decode(content).replace(/\r/g,"").replace(/[ \t]+/g," ").replace(/ *\n */g,"\n").replace(/\n{3,}/g,"\n\n").trim();
  return `# ${title}\n\nSource: ${url}\n\n${content}\n`;
}
export default {
  async fetch(request) {
    const url=new URL(request.url);
    if(request.method!=="GET" || !request.headers.get("Accept")?.split(",").some(x=>x.trim().split(";")[0].trim().toLowerCase()==="text/markdown") || EXCLUDED.test(url.pathname) || /\.[a-z\d]{1,8}$/i.test(url.pathname)){
      return fetch(request);
    }
    const response=await fetch(request);
    const ct=response.headers.get("Content-Type")||"";
    if(!response.ok || !/text\/html/i.test(ct))return response;
    const html=await response.text();
    const markdown=htmlToMarkdown(html,url.href);
    const headers=new Headers(response.headers);
    headers.set("Content-Type","text/markdown; charset=utf-8");
    headers.set("Vary",Array.from(new Set([...(headers.get("Vary")||"").split(",").map(s=>s.trim()).filter(Boolean),"Accept"])).join(", "));
    headers.set("Cache-Control","private, no-store");
    headers.delete("Content-Length");
    headers.delete("Content-Encoding");
    headers.delete("ETag");
    headers.delete("Content-Security-Policy");
    return new Response(markdown,{status:response.status,headers});
  }
};
