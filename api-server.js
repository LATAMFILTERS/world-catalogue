require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const geoip = require('geoip-lite');

const app = express();

// -------------------- BASIC SAFETY --------------------
app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- SECURITY --------------------
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

const allowedOrigins = [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5000'
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

// -------------------- RATE LIMIT --------------------
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
});

app.use('/api/', limiter);

// -------------------- DATABASE --------------------
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL missing');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000
});

pool.on('error', (err) => {
    console.error('DB Pool Error:', err.message);
});

// -------------------- SAFE FIELDS --------------------
const SAFE_FIELDS = `
sku, base_code, technology, category, description,
media_type, outer_diameter, inner_diameter, length,
efficiency, type, style, competitor_codes, oem_codes,
cross_references, applications
`;

// -------------------- HEALTH --------------------
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
        service: 'api-server'
    });
});

// -------------------- GEO-IP DETECTION --------------------
app.get('/api/get-country', (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip);
        const country = geo?.country || 'US';

        return res.json({
            country: country,
            ip: ip,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('GEO-IP ERROR:', err.message);
        return res.json({ country: 'US', error: err.message });
    }
});

// -------------------- SEARCH --------------------
app.get('/api/search', async (req, res) => {
    try {
        const q = (req.query.q || '').toString().trim().toUpperCase();

        if (q.length < 2) {
            return res.status(400).json({ error: 'min 2 chars' });
        }

        const result = await pool.query(
            `SELECT ${SAFE_FIELDS}
             FROM filters
             WHERE UPPER(sku) LIKE $1
                OR UPPER(base_code) LIKE $1
                OR competitor_codes::text ILIKE $2
             LIMIT 20`,
            [q + '%', '%' + q + '%']
        );

        return res.json({
            results: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        console.error('SEARCH ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// -------------------- FILTER BY SKU --------------------
app.get('/api/filter/:sku', async (req, res) => {
    try {
        const sku = (req.params.sku || '').toString().trim().toUpperCase();

        if (!sku) {
            return res.status(400).json({ error: 'invalid sku' });
        }

        const result = await pool.query(
            `SELECT ${SAFE_FIELDS}
             FROM filters
             WHERE UPPER(sku) = $1
             LIMIT 1`,
            [sku]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'not found' });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error('FILTER ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// -------------------- CROSS REFERENCE --------------------
app.get('/api/cross-reference/:code', async (req, res) => {
    try {
        const code = (req.params.code || '').toString().trim().toUpperCase();

        if (code.length < 2) {
            return res.status(400).json({ error: 'invalid code' });
        }

        const result = await pool.query(
            `SELECT ${SAFE_FIELDS}
             FROM filters
             WHERE competitor_codes::text ILIKE $1
                OR oem_codes::text ILIKE $1
             LIMIT 20`,
            ['%' + code + '%']
        );

        return res.json({
            results: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        console.error('CROSS REF ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// -------------------- 404 HANDLER --------------------
app.use((req, res) => {
    res.status(404).json({ error: 'endpoint not found' });
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
    console.error('ERROR:', err.message);
    res.status(500).json({ error: 'internal server error' });
});

// -------------------- START --------------------
const PORT = process.env.API_PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ ELIMFILTERS API running on port ${PORT}`);
});

// -------------------- GLOBAL ERROR HANDLERS --------------------
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED:', err);
});
