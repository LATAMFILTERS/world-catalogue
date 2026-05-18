const { BaseAgent } = require('./agent.base');
const { ToolsRegistry } = require('../tools/tools.registry');

class TechnicalAgent extends BaseAgent {
    constructor() {
        super('TechnicalAgent');
    }

    async execute(userQuery, context) {
        const skus = context.entities?.codes || [];

        if (skus.length === 0) {
            this.log('warn', 'No SKUs found for technical specs', { query: userQuery });
            return { specifications: [] };
        }

        this.log('info', 'Fetching technical specifications', { skuCount: skus.length });

        try {
            const specifications = [];

            for (const sku of skus) {
                const result = await ToolsRegistry.executeTool('getProductSpecs', { sku: sku });
                if (result.specifications) {
                    specifications.push(result.specifications);
                }
            }

            this.log('info', 'Technical specifications retrieved', { specCount: specifications.length });
            return { specifications: specifications };
        } catch (err) {
            this.log('error', 'Technical specifications fetch failed', { error: err.message });
            throw err;
        }
    }
}

module.exports = { TechnicalAgent };
