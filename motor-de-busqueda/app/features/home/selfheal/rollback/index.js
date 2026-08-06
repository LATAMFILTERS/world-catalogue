export const rollbackStrategy = {
  enabled: true,

  shouldRollback(errorCount) {
    return errorCount > 3;
  },

  fallbackUI: 'safe-mode',

  executeRollback() {
    console.warn('UI rollback triggered');
    window.location.reload();
  }
};
