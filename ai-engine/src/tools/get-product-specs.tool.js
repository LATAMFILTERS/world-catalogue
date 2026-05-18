const { DatabaseService } = require('../db/database.service');

class GetProductSpecsTool {
    static definition = {
        type: 'function',
        function: {
            name: 'getProductSpecs',
            description: 'Get complete specifications and details for a specific filter product by SKU',
            parameters: {
                type: 'object',
                properties: {
                    sku: {
                        type: 'string',
                        description: 'Product SKU identifier'
                    }
                },
                required: ['sku']
            }
        }
    };

    static async execute(params) {
        try {
            const { sku } = params;

            if (!sku || sku.trim().length === 0) {
                return {
                    success: false,
                    error: 'SKU cannot be empty',
                    product: null
                };
            }

            const product = await DatabaseService.getProductBySku(sku);

            if (!product) {
                return {
                    success: false,
                    error: `Product not found: ${sku}`,
                    product: null
                };
            }

            return {
                success: true,
                sku,
                product: product,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                product: null
            };
        }
    }
}

module.exports = { GetProductSpecsTool };
