const { DatabaseService } = require('../db/database.service');

class SearchByMachineTool {
    static definition = {
        type: 'function',
        function: {
            name: 'searchByMachine',
            description: 'Find filters compatible with a specific machine, vehicle, or equipment model',
            parameters: {
                type: 'object',
                properties: {
                    machine: {
                        type: 'string',
                        description: 'Machine/vehicle/equipment name or model (e.g., "Caterpillar 320D", "Toyota Camry 2015")'
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum results to return (default 10)',
                        default: 10
                    }
                },
                required: ['machine']
            }
        }
    };

    static async execute(params) {
        try {
            const { machine, limit = 10 } = params;

            if (!machine || machine.trim().length === 0) {
                return {
                    success: false,
                    error: 'Machine name cannot be empty',
                    products: []
                };
            }

            const products = await DatabaseService.getProductsByApplication(machine, Math.min(limit, 50));

            return {
                success: true,
                machine,
                count: products.length,
                products: products,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                products: []
            };
        }
    }
}

module.exports = { SearchByMachineTool };
