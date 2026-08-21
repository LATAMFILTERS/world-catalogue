import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const analyticsFile = path.join(root, 'frontend', 'src', 'components', 'CommercialAnalytics.tsx');
const coreAnalyticsFile = path.join(root, 'frontend', 'src', 'lib', 'analytics.ts');
const failures = [];

for (const file of [analyticsFile, coreAnalyticsFile]) {
  if (!fs.existsSync(file)) failures.push(`measurement source missing: ${path.relative(root, file)}`);
}

if (failures.length === 0) {
  const commercial = fs.readFileSync(analyticsFile, 'utf8');
  const core = fs.readFileSync(coreAnalyticsFile, 'utf8');

  const requiredConversionEvents = [
    'conversion_product_intelligence',
    'conversion_application_support',
    'conversion_distributor_locator',
    'conversion_partner_application',
  ];

  for (const eventName of requiredConversionEvents) {
    if (!commercial.includes(eventName)) failures.push(`conversion event missing: ${eventName}`);
  }

  for (const marker of ['data-conversion-action', 'lead_capture_submit', 'generate_lead', 'part_search_opened']) {
    if (!commercial.includes(marker)) failures.push(`commercial measurement marker missing: ${marker}`);
  }

  if (!commercial.includes("import { trackEvent } from '@/lib/analytics'")) {
    failures.push('CommercialAnalytics is not using the unified GA4/PostHog dispatcher');
  }

  if (!core.includes("window.posthog.capture(name, properties)")) {
    failures.push('PostHog capture is missing from unified analytics dispatcher');
  }
  if (!core.includes("window.gtag('event', name, properties)")) {
    failures.push('GA4 event dispatch is missing from unified analytics dispatcher');
  }
}

if (failures.length) {
  console.error('[validate-conversion-measurement] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[validate-conversion-measurement] PASS — governed conversion clicks and successful leads are instrumented for GA4/PostHog');
