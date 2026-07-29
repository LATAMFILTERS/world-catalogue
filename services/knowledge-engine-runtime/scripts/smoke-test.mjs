#!/usr/bin/env node

/**
 * Knowledge Engine Runtime Smoke Test
 *
 * Validates:
 * - Service health
 * - Authentication enforcement
 * - Reasoning endpoint
 *
 * Exit code: 0 on success, 1 on failure
 */

const TIMEOUT = parseInt(process.env.SMOKE_TIMEOUT || '30', 10) * 1000;
const BASE_URL = process.env.KNOWLEDGE_ENGINE_BASE_URL || 'https://knowledge-engine-runtime-staging.onrender.com';
const API_KEY = process.env.ENGINE_API_KEY_STAGING || '';

if (!API_KEY && BASE_URL.includes('staging.onrender.com')) {
  console.error('ERROR: ENGINE_API_KEY_STAGING secret not provided');
  process.exit(1);
}

async function fetch_with_timeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    return false;
  }
}

async function run() {
  console.log(`Knowledge Engine Runtime Smoke Test`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT / 1000}s\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Health check
  if (await test('Health endpoint responds', async () => {
    const response = await fetch_with_timeout(`${BASE_URL}/health`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    if (data.status !== 'ok') throw new Error(`Unexpected status: ${data.status}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Authentication required
  if (await test('Authentication enforced on /reason', async () => {
    const response = await fetch_with_timeout(`${BASE_URL}/api/knowledge-engine/v1/reason`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test', channel: 'WEB_CHAT' })
    });
    if (response.status !== 401) throw new Error(`Expected 401, got ${response.status}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Authenticated request (expecting database error since no knowledge records exist)
  if (await test('Authenticated request to /reason', async () => {
    const response = await fetch_with_timeout(`${BASE_URL}/api/knowledge-engine/v1/reason`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-engine-api-key': API_KEY
      },
      body: JSON.stringify({
        query: 'What is ISO 16889?',
        channel: 'WEB_CHAT',
        audience: 'TECHNICAL_SUPPORT'
      })
    });
    // Accept 200 (success with no records) or 503 (database unavailable) or 400 (schema missing)
    if (![200, 400, 503].includes(response.status)) {
      throw new Error(`Expected 200/400/503, got ${response.status}`);
    }
  })) {
    passed++;
  } else {
    failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
