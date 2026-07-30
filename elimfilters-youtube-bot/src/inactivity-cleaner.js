export function createInactivityCleaner({ db, whatsapp, instagram, youtube }) {
  const INACTIVITY_MINUTES = 1;
  const CLEANUP_INTERVAL_MS = 30000; // Check every 30 seconds

  return {
    start() {
      console.log('[Inactivity Cleaner] Starting with 1-minute inactivity timeout');

      this.interval = setInterval(async () => {
        try {
          await this.checkAndCleanupInactiveSessions();
        } catch (err) {
          console.error('[Inactivity Cleaner] Error during cleanup:', err.message);
        }
      }, CLEANUP_INTERVAL_MS);
    },

    stop() {
      if (this.interval) {
        clearInterval(this.interval);
        console.log('[Inactivity Cleaner] Stopped');
      }
    },

    async checkAndCleanupInactiveSessions() {
      const inactiveSessions = await db.getInactiveSessions(INACTIVITY_MINUTES);

      if (inactiveSessions.length === 0) return;

      console.log(`[Inactivity Cleaner] Found ${inactiveSessions.length} inactive sessions`);

      for (const session of inactiveSessions) {
        try {
          const { user_id, platform } = session;

          // Send notification to user before closing
          const notificationMessage = this.getNotificationMessage(platform);

          if (platform === 'whatsapp' && whatsapp) {
            await whatsapp.sendMessage(user_id, notificationMessage);
          } else if (platform === 'instagram' && instagram) {
            await instagram.sendMessage(user_id, notificationMessage);
          } else if (platform === 'youtube' && youtube) {
            // YouTube doesn't have a direct message API, only comment replies
            console.log(`[Inactivity Cleaner] Skipping notification for YouTube user ${user_id} (no DM support)`);
          }

          // Close session and clear history
          await db.closeSession(user_id, platform);
          console.log(`[Inactivity Cleaner] Closed session for ${user_id} on ${platform}`);
        } catch (err) {
          console.error(`[Inactivity Cleaner] Error processing session:`, err.message);
        }
      }
    },

    getNotificationMessage(platform) {
      if (platform === 'whatsapp') {
        return '⏱️ Tu sesión ha sido cerrada por inactividad (1 minuto sin actividad). Por favor, envía un nuevo mensaje para continuar. ¿Cuál es tu consulta?';
      } else if (platform === 'instagram') {
        return '⏱️ Tu sesión ha sido cerrada por inactividad (1 minuto sin actividad). Por favor, envía un nuevo mensaje para continuar. ¿Cuál es tu consulta?';
      } else if (platform === 'youtube') {
        return '⏱️ Tu sesión ha sido cerrada por inactividad (1 minuto sin actividad). Por favor, envía un nuevo comentario para continuar. ¿Cuál es tu consulta?';
      }
      return 'Tu sesión ha sido cerrada por inactividad. Por favor, envía un nuevo mensaje para continuar.';
    }
  };
}
