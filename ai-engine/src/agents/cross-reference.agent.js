const { BaseAgent } = require('./agent.base');
const { ToolsRegistry } = require('../tools/tools.registry');

class CrossReferenceAgent extends BaseAgent {
    constructor() {
        super('CrossReferenceAgent');
    }

    async execute(userQuery, context) {
        const codes = context.entities?.codes || [];

        if (codes.length === 0) {
            this.log('warn', 'No codes found for cross-reference search', { query: userQuery });
            return { equivalents: [] };
        }

        this.log('info', 'Executing cross-reference search', { codeCount: codes.length });

        try {
            const allEquivalents = [];

            for (const code of codes) {
                const result = await ToolsRegistry.executeTool('findCrossReference', {
                    code: code,
                    limit: parseInt(context.limit) || 10
                });

                if (result.equivalents) {
                    allEquivalents.push(...result.equivalents);
                }
            }

            // Deduplicate
            const uniqueSkus = new Set();
            const equivalents = allEquivalents.filter(p => {
                if (uniqueSkus.has(p.sku)) return false;
                uniqueSkus.add(p.sku);
                return true;
            });

            this.log('info', 'Cross-reference search completed', { equivalentCount: equivalents.length });
            return { equivalents: equivalents.slice(0, 10) };
        } catch (err) {
            this.log('error', 'Cross-reference search failed', { error: err.message });
            throw err;
        }
    }
}

module.exports = { CrossReferenceAgent };
