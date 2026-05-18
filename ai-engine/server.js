require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ────────────────────── SECURITY ──────────────────────
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ────────────────────── MIDDLEWARE ──────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/ai/', limiter);

// ────────────────────── CONFIG VALIDATION ──────────────────────
const requiredEnvVars = [
    'OPENAI_API_KEY',
    'DATABASE_URL'
];

requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required env var: ${envVar}`);
        process.exit(1);
    }
});

// ────────────────────── ROUTES ──────────────────────
const queryRoutes = require('./src/routes/query.routes');
const intentRoutes = require('./src/routes/intent.routes');
const searchRoutes = require('./src/routes/search.routes');
const crossRefRoutes = require('./src/routes/crossref.routes');

app.use('/ai/query', queryRoutes);
app.use('/ai/intent', intentRoutes);
app.use('/ai/search', searchRoutes);
app.use('/ai/cross-reference', crossRefRoutes);

// ────────────────────── HEALTH CHECK ──────────────────────
app.get('/health', async (req, res) => {
    try {
        const { DatabaseService } = require('./src/services/database.service');
        await DatabaseService.checkConnection();

        res.status(200).json({
            status: 'healthy',
            service: 'ai-engine',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(503).json({
            status: 'unhealthy',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ────────────────────── ROOT ──────────────────────
app.get('/', (req, res) => {
    res.json({
        service: 'ELIMFILTERS AI Engine',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            query: 'POST /ai/query',
            intent: 'POST /ai/intent',
            search: 'POST /ai/search',
            crossReference: 'POST /ai/cross-reference'
        }
    });
});

// ────────────────────── ERROR HANDLERS ──────────────────────
app.use((err, req, res, next) => {
    console.error('ERROR:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
});

// ────────────────────── START ──────────────────────
const PORT = process.env.AI_ENGINE_PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ AI Engine running on port ${PORT}`);
    console.log(`✓ OpenAI API: ${process.env.OPENAI_API_KEY ? 'configured' : 'missing'}`);
    console.log(`✓ Database: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
});

module.exports = app;
