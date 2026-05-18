const { Logger } = require('../utils/logger');

class BaseAgent {
    constructor(name) {
        this.name = name;
    }

    async execute(userQuery, context) {
        throw new Error('execute() must be implemented by subclass');
    }

    log(level, message, data = {}) {
        const logData = { agent: this.name, ...data };
        Logger[level](message, logData);
    }
}

module.exports = { BaseAgent };
