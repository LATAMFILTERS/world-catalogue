require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ════════════════════════════ VALIDATION ════════════════════════════
const requiredVars = ['DATABASE_URL', 'GROQ_API_KEY', 'OPENAI_API_KEY'];
requiredVars.forEach(v => {
    if (!process.env[v]) {
        console.error(`❌ Missing required env: ${v}`);
        process.exit(1);
    }
});

// ════════════════════════════ SECURITY ════════════════════════════
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

// ════════════════════════════ MIDDLEWARE ════════════════════════════
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests'
});

app.use('/ai/', limiter);

// ════════════════════════════ INITIALIZATION ════════════════════════════
const { DatabaseService } = require('./src/db/database.service');
const { EmbeddingService } = require('./src/embeddings/embedding.service');
const { MigrationService } = require('./src/services/migration.service');
const { BatchEmbeddingService } = require('./src/services/batch-embedding.service');

(async () => {
    try {
        await DatabaseService.initialize();
        console.log('✓ Database connected');

        // Run database migrations
        await MigrationService.runStartupMigrations();

        await EmbeddingService.initialize();
        console.log('✓ Embeddings initialized');

        // Batch embed all products (happens in background)
        BatchEmbeddingService.embedAllProducts().catch(err => {
            console.error('Background batch embedding error:', err.message);
        });

    } catch (err) {
        console.error('❌ Initialization failed:', err.message);
        process.exit(1);
    }
})();

// ════════════════════════════ ROUTES ════════════════════════════
const queryRoutes = require('./src/routes/query.routes');
const intentRoutes = require('./src/routes/intent.routes');
const searchRoutes = require('./src/routes/search.routes');
const crossRefRoutes = require('./src/routes/crossref.routes');

app.use('/ai/query', queryRoutes);
app.use('/ai/intent', intentRoutes);
app.use('/ai/search', searchRoutes);
app.use('/ai/cross-reference', crossRefRoutes);

// ════════════════════════════ HEALTH CHECK ════════════════════════════
app.get('/health', async (req, res) => {
    try {
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

// ════════════════════════════ INFO ════════════════════════════
app.get('/', (req, res) => {
    res.json({
        service: 'ELIMFILTERS AI Engine',
        version: '1.0.0',
        type: 'Industrial Intelligence - RAG + Tool Calling',
        endpoints: {
            health: 'GET /health',
            query: 'POST /ai/query',
            intent: 'POST /ai/intent',
            search: 'POST /ai/search',
            crossReference: 'POST /ai/cross-reference'
        },
        features: [
            'Tool-based architecture',
            'RAG pipeline with embeddings',
            'Intent classification',
            'Vector semantic search',
            'pgvector integration'
        ]
    });
});

// ════════════════════════════ ERROR HANDLING ════════════════════════════
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

// ════════════════════════════ START ════════════════════════════
const PORT = process.env.AI_ENGINE_PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n╔════════════════════════════════════════════╗`);
    console.log(`║  ELIMFILTERS AI Engine - Production Ready  ║`);
    console.log(`╚════════════════════════════════════════════╝\n`);
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ GROQ LLM: ${process.env.GROQ_MODEL}`);
    console.log(`✓ OpenAI Embeddings: ${process.env.OPENAI_EMBEDDING_MODEL}`);
    console.log(`✓ Vector Search: pgvector (cosine similarity)`);
    console.log(`✓ RAG Pipeline: Active`);
    console.log(`✓ Tool Calling: Enabled\n`);
});

module.exports = app;
