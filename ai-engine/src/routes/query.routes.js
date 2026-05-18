const express = require('express');
const router = express.Router();
const { RAGService } = require('../rag/rag.service');

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        const result = await RAGService.fullRAGQuery(query);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Query error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Query processing failed',
            message: err.message
        });
    }
});

module.exports = router;
