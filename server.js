require('dotenv').config();
const express = require('express');
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

// Healthcheck FIRST — must respond before anything else can fail
app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '3.8.0' }));


app.use(cors({
  origin: [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'https://part-search.elimfilters.com',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Import endpoints need larger body limit (Mann fitment can be 300+ rows per product)
app.use('/api/import', express.json({ charset: 'utf-8', limit: '10mb' }));
app.use(express.json({ charset: 'utf-8', limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
const frontendStatic = express.static('frontend/out', { maxAge: '1h', etag: true, lastModified: true });
const partSearchStatic = express.static('part-search', { maxAge: '1h', etag: true, lastModified: true });

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
  if (!TURNSTILE_SECRET) return true; // skip if not configured
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

// Contact form endpoint
app.post('/api/contact', searchLimiter, async (req, res) => {
  const { name, email, phone, company, message, turnstileToken } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (name.length > 200 || email.length > 254 || message.length > 5000 ||
      (phone && phone.length > 30) || (company && company.length > 200)) {
    return res.status(400).json({ error: 'Input exceeds maximum length' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!await _verifyTurnstile(turnstileToken, req.ip)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }
  const safeName    = _escHtml(name);
  const safeEmail   = _escHtml(email);
  const safePhone   = _escHtml(phone || '—');
  const safeCompany = _escHtml(company || '—');
  const safeMessage = _escHtml(message).replace(/\n/g, '<br>');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: 'info@elimfilters.com',
        pass: process.env.GODADDY_MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Web" <info@elimfilters.com>',
      to: 'info@elimfilters.com',
      replyTo: safeEmail,
      subject: `[Web Contact] ${safeName} — ${safeCompany}`,
      html: `
        <h2 style="color:#000">New contact from elimfilters.com</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%">
          <tr><td><b>Name</b></td><td>${safeName}</td></tr>
          <tr><td><b>Email</b></td><td>${safeEmail}</td></tr>
          <tr><td><b>Phone</b></td><td>${safePhone}</td></tr>
          <tr><td><b>Company</b></td><td>${safeCompany}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="background:#f5f5f5;padding:1rem">${safeMessage}</p>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});


// Distributor application endpoint
app.post('/api/distributor', searchLimiter, async (req, res) => {
  const {
    companyName, legalName, contactName, email, phone,
    country, state, employees, yearsInBusiness,
    currentProducts, serviceArea, message,
  } = req.body || {};

  if (!companyName || !contactName || !email || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (email.length > 254 || companyName.length > 200 || contactName.length > 200 ||
      (phone && phone.length > 30) || (message && message.length > 5000)) {
    return res.status(400).json({ error: 'Input exceeds maximum length' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!await _verifyTurnstile(req.body.turnstileToken, req.ip)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }

  const esc = _escHtml;
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: { user: 'info@elimfilters.com', pass: process.env.GODADDY_MAIL_PASS },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Web" <info@elimfilters.com>',
      to: 'distribution_network@elimfilters.com',
      replyTo: esc(email),
      subject: `[Distributor] ${esc(companyName)} — ${esc(country)}`,
      html: `
        <h2 style="color:#000">New distributor application — elimfilters.com</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;font-family:sans-serif">
          <tr style="background:#f5f5f5"><td><b>Company</b></td><td>${esc(companyName)}</td></tr>
          <tr><td><b>Legal name</b></td><td>${esc(legalName || '—')}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Contact</b></td><td>${esc(contactName)}</td></tr>
          <tr><td><b>Email</b></td><td>${esc(email)}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Phone</b></td><td>${esc(phone || '—')}</td></tr>
          <tr><td><b>Country</b></td><td>${esc(country)}</td></tr>
          <tr style="background:#f5f5f5"><td><b>State/Region</b></td><td>${esc(state || '—')}</td></tr>
          <tr><td><b>Employees</b></td><td>${esc(employees || '—')}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Years in business</b></td><td>${esc(yearsInBusiness || '—')}</td></tr>
          <tr><td><b>Current products</b></td><td>${esc(currentProducts || '—')}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Service area</b></td><td>${esc(serviceArea || '—')}</td></tr>
        </table>
        ${message ? `<h3>Additional message</h3><p style="background:#f5f5f5;padding:1rem">${esc(message).replace(/\n/g, '<br>')}</p>` : ''}
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[distributor]', err.code || 'SMTP error');
    res.status(500).json({ error: 'Failed to send application' });
  }
});

// ─── Chat API (Groq / Llama-3.3-70b) ────────────────────────────────────────
const _chatSessions = new Map(); // sessionId → { count, lastActivity }
const CHAT_LIMIT = 5;
const CHAT_SYSTEM_PROMPT = `You are the ELIMFILTERS Asset Protection Assistant — a knowledgeable, warm, and consultative expert in industrial filtration. Your role is to guide every user to the right solution through conversation, regardless of their technical background.

## Conversation approach

**For non-technical users or vague questions:**
Guide them step by step with short, friendly questions — one at a time. Never overwhelm. Discover:
1. What type of equipment or machinery they use (truck, excavator, agricultural tractor, compressor, hydraulic press, etc.)
2. What problem or concern they have (excessive wear, filter clogging, contamination, high downtime, oil looking dirty, etc.)
3. Which system is affected (engine, hydraulic circuit, fuel system, cabin, compressed air)
Then connect their problem to the right ELIMFILTERS solution: contamination source → protection technology → product line.

**For technical users** (they use terms like ISO, Beta ratio, micron, cleanliness code, ppm, etc.):
Answer directly, precisely, and cordially. Use the full technical depth they expect. Reference ISO codes, Beta ratios, micron ratings, and quantified operational impacts.

**In both cases:**
- Be human, warm, and conversational — never robotic or like a product catalog
- Keep responses concise (2–3 short paragraphs or a brief guided question)
- Never list all capabilities unprompted
- No marketing language ("best", "leading", "superior", "premium")
- Respond in the same language as the user
- **Never improvise or invent information.** Only answer what you know with certainty from your knowledge base.
- **When uncertain, information is missing, or the question exceeds your knowledge:** do not guess. Acknowledge the limit honestly and refer the user to the ELIMFILTERS engineering team: "For this specific question, I recommend contacting our technical team directly at support@elimfilters.com — they can give you a precise answer for your application."

## Technical knowledge base

Filtration domains and key standards:
- Engine lube oil: ISO 16889 (Beta ratio testing), ISO 4406 (cleanliness codes 16/14/11 target)
- Air intake: ISO 5011 / SAE J726 (efficiency, dust capacity, collapse test)
- Hydraulic: ISO 16889, NFPA T2.14 (servo valves need ISO 16/14/11; cylinders ISO 19/17/14)
- Fuel / HPCR: ASTM D6304, ISO 12937 (Karl Fischer water), ISO 16332
- Cabin air: ISO 11155, DIN 71220 (PM10, allergens, operator health)
- Compressed air: ISO 8573-1 (purity classes: particles, water, oil)

ELIMFILTERS technologies by domain:
- MACROCORE → air intake (ISO 5011 certified)
- SYNTRAX → engine lube oil (ISO 16889)
- NANOFORCE → hydraulic systems (ISO 16889, sub-micron)
- SYNTEPORE → fuel / HPCR injectors (ASTM D6304)
- HYDROCORE → fuel water separation (ASTM D6304)
- TURBOCORE → fuel 3-stage filtration (ISO 16332)
- MICROKAPPA → cabin air (ISO 11155, DIN 71220)
- DRYCORE → compressed air / pneumatic (ISO 8573)
- THERMACORE → cooling system SCA additive
- DURATECH → fleet maintenance master kits

Failure chains (root cause → consequence):
- Particles in oil → abrasive wear → bearing clearance reduction → seizure
- Water in diesel → injector stiction → HPCR pump failure
- Dirty hydraulic fluid → valve spool wear → control loss → unplanned downtime
- Unfiltered cabin air → operator PM10 exposure → health / regulatory risk`;


// Cleanup sessions older than 24 h (run every hour)
setInterval(() => {
  const cutoff = Date.now() - 86400000;
  for (const [id, s] of _chatSessions) {
    if (s.lastActivity < cutoff) _chatSessions.delete(id);
  }
}, 3600000);

app.post('/api/chat', searchLimiter, async (req, res) => {
  try {
    const { message, sessionId } = req.body || {};
    if (!message || typeof message !== 'string' || !sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Missing message or sessionId' });
    }
    if (message.length > 1000) return res.status(400).json({ error: 'Message too long' });

    const session = _chatSessions.get(sessionId) || { count: 0, lastActivity: Date.now() };
    if (session.count >= CHAT_LIMIT) {
      return res.json({ limitReached: true, messagesLeft: 0 });
    }
    session.count++;
    session.lastActivity = Date.now();
    _chatSessions.set(sessionId, session);
    const messagesLeft = CHAT_LIMIT - session.count;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[chat] GROQ_API_KEY not set');
      return res.status(503).json({ error: 'Chat service not configured' });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 450,
        temperature: 0.25,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('[chat] Groq error:', groqRes.status, err.slice(0, 200));
      return res.status(502).json({ error: 'LLM service error' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty Groq response');

    return res.json({ reply, messagesLeft, limitReached: messagesLeft === 0 });
  } catch (err) {
    console.error('[chat]', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// Middleware para encoding UTF-8 — solo rutas API, no archivos estáticos ni webhook
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL_VERIFY === 'true'
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
};
const pool = new Pool(dbConfig);
pool.on('connect', client => {
  client.query("SET statement_timeout = '8000'").catch(() => {});
});

// ─── Cache layer (Redis if REDIS_URL set, otherwise in-memory Map) ────────────
let _redis = null;
if (process.env.REDIS_URL) {
  const Redis = require('ioredis');
  _redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    connectTimeout: 3000,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
  _redis.on('error', (e) => console.error('[redis]', e.message));
  _redis.connect().then(() => console.log('[cache] Redis connected')).catch(() => {
    console.warn('[cache] Redis unavailable — falling back to in-memory cache');
    _redis = null;
  });
}

const _memCache = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _memCache) if (now > v.exp) _memCache.delete(k);
}, 5 * 60 * 1000);

async function cacheGet(key) {
  if (_redis) {
    try {
      const raw = await _redis.get(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch { /* fall through */ }
  }
  const entry = _memCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.exp) { _memCache.delete(key); return undefined; }
  return entry.val;
}

const MEM_CACHE_MAX = 200;
async function cacheSet(key, val, ttlMs) {
  if (_redis) {
    try {
      await _redis.set(key, JSON.stringify(val), 'PX', ttlMs);
      return;
    } catch { /* fall through */ }
  }
  if (_memCache.size >= MEM_CACHE_MAX) {
    _memCache.delete(_memCache.keys().next().value);
  }
  _memCache.set(key, { val, exp: Date.now() + ttlMs });
}

// Filter brands (competitors) — everything else is an OEM equipment manufacturer
const COMPETITOR_BRANDS = new Set([
  'DONALDSON','BALDWIN','FLEETGUARD','MANN','MANN+HUMMEL','MANN-HUMMEL',
  'WIX','FRAM','PUROLATOR','NAPA','AC DELCO','ACDELCO','BOSCH','MAHLE',
  'HENGST','SAKURA','HASTINGS','LUBER-FINER','LUBERFINER','PARKER',
  'PALL','HYDAC','MP FILTRI','MPFILTRI','UFI','CHAMPION','COOPERSFITERS',
  'COOPERSFILTERS','MOTORCRAFT','KNECHT','SOGEFI','FILTRON','SOFIMA',
  'FIAAM','NIPPARTS','STARLINE','CHAMPION LABS','CARQUEST','PRONTO',
  'DEFENSE','PENNZOIL','CASTROL','MOBIL','SHELL','TOTAL','DENSO',
  'TISCO','TRACTORPARTS','AGCO','ATLAS COPCO','SULLAIR','INGERSOLL RAND',
  'COMPAIR','GARDNER DENVER','QUINCY','LEROI','KOBELCO COMPRESSORS',
  'ALCO','INLINE','GOLDENROD','RACOR','PARKER RACOR','DAVCO',
  'FLEETRITE','JOHN DEERE PARTS','CAT PARTS','CASE PARTS',
  'EUROPART','DINEX','TRUCKTEC','FEBI','SWAG','MEYLE','VALEO',
  'ELOFIC','WABCO','KNORR','ALLISON','ZF',
]);

function isCompetitor(manufacturer) {
  if (!manufacturer) return false;
  // Strip trademark/registered symbols before matching — some scraped brand
  // names carry them (e.g. "FLEETGUARD®"), which would otherwise silently
  // fail the exact-match lookup and misclassify a competitor as OEM.
  const m = manufacturer.toUpperCase().replace(/[®™]/g, '').trim();
  // Direct match
  if (COMPETITOR_BRANDS.has(m)) return true;
  // Partial match for common patterns
  return m.includes('FILTER') || m.includes('FILTR') || m.includes('FILTRO');
}

function parseRefs(arr){
  if (!Array.isArray(arr)) return [];

  // Bad scraper data occasionally stores an internal field name (a spec-table
  // column header, or literal webpage UI text like "Find a Dealer") in either
  // the "manufacturer" or the "code" position of a cross-reference entry —
  // the two got scrambled at import time, not consistently in one position.
  // These must never reach the API response.
  const INVALID = new Set([
    'THREADSIZE',
    'LARGESTOD',
    'SMALLESTOD',
    'LENGTH',
    'HEIGHT',
    'GASKETOD',
    'GASKETID',
    'PRESSUREVALVE',
    'RATEDFLOW',
    'MEDIATYPE',
    'RELATEDPARTS',
    'RELATED PARTS',
    'MAINTENANCEKITS',
    'MAINTENANCE KITS',
    'TESTSPECIFICATION',
    'PRODUCT DESCRIPTION',
    'PRODUCTDESCRIPTION',
    'APPLICABLEREGION',
    'UPGRADE OF',
    'UPGRADEOF',
    'FOR UPGRADE, USE',
    'FIND A DEALER',
    'DOWNLOAD SPECS',
    'OEM CROSS REFERENCE',
    'CELLULOSE',
    'NO'
  ]);

  // A real manufacturer name or reference code never looks like a physical
  // measurement (a number followed by a unit). When either field matches
  // this shape, the entry is spec-table noise, not a genuine cross-reference.
  const MEASUREMENT = /\d\s*(INCH|MM|GPM|L\/MIN|MICRON|PSI|BAR|UN|UNF|KG|LB)\b/i;

  // A real manufacturer name always contains at least one letter (Caterpillar,
  // 3M, SKF...). Some scraped rows pair two part numbers together (e.g.
  // {manufacturer: "23518480", code: "23527033"} — a related/alternate code
  // relationship, not a cross-reference brand) with no company name at all.
  const HAS_LETTER = /[A-Za-z]/;

  // A real manufacturer name is never *shaped* like a part number either —
  // a short letter prefix (0-4 chars) immediately followed by 3+ digits
  // (LF3620, FL1994, E12981309) is a reference code, not a company name.
  // Real company names are either pure letters/spaces (CATERPILLAR, ATLAS
  // COPCO) or a short alphanumeric abbreviation with few digits (3M).
  const CODE_SHAPED = /^[A-Za-z]{0,4}\d{3,}[A-Za-z0-9]*$/;

  const seen = new Set();

  return arr
    .map(item => ({
      manufacturer: fixMojibake(String(item.manufacturer || item.brand || '').trim()),
      code: fixMojibake(String(item.code || '').trim())
    }))
    .filter(r => r.manufacturer && r.code)
    .filter(r => !INVALID.has(r.manufacturer.toUpperCase()) && !INVALID.has(r.code.toUpperCase()))
    .filter(r => !MEASUREMENT.test(r.manufacturer) && !MEASUREMENT.test(r.code))
    .filter(r => HAS_LETTER.test(r.manufacturer))
    .filter(r => !CODE_SHAPED.test(r.manufacturer))
    .filter(r => {
      const k = (r.manufacturer + '|' + r.code).toUpperCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

// ── Shared: resolve alternatives[] P-codes → ELIMFILTERS SKUs + inherit data ──
// Called from every search endpoint so all modes (part / VIN / equipment) benefit.
// alternatives[] is stored as codigo_base values ("P552100"). This function resolves
// them to EL-SKUs in one batch query and inherits equipment_applications /
// competitor_codes from the source product when the current product has none.
async function enrichAlternatives(products, client) {
  const withAlts = products.filter(p =>
    Array.isArray(p.alternatives) && p.alternatives.length > 0
  );
  if (!withAlts.length) return;

  const altCodes = [...new Set(withAlts.flatMap(p =>
    p.alternatives
      .map(a => typeof a === 'object' ? (a.sku || a.code || '') : String(a))
      .filter(Boolean)
      .map(c => c.toUpperCase())
  ))];
  if (!altCodes.length) return;

  const { rows } = await client.query(
    `SELECT sku, codigo_base, oem_codes, competitor_codes, equipment_applications
     FROM elimfilters_catalog
     WHERE UPPER(codigo_base) = ANY($1)`,
    [altCodes]
  );

  const altMap = {};
  rows.forEach(r => { if (r.codigo_base) altMap[r.codigo_base.toUpperCase()] = r; });

  for (const p of withAlts) {
    const resolvedSkus = [];
    for (const a of p.alternatives) {
      const cb = (typeof a === 'object' ? (a.sku || a.code || '') : String(a)).toUpperCase();
      const src = altMap[cb];
      if (!src) continue;
      if (src.sku) resolvedSkus.push(src.sku);
      if (p.equipment_applications.length === 0 && Array.isArray(src.equipment_applications) && src.equipment_applications.length) {
        p.equipment_applications = src.equipment_applications;
      }
      if (p.competitor_codes.length === 0) {
        const srcRefs = splitRefs([...parseRefs(src.oem_codes), ...parseRefs(src.competitor_codes)]);
        if (srcRefs.competitor.length) p.competitor_codes = srcRefs.competitor;
        if (p.oem_codes.length === 0 && srcRefs.oem.length) p.oem_codes = srcRefs.oem;
      }
    }
    if (resolvedSkus.length > 0) p.alternatives = resolvedSkus;
  }
}

// Split a combined refs array into { oem, competitor }
function splitRefs(arr) {
  if (!arr || !Array.isArray(arr)) return { oem: [], competitor: [] };
  const oem = [], competitor = [];
  arr.forEach(item => {
    const mfr = item.manufacturer || item.brand || '';
    if (isCompetitor(mfr)) competitor.push(item);
    else oem.push(item);
  });
  return { oem, competitor };
}

function detectLang(req) {
  if (req.query.lang) {
    const qLang = String(req.query.lang).toLowerCase().trim();
    if (qLang === 'es' || qLang === 'en' || qLang === 'pt' || qLang === 'fr' || qLang === 'it' || qLang === 'nl' || qLang === 'ru' || qLang === 'zh' || qLang === 'ja' || qLang === 'ar' || qLang === 'fa') {
      return qLang;
    }
  }
  const langs = (req.headers['accept-language'] || '').toLowerCase()
    .split(',').map(l => l.split(';')[0].trim());
  return langs.some(l => l.startsWith('es')) ? 'es' : 'en';
}

const PROPRIETARY_SUBTYPES = new Set([
  'synteq xp', 'synteq', 'ultra-web nanofiber', 'aquabloc® ii', 'aquabloc ii',
  'alpha-web™', 'alpha-web', 'synteq xp™',
]);
function safeSubtype(val, lang = 'en') {
  const text = extractText(val, lang);
  if (!text) return null;
  if (/[®™]/.test(text)) return null;
  if (PROPRIETARY_SUBTYPES.has(text.toLowerCase())) return null;
  return text;
}

// ── Mojibake repair ──────────────────────────────────────────────────────────
// Some catalog rows were imported through a pipeline that read UTF-8 bytes as
// Latin-1 and re-encoded them, producing sequences like "Â", "â€”", "â†'".
// Re-interpreting the string as Latin-1 bytes and decoding as UTF-8 undoes
// exactly that mistake. Only applied when the string looks corrupted, and
// only kept if the repair doesn't produce replacement characters.
const MOJIBAKE_PATTERN = /Ã[\x80-\xBF]|Â[\x80-\xBF ®™]|â€[™"" -]|â†[’'-]/;
function fixMojibake(str) {
  if (typeof str !== 'string' || !MOJIBAKE_PATTERN.test(str)) return str;
  try {
    const repaired = Buffer.from(str, 'latin1').toString('utf8');
    if (repaired && !repaired.includes('�') && repaired !== str) return repaired;
  } catch (_) {}
  return str;
}

function extractText(val, lang = 'en') {
  if (val === null || val === undefined) return null;
  // Already an object (JSONB from pg)
  if (typeof val === 'object' && !Array.isArray(val)) {
    return fixMojibake(val[lang] || val.en || val.es || Object.values(val)[0] || null);
  }
  // String – may be raw text OR a JSON-encoded object
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const p = JSON.parse(trimmed);
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          return fixMojibake(p[lang] || p.en || p.es || Object.values(p)[0] || val);
        }
      } catch (_) {}
    }
    return fixMojibake(val); // plain text
  }
  return String(val);
}

const TECH_LOGO_MAP = {
  'syntrax': 'sintrax', 'sintrax': 'sintrax',
  'nanoforce': 'nanoforce',
  'macrocore': 'macrocore',
  'intekcore': 'intekcore',
  'drycore': 'drycore',
  'duratech': 'duratech',
  'cooltech': 'cooltech',
  'syntepore': 'syntepore', 'syntapore': 'syntepore',
  'microkappa': 'microkappa',
  'gasultra': 'gasultra',
  'aquaguard': 'aquaguard',
  'marineclean': 'marineclean',
  'blueclean': 'blueclean',
};

function getTechLogo(tech) {
  if (!tech) return null;
  const key = tech.toLowerCase().replace(/[™®\s™]/g, '').trim();
  const mapped = TECH_LOGO_MAP[key];
  return mapped ? `/assets/logo-${mapped}.png` : null;
}

// Canonical technology name corrections (DB may have older/misspelled variants)
const TECH_NAME_FIXES = { 'SYNTAPORE': 'SYNTEPORE', 'SYNTAPORE™': 'SYNTEPORE™' };

// Deep-sanitizes every string leaf of an array of application objects
// (equipment_applications / vehicle_applications) against mojibake.
function fixMojibakeDeep(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (item && typeof item === 'object') {
      const out = {};
      for (const k of Object.keys(item)) {
        out[k] = typeof item[k] === 'string' ? fixMojibake(item[k]) : item[k];
      }
      return out;
    }
    return typeof item === 'string' ? fixMojibake(item) : item;
  });
}

function buildFilterData(row, lang = 'en'){
  let subtype = safeSubtype(row.sub_type, lang);

  // Enforce rule: No Cellulose/Celulosa media (sub_type) for any filter
  if (subtype && (subtype.toUpperCase() === 'CELLULOSE' || subtype.toUpperCase() === 'CELULOSA')) {
    subtype = lang === 'es' ? 'Híbrida' : 'Genuine Media';
  }

  // Re-classify on every response: after the consolidation migration oem_codes
  // may contain competitor filter-brand codes. Merging both arrays and running
  // splitRefs() keeps OEM equipment manufacturers and competitor filter brands
  // in the correct columns regardless of what the DB stored.
  const refs = splitRefs([...parseRefs(row.oem_codes), ...parseRefs(row.competitor_codes)]);

  return {
    elimfilters_sku: row.sku,
    description: extractText(row.description, lang),
    filter_type: extractText(row.filter_type, lang),
    filter_subtype: subtype,
    technology: TECH_NAME_FIXES[row.technology] || row.technology || null,
    technology_logo: getTechLogo(TECH_NAME_FIXES[row.technology] || row.technology),
    installation_type: row.installation_type || null,
    thread_size: row.thread_size || null,
    height_mm: row.height_mm || null,
    outer_diameter_mm: row.outer_diameter_mm || null,
    gasket_od_mm: row.gasket_od_mm || null,
    gasket_id_mm: row.gasket_id_mm || null,
    iso_test_method: row.iso_test_method || null,
    micron_rating: row.micron_rating || null,
    nominal_efficiency: row.nominal_efficiency || null,
    burst_pressure_psi: row.burst_pressure_psi || null,
    collapse_pressure_psi: row.collapse_pressure_psi || null,
    duty: row.duty || null,
    oem_codes:        refs.oem,
    competitor_codes: refs.competitor,
    brand_crossrefs: row.brand_crossrefs || {},
    alternatives: row.alternatives || [],
    equipment_applications: fixMojibakeDeep(row.equipment_applications),
    vehicle_applications: fixMojibakeDeep(row.vehicle_applications)
  };
}

// Duplicate status route removed — the authoritative one is at top of file (v3.8.0)








// POST /api/kits — create a kit from filter SKUs + equipment name
app.post('/api/kits', adminLimiter, requireAdmin, async (req, res) => {
  const { name, equipment_ref, filter_skus } = req.body;
  if (!name || !Array.isArray(filter_skus) || filter_skus.length === 0)
    return res.status(400).json({ success: false, error: 'name and filter_skus[] required' });
  if (name.length > 200 || (equipment_ref && equipment_ref.length > 500) || filter_skus.length > 100)
    return res.status(400).json({ success: false, error: 'Input exceeds maximum length' });

  const client = await pool.connect();
  try {

    // Determine duty from the first filter found
    const sample = await client.query(
      'SELECT duty FROM elimfilters_catalog WHERE sku = ANY($1) AND duty IS NOT NULL LIMIT 1',
      [filter_skus]
    );
    const duty = sample.rows[0]?.duty || 'LD';
    const prefix = duty === 'HD' ? 'EK3' : 'EK5';

    // Generate next kit SKU
    const last = await client.query(
      `SELECT kit_sku FROM maintenance_kits WHERE kit_sku LIKE $1 ORDER BY kit_sku DESC LIMIT 1`,
      [prefix + '%']
    );
    const nextNum = last.rows.length
      ? String(parseInt(last.rows[0].kit_sku.slice(3)) + 1).padStart(4, '0')
      : '0001';
    const kit_sku = prefix + nextNum;

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO maintenance_kits (kit_sku, name, equipment_ref, duty) VALUES ($1,$2,$3,$4)',
      [kit_sku, name, equipment_ref || null, duty]
    );
    for (const fsku of filter_skus) {
      if (!/^[A-Z]{2,3}[0-9]{4,7}[A-Z0-9]?$/.test(String(fsku).trim().toUpperCase())) continue;
      await client.query(
        'INSERT INTO kit_components (kit_sku, filter_sku) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [kit_sku, fsku.toUpperCase()]
      );
    }
    await client.query('COMMIT');

    res.status(201).json({ success: true, kit_sku, duty, name, equipment_ref, filter_skus });
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('[kits POST]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/kits/:kit_sku — full kit details with all component filters
app.get('/api/kits/:kit_sku', searchLimiter, async (req, res) => {
  const kit_sku = req.params.kit_sku.trim().toUpperCase();
  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");

    const kit = await client.query(
      'SELECT * FROM maintenance_kits WHERE kit_sku = $1',
      [kit_sku]
    );
    if (!kit.rows.length) return res.status(404).json({ success: false, error: 'Kit not found' });

    const components = await client.query(
      `SELECT c.*, kc.kit_sku
       FROM elimfilters_catalog c
       JOIN kit_components kc ON kc.filter_sku = c.sku
       WHERE kc.kit_sku = $1`,
      [kit_sku]
    );

    res.json({
      success: true,
      kit: {
        kit_sku: kit.rows[0].kit_sku,
        name: kit.rows[0].name,
        equipment_ref: kit.rows[0].equipment_ref,
        duty: kit.rows[0].duty,
        filters: components.rows.map(row => buildFilterData(row, lang))
      }
    });
  } catch(e) {
    console.error('[kits GET]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/filters/kits?sku=XXX — which kits contain this filter
app.get('/api/filters/kits', searchLimiter, async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({ success: false, kits: [] });
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT mk.kit_sku, mk.name, mk.equipment_ref, mk.duty
       FROM maintenance_kits mk
       JOIN kit_components kc ON kc.kit_sku = mk.kit_sku
       WHERE kc.filter_sku = $1`,
      [sku]
    );
    res.json({ success: true, kits: result.rows });
  } catch(e) {
    console.error('[filters/kits]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});


app.get('/api/filters/alternatives', searchLimiter, async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({success: false, alternatives: []});

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      `SELECT sku, codigo_base, description, filter_type, sub_type, technology,
              duty, oem_codes, competitor_codes, brand_crossrefs,
              alternatives, equipment_applications
       FROM elimfilters_catalog
       WHERE sku = $1`,
      [sku]
    );
    if (!result.rows.length) return res.json({ success: false, alternatives: [] });
    const row = result.rows[0];
    const alts = Array.isArray(row.alternatives) ? row.alternatives : [];
    if (!alts.length) return res.json({ success: true, alternatives: [] });

    const altCodes = alts
      .map(a => typeof a === 'object' ? (a.sku || a.code || '') : String(a))
      .filter(Boolean)
      .map(c => c.toUpperCase());

    const { rows: altRows } = await client.query(
      `SELECT sku, codigo_base, description, filter_type, sub_type, technology,
              duty, oem_codes, competitor_codes, brand_crossrefs,
              alternatives, equipment_applications
       FROM elimfilters_catalog
       WHERE UPPER(codigo_base) = ANY($1)`,
      [altCodes]
    );

    const lang = detectLang(req);
    res.json({ success: true, alternatives: altRows.map(r => buildFilterData(r, lang)) });
  } catch(e) {
    console.error('[filters/alternatives]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});


// Splits a cross-reference match into HD/LD groups when a duty filter wasn't
// requested and the code hit both classes. Returns null when the rows are a
// single duty class (caller should render results normally in that case).
async function handleMixedDuty(rows, lang, client) {
  const hd = rows.filter(r => r.duty === 'HEAVY_DUTY');
  const ld = rows.filter(r => r.duty === 'LIGHT_DUTY');
  if (hd.length === 0 || ld.length === 0) return null;
  const hd_products = hd.slice(0, 10).map(r => buildFilterData(r, lang));
  const ld_products = ld.slice(0, 10).map(r => buildFilterData(r, lang));
  await enrichAlternatives(hd_products, client);
  await enrichAlternatives(ld_products, client);
  return {
    success: true,
    results: [],
    mixed_duty: true,
    hd_count: hd.length,
    ld_count: ld.length,
    hd_products,
    ld_products,
  };
}

// ─── GET /api/autocomplete ────────────────────────────────────────────────────────────────────────
// Predictive suggestions for the part number search box: SKU / codigo_base
// prefix matches and OEM/competitor cross-reference code prefix matches.
app.get('/api/autocomplete', searchLimiter, async (req, res) => {
  const raw = (req.query.q || '').trim();
  if (raw.length < 2) return res.json([]);
  const q = raw.toUpperCase().replace(/[-\s]/g, '');

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const { rows } = await client.query(
      `SELECT DISTINCT ON (val) val, type FROM (
         SELECT sku AS val, 'SKU' AS type
         FROM elimfilters_catalog
         WHERE UPPER(REPLACE(sku,'-','')) LIKE $1
         UNION ALL
         SELECT codigo_base AS val, 'BASE CODE' AS type
         FROM elimfilters_catalog
         WHERE codigo_base IS NOT NULL AND UPPER(REPLACE(codigo_base,'-','')) LIKE $1
         UNION ALL
         SELECT ref->>'code' AS val, 'OEM' AS type
         FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS ref
         WHERE UPPER(REPLACE(ref->>'code','-','')) LIKE $1
         UNION ALL
         SELECT ref->>'code' AS val, 'CROSS-REF' AS type
         FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS ref
         WHERE UPPER(REPLACE(ref->>'code','-','')) LIKE $1
       ) matches
       WHERE val IS NOT NULL AND val <> ''
       ORDER BY val, type
       LIMIT 8`,
      [q + '%']
    );
    res.json(rows.map(r => ({ text: fixMojibake(r.val), type: r.type })));
  } catch (e) {
    console.error('[autocomplete]', e.message);
    res.json([]);
  } finally {
    client.release();
  }
});

// ─── GET /api/search ──────────────────────────────────────────────────────────────────────────────
app.get('/api/search', searchLimiter, async (req, res) => {
  const raw = (req.query.q || req.query.sku || '').trim();
  if (!raw) return res.json({ success: false, results: [] });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (SEARCH_KEY && providedKey !== SEARCH_KEY) {
    return res.status(403).json({ error: 'forbidden' });
  }

  res.set('Cache-Control', 'no-store');
  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const q = raw.toUpperCase().replace(/[-\s]/g, '');

    // 1. Exact SKU match
    const exact = await client.query(
      `SELECT * FROM elimfilters_catalog WHERE UPPER(REPLACE(sku,'-','')) = $1 LIMIT 1`,
      [q]
    );
    if (exact.rows.length > 0) {
      const products = exact.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'exact_sku' });
    }

    // 1b. codigo_base match (Donaldson base code e.g. P552100)
    const byBase = await client.query(
      `SELECT * FROM elimfilters_catalog WHERE UPPER(REPLACE(codigo_base,'-','')) = $1 LIMIT 10`,
      [q]
    );
    if (byBase.rows.length > 0) {
      const products = byBase.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'codigo_base' });
    }

    // Equipment class filter — HD and LD parts must never be mixed in a single
    // result set (different thread sizes / bypass pressures). When the caller
    // doesn't specify one and a cross-reference code hits both classes, the
    // duty-separated shape below is returned instead of a flat list.
    const dutyParam = (req.query.duty || '').trim().toUpperCase();
    const validDuty = dutyParam === 'HEAVY_DUTY' || dutyParam === 'HD' ? 'HEAVY_DUTY'
      : dutyParam === 'LIGHT_DUTY' || dutyParam === 'LD' ? 'LIGHT_DUTY'
      : null;
    const dutyClause = validDuty ? ' AND duty = $2' : '';
    const dutyArgs = validDuty ? [validDuty] : [];

    // 2. OEM / competitor cross-reference (exact match)
    const oem = await client.query(
      `SELECT * FROM elimfilters_catalog
       WHERE (EXISTS (
         SELECT 1 FROM jsonb_array_elements(oem_codes) AS ref
         WHERE UPPER(REPLACE(ref->>'code','-','')) = $1
       )
       OR EXISTS (
         SELECT 1 FROM jsonb_array_elements(competitor_codes) AS ref
         WHERE UPPER(REPLACE(ref->>'code','-','')) = $1
       ))${dutyClause}
       LIMIT 20`,
      [q, ...dutyArgs]
    );
    if (oem.rows.length > 0) {
      if (!validDuty) {
        const mixed = await handleMixedDuty(oem.rows, lang, client);
        if (mixed) return res.json(mixed);
      }
      const products = oem.rows.slice(0, 10).map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'oem_crossref' });
    }

    // 2b. OEM / competitor prefix match (e.g. PH3387 matches PH3387A, PH3387AAZ)
    if (q.length >= 4) {
      const prefix = await client.query(
        `SELECT * FROM elimfilters_catalog
         WHERE (EXISTS (
           SELECT 1 FROM jsonb_array_elements(oem_codes) AS ref
           WHERE UPPER(REPLACE(ref->>'code','-','')) LIKE $1
         )
         OR EXISTS (
           SELECT 1 FROM jsonb_array_elements(competitor_codes) AS ref
           WHERE UPPER(REPLACE(ref->>'code','-','')) LIKE $1
         ))${dutyClause}
         LIMIT 20`,
        [q + '%', ...dutyArgs]
      );
      if (prefix.rows.length > 0) {
        if (!validDuty) {
          const mixed = await handleMixedDuty(prefix.rows, lang, client);
          if (mixed) return res.json(mixed);
        }
        const products = prefix.rows.slice(0, 10).map(r => buildFilterData(r, lang));
        await enrichAlternatives(products, client);
        return res.json({ success: true, results: products, source: 'oem_prefix' });
      }
    }

    // 3. Description full-text search
    // description is JSONB ({"en": "...", "es": "..."}), not text — COALESCE
    // against a text literal throws "invalid input syntax for type json" and
    // turns every true no-match search into a 500. Pull the language values
    // out as text before building the tsvector.
    const desc = await client.query(
      `SELECT * FROM elimfilters_catalog
       WHERE to_tsvector('english',
         COALESCE(description->>'en', '') || ' ' || COALESCE(description->>'es', '')
       ) @@ plainto_tsquery('english', $1)
       LIMIT 10`,
      [raw]
    );
    if (desc.rows.length > 0) {
      const products = desc.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'description' });
    }

    res.json({ success: true, results: [], source: 'no_match' });
  } catch (e) {
    console.error('[search]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/search/vin ───────────────────────────────────────────────────────────────────────────
app.get('/api/search/vin', searchLimiter, async (req, res) => {
  const vin = (req.query.vin || '').trim().toUpperCase();
  if (!vin || vin.length !== 17) return res.status(400).json({ success: false, error: 'Invalid VIN (must be 17 chars)' });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (SEARCH_KEY && providedKey !== SEARCH_KEY) return res.status(403).json({ error: 'forbidden' });

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const { rows } = await client.query(
      `SELECT c.* FROM elimfilters_catalog c
       JOIN vin_equipment_map v ON c.sku = ANY(v.filter_skus)
       WHERE v.vin = $1
       LIMIT 20`,
      [vin]
    );
    if (!rows.length) return res.json({ success: true, results: [], source: 'vin_no_match' });
    const products = rows.map(r => buildFilterData(r, lang));
    await enrichAlternatives(products, client);
    return res.json({ success: true, results: products, source: 'vin' });
  } catch (e) {
    console.error('[search/vin]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/search/equipment ─────────────────────────────────────────────────────────────────────
app.get('/api/search/equipment', searchLimiter, async (req, res) => {
  const { make, model, year, engine } = req.query;
  if (!make && !model) return res.status(400).json({ success: false, error: 'make or model required' });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (SEARCH_KEY && providedKey !== SEARCH_KEY) return res.status(403).json({ error: 'forbidden' });

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");

    const conditions = [];
    const params = [];
    let idx = 1;

    if (make) {
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE UPPER(ea->>'make') LIKE $${idx}
      )`);
      params.push('%' + make.toUpperCase() + '%');
      idx++;
    }
    if (model) {
      // Older imports stored the equipment name under 'machine' instead of
      // 'model' (see scripts/run_004_batched.py) — match either key so
      // legacy-keyed rows aren't silently invisible to this search.
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE UPPER(COALESCE(ea->>'model', ea->>'machine')) LIKE $${idx}
      )`);
      params.push('%' + model.toUpperCase() + '%');
      idx++;
    }
    if (year) {
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE (ea->>'year_from')::int <= $${idx} AND (ea->>'year_to')::int >= $${idx}
      )`);
      params.push(parseInt(year));
      idx++;
    }
    if (engine) {
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE UPPER(ea->>'engine') LIKE $${idx}
      )`);
      params.push('%' + engine.toUpperCase() + '%');
      idx++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const { rows } = await client.query(
      `SELECT * FROM elimfilters_catalog ${whereClause} LIMIT 20`,
      params
    );

    const products = rows.map(r => buildFilterData(r, lang));
    await enrichAlternatives(products, client);
    res.json({ success: true, results: products, source: 'equipment' });
  } catch (e) {
    console.error('[search/equipment]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/debug/sku-codes ───────────────────────────────────────────────────────────────────────
app.get('/api/debug/sku-codes', searchLimiter, async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.status(400).json({ error: 'sku required' });

  const ADMIN_KEY_LOCAL = process.env.ADMIN_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!ADMIN_KEY_LOCAL || providedKey !== ADMIN_KEY_LOCAL) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      `SELECT sku, duty, filter_type, competitor_codes, oem_codes
       FROM elimfilters_catalog WHERE sku = $1`,
      [sku]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'not found' });
    const row = result.rows[0];
    res.json({
      sku: row.sku,
      duty: row.duty,
      filter_type: row.filter_type,
      competitor_codes: row.competitor_codes,
      oem_codes: row.oem_codes,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/debug/suspects-equipment ─────────────────────────────────────────────────────────
app.get('/api/debug/suspects-equipment', searchLimiter, async (req, res) => {
  const ADMIN_KEY_LOCAL = process.env.ADMIN_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!ADMIN_KEY_LOCAL || providedKey !== ADMIN_KEY_LOCAL) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;
  const filter_type = req.query.filter_type || null;

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const conditions = ["(equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)"];
    const params = [];
    let idx = 1;
    if (filter_type) {
      conditions.push(`filter_type = $${idx}`);
      params.push(filter_type);
      idx++;
    }
    params.push(limit, offset);
    const { rows } = await client.query(
      `SELECT sku, filter_type, description, duty
       FROM elimfilters_catalog
       WHERE ${conditions.join(' AND ')}
       ORDER BY sku
       LIMIT $${idx} OFFSET $${idx+1}`,
      params
    );
    const { rows: countRows } = await client.query(
      `SELECT COUNT(*) FROM elimfilters_catalog WHERE ${conditions.join(' AND ')}`,
      params.slice(0, -2)
    );
    res.json({ total: parseInt(countRows[0].count), offset, limit, results: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/import/donaldson ─────────────────────────────────────────────────────────────────────────
const FILTER_TYPE_CANONICAL = {
  'Air Filter':                'air',
  'Air Filter Housing':        'air',
  'Air Dryer':                 'air',
  'air-intake':                'air',
  'air-dryer':                 'air',
  'Lube Filter':               'oil',
  'Oil Filter':                'oil',
  'lube':                      'oil',
  'Fuel Filter':               'fuel',
  'Fuel Filter - Water Separator': 'water',
  'turbine':                   'fuel',
  'Hydraulic Filter':          'hydraulic',
  'Cabin Filter':              'cabin',
  'Coolant Filter':            'other',
  'coolant':                   'other',
};

const VALID_FILTER_TYPES = new Set(['oil','fuel','air','cabin','hydraulic','compressed-air','water','other']);

function _normalizeFilterType(raw) {
  if (!raw) return 'other';
  if (VALID_FILTER_TYPES.has(raw)) return raw;
  return FILTER_TYPE_CANONICAL[raw] || 'other';
}

function _validateImportRow(row) {
  if (!row.sku || typeof row.sku !== 'string' || !/^[A-Z0-9]{2,4}[0-9]{4}$/.test(row.sku) || row.sku.length !== 7) return `invalid sku: ${row.sku} (must be 7 chars: prefix + 4 digits)`;
  const ft = _normalizeFilterType(row.filter_type);
  if (!ft) return `invalid filter_type: ${row.filter_type}`;
  return null;
}

app.post('/api/import/donaldson', importLimiter, requireAdmin, async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.products;
  if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: 'Expected array of products' });
  if (rows.length > 500) return res.status(400).json({ error: 'Max 500 products per batch' });

  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const validErr = _validateImportRow(row);
      if (validErr) { results.errors.push({ sku: row.sku, error: validErr }); results.skipped++; continue; }

      const sku = row.sku.trim().toUpperCase();
      const ft = _normalizeFilterType(row.filter_type);

      const oem_codes        = row.oem_codes        ? JSON.stringify(row.oem_codes)        : null;
      const competitor_codes = row.competitor_codes ? JSON.stringify(row.competitor_codes) : null;
      const brand_crossrefs  = row.brand_crossrefs  ? JSON.stringify(row.brand_crossrefs)  : null;
      const alternatives     = row.alternatives     ? JSON.stringify(row.alternatives)     : null;
      const equipment_applications = row.equipment_applications ? JSON.stringify(row.equipment_applications) : null;

      try {
        const existing = await client.query('SELECT sku FROM elimfilters_catalog WHERE sku = $1', [sku]);
        if (existing.rows.length > 0) {
          // UPDATE — merge JSONB arrays (competitor_codes, oem_codes, equipment_applications)
          await client.query(`
            UPDATE elimfilters_catalog SET
              codigo_base = COALESCE($2, codigo_base),
              description = COALESCE($3, description),
              filter_type = $4,
              sub_type = COALESCE($5, sub_type),
              technology = COALESCE($6, technology),
              installation_type = COALESCE($7, installation_type),
              thread_size = COALESCE($8, thread_size),
              outer_diameter_mm = COALESCE($9, outer_diameter_mm),
              height_mm = COALESCE($10, height_mm),
              gasket_od_mm = COALESCE($11, gasket_od_mm),
              gasket_id_mm = COALESCE($12, gasket_id_mm),
              iso_test_method = COALESCE($13, iso_test_method),
              micron_rating = COALESCE($14, micron_rating),
              nominal_efficiency = COALESCE($15, nominal_efficiency),
              burst_pressure_psi = COALESCE($16, burst_pressure_psi),
              collapse_pressure_psi = COALESCE($17, collapse_pressure_psi),
              duty = CASE WHEN duty = 'LIGHT_DUTY' THEN 'LIGHT_DUTY' ELSE COALESCE($18, duty) END,
              oem_codes = CASE WHEN $19::jsonb IS NOT NULL
                THEN (
                  SELECT jsonb_agg(DISTINCT elem)
                  FROM (
                    SELECT jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb))
                    UNION ALL
                    SELECT jsonb_array_elements($19::jsonb)
                  ) AS t(elem)
                )
                ELSE oem_codes END,
              competitor_codes = CASE WHEN $20::jsonb IS NOT NULL
                THEN (
                  SELECT jsonb_agg(DISTINCT elem)
                  FROM (
                    SELECT jsonb_array_elements(COALESCE(competitor_codes, '[]'::jsonb))
                    UNION ALL
                    SELECT jsonb_array_elements($20::jsonb)
                  ) AS t(elem)
                )
                ELSE competitor_codes END,
              brand_crossrefs = CASE WHEN $21::jsonb IS NOT NULL THEN $21::jsonb ELSE brand_crossrefs END,
              alternatives = CASE WHEN $22::jsonb IS NOT NULL THEN $22::jsonb ELSE alternatives END,
              equipment_applications = CASE WHEN $23::jsonb IS NOT NULL
                THEN (
                  SELECT jsonb_agg(DISTINCT elem)
                  FROM (
                    SELECT jsonb_array_elements(COALESCE(equipment_applications, '[]'::jsonb))
                    UNION ALL
                    SELECT jsonb_array_elements($23::jsonb)
                  ) AS t(elem)
                )
                ELSE equipment_applications END
            WHERE sku = $1`,
            [
              sku,
              row.codigo_base || null,
              row.description || null,
              ft,
              row.sub_type || null,
              row.technology || null,
              row.installation_type || null,
              row.thread_size || null,
              row.outer_diameter_mm || null,
              row.height_mm || null,
              row.gasket_od_mm || null,
              row.gasket_id_mm || null,
              row.iso_test_method || null,
              row.micron_rating || null,
              row.nominal_efficiency || null,
              row.burst_pressure_psi || null,
              row.collapse_pressure_psi || null,
              row.duty || null,
              oem_codes,
              competitor_codes,
              brand_crossrefs,
              alternatives,
              equipment_applications,
            ]
          );
          results.updated++;
        } else {
          await client.query(`
            INSERT INTO elimfilters_catalog (
              sku, codigo_base, description, filter_type, sub_type, technology,
              installation_type, thread_size,
              outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
              iso_test_method, micron_rating, nominal_efficiency,
              burst_pressure_psi, collapse_pressure_psi,
              duty, oem_codes, competitor_codes, brand_crossrefs, alternatives, equipment_applications
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
              $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb)`,
            [
              sku,
              row.codigo_base || null,
              row.description || null,
              ft,
              row.sub_type || null,
              row.technology || null,
              row.installation_type || null,
              row.thread_size || null,
              row.outer_diameter_mm || null,
              row.height_mm || null,
              row.gasket_od_mm || null,
              row.gasket_id_mm || null,
              row.iso_test_method || null,
              row.micron_rating || null,
              row.nominal_efficiency || null,
              row.burst_pressure_psi || null,
              row.collapse_pressure_psi || null,
              row.duty || 'HEAVY_DUTY',
              oem_codes || '[]',
              competitor_codes || '[]',
              brand_crossrefs || '{}',
              alternatives || '[]',
              equipment_applications || '[]',
            ]
          );
          results.inserted++;
        }
      } catch (rowErr) {
        results.errors.push({ sku, error: rowErr.message });
        results.skipped++;
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[import/donaldson]', e.message);
    res.status(500).json({ error: 'Import failed', detail: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/import/mann ───────────────────────────────────────────────────────────────────────────────
const MANN_SKU_PREFIXES = {
  'Oil Filter':    'EL3',
  'Air Filter':    'EA3',
  'Cabin Filter':  'EC3',
  'Fuel Filter':   'EF3',
};

const MANN_FILTER_TYPES = {
  'Oil Filter':    'oil',
  'Air Filter':    'air',
  'Cabin Filter':  'cabin',
  'Fuel Filter':   'fuel',
};

app.post('/api/import/mann', importLimiter, requireAdmin, async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.products;
  if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: 'Expected array of products' });
  if (rows.length > 500) return res.status(400).json({ error: 'Max 500 products per batch' });

  const results = { inserted: 0, updated: 0, skipped: 0, collision: 0, errors: [] };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const mannCode = (row.mann_part_number || row.sku || '').trim().toUpperCase();
      const filterType = row.filter_type || '';
      const prefix = MANN_SKU_PREFIXES[filterType];
      if (!prefix) {
        results.errors.push({ mann: mannCode, error: `unsupported filter type for LD: ${filterType}` });
        results.skipped++;
        continue;
      }

      // Generate 4-digit codigo_base from last 4 digits of MANN code
      // (zero-padded on the left when the MANN code has fewer than 4 digits, e.g. C31 -> 0031)
      const digits = mannCode.replace(/[^0-9]/g, '');
      if (!digits) {
        results.errors.push({ mann: mannCode, error: `cannot extract digits from ${mannCode}` });
        results.skipped++;
        continue;
      }
      const codigoBase = digits.slice(-4).padStart(4, '0');
      const sku = prefix + codigoBase;

      // Collision check: if another MANN code already generated this SKU, reject
      const existing = await client.query('SELECT sku, codigo_base FROM elimfilters_catalog WHERE sku = $1', [sku]);
      if (existing.rows.length > 0 && existing.rows[0].codigo_base !== codigoBase) {
        results.errors.push({ mann: mannCode, sku, error: `SKU collision: ${sku} already used by codigo_base ${existing.rows[0].codigo_base}` });
        results.collision++;
        continue;
      }

      const oem_codes        = row.oem_codes        ? JSON.stringify(row.oem_codes)        : '[]';
      const competitor_codes = row.competitor_codes ? JSON.stringify(row.competitor_codes) : '[]';
      const equipment_applications = row.equipment_applications ? JSON.stringify(row.equipment_applications) : '[]';
      const ft = MANN_FILTER_TYPES[filterType] || 'other';

      await client.query('SAVEPOINT row_sp');
      try {
        if (existing.rows.length > 0) {
          // UPDATE: merge arrays
          await client.query(`
            UPDATE elimfilters_catalog SET
              description = COALESCE($2, description),
              filter_type = $3,
              duty = 'LIGHT_DUTY',
              oem_codes = (
                SELECT jsonb_agg(DISTINCT elem)
                FROM (
                  SELECT jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb))
                  UNION ALL
                  SELECT jsonb_array_elements($4::jsonb)
                ) AS t(elem)
              ),
              competitor_codes = (
                SELECT jsonb_agg(DISTINCT elem)
                FROM (
                  SELECT jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb))
                  UNION ALL
                  SELECT jsonb_array_elements($5::jsonb)
                ) AS t(elem)
              ),
              equipment_applications = (
                SELECT jsonb_agg(DISTINCT elem)
                FROM (
                  SELECT jsonb_array_elements(COALESCE(equipment_applications,'[]'::jsonb))
                  UNION ALL
                  SELECT jsonb_array_elements($6::jsonb)
                ) AS t(elem)
              )
            WHERE sku = $1`,
            [sku, row.description || null, ft, oem_codes, competitor_codes, equipment_applications]
          );
          results.updated++;
        } else {
          await client.query(`
            INSERT INTO elimfilters_catalog
              (sku, codigo_base, description, filter_type, duty,
               oem_codes, competitor_codes, equipment_applications)
            VALUES ($1,$2,$3,$4,'LIGHT_DUTY',$5::jsonb,$6::jsonb,$7::jsonb)`,
            [sku, codigoBase, row.description || null, ft, oem_codes, competitor_codes, equipment_applications]
          );
          results.inserted++;
        }
        await client.query('RELEASE SAVEPOINT row_sp');
      } catch (rowErr) {
        await client.query('ROLLBACK TO SAVEPOINT row_sp');
        results.errors.push({ mann: mannCode, sku, error: rowErr.message });
        results.skipped++;
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[import/mann]', e.message);
    res.status(500).json({ error: 'Import failed', detail: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/admin/rename-sku ──────────────────────────────────────────────────────────────────────────────
// Renames a SKU: copies all data to new_sku, deletes old_sku.
// Body: { old_sku: "EA200003", new_sku: "EA20003" }
// Both must match /^[A-Z]{2,3}[0-9]{4}$/ (3-char prefix + 4 digits).
app.post('/api/admin/rename-sku', importLimiter, requireAdmin, async (req, res) => {
  const { old_sku, new_sku } = req.body || {};
  if (!old_sku || !new_sku) return res.status(400).json({ error: 'old_sku and new_sku required' });
  if (new_sku.length !== 7) return res.status(400).json({ error: `new_sku must be exactly 7 characters: ${new_sku}` });

  const oldNorm = old_sku.trim().toUpperCase();
  const newNorm = new_sku.trim().toUpperCase();
  if (oldNorm === newNorm) return res.status(400).json({ error: 'old_sku and new_sku are identical' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const src = await client.query(`SELECT * FROM elimfilters_catalog WHERE sku = $1`, [oldNorm]);
    if (src.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `SKU not found: ${oldNorm}` });
    }

    const conflict = await client.query(`SELECT sku FROM elimfilters_catalog WHERE sku = $1`, [newNorm]);
    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `new_sku already exists: ${newNorm}` });
    }

    const row = src.rows[0];
    await client.query(`
      INSERT INTO elimfilters_catalog (
        sku, codigo_base, description, filter_type, sub_type, technology,
        installation_type, thread_size,
        outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
        iso_test_method, micron_rating, nominal_efficiency,
        burst_pressure_psi, collapse_pressure_psi,
        duty, oem_codes, competitor_codes, brand_crossrefs, alternatives, equipment_applications
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb
      )
    `, [
      newNorm, row.codigo_base, row.description, row.filter_type, row.sub_type, row.technology,
      row.installation_type, row.thread_size,
      row.outer_diameter_mm, row.height_mm, row.gasket_od_mm, row.gasket_id_mm,
      row.iso_test_method, row.micron_rating, row.nominal_efficiency,
      row.burst_pressure_psi, row.collapse_pressure_psi,
      row.duty,
      JSON.stringify(row.oem_codes || []), JSON.stringify(row.competitor_codes || []),
      JSON.stringify(row.brand_crossrefs || {}), JSON.stringify(row.alternatives || []),
      JSON.stringify(row.equipment_applications || []),
    ]);

    await client.query(`DELETE FROM elimfilters_catalog WHERE sku = $1`, [oldNorm]);
    await client.query('COMMIT');

    res.json({ success: true, renamed: { from: oldNorm, to: newNorm } });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/admin/delete-sku ──────────────────────────────────────────────────────────────────────────────
// Permanently deletes a single SKU from the catalog.
// Body: { sku: "EA200003" }
app.post('/api/admin/delete-sku', importLimiter, requireAdmin, async (req, res) => {
  const { sku } = req.body || {};
  if (!sku) return res.status(400).json({ error: 'sku required' });
  const norm = sku.trim().toUpperCase();
  try {
    const result = await pool.query(`DELETE FROM elimfilters_catalog WHERE sku = $1`, [norm]);
    if (result.rowCount === 0) return res.status(404).json({ error: `SKU not found: ${norm}` });
    res.json({ success: true, deleted: norm });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/admin/fix-ld-duty ─────────────────────────────────────────────
// Bulk-corrects EL3/EA3/EC3/EF3 records that have wrong duty value.
app.post('/api/admin/fix-ld-duty', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE elimfilters_catalog
      SET duty = 'LIGHT_DUTY'
      WHERE (sku ~ '^EL3' OR sku ~ '^EA3' OR sku ~ '^EC3' OR sku ~ '^EF3')
        AND duty IS DISTINCT FROM 'LIGHT_DUTY'
      RETURNING sku
    `);
    res.json({ success: true, fixed: result.rowCount, skus: result.rows.map(r => r.sku) });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/update/mann-crossrefs ──────────────────────────────────────────
// Bulk-apply competitor cross-reference codes to LD products via Mann part number.
// Body: { rows: [{ sku: "W940/21", crossrefs: { FRAM: ["PH5316"], WIX: ["51452"] } }] }
app.post('/api/update/mann-crossrefs', importLimiter, requireAdmin, async (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });

  const client = await pool.connect();
  let updated = 0, skipped = 0, errors = 0;
  try {
    for (const row of rows) {
      const mannSku = (row.sku || '').trim();
      const crossrefs = row.crossrefs || {};
      if (!mannSku || Object.keys(crossrefs).length === 0) { skipped++; continue; }

      // Build competitor_codes array from crossrefs object
      const newCodes = [];
      for (const [manufacturer, codes] of Object.entries(crossrefs)) {
        for (const code of (Array.isArray(codes) ? codes : [])) {
          if (code) newCodes.push({ manufacturer: manufacturer.toUpperCase(), code: code.trim() });
        }
      }
      if (newCodes.length === 0) { skipped++; continue; }

      // Find the LD product by codigo_base (last 4 digits of Mann part number)
      // Mann W940/21 → digits "94021" → last 4 = "4021" → codigo_base
      const digits = mannSku.replace(/\D/g, '');
      if (!digits) { skipped++; continue; }
      const codigoBase = digits.slice(-4).padStart(4, '0');
      const find = await client.query(
        `SELECT id, competitor_codes FROM elimfilters_catalog
         WHERE duty = 'LIGHT_DUTY' AND codigo_base = $1
         LIMIT 1`,
        [codigoBase]
      );
      if (!find.rows.length) { skipped++; continue; }

      const existing = find.rows[0].competitor_codes || [];
      const existingSet = new Set(existing.map(c => `${c.manufacturer}|${c.code}`));
      const toAdd = newCodes.filter(c => !existingSet.has(`${c.manufacturer}|${c.code}`));
      if (toAdd.length === 0) { skipped++; continue; }

      const merged = [...existing, ...toAdd];
      try {
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE id = $2`,
          [JSON.stringify(merged), find.rows[0].id]
        );
        updated++;
      } catch (rowErr) {
        console.error('[update/mann-crossrefs row]', mannSku, rowErr.message);
        errors++;
      }
    }
    res.json({ success: true, total: rows.length, updated, skipped, errors });
  } catch (e) {
    console.error('[update/mann-crossrefs]', e.message);
    res.status(500).json({ success: false, error: e.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/admin/lookup-competitor ─────────────────────────────────────────
app.get('/api/admin/lookup-competitor', adminLimiter, requireAdmin, async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code required' });
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT sku, duty, competitor_codes
       FROM elimfilters_catalog
       WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(competitor_codes) AS ref
         WHERE UPPER(ref->>'code') = $1
       )
       LIMIT 20`,
      [code.replace(/[-\s]/g, '')]
    );
    res.json({ found: rows.length, rows });
  } catch(e) {
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/cleanup/fram-hd-force ───────────────────────────────────────────────────────────────────────────────
// Hard SQL-based cleanup: strip ALL FRAM PH/CA/CF/G codes from HD SKUs (EL8, EA1, EC1, EF9).
// Handles any manufacturer key format (uppercase, lowercase, missing).
app.post('/api/cleanup/fram-hd-force', importLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: before } = await client.query(`
      SELECT COUNT(*) as cnt FROM elimfilters_catalog
      WHERE (sku LIKE 'EL8%' OR sku LIKE 'EA1%' OR sku LIKE 'EC1%' OR sku LIKE 'EF9%')
        AND competitor_codes @> '[{"manufacturer":"FRAM"}]'::jsonb
    `);

    await client.query(`
      UPDATE elimfilters_catalog
      SET competitor_codes = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(competitor_codes) AS elem
        WHERE NOT (
          UPPER(elem->>'manufacturer') = 'FRAM'
          AND (
            elem->>'code' ~ '^PH[0-9]' OR
            elem->>'code' ~ '^CA[0-9]' OR
            elem->>'code' ~ '^CF[0-9]' OR
            elem->>'code' ~ '^G[0-9]'
          )
        )
      )
      WHERE (sku LIKE 'EL8%' OR sku LIKE 'EA1%' OR sku LIKE 'EC1%' OR sku LIKE 'EF9%')
        AND competitor_codes IS NOT NULL
    `);

    res.json({ success: true, skus_affected_before: parseInt(before[0].cnt) });
  } catch (e) {
    console.error('[cleanup/fram-hd-force]', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/cleanup/oem-reclassify ─────────────────────────────────────────────────────────────────────────
// Re-runs the isCompetitor() classification on every row to fix any oem_codes/competitor_codes
// that were stored in the wrong column.
app.post('/api/cleanup/oem-reclassify', importLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  let fixed = 0;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT sku, oem_codes, competitor_codes FROM elimfilters_catalog`
    );
    for (const row of rows) {
      const allRefs = [...parseRefs(row.oem_codes), ...parseRefs(row.competitor_codes)];
      const split = splitRefs(allRefs);
      const newOem = JSON.stringify(split.oem);
      const newComp = JSON.stringify(split.competitor);
      const curOem = JSON.stringify(row.oem_codes || []);
      const curComp = JSON.stringify(row.competitor_codes || []);
      if (newOem !== curOem || newComp !== curComp) {
        await client.query(
          `UPDATE elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb WHERE sku=$3`,
          [newOem, newComp, row.sku]
        );
        fixed++;
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, rows_fixed: fixed, total: rows.length });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[cleanup/oem-reclassify]', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/admin/audit ───────────────────────────────────────────────────────────────────────────────────
app.get('/api/admin/audit', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const [total, byType, byDuty, noEquip, noComp, noOem, malformed] = await Promise.all([
      client.query('SELECT COUNT(*) FROM elimfilters_catalog'),
      client.query('SELECT filter_type, COUNT(*) FROM elimfilters_catalog GROUP BY filter_type ORDER BY count DESC'),
      client.query('SELECT duty, COUNT(*) FROM elimfilters_catalog GROUP BY duty ORDER BY count DESC'),
      client.query("SELECT COUNT(*) FROM elimfilters_catalog WHERE equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0"),
      client.query('SELECT COUNT(*) FROM elimfilters_catalog WHERE competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0'),
      client.query('SELECT COUNT(*) FROM elimfilters_catalog WHERE oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0'),
      client.query("SELECT COUNT(*) FROM elimfilters_catalog WHERE sku !~ '^[A-Z0-9]{2,4}[0-9]{4}$' OR length(sku) != 7"),
    ]);
    res.json({
      total: parseInt(total.rows[0].count),
      by_filter_type: byType.rows,
      by_duty: byDuty.rows,
      missing_equipment_applications: parseInt(noEquip.rows[0].count),
      missing_competitor_codes: parseInt(noComp.rows[0].count),
      missing_oem_codes: parseInt(noOem.rows[0].count),
      malformed_skus: parseInt(malformed.rows[0].count),
    });
  } catch (e) {
    console.error('[audit]', e.message);
    res.status(500).json({ error: 'Audit failed' });
  } finally {
    client.release();
  }
});

// ─── GET /api/admin/malformed-skus ────────────────────────────────────────────────────────────────────────────
// Lists all SKUs that don’t match the 7-char format ^[A-Z0-9]{2,4}[0-9]{4}$
app.get('/api/admin/malformed-skus', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const { rows } = await client.query(
      `SELECT sku, filter_type, duty, description
       FROM elimfilters_catalog
       WHERE sku !~ '^[A-Z0-9]{2,4}[0-9]{4}$' OR length(sku) != 7
       ORDER BY sku`
    );
    res.json({ count: rows.length, skus: rows });
  } catch (e) {
    console.error('[malformed-skus]', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/ai/search ─────────────────────────────────────────────────────────────────────────────────
app.get('/api/ai/search', searchLimiter, async (req, res) => {
  const raw = (req.query.q || '').trim();
  if (!raw) return res.json({ success: false, results: [] });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (SEARCH_KEY && providedKey !== SEARCH_KEY) return res.status(403).json({ error: 'forbidden' });

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const q = raw.toUpperCase().replace(/[-\s]/g, '');

    // Try exact SKU match
    const exact = await client.query(
      `SELECT * FROM elimfilters_catalog WHERE UPPER(REPLACE(sku,'-','')) = $1 LIMIT 1`, [q]
    );
    if (exact.rows.length > 0) {
      const products = exact.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'exact_sku' });
    }

    // OEM/competitor cross-ref
    const oem = await client.query(
      `SELECT * FROM elimfilters_catalog
       WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(oem_codes) AS ref WHERE UPPER(REPLACE(ref->>'code','-',''))=$1)
       OR    EXISTS (SELECT 1 FROM jsonb_array_elements(competitor_codes) AS ref WHERE UPPER(REPLACE(ref->>'code','-',''))=$1)
       LIMIT 10`, [q]
    );
    if (oem.rows.length > 0) {
      const products = oem.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'oem_crossref' });
    }

    res.json({ success: true, results: [], source: 'no_match' });
  } catch (e) {
    console.error('[ai/search]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/ai/escalate ───────────────────────────────────────────────────────────────────────────────
app.post('/api/ai/escalate', searchLimiter, async (req, res) => {
  const { session_id, lang, messages } = req.body || {};
  if (!session_id || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'session_id and messages[] required' });
  }

  if (!await _verifyTurnstile(req.body.turnstile_token, req.ip)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }

  const usedLang = lang || 'en';
  const transcript = messages
    .map(m => `[${m.role === 'user' ? 'USER' : 'BOT'}] ${m.text}`)
    .join('\n');

  const safeTranscript = _escHtml(transcript);
  const safeSessionId  = _escHtml(session_id);

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: { user: 'info@elimfilters.com', pass: process.env.GODADDY_MAIL_PASS },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Chat" <info@elimfilters.com>',
      to: 'info@elimfilters.com',
      subject: `[Chat Escalation] Session ${safeSessionId} — ${usedLang.toUpperCase()}`,
      html: `
        <h2>Chat session escalated to human support</h2>
        <p><b>Session:</b> ${safeSessionId} | <b>Language:</b> ${usedLang}</p>
        <hr/>
        <pre style="background:#f5f5f5;padding:1rem;font-family:monospace">${safeTranscript}</pre>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[ai/escalate]', err.message);
    res.status(500).json({ error: 'Failed to send escalation email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] ✅ Listening on port ${PORT}`);
  console.log(`[server] ✅ ELIMFILTERS API ready`);
});