require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a minute.' },
});
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests.' },
});
// Higher limit for bulk import endpoints (Mann LD: ~100+ batches of 20)
const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many import requests.' },
});
// ─── Admin key middleware ─────────────────────────────────────────────────────
const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) throw new Error('ADMIN_KEY environment variable is required');

const _extractAdminKey = (req) => {
  const authHeader = req.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return '';
};
const requireAdmin = (req, res, next) => {
  const key = _extractAdminKey(req);
  if (!key || key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
  next();
};

// Prevent unhandled errors from crashing the process
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

const app = express();
app.set('trust proxy', 1);

// ─── HTTPS enforcement + security headers (production only) ────────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, 'https://' + req.get('host') + req.originalUrl);
  }
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// ─── SEO/GEO Redirects (knowledge-system -> knowledge-center) ───────────────────
// Maps legacy routes to new structures. Covers trailing slashes and retains query parameters.
const LEGACY_REDIRECTS = {
  '/knowledge-system': '/knowledge-center',
  '/knowledge-system/': '/knowledge-center/',
  '/knowledge-system/index': '/knowledge-center',
  '/knowledge-system/index/': '/knowledge-center/',
  '/knowledge-system/science': '/knowledge-center/engineering',
  '/knowledge-system/science/': '/knowledge-center/engineering/',

  '/knowledge-system/standards': '/knowledge-center/standards',
  '/knowledge-system/standards/': '/knowledge-center/standards/',
  '/knowledge-system/standards/lube-oil-systems': '/knowledge-center/systems/lubrication-protection',
  '/knowledge-system/standards/lube-oil-systems/': '/knowledge-center/systems/lubrication-protection/',
  '/knowledge-system/standards/hydraulic-systems': '/knowledge-center/systems/hydraulic-protection',
  '/knowledge-system/standards/hydraulic-systems/': '/knowledge-center/systems/hydraulic-protection/',
  '/knowledge-system/standards/air-intake-systems': '/knowledge-center/systems/air-intake-protection',
  '/knowledge-system/standards/air-intake-systems/': '/knowledge-center/systems/air-intake-protection/',
  '/knowledge-system/standards/fuel-systems': '/knowledge-center/systems/fuel-cleanliness-protection',
  '/knowledge-system/standards/fuel-systems/': '/knowledge-center/systems/fuel-cleanliness-protection/',
  '/knowledge-system/standards/cabin-safety-systems': '/knowledge-center/systems/cabin-air-protection',
  '/knowledge-system/standards/cabin-safety-systems/': '/knowledge-center/systems/cabin-air-protection/',
  '/knowledge-system/standards/compressed-air-systems': '/knowledge-center/standards/iso-8573-1',
  '/knowledge-system/standards/compressed-air-systems/': '/knowledge-center/standards/iso-8573-1/',
  '/knowledge-system/standards/iso-16889': '/knowledge-center/standards/iso-16889',
  '/knowledge-system/standards/iso-16889/': '/knowledge-center/standards/iso-16889/',
  '/knowledge-system/standards/iso-4406': '/knowledge-center/standards/iso-4406',
  '/knowledge-system/standards/iso-4406/': '/knowledge-center/standards/iso-4406/',
  '/knowledge-system/standards/iso-5011': '/knowledge-center/standards/iso-5011',
  '/knowledge-system/standards/iso-5011/': '/knowledge-center/standards/iso-5011/',

  '/knowledge-system/contamination': '/knowledge-center/engineering',
  '/knowledge-system/contamination/': '/knowledge-center/engineering/',
  '/knowledge-system/contamination/hydraulic-system': '/knowledge-center/engineering/contamination-control',
  '/knowledge-system/contamination/hydraulic-system/': '/knowledge-center/engineering/contamination-control/',
  '/knowledge-system/contamination/particle-wear': '/knowledge-center/engineering/contamination-control',
  '/knowledge-system/contamination/particle-wear/': '/knowledge-center/engineering/contamination-control/',
  '/knowledge-system/contamination/diesel-water': '/knowledge-center/engineering/fluid-cleanliness',
  '/knowledge-system/contamination/diesel-water/': '/knowledge-center/engineering/fluid-cleanliness/',
  '/knowledge-system/contamination/varnish-formation': '/knowledge-center/engineering/contamination-control',
  '/knowledge-system/contamination/varnish-formation/': '/knowledge-center/engineering/contamination-control/',
  '/knowledge-system/contamination/fuel-injector-wear': '/knowledge-center/engineering/fluid-cleanliness',
  '/knowledge-system/contamination/fuel-injector-wear/': '/knowledge-center/engineering/fluid-cleanliness/',
  '/knowledge-system/contamination/compressed-air-contamination': '/knowledge-center/standards/iso-8573-1',
  '/knowledge-system/contamination/compressed-air-contamination/': '/knowledge-center/standards/iso-8573-1/',
  '/knowledge-system/contamination/coolant-contamination': '/knowledge-center/systems/cooling-system-protection',
  '/knowledge-system/contamination/coolant-contamination/': '/knowledge-center/systems/cooling-system-protection/',

  '/knowledge-system/fleet': '/knowledge-center/technical-library',
  '/knowledge-system/fleet/': '/knowledge-center/technical-library/',
  '/knowledge-system/fleet/reducing-downtime': '/knowledge-center/technical-library',
  '/knowledge-system/fleet/reducing-downtime/': '/knowledge-center/technical-library/',
  '/knowledge-system/fleet/fuel-efficiency': '/knowledge-center/technical-library',
  '/knowledge-system/fleet/fuel-efficiency/': '/knowledge-center/technical-library/',
  '/knowledge-system/fleet/total-cost-ownership': '/knowledge-center/engineering/total-cost-of-ownership',
  '/knowledge-system/fleet/total-cost-ownership/': '/knowledge-center/engineering/total-cost-of-ownership/',
  '/knowledge-system/fleet/roi-calculator': '/knowledge-center/technical-library',
  '/knowledge-system/fleet/roi-calculator/': '/knowledge-center/technical-library/',

  '/knowledge-system/bridges': '/knowledge-center',
  '/knowledge-system/bridges/': '/knowledge-center/',
  '/knowledge-system/bridges/industrial-filtration': '/knowledge-center',
  '/knowledge-system/bridges/industrial-filtration/': '/knowledge-center/',
  '/knowledge-system/bridges/aftermarket-selection': '/knowledge-center',
  '/knowledge-system/bridges/aftermarket-selection/': '/knowledge-center/',
  '/knowledge-system/bridges/fleet-solutions': '/knowledge-center/technical-library',
  '/knowledge-system/bridges/fleet-solutions/': '/knowledge-center/technical-library/',
  '/knowledge-system/bridges/oem-replacement': '/knowledge-center',
  '/knowledge-system/bridges/oem-replacement/': '/knowledge-center/',

  '/knowledge-system/compare': '/knowledge-center',
  '/knowledge-system/compare/': '/knowledge-center/',
  '/knowledge-system/compare/evaluation-framework': '/knowledge-center/technical-library',
  '/knowledge-system/compare/evaluation-framework/': '/knowledge-center/technical-library/',
  '/knowledge-system/compare/oem-comparison': '/knowledge-center',
  '/knowledge-system/compare/oem-comparison/': '/knowledge-center/',
  '/knowledge-system/compare/system-vs-commodity': '/knowledge-center',
  '/knowledge-system/compare/system-vs-commodity/': '/knowledge-center/',
  '/knowledge-system/compare/total-cost-ownership': '/knowledge-center/engineering/total-cost-of-ownership',
  '/knowledge-system/compare/total-cost-ownership/': '/knowledge-center/engineering/total-cost-of-ownership/'
};

