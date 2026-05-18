const express = require('express');
const router = express.Router();
const { RAGService } = require('../services/rag.service');

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const result = await RAGService.queryWithRAG(query);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Query error:', err.message);
        res.status(500).json({
            error: 'Failed to process query',
            message: err.message
        });
    }
});

module.exports = router;
