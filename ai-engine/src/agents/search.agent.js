const { BaseAgent } = require('./agent.base');
const { ToolsRegistry } = require('../tools/tools.registry');

class SearchAgent extends BaseAgent {
    constructor() {
        super('SearchAgent');
    }

    async execute(userQuery, context) {
        this.log('info', 'Executing product search', { query: userQuery.substring(0, 50) });

        try {
            const result = await ToolsRegistry.executeTool('searchProducts', {
                query: userQuery,
                limit: parseInt(context.limit) || 10
            });

            this.log('info', 'Search completed', { resultCount: result.results?.length || 0 });
            return result;
        } catch (err) {
            this.log('error', 'Search failed', { error: err.message });
            throw err;
        }
    }
}

module.exports = { SearchAgent };
