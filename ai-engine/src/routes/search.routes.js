const express = require('express');
const router = express.Router();
const { VectorSearchService } = require('../vector-search/vector-search.service');
const { IntentClassifierAgent } = require('../agents/intent-classifier.agent');
const { Logger } = require('../utils/logger');

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        Logger.info('Search endpoint called', { queryLength: query.length });

        const intent = await IntentClassifierAgent.classify(query);
        const entities = await IntentClassifierAgent.extractEntities(query);

        const products = await VectorSearchService.searchProductsHybrid(query, 10);

        // Grounded response - only returning what was actually found in database
        const response = {
            query,
            intent: intent.intent,
            confidence: intent.confidence,
            entities,
            products,
            count: products.length,
            dataSource: 'Hybrid Vector + SQL Search (Grounded)',
            retrievedContextUsed: products.length > 0,
            timestamp: new Date().toISOString()
        };

        Logger.info('Search completed', {
            query: query.substring(0, 50),
            resultCount: products.length,
            intent: intent.intent
        });

        res.json({
            success: true,
            data: response
        });
    } catch (err) {
        Logger.error('Search error', { error: err.message });
        res.status(500).json({
            success: false,
            error: 'Search failed',
            message: err.message
        });
    }
});

module.exports = router;
