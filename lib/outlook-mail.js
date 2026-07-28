/**
 * Outlook Mail Service - Microsoft 365 Email Integration
 * Uses OAuth 2.0 Client Credentials flow + SMTP or Graph API
 */

const axios = require('axios');
const nodemailer = require('nodemailer');

class OutlookMailService {
  constructor() {
    this.clientId = process.env.AZURE_CLIENT_ID;
    this.clientSecret = process.env.AZURE_CLIENT_SECRET;
    this.tenantId = process.env.AZURE_TENANT_ID;
    this.accessToken = null;
    this.tokenExpiry = null;

    // Email routing by purpose
    this.emailMap = {
      contact: 'info@elimfilters.com',           // General inquiries
      support: 'support@elimfilters.com',         // Technical support
      distributor: 'distribution_network@elimfilters.com', // Distributor applications
      finance: 'finance@elimfilters.com',         // Finance/Orders
      logistics: 'logistics@elimfilters.com',     // Logistics
      solutions: 'solutions@elimfilters.com',     // Solutions team
      default: 'info@elimfilters.com',
    };
  }

  /**
   * Get access token using Client Credentials flow
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 1 minute before actual expiry
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
      console.log('[outlook-auth] Token acquired successfully');
      return this.accessToken;
    } catch (err) {
      console.error('[outlook-auth] Failed to get access token:', err.message);
      throw new Error('Failed to authenticate with Microsoft 365');
    }
  }

  /**
   * Send email using Microsoft Graph API (Method 1 - Recommended)
   * @param {string|array} to - Recipient email(s)
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content
   * @param {string} textContent - Plain text content (optional)
   * @param {string} type - Email type (contact, support, distributor, finance, logistics, solutions) - defaults to 'contact'
   */
  async sendViaGraphAPI(to, subject, htmlContent, textContent = null, type = 'contact') {
    try {
      const token = await this.getAccessToken();
      const fromEmail = this.emailMap[type] || this.emailMap.default;

      const mailBody = {
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: htmlContent || textContent || '',
          },
          toRecipients: Array.isArray(to)
            ? to.map(email => ({ emailAddress: { address: email } }))
            : [{ emailAddress: { address: to } }],
          from: {
            emailAddress: {
              address: fromEmail,
            },
          },
        },
        saveToSentItems: true,
      };

      const response = await axios.post(
        `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`,
        mailBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`[outlook-graph] Email sent successfully from ${fromEmail} via Graph API`);
      return { success: true, method: 'graph', from: fromEmail, response: response.status };
    } catch (err) {
      console.error('[outlook-graph] Failed to send via Graph API:', err.message);
      throw err;
    }
  }

  /**
   * Send email using SMTP (Fallback Method 2)
   * Uses Outlook SMTP with password authentication
   * @param {string|array} to - Recipient email(s)
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content
   * @param {string} textContent - Plain text content (optional)
   * @param {string} type - Email type (contact, support, distributor, finance, logistics, solutions) - defaults to 'contact'
   */
  async sendViaSMTP(to, subject, htmlContent, textContent = null, type = 'contact') {
    try {
      const fromEmail = this.emailMap[type] || this.emailMap.default;

      // Note: For production, requires OUTLOOK_SMTP_PASSWORD (app password for the specific mailbox)
      const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // TLS, not SSL
        auth: {
          user: fromEmail,
          pass: process.env.OUTLOOK_SMTP_PASSWORD, // App password or service account password
        },
      });

      const mailOptions = {
        from: fromEmail,
        to: Array.isArray(to) ? to.join(',') : to,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent?.replace(/<[^>]*>/g, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[outlook-smtp] Email sent successfully from ${fromEmail} via SMTP:`, info.messageId);
      return { success: true, method: 'smtp', from: fromEmail, response: info };
    } catch (err) {
      console.error('[outlook-smtp] Failed to send via SMTP:', err.message);
      throw err;
    }
  }

  /**
   * Smart send - tries Graph API first, falls back to SMTP
   * @param {string|array} to - Recipient email(s)
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content
   * @param {string} textContent - Plain text content (optional)
   * @param {string} type - Email type (contact, support, distributor, finance, logistics, solutions) - defaults to 'contact'
   */
  async send(to, subject, htmlContent, textContent = null, type = 'contact') {
    try {
      // Try Graph API first (preferred method)
      return await this.sendViaGraphAPI(to, subject, htmlContent, textContent, type);
    } catch (graphErr) {
      console.warn(`[outlook] Graph API failed, attempting SMTP fallback for type: ${type}...`);
      try {
        // Fall back to SMTP if available
        if (process.env.OUTLOOK_SMTP_PASSWORD) {
          return await this.sendViaSMTP(to, subject, htmlContent, textContent, type);
        }
        throw graphErr; // Re-throw if no SMTP password configured
      } catch (smtpErr) {
        console.error('[outlook] Both methods failed');
        throw new Error(`Email delivery failed: ${smtpErr.message}`);
      }
    }
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const required = ['AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET', 'AZURE_TENANT_ID'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log('[outlook-config] ✓ Outlook mail service configured');
  }
}

module.exports = OutlookMailService;
