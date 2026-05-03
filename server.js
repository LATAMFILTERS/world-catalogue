require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'https://world-catalogue-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:8080'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas solicitudes. Intenta en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);
app.use(express.json());

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL no definida');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
    console.error('Error en pool PostgreSQL:', err.message);
});

const SAFE_FIELDS = `sku, base_code, technology, category, description, media_type, outer_diameter, inner_diameter, length, efficiency, type, style, competitor_codes, oem_codes, cross_references, applications`;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/search', async (req, res) => {
    const q = (req.query.q || '').toUpperCase().trim();
    if (!q || q.length < 2) return res.status(400).json({ error: 'Minimo 2 caracteres' });
    if (q.length > 50) return res.status(400).json({ error: 'Busqueda demasiado larga' });
    try {
        const result = await pool.query(
            `SELECT ${SAFE_FIELDS} FROM filters WHERE UPPER(sku) LIKE $1 OR UPPER(base_code) LIKE $1 OR competitor_codes::text ILIKE $2 ORDER BY sku LIMIT 20`,
            [q + '%', '%' + q + '%']
        );
        res.json({ results: result.rows, count: result.rows.length });
    } catch (err) {
        console.error('Error en /api/search:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/filter/:sku', async (req, res) => {
    const sku = (req.params.sku || '').toUpperCase().trim();
    if (!sku || sku.length > 20) return res.status(400).json({ error: 'SKU invalido' });
    try {
        const result = await pool.query(
            `SELECT ${SAFE_FIELDS} FROM filters WHERE UPPER(sku) = $1 LIMIT 1`,
            [sku]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en /api/filter/:sku:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/cross-reference/:code', async (req, res) => {
    const code = (req.params.code || '').toUpperCase().trim();
    if (!code || code.length < 3 || code.length > 30) return res.status(400).json({ error: 'Codigo invalido' });
    try {
        const result = await pool.query(
            `SELECT ${SAFE_FIELDS} FROM filters WHERE competitor_codes::text ILIKE $1 OR oem_codes::text ILIKE $1 LIMIT 10`,
            ['%' + code + '%']
        );
        res.json({ results: result.rows, count: result.rows.length });
    } catch (err) {
        console.error('Error en /api/cross-reference:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/technologies', async (req, res) => {
    try {
        const result = await pool.query(`SELECT DISTINCT technology, category FROM filters WHERE technology IS NOT NULL ORDER BY technology`);
        res.json({ technologies: result.rows });
    } catch (err) {
        console.error('Error en /api/technologies:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/industries', async (req, res) => {
    try {
        const result = await pool.query(`SELECT DISTINCT jsonb_array_elements_text(applications) as industry FROM filters WHERE applications IS NOT NULL AND jsonb_array_length(applications) > 0 ORDER BY industry`);
        res.json({ industries: result.rows.map(r => r.industry) });
    } catch (err) {
        console.error('Error en /api/industries:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/category/:category', async (req, res) => {
    const category = (req.params.category || '').trim();
    if (!category || category.length > 50) return res.status(400).json({ error: 'Categoria invalida' });
    try {
        const result = await pool.query(
            `SELECT ${SAFE_FIELDS} FROM filters WHERE LOWER(category) = LOWER($1) ORDER BY sku LIMIT 50`,
            [category]
        );
        res.json({ results: result.rows, count: result.rows.length });
    } catch (err) {
        console.error('Error en /api/category:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ELIMFILTERS API corriendo en puerto ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
