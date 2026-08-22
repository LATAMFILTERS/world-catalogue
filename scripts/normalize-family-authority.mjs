import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const familyRoot = path.join(root, 'frontend', 'out', 'families');

if (!fs.existsSync(familyRoot)) {
  console.error('[normalize-family-authority] frontend/out/families is missing');
  process.exit(1);
}

function stripHtml(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceMeta(html, key, value, content) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const found = tag.match(new RegExp(`\\b${key}=["']([^"']+)["']`, 'i'))?.[1];
    if (found?.toLowerCase() !== value.toLowerCase()) continue;
    const replacement = tag.match(/\bcontent=["'][^"']*["']/i)
      ? tag.replace(/\bcontent=["'][^"']*["']/i, `content="${escapeHtml(content)}"`)
      : tag.replace(/\s*\/>$|>$/, ` content="${escapeHtml(content)}">`);
    return html.replace(tag, replacement);
  }
  return html;
}

function descriptionFor(name) {
  const full = `${name} engineering and selection guidance for protected assets, contamination control, operating duty, system requirements, and service conditions.`;
  if (full.length <= 170) return full;
  return `${name} selection guidance for protected assets, contamination control, operating duty, system requirements, and service conditions.`;
}

let modified = 0;
let audited = 0;

for (const entry of fs.readdirSync(familyRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(familyRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;

  audited += 1;
  let html = fs.readFileSync(file, 'utf8');
  const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) continue;

  const name = stripHtml(h1Match[1]);
  if (!name) continue;

  const title = `${name} for Asset Protection | ELIMFILTERS`;
  const description = descriptionFor(name);

  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);

  if (!html.includes('data-family-authority-factors="true"')) {
    const heroPattern = /(<h1\b[^>]*>[\s\S]*?<\/h1>\s*<p\b[^>]*>)([\s\S]*?)(<\/p>)/i;
    const heroMatch = html.match(heroPattern);
    if (heroMatch) {
      const original = stripHtml(heroMatch[2]);
      const extension = ' Selection depends on the protected asset, contamination exposure, operating duty, flow conditions, and disciplined service practices.';
      const lead = original.endsWith('.') ? `${original}${extension}` : `${original}.${extension}`;
      const factors = '<ul data-family-authority-factors="true" style="display:flex;flex-wrap:wrap;gap:0.5rem 1.25rem;margin:1rem 0 0;padding:0;list-style:none;font-size:0.78rem;letter-spacing:0.04em;color:rgba(255,255,255,0.58)"><li>Protected asset</li><li>Contamination exposure</li><li>Operating duty</li><li>Flow and service conditions</li></ul>';
      html = html.replace(heroPattern, `${heroMatch[1]}${escapeHtml(lead)}${heroMatch[3]}${factors}`);
    }
  }

  fs.writeFileSync(file, html);
  modified += 1;
}

console.log(`[normalize-family-authority] PASS — ${modified}/${audited} family pages normalized for title intent, direct-answer depth and semantic selection factors`);
