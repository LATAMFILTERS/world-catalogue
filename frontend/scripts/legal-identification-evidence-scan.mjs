import fs from 'node:fs';
import path from 'node:path';

function copyKey(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return `copy${(hash >>> 0).toString(16)}_${text.length}`;
}

/** Extend the existing legal identification exception to its exact translated paragraphs, not to whole locale files. */
export function legalIdentificationEvidenceScanText(file, text, frontendRoot) {
  const relative = path.relative(frontendRoot, file).replaceAll('\\', '/');
  if (!/^out\/locales\/(en|es|pt)\/translation\.json$/.test(relative)) return text;
  const sourcePath = path.join(frontendRoot, 'src/app/legal/cross-reference/page.tsx');
  if (!fs.existsSync(sourcePath)) return text;
  const source = fs.readFileSync(sourcePath, 'utf8').replaceAll('\r\n', '\n');
  const body = source.match(/code:\s*['"]XR['"],[\s\S]*?body:\s*`([^`]*)`/)?.[1];
  if (!body) return text;
  const attribution = body.split('\n\n').find(paragraph => paragraph.includes('Cross-referenced brands') && paragraph.includes('property of their respective owners') && paragraph.includes('identification purposes only'));
  if (!attribution) return text;
  let bundle;
  try { bundle = JSON.parse(text); } catch { return text; }
  if (!bundle.reviewedCopy || typeof bundle.reviewedCopy !== 'object') return text;
  for (const key of new Set([copyKey(body), copyKey(attribution)])) {
    const value = bundle.reviewedCopy[key];
    if (typeof value !== 'string') continue;
    // Only this unchanged entry in the original legal trademark list is exempt.
    // Extra FRAM claims, fram.com links and private fram_ld_* provenance still reach the normal validator.
    bundle.reviewedCopy[key] = value.replace(/(\bBosch,\s*)Fram(?=,\s*Luber-Finer\b)/g, '$1[identified competitor trademark]');
  }
  return JSON.stringify(bundle);
}
