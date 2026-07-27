# Outlook Email Integration (Microsoft 365)

## Overview

ELIMFILTERS has migrated from GoDaddy SMTP to Microsoft 365 (Outlook) using OAuth 2.0 Client Credentials flow for secure, enterprise-grade email delivery.

## Architecture

The integration uses two fallback methods:

### Method 1: Microsoft Graph API (Recommended)
- **Protocol**: OAuth 2.0 Client Credentials
- **Endpoint**: `https://graph.microsoft.com/v1.0/me/sendMail`
- **Advantages**: More robust, Microsoft-maintained, no SMTP limitations
- **Authentication**: Azure AD Client Credentials

### Method 2: SMTP Fallback
- **Host**: `smtp-mail.outlook.com`
- **Port**: 587 (TLS)
- **Advantages**: Fallback if Graph API fails
- **Requires**: Outlook application password or service account

## Setup Instructions

### 1. Register Azure Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory > App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: `ELIMFILTERS Email Service`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank (not needed for client credentials)
5. Click **Register**

### 2. Get Credentials

After registration, navigate to:

#### Get CLIENT_ID and TENANT_ID:
- On the **Overview** page:
  - Copy **Application (client) ID** → `AZURE_CLIENT_ID`
  - Copy **Directory (tenant) ID** → `AZURE_TENANT_ID`

#### Create CLIENT_SECRET:
- Go to **Certificates & secrets**
- Click **New client secret**
- Add description: `ELIMFILTERS Email Service Secret`
- Set expiry: `24 months` (recommended)
- Copy the **Value** → `AZURE_CLIENT_SECRET`
- ⚠️ **IMPORTANT**: Save this immediately; it won't be shown again

### 3. Grant Email Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Search for and select:
   - ✅ `Mail.Send`
6. Click **Add permissions**
7. Click **Grant admin consent for [Organization]**

### 4. Create Service Account (Optional, for SMTP)

If using SMTP fallback:

1. Create a service account user in Microsoft 365 Admin Center
2. Assign an Outlook mailbox license
3. Create an **App password**:
   - Go to account settings → **Security**
   - Create app password for `Other (Windows Phone)`
   - Save as `OUTLOOK_SMTP_PASSWORD` in `.env`

### 5. Update Environment Variables

Add to `.env` or deployment platform's environment variable section:

```bash
AZURE_CLIENT_ID=d8e95705-e99a-45fc-8b51-48032be25b1a
AZURE_CLIENT_SECRET=[Your-Client-Secret-Here]
AZURE_TENANT_ID=dac89e43-7889-46ec-8ca3-c0a24aba1a27
OUTLOOK_MAILBOX_EMAIL=info@elimfilters.com
OUTLOOK_SMTP_PASSWORD=[Your-App-Password-Here]  # Optional
```

⚠️ **NEVER commit `.env` file to Git**

### 6. Deploy

1. Update environment variables in deployment platform (Render, Railway, etc.)
2. Redeploy the application
3. Verify in logs: `[outlook-config] ✓ Outlook mail service configured`

## Testing

### Test Graph API Method

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Co",
    "message": "Test message",
    "turnstileToken": "test-token"
  }'
```

Check logs for:
- `[outlook-auth] Token acquired successfully`
- `[outlook-graph] Email sent successfully via Graph API`

### Test SMTP Fallback

The service automatically falls back to SMTP if Graph API fails and `OUTLOOK_SMTP_PASSWORD` is set.

Check logs for:
- `[outlook] Graph API failed, attempting SMTP fallback...`
- `[outlook-smtp] Email sent successfully via SMTP`

## Endpoints Using Outlook

1. **POST `/api/contact`** → Sends to `info@elimfilters.com`
2. **POST `/api/distributor`** → Sends to `distribution_network@elimfilters.com`
3. **POST `/api/ai/escalate`** → Sends to `support@elimfilters.com`

## Troubleshooting

### Error: "Failed to authenticate with Microsoft 365"

**Cause**: Invalid credentials or missing environment variables

**Solution**:
1. Verify `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID` are correct
2. Check that client secret hasn't expired (max 24 months)
3. Verify permissions were granted in Azure Portal

### Error: "Both methods failed"

**Cause**: Graph API failed AND no SMTP password configured

**Solution**:
1. Check Azure permissions (Mail.Send must be granted)
2. Verify tenant ID matches registration
3. Optionally, set `OUTLOOK_SMTP_PASSWORD` for fallback

### Error: "The OAuth 2.0 credential is invalid"

**Cause**: Client secret expired or permissions not granted

**Solution**:
1. Create new client secret in Azure Portal
2. Re-grant admin consent for Mail.Send permission
3. Update `.env` with new secret

## Monitoring

Log messages to watch for:

```
[outlook-config] ✓ Outlook mail service configured        ← Good
[outlook-auth] Token acquired successfully               ← Good
[outlook-graph] Email sent successfully via Graph API    ← Good
[outlook-smtp] Email sent successfully via SMTP          ← Good (fallback)

[outlook] Service initialization error                   ← Warning
[outlook-auth] Failed to get access token               ← Error
[outlook] Both methods failed                           ← Error
```

## Migration from GoDaddy

This integration completely replaces GoDaddy SMTP (`smtpout.secureserver.net`).

**Removed dependencies**:
- ❌ `GODADDY_MAIL_PASS` (no longer used)
- ❌ GoDaddy SMTP host configuration

**Code changes**:
- All `nodemailer.createTransport()` calls replaced with `OutlookMailService.send()`
- Service location: `/lib/outlook-mail.js`
- Integration points: `server-original.js` (3 endpoints)

## Security Best Practices

1. **Never commit `.env`** to version control
2. **Rotate client secrets** annually or on suspected compromise
3. **Use admin consent** for permission grants (not user consent)
4. **Monitor Azure logs** in Azure Portal > Monitor > Activity log
5. **Use strong passwords** for service account (if using SMTP fallback)
6. **Limit permissions** to only `Mail.Send` (no other Graph permissions needed)

## Reference

- [Microsoft Graph Mail API Docs](https://docs.microsoft.com/en-us/graph/api/user-sendmail)
- [OAuth 2.0 Client Credentials Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
- [Azure App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
