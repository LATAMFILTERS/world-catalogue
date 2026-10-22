import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Victor 2026-10-22: titles and subtitles must never be split with a hyphen.
describe('site CSS never hyphenates words automatically', () => {
  it('no CSS rule turns on automatic hyphenation', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(css|tsx?)$/.test(entry.name) && /hyphens\s*:\s*auto/.test(readFileSync(path, 'utf8'))) offenders.push(path);
      }
    };
    walk(join(__dirname, '..', '..'));
    expect(offenders).toEqual([]);
  });
});
