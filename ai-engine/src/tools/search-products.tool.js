const { DatabaseService } = require('../db/database.service');

class SearchProductsTool {
    static definition = {
        type: 'function',
        function: {
            name: 'searchProducts',
            description: 'Search for filter products by SKU, code, category, or technical specifications',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search query (SKU, part code, category, or specification)'
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum results to return (default 10)',
                        default: 10
                    }
                },
                required: ['query']
            }
        }
    };

    static async execute(params) {
        try {
            const { query, limit = 10 } = params;

            if (!query || query.trim().length === 0) {
                return {
                    success: false,
                    error: 'Query cannot be empty',
                    results: []
                };
            }

            const products = await DatabaseService.searchProducts(query, Math.min(limit, 50));

            return {
                success: true,
                query,
                count: products.length,
                results: products,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                results: []
            };
        }
    }
}

module.exports = { SearchProductsTool };
