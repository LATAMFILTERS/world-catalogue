import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const partNumber = process.env.UFI_PART_NUMBER || '25.696.00';
const outDir = path.resolve('artifacts/hd-packaging-ufi-test');
fs.mkdirSync(outDir, { recursive: true });

const candidateUrls = [
  `https://ufi-aftermarket.com/EU/en/product/item/${encodeURIComponent(partNumber)}?download=true&print=true`,
  `https://ufi-aftermarket.com/EU/en/product/item/${encodeURIComponent(partNumber)}`,
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  locale: 'en-US',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
});
const page = await context.newPage();

let finalUrl = null;
let bodyText = '';
let status = 'REQUIRES_REVIEW';
let reason = 'OFFICIAL_PAGE_NOT_REACHED';
let dimensions = {
  unit_packaged_length_cm: null,
  unit_packaged_width_cm: null,
  unit_packaged_height_cm: null,
  unit_packaged_weight_kg: null,
};

function mmToCm(v) { return Number(v) / 10; }
function gToKg(v) { return Number(v) / 1000; }

try {
  for (const url of candidateUrls) {
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2500);
      bodyText = await page.locator('body').innerText().catch(() => '');
      finalUrl = page.url();
      if (response && response.ok() && bodyText && !/access denied|forbidden|captcha|cloudflare/i.test(bodyText)) break;
    } catch {}
  }

  await page.screenshot({ path: path.join(outDir, `${partNumber.replaceAll('.', '_')}.png`), fullPage: true }).catch(() => {});
  fs.writeFileSync(path.join(outDir, `${partNumber.replaceAll('.', '_')}.txt`), bodyText || '', 'utf8');

  const box = bodyText.match(/Box\s*\(width\s*x\s*length\s*x\s*height\)\s*:\s*([0-9.]+)\s*x\s*([0-9.]+)\s*x\s*([0-9.]+)\s*\(mm\)/i);
  const gross = bodyText.match(/Gross weight filter\s*\+\s*box\s*:\s*([0-9.]+)\s*g\b/i);
  const qty = bodyText.match(/Quantity unit packaging\s*:\s*([0-9]+)/i);

  if (box && gross && qty && Number(qty[1]) === 1) {
    dimensions = {
      unit_packaged_width_cm: mmToCm(box[1]),
      unit_packaged_length_cm: mmToCm(box[2]),
      unit_packaged_height_cm: mmToCm(box[3]),
      unit_packaged_weight_kg: gToKg(gross[1]),
    };
    status = 'RESOLVED';
    reason = null;
  } else if (finalUrl && finalUrl.includes('ufi-aftermarket.com')) {
    status = 'UNRESOLVED';
    reason = 'OFFICIAL_SOURCE_LACKS_COMPLETE_UNIT_PACKAGED_FIELDS';
  }

  const record = {
    captured_at: new Date().toISOString(),
    scope: 'HD',
    organization_id: 'ufi_filters',
    manufacturer: 'UFI Filters',
    part_number: partNumber,
    source_url: finalUrl,
    source_type: 'official_product_page',
    source_hash: crypto.createHash('sha256').update(bodyText || '').digest('hex'),
    status,
    reason_code: reason,
    dimensions,
    database_write: false,
    apply: false,
  };

  fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(record, null, 2));
  console.log(JSON.stringify(record, null, 2));
} finally {
  await browser.close();
}
