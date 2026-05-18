const express = require('express');
const router = express.Router();
const { RAGService } = require('../services/rag.service');

router.post('/', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || code.trim().length === 0) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const result = await RAGService.findCrossReferences(code);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Cross-reference error:', err.message);
        res.status(500).json({
            error: 'Cross-reference lookup failed',
            message: err.message
        });
    }
});

module.exports = router;
