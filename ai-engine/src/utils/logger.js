class Logger {
    static LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };

    static currentLevel = this.LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'];

    static debug(message, data = {}) {
        if (this.currentLevel <= this.LOG_LEVELS.DEBUG) {
            console.log(`[DEBUG] ${message}`, data);
        }
    }

    static info(message, data = {}) {
        if (this.currentLevel <= this.LOG_LEVELS.INFO) {
            console.log(`[INFO] ${message}`, data);
        }
    }

    static warn(message, data = {}) {
        if (this.currentLevel <= this.LOG_LEVELS.WARN) {
            console.warn(`[WARN] ${message}`, data);
        }
    }

    static error(message, error = {}) {
        if (this.currentLevel <= this.LOG_LEVELS.ERROR) {
            console.error(`[ERROR] ${message}`, error.message || error);
        }
    }
}

module.exports = { Logger };
