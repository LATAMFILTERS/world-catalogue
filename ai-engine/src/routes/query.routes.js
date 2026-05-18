const express = require('express');
const router = express.Router();
const { RAGService } = require('../rag/rag.service');
const { ResponseValidator } = require('../middleware/response-validator.middleware');
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

        Logger.info('Query endpoint called', { queryLength: query.length });

        const result = await RAGService.fullRAGQuery(query);

        // Enforce response validation
        const validatedResponse = ResponseValidator.enforceFormat(result);

        // Check for hallucinations
        if (validatedResponse.validation.hasHallucinations) {
            Logger.error('HALLUCINATION DETECTED - Response blocked', {
                query: query.substring(0, 50),
                errors: validatedResponse.validation.errors
            });

            return res.status(422).json({
                success: false,
                error: 'Response validation failed - potential hallucination detected',
                details: validatedResponse.validation.errors
            });
        }

        res.json({
            success: true,
            data: validatedResponse
        });
    } catch (err) {
        Logger.error('Query error', { error: err.message });
        res.status(500).json({
            success: false,
            error: 'Query processing failed',
            message: err.message
        });
    }
});

module.exports = router;
