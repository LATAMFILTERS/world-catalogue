const express = require('express');
const router = express.Router();
const { VectorSearchService } = require('../vector-search/vector-search.service');
const { IntentClassifierAgent } = require('../agents/intent-classifier.agent');

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        const intent = await IntentClassifierAgent.classify(query);
        const entities = await IntentClassifierAgent.extractEntities(query);

        const products = await VectorSearchService.searchProductsHybrid(query, 10);

        res.json({
            success: true,
            data: {
                query,
                intent: intent.intent,
                confidence: intent.confidence,
                entities,
                products,
                count: products.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('Search error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Search failed',
            message: err.message
        });
    }
});

module.exports = router;
