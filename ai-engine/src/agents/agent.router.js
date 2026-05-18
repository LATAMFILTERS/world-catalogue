const { SearchAgent } = require('./search.agent');
const { CrossReferenceAgent } = require('./cross-reference.agent');
const { TechnicalAgent } = require('./technical.agent');
const { MachineLookupAgent } = require('./machine-lookup.agent');
const { Logger } = require('../utils/logger');

class AgentRouter {
    static agents = {
        PRODUCT_SEARCH: new SearchAgent(),
        CROSS_REFERENCE_SEARCH: new CrossReferenceAgent(),
        TECHNICAL_SPEC_REQUEST: new TechnicalAgent(),
        MACHINE_LOOKUP: new MachineLookupAgent(),
        INVENTORY_REQUEST: new SearchAgent()
    };

    static async route(intent, userQuery, context) {
        Logger.debug('Agent routing', { intent, agents: Object.keys(this.agents) });

        const agent = this.agents[intent];
        if (!agent) {
            Logger.warn('No agent found for intent', { intent });
            return null;
        }

        try {
            Logger.info('Agent dispatched', { intent, agent: agent.name });
            const result = await agent.execute(userQuery, context);
            Logger.debug('Agent execution completed', { intent, agent: agent.name });
            return result;
        } catch (err) {
            Logger.error('Agent execution failed', { intent, agent: agent.name, error: err.message });
            throw err;
        }
    }

    static getAgent(intent) {
        return this.agents[intent] || null;
    }

    static getSupportedIntents() {
        return Object.keys(this.agents);
    }
}

module.exports = { AgentRouter };
