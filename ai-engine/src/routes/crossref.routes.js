const express = require('express');
const router = express.Router();
const { DatabaseService } = require('../db/database.service');

router.post('/', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || code.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Code must be at least 2 characters'
            });
        }

        const equivalents = await DatabaseService.findCrossReferences(code, 20);

        res.json({
            success: true,
            data: {
                code,
                equivalents,
                count: equivalents.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('Cross-reference error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Cross-reference lookup failed',
            message: err.message
        });
    }
});

module.exports = router;
