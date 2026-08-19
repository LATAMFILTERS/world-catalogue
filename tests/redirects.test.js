'use strict';

// Verifies the 21 legacy pre-migration marketing URLs (found bleeding Search
// Console impressions with zero clicks) now return a real HTTP 301 with the
// correct Location header, instead of the removed client-side meta-refresh
// stub pages. Boots server-original.js in-process on an ephemeral test port
// so this runs offline, without touching the live database or production.
//
// Run: node --test tests/redirects.test.js

const test = require('node:test');
const assert = require('node:assert/strict');

process.env.PORT = process.env.PORT || '4173';
process.env.ADMIN_KEY = process.env.ADMIN_KEY || 'test-admin-key';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const BASE_URL = `http://localhost:${process.env.PORT}`;

// server-original.js calls app.listen() as a side effect of being required.
require('../server-original.js');

const REDIRECT_CASES = [
  ['/mining/', '/industries/mining/'],
  ['/technology/', '/technologies/'],
  ['/oil-filtration/', '/systems/lubrication/'],
  ['/gas-filters/', '/systems/air-intake/'],
  ['/marine-filters/', '/industries/marine/'],
  ['/dealer-portal/', '/distributors/'],
  ['/about-elimfilters/', '/about/'],
  ['/contact-2/', '/contact/'],
  ['/industries-we-service/', '/industries/'],
  ['/power-generations-industry/', '/industries/power-generation/'],
  ['/duratech-technology/', '/commercial-lines/duratech/'],
  ['/coolant-filters/', '/systems/cooling-system/'],
  ['/trucks-fleets/', '/industries/trucks-fleets/'],
  ['/systems/fuel/', '/systems/fuel-cleanliness/'],
  ['/systems/oil/', '/systems/lubrication/'],
  ['/systems/marine/', '/industries/marine/'],
  ['/technologies/THERMACORE/', '/technologies/thermacore/'],
  ['/technologies/turbocore-series/', '/technologies/hydrocore/'],
  ['/technologies/turbocore/', '/technologies/hydrocore/'],
  ['/technologies/duratech/', '/commercial-lines/duratech/'],
  ['/technologies/marineclean/', '/commercial-lines/marineclean/'],
];

test('legacy marketing URLs — 21 cases', async (t) => {
  // Give the server a moment to bind before the first request.
  await new Promise((resolve) => setTimeout(resolve, 300));

  for (const [from, to] of REDIRECT_CASES) {
    await t.test(`${from} -> 301 ${to}`, async () => {
      const res = await fetch(`${BASE_URL}${from}`, { redirect: 'manual' });
      assert.equal(res.status, 301, `expected 301 for ${from}, got ${res.status}`);
      assert.equal(res.headers.get('location'), to, `expected Location: ${to} for ${from}`);
    });
  }

  // Query strings must be preserved across the redirect.
  await t.test('query string preserved', async () => {
    const res = await fetch(`${BASE_URL}/mining/?utm_source=test`, { redirect: 'manual' });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), '/industries/mining/?utm_source=test');
  });

  // /knowledge-system must still 301 exactly as before (unmodified block).
  await t.test('/knowledge-system/ untouched — still 301', async () => {
    const res = await fetch(`${BASE_URL}/knowledge-system/`, { redirect: 'manual' });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), '/knowledge-center/');
  });
});
