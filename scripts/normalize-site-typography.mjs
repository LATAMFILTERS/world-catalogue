import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'src');
const allowedExt = new Set(['.tsx', '.ts', '.jsx', '.js', '.css']);

const replacements = [
  [/fontFamily:\s*'Chakra Petch, Arial Narrow, monospace'/g, "fontFamily: 'var(--font-display)'"] ,
  [/fontFamily:\s*'Chakra Petch, 'Arial Narrow', monospace'/g, "fontFamily: 'var(--font-display)'"] ,
  [/fontFamily:\s*'Barlow, Arial, sans-serif'/g, "fontFamily: 'var(--font-body)'"] ,
  [/fontFamily:\s*'Inter, sans-serif'/g, "fontFamily: 'var(--font-body)'"] ,
  [/fontFamily:\s*'Outfit, sans-serif'/g, "fontFamily: 'var(--font-display)'"] ,
  [/fontFamily:\s*'JetBrains Mono, monospace'/g, "fontFamily: 'var(--font-mono)'"] ,
  [/fontFamily:\s*"Chakra Petch, Arial Narrow, monospace"/g, "fontFamily: 'var(--font-display)'"] ,
  [/fontFamily:\s*"Barlow, Arial, sans-serif"/g, "fontFamily: 'var(--font-body)'"] ,
  [/fontFamily:\s*"Inter, sans-serif"/g, "fontFamily: 'var(--font-body)'"] ,
  [/fontFamily:\s*"Outfit, sans-serif"/g, "fontFamily: 'var(--font-display)'"] ,
  [/fontFamily:\s*"JetBrains Mono, monospace"/g, "fontFamily: 'var(--font-mono)'"] ,
  [/font-family:\s*'Chakra Petch'[^;]*;/g, 'font-family: var(--font-display);'],
  [/font-family:\s*'Barlow'[^;]*;/g, 'font-family: var(--font-body);'],
  [/font-family:\s*'Inter'[^;]*;/g, 'font-family: var(--font-body);'],
  [/font-family:\s*'Outfit'[^;]*;/g, 'font-family: var(--font-display);'],
  [/font-family:\s*'JetBrains Mono'[^;]*;/g, 'font-family: var(--font-mono);'],
  [/@import\s+url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Barlow:[^']*Chakra\+Petch[^']*'\);\n?/g, ''],
  [/@import\s+url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Barlow:[^"]*Chakra\+Petch[^"]*"\);\n?/g, ''],
  [/\s*<style>\{`@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Barlow:wght@400;500;600;700;800;900&family=Chakra\+Petch:wght@500;600;700&display=swap'\);`\}<\/style>/g, ''],
];

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'out') continue;
      out.push(...walk(full));
    } else if (allowedExt.has(extname(full))) {
      out.push(full);
    }
  }
  return out;
}

let changedFiles = 0;
let replacementsApplied = 0;

for (const file of walk(root)) {
  let content = readFileSync(file, 'utf8');
  const before = content;
  for (const [pattern, replacement] of replacements) {
    const matches = content.match(pattern);
    if (matches) replacementsApplied += matches.length;
    content = content.replace(pattern, replacement);
  }
  if (content !== before) {
    writeFileSync(file, content, 'utf8');
    changedFiles += 1;
    console.log(`[normalize-site-typography] normalized ${file}`);
  }
}

console.log(`[normalize-site-typography] Files changed: ${changedFiles}`);
console.log(`[normalize-site-typography] Replacements applied: ${replacementsApplied}`);
