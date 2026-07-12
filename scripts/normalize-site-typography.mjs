import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'src');
const allowedExt = new Set(['.tsx', '.ts', '.jsx', '.js', '.css']);

const APPROVED_TOKENS = {
  display: 'var(--font-display)',
  body: 'var(--font-body)',
  mono: 'var(--font-mono)',
};

const replacements = [
  // Inline React style fontFamily values.
  [/fontFamily:\s*'Chakra Petch, Arial Narrow, monospace'/g, `fontFamily: '${APPROVED_TOKENS.display}'`],
  [/fontFamily:\s*"Chakra Petch, Arial Narrow, monospace"/g, `fontFamily: '${APPROVED_TOKENS.display}'`],
  [/fontFamily:\s*'Barlow, Arial, sans-serif'/g, `fontFamily: '${APPROVED_TOKENS.body}'`],
  [/fontFamily:\s*"Barlow, Arial, sans-serif"/g, `fontFamily: '${APPROVED_TOKENS.body}'`],
  [/fontFamily:\s*'Inter, sans-serif'/g, `fontFamily: '${APPROVED_TOKENS.body}'`],
  [/fontFamily:\s*"Inter, sans-serif"/g, `fontFamily: '${APPROVED_TOKENS.body}'`],
  [/fontFamily:\s*'Outfit, sans-serif'/g, `fontFamily: '${APPROVED_TOKENS.display}'`],
  [/fontFamily:\s*"Outfit, sans-serif"/g, `fontFamily: '${APPROVED_TOKENS.display}'`],
  [/fontFamily:\s*'JetBrains Mono, monospace'/g, `fontFamily: '${APPROVED_TOKENS.mono}'`],
  [/fontFamily:\s*"JetBrains Mono, monospace"/g, `fontFamily: '${APPROVED_TOKENS.mono}'`],

  // Standalone constants used by page components.
  [/const displayFont = 'Chakra Petch, Arial Narrow, monospace';/g, `const displayFont = '${APPROVED_TOKENS.display}';`],
  [/const bodyFont = 'Barlow, Arial, sans-serif';/g, `const bodyFont = '${APPROVED_TOKENS.body}';`],
  [/const monoFont = 'JetBrains Mono, monospace';/g, `const monoFont = '${APPROVED_TOKENS.mono}';`],

  // CSS font-family declarations.
  [/font-family:\s*'Chakra Petch'[^;]*;/g, 'font-family: var(--font-display);'],
  [/font-family:\s*"Chakra Petch"[^;]*;/g, 'font-family: var(--font-display);'],
  [/font-family:\s*'Barlow'[^;]*;/g, 'font-family: var(--font-body);'],
  [/font-family:\s*"Barlow"[^;]*;/g, 'font-family: var(--font-body);'],
  [/font-family:\s*'Inter'[^;]*;/g, 'font-family: var(--font-body);'],
  [/font-family:\s*"Inter"[^;]*;/g, 'font-family: var(--font-body);'],
  [/font-family:\s*'Outfit'[^;]*;/g, 'font-family: var(--font-display);'],
  [/font-family:\s*"Outfit"[^;]*;/g, 'font-family: var(--font-display);'],
  [/font-family:\s*'JetBrains Mono'[^;]*;/g, 'font-family: var(--font-mono);'],
  [/font-family:\s*"JetBrains Mono"[^;]*;/g, 'font-family: var(--font-mono);'],

  // Remote Google Fonts imports are not allowed.
  [/@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/css2\?[^'"]*['"]\);\n?/g, ''],
  [/\s*<style>\{`@import url\(['"]https:\/\/fonts\.googleapis\.com\/css2\?[^'"]*['"]\);`\}<\/style>/g, ''],

  // next/font/google must not be used.
  [/import\s+[^;]*from\s+['"]next\/font\/google['"];?\n?/g, ''],
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

console.log('[normalize-site-typography] Approved typography: ELIM Display Font = var(--font-display), ELIM Body Font = var(--font-body), ELIM Mono Font = var(--font-mono)');
console.log(`[normalize-site-typography] Files changed: ${changedFiles}`);
console.log(`[normalize-site-typography] Replacements applied: ${replacementsApplied}`);
