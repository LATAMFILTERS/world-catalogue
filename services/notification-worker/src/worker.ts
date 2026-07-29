import axios, { AxiosError } from 'axios';
import pino from 'pino';

const log = pino({ level: process.env.LOG_LEVEL ?? 'info' });

interface NotificationRecord {
  id: string;
  candidate_case_id: string;
  event_type: string;
  idempotency_key: string;
  sender: string;
  recipient: string;
  delivery_status: string;
  attempt_count: number;
  failure_reason?: string;
  created_at: string;
}

interface CandidateCase {
  id: string;
  external_id: string;
  symptom_summary: string;
  asset_summary?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
}

interface MailMessage {
  subject: string;
  body: string;
  htmlBody: string;
  toRecipients: Array<{ emailAddress: { address: string; name?: string } }>;
  from?: { emailAddress: { address: string; name?: string } };
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const POLL_INTERVAL_MS = 10000; // 10 seconds
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

const API_URL = process.env.KNOWLEDGE_CENTER_API_URL || 'https://knowledge-center-api-staging.onrender.com';
const API_KEY = process.env.KNOWLEDGE_CENTER_API_KEY;
const ACTOR_ID = process.env.NOTIFICATION_WORKER_ACTOR_ID || 'notification-worker-system';
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;

if (!API_KEY) {
  log.error('KNOWLEDGE_CENTER_API_KEY is required');
  process.exit(1);
}

let accessToken: { token: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < accessToken.expiry) {
    return accessToken.token;
  }

  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: AZURE_CLIENT_ID!,
        client_secret: AZURE_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    accessToken = {
      token: response.data.access_token,
      expiry: Date.now() + (response.data.expires_in - 60) * 1000, // Refresh 60s before expiry
    };

    return accessToken.token;
  } catch (error) {
    log.error({ error }, 'Failed to get Microsoft Graph access token');
    throw error;
  }
}

async function sendViaGraphAPI(email: MailMessage, fromEmail: string): Promise<string> {
  const token = await getAccessToken();

  try {
    const response = await axios.post(
      `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`,
      { message: email, saveToSentItems: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    log.info({ response: response.status }, 'Email sent via Microsoft Graph');
    return `graph-${Date.now()}`;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      log.error({ status: error.response?.status, message: error.message }, 'Microsoft Graph API error');
      throw new Error(`Graph API error: ${error.response?.status}`);
    }
    throw error;
  }
}

async function fetchQueuedNotifications(): Promise<NotificationRecord[]> {
  try {
    const response = await axios.get(`${API_URL}/api/knowledge-center/v1/notifications/queued`, {
      headers: {
        'x-api-key': API_KEY,
        'x-actor-id': ACTOR_ID,
        'x-actor-role': 'NOTIFICATION_WORKER',
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        log.error('Authentication failed - check KNOWLEDGE_CENTER_API_KEY');
        process.exit(1);
      }
      log.warn({ status: error.response?.status }, 'Failed to fetch notifications');
    } else {
      log.error({ error }, 'Network error fetching notifications');
    }
    return [];
  }
}

async function getCandidateCase(caseId: string): Promise<CandidateCase | null> {
  try {
    const response = await axios.get(`${API_URL}/api/knowledge-center/v1/candidate-cases/${caseId}`, {
      headers: {
        'x-api-key': API_KEY,
        'x-actor-id': ACTOR_ID,
        'x-actor-role': 'NOTIFICATION_WORKER',
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    return response.data;
  } catch (error) {
    log.warn({ caseId }, 'Failed to fetch candidate case');
    return null;
  }
}

async function updateNotificationStatus(
  notificationId: string,
  status: 'SENT' | 'DELIVERED' | 'FAILED',
  providerMessageId?: string,
  failureReason?: string
): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = { status };
    if (providerMessageId) payload.providerMessageId = providerMessageId;
    if (failureReason) payload.failureReason = failureReason;

    await axios.patch(`${API_URL}/api/knowledge-center/v1/notifications/${notificationId}`, payload, {
      headers: {
        'x-api-key': API_KEY,
        'x-actor-id': ACTOR_ID,
        'x-actor-role': 'NOTIFICATION_WORKER',
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    return true;
  } catch (error) {
    log.error({ notificationId }, 'Failed to update notification status');
    return false;
  }
}

async function buildEmailMessage(notification: NotificationRecord, candidateCase: CandidateCase | null): Promise<MailMessage> {
  const subject = `[Knowledge Center] Candidate Case ${notification.idempotency_key}`;
  const summary = candidateCase?.symptom_summary || 'Technical issue submitted';

  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>New Candidate Case Submitted</h2>
        <p><strong>Event:</strong> ${notification.event_type}</p>
        <p><strong>Case ID:</strong> ${notification.candidate_case_id}</p>
        <p><strong>Summary:</strong></p>
        <p style="background: #f5f5f5; padding: 1rem; border-left: 4px solid #FFF12D;">
          ${summary}
        </p>
        <p><em>This is an automated notification from the ELIMFILTERS Knowledge Center.</em></p>
      </body>
    </html>
  `;

  return {
    subject,
    body: `${subject}\n\n${summary}`,
    htmlBody,
    toRecipients: [{ emailAddress: { address: notification.recipient } }],
    from: { emailAddress: { address: notification.sender } },
  };
}

async function processNotification(notification: NotificationRecord): Promise<void> {
  const logContext = { notificationId: notification.id, idempotencyKey: notification.idempotency_key };

  if (notification.attempt_count >= MAX_RETRIES) {
    log.warn(logContext, 'Max retries exceeded, marking as failed');
    await updateNotificationStatus(
      notification.id,
      'FAILED',
      undefined,
      `Max retry attempts (${MAX_RETRIES}) exceeded`
    );
    return;
  }

  try {
    // Fetch candidate case for context
    const candidateCase = await getCandidateCase(notification.candidate_case_id);

    // Build email
    const email = await buildEmailMessage(notification, candidateCase);

    // Send via Microsoft Graph
    const providerId = await sendViaGraphAPI(email, notification.sender);

    // Update status
    const updated = await updateNotificationStatus(notification.id, 'DELIVERED', providerId);
    if (updated) {
      log.info(logContext, 'Notification delivered successfully');
    } else {
      log.warn(logContext, 'Delivered but status update failed');
    }
  } catch (error) {
    const backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, notification.attempt_count), MAX_BACKOFF_MS);
    const failureReason = error instanceof Error ? error.message : 'Unknown error';

    log.error({ ...logContext, backoffMs, failureReason }, 'Notification processing failed');

    // For now, mark as failed (in production, would re-queue with backoff)
    await updateNotificationStatus(notification.id, 'FAILED', undefined, failureReason);
  }
}

async function pollAndProcess(): Promise<void> {
  try {
    const notifications = await fetchQueuedNotifications();

    if (notifications.length > 0) {
      log.info({ count: notifications.length }, 'Processing queued notifications');

      for (const notification of notifications) {
        await processNotification(notification);
        // Small delay between processing to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    log.error({ error }, 'Unexpected error in poll cycle');
  }

  // Schedule next poll
  setTimeout(pollAndProcess, POLL_INTERVAL_MS);
}

async function shutdown(signal: string): Promise<void> {
  log.info(`${signal} received, shutting down notification worker`);
  process.exit(0);
}

// Start worker
log.info(
  {
    api: API_URL,
    pollInterval: POLL_INTERVAL_MS,
    maxRetries: MAX_RETRIES,
  },
  'Notification worker starting'
);

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => shutdown(signal));
}

pollAndProcess();
