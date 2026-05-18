const express = require('express');
const router = express.Router();
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

        Logger.info('Intent classification requested', { queryLength: query.length });

        const intent = await IntentClassifierAgent.classify(query);
        const entities = await IntentClassifierAgent.extractEntities(query);

        Logger.info('Intent classified', { intent: intent.intent, confidence: intent.confidence });

        res.json({
            success: true,
            data: {
                ...intent,
                entities
            }
        });
    } catch (err) {
        Logger.error('Intent classification error', { error: err.message });
        res.status(500).json({
            success: false,
            error: 'Intent classification failed',
            message: err.message
        });
    }
});

module.exports = router;
