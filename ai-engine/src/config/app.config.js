module.exports = {
    // Server
    port: process.env.AI_ENGINE_PORT || 3001,
    environment: process.env.NODE_ENV || 'development',

    // Database
    database: {
        url: process.env.DATABASE_URL,
        poolSize: 5,
        idleTimeout: 30000,
        connectionTimeout: 8000
    },

    // LLM: GROQ
    groq: {
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
        temperature: 0.3,
        maxTokens: 1024
    },

    // Embeddings: OpenAI
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        embeddingDimension: 1536
    },

    // RAG Configuration
    rag: {
        chunkSize: parseInt(process.env.RAG_CHUNK_SIZE) || 512,
        overlap: parseInt(process.env.RAG_OVERLAP) || 50,
        retrievalK: parseInt(process.env.RAG_RETRIEVAL_K) || 5,
        minScore: parseFloat(process.env.RAG_MIN_SCORE) || 0.6
    },

    // Vector Search
    vectorSearch: {
        distanceType: process.env.VECTOR_SEARCH_DISTANCE_TYPE || 'cosine',
        threshold: parseFloat(process.env.VECTOR_SEARCH_THRESHOLD) || 0.7,
        indexType: 'hnsw'
    },

    // Intent Classification
    intent: {
        confidenceThreshold: parseFloat(process.env.INTENT_CONFIDENCE_THRESHOLD) || 0.7
    },

    // CORS
    cors: {
        origins: [
            'https://elimfilters.com',
            'https://www.elimfilters.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8080'
        ]
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100
    },

    // Embedding Cache
    embeddingCache: {
        enabled: process.env.EMBEDDING_CACHE_ENABLED !== 'false',
        maxSize: 1000,
        ttlMs: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Anti-Hallucination
    antiHallucination: {
        enabled: true,
        blockOnDetection: true,
        similarityThreshold: 0.75,
        requireSourceAttribution: true
    }
};