app.use((req, res, next) => {
  const requestPath = req.path;
  if (requestPath.startsWith('/knowledge-system')) {
    const target = LEGACY_REDIRECTS[requestPath];
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    if (target) {
      return res.redirect(301, target + queryString);
    }
    const wildcardTarget = requestPath.replace(/^\/knowledge-system/, '/knowledge-center');
    return res.redirect(301, wildcardTarget + queryString);
  }
  next();
});

// Healthcheck FIRST — must respond before anything else can fail
app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '3.8.1-ld-diag' }));

app.use(cors({
  origin: [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'https://part-search.elimfilters.com',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api/import', express.json({ charset: 'utf-8', limit: '10mb' }));
app.use(express.json({ charset: 'utf-8', limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
const frontendStatic = express.static('frontend/out', { maxAge: '1h', etag: true, lastModified: true });
const partSearchStatic = express.static('part-search', { maxAge: '1h', etag: true, lastModified: true });

// Serve Part Search with the frontend typography and normalized controls.
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const host = req.get('host') || req.hostname || '';
  if (!host.includes('part-search') || (req.path !== '/' && req.path !== '/index.html')) return next();

  try {
    const indexPath = path.join(__dirname, 'part-search', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html
      .replace('</head>', '  <link rel="stylesheet" href="/elim-ui-fix.css?v=20260713b">\n</head>')
      .replace(/(<button\b[^>]*class="[^"]*btn-search[^"]*"[^>]*>)[\s\S]*?(<\/button>)/gi, '$1SEARCH$2')
      .replace(/<span\b[^>]*class="[^"]*input-icon[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.type('html').send(html);
  } catch (error) {
    console.error('[part-search-ui]', error.message);
    return next();
  }
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const host = req.get('host') || req.hostname || '';
  if (host.includes('part-search')) {
    partSearchStatic(req, res, next);
  } else {
    frontendStatic(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  express.static('public')(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  express.static('www')(req, res, next);
});

const _escHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
async function _verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) return true;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    const data = await r.json();
    return data.success === true;
  } catch {
    return false;
  }
}
