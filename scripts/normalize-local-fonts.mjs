import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const files = [
  resolve(process.cwd(), 'src', 'app', 'systems', '[slug]', 'page.tsx'),
];

let changed = 0;

for (const file of files) {
  if (!existsSync(file)) continue;
  let content = readFileSync(file, 'utf8');
  const before = content;

  content = content.replace(
    /const displayFont = 'Chakra Petch, Arial Narrow, monospace';/g,
    "const displayFont = 'var(--font-display), Arial Narrow, monospace';",
  );
  content = content.replace(
    /const bodyFont = 'Barlow, Arial, sans-serif';/g,
    "const bodyFont = 'var(--font-body), Arial, sans-serif';",
  );
  content = content.replace(
    /\s*<style>\{`@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Barlow:wght@400;500;600;700;800;900&family=Chakra\+Petch:wght@500;600;700&display=swap'\);`\}<\/style>/g,
    '',
  );

  if (content !== before) {
    writeFileSync(file, content, 'utf8');
    changed += 1;
    console.log(`[normalize-local-fonts] Removed remote Google font usage from ${file}`);
  }
}

console.log(`[normalize-local-fonts] Files changed: ${changed}`);
