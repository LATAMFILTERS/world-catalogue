/**
 * Structured Logger
 *
 * Provides consistent logging across bots with:
 * - Structured context (sessionId, platform, contactId)
 * - Log levels (DEBUG, INFO, WARN, ERROR)
 * - Automatic timestamps and formatting
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

export function createLogger(serviceName, minLevel = LogLevel.INFO) {
  const formatLog = (level, context, message, data) => {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LogLevel).find(k => LogLevel[k] === level);

    const logEntry = {
      timestamp,
      service: serviceName,
      level: levelName,
      message,
      ...context,
      ...(data && { data })
    };

    return JSON.stringify(logEntry);
  };

  return {
    debug(message, context = {}, data = null) {
      if (LogLevel.DEBUG >= minLevel) {
        console.debug(formatLog(LogLevel.DEBUG, context, message, data));
      }
    },

    info(message, context = {}, data = null) {
      if (LogLevel.INFO >= minLevel) {
        console.log(formatLog(LogLevel.INFO, context, message, data));
      }
    },

    warn(message, context = {}, data = null) {
      if (LogLevel.WARN >= minLevel) {
        console.warn(formatLog(LogLevel.WARN, context, message, data));
      }
    },

    error(message, context = {}, data = null) {
      if (LogLevel.ERROR >= minLevel) {
        console.error(formatLog(LogLevel.ERROR, context, message, data));
      }
    },

    // Log conversation turn with full context
    logConversationTurn(context, messageText, state, result) {
      this.info('Conversation turn processed', context, {
        messageLength: messageText.length,
        state,
        result: {
          action: result.action,
          status: result.status,
          productsFound: result.products?.length || 0
        }
      });
    },

    // Log error with context
    logError(context, error, additionalData) {
      this.error('Processing error', context, {
        errorMessage: error.message,
        errorStack: error.stack?.split('\n')[0],
        ...additionalData
      });
    }
  };
}
