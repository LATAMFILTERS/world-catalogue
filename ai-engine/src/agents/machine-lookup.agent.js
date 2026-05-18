const { BaseAgent } = require('./agent.base');
const { ToolsRegistry } = require('../tools/tools.registry');

class MachineLookupAgent extends BaseAgent {
    constructor() {
        super('MachineLookupAgent');
    }

    async execute(userQuery, context) {
        const machines = context.entities?.machines || [];

        if (machines.length === 0) {
            this.log('warn', 'No machines found in query, falling back to text search', { query: userQuery });
            return ToolsRegistry.executeTool('searchProducts', {
                query: userQuery,
                limit: parseInt(context.limit) || 10
            });
        }

        this.log('info', 'Executing machine compatibility lookup', { machineCount: machines.length });

        try {
            const allProducts = [];

            for (const machine of machines) {
                const result = await ToolsRegistry.executeTool('searchByMachine', {
                    machine: machine,
                    limit: parseInt(context.limit) || 10
                });

                if (result.products) {
                    allProducts.push(...result.products);
                }
            }

            // Deduplicate by SKU
            const uniqueSkus = new Set();
            const products = allProducts.filter(p => {
                if (uniqueSkus.has(p.sku)) return false;
                uniqueSkus.add(p.sku);
                return true;
            });

            this.log('info', 'Machine lookup completed', { machineCount: machines.length, productCount: products.length });
            return { products: products.slice(0, 10) };
        } catch (err) {
            this.log('error', 'Machine lookup failed', { error: err.message });
            throw err;
        }
    }
}

module.exports = { MachineLookupAgent };
