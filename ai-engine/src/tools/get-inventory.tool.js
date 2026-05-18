const { DatabaseService } = require('../db/database.service');

class GetInventoryTool {
    static definition = {
        type: 'function',
        function: {
            name: 'getInventory',
            description: 'Check inventory and availability status for a specific filter product',
            parameters: {
                type: 'object',
                properties: {
                    sku: {
                        type: 'string',
                        description: 'Product SKU to check inventory for'
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
                    inventory: null
                };
            }

            const inventory = await DatabaseService.getProductInventory(sku);

            if (!inventory) {
                return {
                    success: false,
                    error: `Product not found: ${sku}`,
                    inventory: null
                };
            }

            return {
                success: true,
                sku,
                inventory: inventory,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                inventory: null
            };
        }
    }
}

module.exports = { GetInventoryTool };
