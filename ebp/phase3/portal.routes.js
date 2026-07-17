'use strict';

// EBP Phase 3 — Factory Portal frontend (ADR-0029). Server-rendered pages
// mounted directly in server.js under /portal. No new frontend framework,
// no build step. Every page: requires a valid session cookie (checked
// server-side before any HTML renders), sets noindex/nofollow, sets the
// session cookie HttpOnly/Secure/SameSite=Strict, and is never linked from
// the public Next.js site's navigation/sitemap.

const express = require('express');
const multer = require('multer');
const service = require('./service');
const excel = require('./excel');
const staging = require('./staging');
const validation = require('./validation');
const dto = require('./dto');
const csrf = require('./csrf');
const pepFields = require('./pep-fields');
const errorUtils = require('./errors');
const factoryAuth = require('./factory-auth');

const SESSION_COOKIE = 'ebp_factory_session';
const LOGIN_CSRF_COOKIE = 'ebp_login_csrf';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: validation.MAX_DOCUMENT_SIZE_BYTES } });

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function parseCookies(req) {
  const header = req.get('cookie') || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const idx = p.indexOf('=');
        return [p.slice(0, idx), decodeURIComponent(p.slice(idx + 1))];
      })
  );
}

// ADR-0035: Max-Age is always aligned with the server-side session TTL
// (factory-auth.js's own 12-hour SESSION_TTL_SECONDS, never a separate
// hardcoded number that could drift from it) — the cookie's own lifetime
// never outlives, or meaningfully undershoots, the session it names. The
// server session row remains the sole authority regardless: an expired/
// revoked session is rejected by resolveSession() even if a stale cookie
// with a longer client-side clock is still present.
function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/portal; Max-Age=${factoryAuth.SESSION_TTL_SECONDS}${secure}`
  );
}

// Clearing uses the identical HttpOnly/SameSite/Path/Secure attributes as
// setSessionCookie (only Max-Age changes, to 0) — some browsers only
// reliably overwrite/delete a cookie when every other attribute matches.
function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.set('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/portal; Max-Age=0${secure}`);
}

// Double-submit cookie for the pre-session /portal/login form (there is no
// session yet at that point, so the synchronizer-token pattern used
// everywhere else does not apply). The cookie value is never read by
// client JS — the browser simply re-attaches it automatically, and the
// server compares it against the hidden form field it rendered alongside
// it, so a cross-site forged form (which cannot read this cookie) can
// never supply a matching field value.
function setLoginCsrfCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.set('Set-Cookie', `${LOGIN_CSRF_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/portal/login; Max-Age=600${secure}`);
}

function clearLoginCsrfCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.set('Set-Cookie', `${LOGIN_CSRF_COOKIE}=; HttpOnly; SameSite=Strict; Path=/portal/login; Max-Age=0${secure}`);
}

// csrfToken, when present, renders "Log out" as its own tiny POST form
// (logout is a state-changing action and must never be a GET link) with
// the session's synchronizer token attached. Omitted entirely when there
// is no session (e.g. the login page itself).
function layout(title, bodyHtml, csrfToken) {
  const logoutControl = csrfToken
    ? `<form method="post" action="/portal/logout" style="display:inline;margin:0;padding:0;max-width:none;width:auto;">
  <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">
  <button type="submit" style="all:unset;cursor:pointer;color:#FFF12D;font:inherit;">Log out</button>
</form>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} — ELIMFILTERS Factory Portal</title>
<style>
  body { font-family: -apple-system, sans-serif; background:#0a0a0a; color:#eee; margin:0; padding:2rem; }
  a { color:#FFF12D; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
  th, td { border: 1px solid #333; padding: 0.5rem; text-align: left; font-size: 0.9rem; }
  th { background: #111; }
  input, select, textarea, button { font-size: 1rem; padding: 0.5rem; margin: 0.25rem 0; width: 100%; box-sizing: border-box; }
  button { background:#FFF12D; color:#000; border:none; cursor:pointer; font-weight:600; }
  .error { color:#ff6b6b; }
  .status { display:inline-block; padding:0.15rem 0.5rem; border:1px solid #555; border-radius:3px; font-size:0.8rem; }
  form { max-width: 480px; }
  nav a { margin-right: 1rem; }
</style>
</head>
<body>
<nav><a href="/portal/dashboard">Dashboard</a> ${logoutControl}</nav>
<h1>${escapeHtml(title)}</h1>
${bodyHtml}
</body>
</html>`;
}

// Applied to every state-changing (non-login) POST route. Must run after
// the auth-gate middleware (req.factorySession) and after body parsing
// (req.body._csrf). Rejects with a generic, safe message — never
// reflects the submitted or expected token back to the client, and never
// logs either value.
function verifyCsrf(req, res, next) {
  const submitted = (req.body || {})._csrf;
  if (!csrf.csrfTokensMatch(req.factorySession.csrf_token, submitted)) {
    return res
      .status(403)
      .send(
        layout(
          'Request Blocked',
          '<p class="error">This request could not be verified. Go back, refresh the page, and try again.</p>',
          req.factorySession.csrf_token
        )
      );
  }
  next();
}

function createPortalRouter(pool) {
  const router = express.Router();

  // Auth gate — applied to every route below except /login. Also assigns
  // a per-request correlation id (ADR-0034) used to tie a generic
  // user-facing error message back to its full, sanitized server log
  // line, without ever exposing the underlying error itself.
  router.use(async (req, res, next) => {
    req.requestId = errorUtils.generateRequestId();
    if (req.path === '/login' || req.path === '/login/') return next();
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE];
    if (!token) return res.redirect('/portal/login');
    const session = await service.resolveSession(pool, token);
    if (!session) {
      clearSessionCookie(res);
      return res.redirect('/portal/login');
    }
    req.factorySession = session;
    req.factorySessionToken = token;
    next();
  });

  router.get('/login', (req, res) => {
    const error = req.query.error === 'csrf' ? '<p class="error">Your session expired. Please try again.</p>' : req.query.error ? '<p class="error">Invalid email or password.</p>' : '';
    const loginCsrfToken = csrf.generateCsrfToken();
    setLoginCsrfCookie(res, loginCsrfToken);
    res.send(
      layout(
        'Log in',
        `${error}
<form method="post" action="/portal/login">
  <input type="hidden" name="_csrf" value="${escapeHtml(loginCsrfToken)}">
  <label>Email<input type="email" name="email" required></label>
  <label>Password<input type="password" name="password" required></label>
  <button type="submit">Log in</button>
</form>`
      )
    );
  });

  router.post('/login', express.urlencoded({ extended: false }), async (req, res) => {
    const cookies = parseCookies(req);
    if (!csrf.csrfTokensMatch(cookies[LOGIN_CSRF_COOKIE], (req.body || {})._csrf)) {
      return res.redirect('/portal/login?error=csrf');
    }
    clearLoginCsrfCookie(res);
    try {
      const { email, password } = req.body || {};
      const { sessionToken } = await service.login(pool, email, password, { ip: req.ip, userAgent: req.get('user-agent') });
      setSessionCookie(res, sessionToken);
      res.redirect('/portal/dashboard');
    } catch {
      res.redirect('/portal/login?error=1');
    }
  });

  router.post('/logout', express.urlencoded({ extended: false }), verifyCsrf, async (req, res) => {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE];
    if (token) {
      await service.logout(pool, token, req.factorySession && req.factorySession.factory_user_id).catch(() => {});
    }
    clearSessionCookie(res);
    res.redirect('/portal/login');
  });

  router.get('/dashboard', async (req, res) => {
    const batches = await service.listBatches(pool, { manufacturer_id: req.factorySession.manufacturer_id });
    const rows = batches.length
      ? batches
          .map(
            (b) =>
              `<tr><td><a href="/portal/batches/${escapeHtml(b.batch_code)}">${escapeHtml(b.batch_code)}</a></td>` +
              `<td>${escapeHtml(b.purpose)}</td><td><span class="status">${escapeHtml(b.effective_status || b.status)}</span></td>` +
              `<td>${escapeHtml(b.response_due_at || '—')}</td></tr>`
          )
          .join('')
      : '<tr><td colspan="4">No batches yet.</td></tr>';
    res.send(
      layout(
        'Your Batches',
        `<table><thead><tr><th>Batch</th><th>Purpose</th><th>Status</th><th>Response Due</th></tr></thead><tbody>${rows}</tbody></table>`,
        req.factorySession.csrf_token
      )
    );
  });

  router.get('/batches/:batch_code', async (req, res) => {
    try {
      const batch = await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
      const items = await service.listBatchItems(pool, req.params.batch_code);
      const rows = items.length
        ? items
            .map(
              (i) =>
                `<tr><td>${escapeHtml(i.elimfilters_code)}</td><td><span class="status">${escapeHtml(i.status)}</span></td>` +
                `<td><a href="/portal/batches/${escapeHtml(req.params.batch_code)}/items/${escapeHtml(i.id)}/offer">Submit Offer</a></td></tr>`
            )
            .join('')
        : '<tr><td colspan="3">No items.</td></tr>';
      res.send(
        layout(
          `Batch ${batch.batch_code}`,
          `<p>Purpose: ${escapeHtml(batch.purpose)} · Status: <span class="status">${escapeHtml(batch.effective_status || batch.status)}</span> · Due: ${escapeHtml(batch.response_due_at || '—')}</p>` +
            `<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}/excel">Excel export/import</a></p>` +
            `<table><thead><tr><th>Product</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`,
          req.factorySession.csrf_token
        )
      );
    } catch {
      res.status(404).send(layout('Not Found', '<p>Batch not found.</p>', req.factorySession.csrf_token));
    }
  });

  // Looks up a single Batch Item by id from the tenant-scoped item list —
  // there is no dedicated single-item service function, and the list is
  // already tenant/batch-scoped via getBatchForManufacturer + listBatchItems.
  async function findOwnBatchItem(batchCode, manufacturerId, itemId) {
    await service.getBatchForManufacturer(pool, batchCode, manufacturerId);
    const items = await service.listBatchItems(pool, batchCode);
    return items.find((i) => i.id === itemId) || null;
  }

  router.get('/batches/:batch_code/items/:item_id/offer', async (req, res) => {
    try {
      const item = await findOwnBatchItem(req.params.batch_code, req.factorySession.manufacturer_id, req.params.item_id);
      if (!item) return res.status(404).send(layout('Not Found', '<p>Product not found in this batch.</p>', req.factorySession.csrf_token));
      const fields = pepFields.getApplicableFields(item.manufacturer_visible_snapshot);
      const error = req.query.error ? `<p class="error">${escapeHtml(req.query.error)}</p>` : '';
      const fieldBlocks = fields
        .map(
          (f) => `<fieldset style="border:1px solid #333;margin-bottom:1rem;padding:1rem;">
  <legend>${escapeHtml(f.label)}${f.unit ? ` (${escapeHtml(f.unit)})` : ''}</legend>
  <p style="color:rgba(255,255,255,0.6);font-size:0.85rem;">ELIMFILTERS-required: ${escapeHtml(f.required_value ?? '—')}${
            f.required_tolerance ? ` &#177; ${escapeHtml(f.required_tolerance)}` : ''
          }${f.instructions ? ` — ${escapeHtml(f.instructions)}` : ''}</p>
  <label>Offered value<input type="text" name="tf_${escapeHtml(f.field_name)}_value"></label>
  <label>Offered unit<input type="text" name="tf_${escapeHtml(f.field_name)}_unit" value="${escapeHtml(f.unit || '')}"></label>
  <label>Offered tolerance<input type="text" name="tf_${escapeHtml(f.field_name)}_tolerance"></label>
  <label>Completeness
    <select name="tf_${escapeHtml(f.field_name)}_status">
      <option value="">— choose —</option>
      <option value="ANSWERED">Answered</option>
      <option value="CANNOT_MEET">Cannot meet</option>
      <option value="NOT_APPLICABLE">Not applicable</option>
    </select>
  </label>
  <label>Note<textarea name="tf_${escapeHtml(f.field_name)}_note"></textarea></label>
</fieldset>`
        )
        .join('');
      res.send(
        layout(
          'Submit Offer',
          `${error}
<p>Answer every applicable field below exactly as defined in this product's Engineering Passport. Field names are fixed by ELIMFILTERS and cannot be edited. You may save an incomplete response as a Draft, but every field must have an explicit answer before submitting.</p>
<form method="post" action="/portal/batches/${escapeHtml(req.params.batch_code)}/items/${escapeHtml(req.params.item_id)}/offer">
  <input type="hidden" name="_csrf" value="${escapeHtml(req.factorySession.csrf_token)}">
  <label>FOB Price (decimal, e.g. 12.50)<input type="text" name="fob_price" required pattern="-?\\d+(\\.\\d+)?"></label>
  <label>Currency (3-letter)<input type="text" name="currency" maxlength="3" required></label>
  <label>MOQ<input type="number" name="moq"></label>
  <label>Lead time (days)<input type="number" name="lead_time_days"></label>
  <h3>Technical fields</h3>
  ${fieldBlocks || '<p>No applicable technical fields for this product.</p>'}
  <button type="submit" name="action" value="draft">Save as Draft</button>
  <button type="submit" name="action" value="submit">Submit Offer</button>
</form>`,
          req.factorySession.csrf_token
        )
      );
    } catch {
      res.status(404).send(layout('Not Found', '<p>Batch or item not found.</p>', req.factorySession.csrf_token));
    }
  });

  router.post('/batches/:batch_code/items/:item_id/offer', express.urlencoded({ extended: false }), verifyCsrf, async (req, res) => {
    try {
      const item = await findOwnBatchItem(req.params.batch_code, req.factorySession.manufacturer_id, req.params.item_id);
      if (!item) throw new Error('item not found');
      const applicableFields = pepFields.getApplicableFields(item.manufacturer_visible_snapshot);
      const body = req.body || {};
      const technicalFields = applicableFields
        .map((f) => {
          const status = body[`tf_${f.field_name}_status`];
          if (!status) return null; // left blank — omitted; SUBMITTED will be rejected server-side if this field is required
          return {
            field_name: f.field_name,
            offered_value: body[`tf_${f.field_name}_value`] || null,
            unit: body[`tf_${f.field_name}_unit`] || null,
            tolerance: body[`tf_${f.field_name}_tolerance`] || null,
            completeness_status: status,
            manufacturer_note: body[`tf_${f.field_name}_note`] || null,
          };
        })
        .filter(Boolean);
      await service.createOfferRevision(
        pool,
        req.params.batch_code,
        req.params.item_id,
        {
          submit: body.action === 'submit',
          fob_price: body.fob_price,
          currency: body.currency,
          moq: body.moq ? Number(body.moq) : undefined,
          lead_time_days: body.lead_time_days ? Number(body.lead_time_days) : undefined,
          technical_fields: technicalFields,
        },
        { declared_actor: req.factorySession.factory_user_id, identity_mechanism: 'FACTORY_SESSION', factory_user_id: req.factorySession.factory_user_id }
      );
      res.redirect(`/portal/batches/${encodeURIComponent(req.params.batch_code)}`);
    } catch (err) {
      const message = errorUtils.safeMessage(err, req.requestId, 'portal offer submit');
      res.redirect(
        `/portal/batches/${encodeURIComponent(req.params.batch_code)}/items/${encodeURIComponent(req.params.item_id)}/offer?error=${encodeURIComponent(message)}`
      );
    }
  });

  // Renders a single technical field row inside the preview table.
  function renderFieldRow(field) {
    return `<tr><td>${escapeHtml(field.field_name)}</td><td>${escapeHtml(field.offered_value)}</td>` +
      `<td>${escapeHtml(field.unit || '—')}</td><td>${escapeHtml(field.tolerance || '—')}</td>` +
      `<td><span class="status">${escapeHtml(field.completeness_status)}</span></td>` +
      `<td>${escapeHtml(field.manufacturer_note || '—')}</td></tr>`;
  }

  // Renders the staged errors, whichever shape they take: an array of
  // structural strings (wrong batch/template/tampered locked columns) or
  // an array of per-row objects (Stage 2 field validation).
  function renderErrorReport(errorsJson) {
    const errors = errorsJson || [];
    if (!errors.length) return '<p>No errors.</p>';
    if (typeof errors[0] === 'string') {
      return `<ul class="error">${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`;
    }
    const rows = errors
      .map(
        (e) =>
          `<tr><td>${escapeHtml(e.row)}</td><td>${escapeHtml(e.batch_item_id)}</td><td>${escapeHtml(e.field_name)}</td>` +
          `<td class="error">${e.errors.map((m) => escapeHtml(m)).join('; ')}</td></tr>`
      )
      .join('');
    return `<table><thead><tr><th>Row</th><th>Product</th><th>Field</th><th>Problem</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  router.get('/batches/:batch_code/excel', async (req, res) => {
    try {
      const batch = await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
      const error = req.query.error ? `<p class="error">${escapeHtml(req.query.error)}</p>` : '';
      res.send(
        layout(
          'Excel Export / Import',
          `${error}
<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}/excel/export">1. Download the current workbook</a> — fill in the editable (unshaded) columns only.</p>
<p>2. Upload your completed workbook below. It is checked and staged for your review before anything is submitted.</p>
<form method="post" action="/portal/batches/${escapeHtml(batch.batch_code)}/excel/upload" enctype="multipart/form-data">
  <input type="hidden" name="_csrf" value="${escapeHtml(req.factorySession.csrf_token)}">
  <label>Completed workbook (.xlsx)<input type="file" name="file" accept=".xlsx" required></label>
  <button type="submit">Upload &amp; Review</button>
</form>`,
          req.factorySession.csrf_token
        )
      );
    } catch {
      res.status(404).send(layout('Not Found', '<p>Batch not found.</p>', req.factorySession.csrf_token));
    }
  });

  router.get('/batches/:batch_code/excel/export', async (req, res) => {
    try {
      const batch = await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
      const batchItems = await service.listBatchItems(pool, req.params.batch_code);
      const buffer = await excel.buildBatchWorkbook({ batchCode: batch.batch_code, manufacturerId: batch.manufacturer_id, batchItems });
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.set('Content-Disposition', `attachment; filename="${batch.batch_code}.xlsx"`);
      res.send(Buffer.from(buffer));
    } catch {
      res.status(404).send(layout('Not Found', '<p>Batch not found.</p>', req.factorySession.csrf_token));
    }
  });

  router.post('/batches/:batch_code/excel/upload', upload.single('file'), verifyCsrf, async (req, res) => {
    let batch;
    try {
      batch = await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
    } catch {
      return res.status(404).send(layout('Not Found', '<p>Batch not found.</p>', req.factorySession.csrf_token));
    }
    if (!req.file) {
      return res.redirect(`/portal/batches/${encodeURIComponent(req.params.batch_code)}/excel?error=${encodeURIComponent('Choose a .xlsx file to upload.')}`);
    }
    try {
      const workbookHash = require('node:crypto').createHash('sha256').update(req.file.buffer).digest('hex');
      const { errors, preview } = await excel.parseAndValidateWorkbook(req.file.buffer, batch.batch_code, batch.manufacturer_id);
      const stagingId = await staging.put(pool, {
        manufacturerId: req.factorySession.manufacturer_id,
        factoryUserId: req.factorySession.factory_user_id,
        batchId: batch.id,
        workbookHash,
        preview,
        errors: errors.length ? errors : null,
      });
      res.redirect(`/portal/batches/${encodeURIComponent(batch.batch_code)}/excel/preview/${encodeURIComponent(stagingId)}`);
    } catch (err) {
      // Always a fixed, generic message to the Manufacturer — but still
      // logged internally (with a correlation id) so a real parsing bug
      // is traceable, not silently swallowed.
      errorUtils.safeMessage(err, req.requestId, 'portal excel upload');
      res.redirect(
        `/portal/batches/${encodeURIComponent(req.params.batch_code)}/excel?error=${encodeURIComponent('That file could not be read — make sure it is the unmodified workbook downloaded from this portal.')}`
      );
    }
  });

  router.get('/batches/:batch_code/excel/preview/:staging_id', async (req, res) => {
    let batch;
    try {
      batch = await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
    } catch {
      return res.status(404).send(layout('Not Found', '<p>Batch not found.</p>', req.factorySession.csrf_token));
    }
    const staged = await staging.peek(pool, req.params.staging_id, batch.id, req.factorySession.manufacturer_id);
    if (!staged) {
      return res.send(
        layout(
          'Upload Expired',
          `<p class="error">This staged upload was not found or has expired. Please upload the workbook again.</p>
<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}/excel">Back to Excel upload</a></p>`,
          req.factorySession.csrf_token
        )
      );
    }
    if (staged.status !== 'STAGED') {
      return res.send(
        layout(
          'Already Handled',
          `<p>This staged upload has already been ${escapeHtml(staged.status.toLowerCase())}.</p>
<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}">Back to batch</a></p>`,
          req.factorySession.csrf_token
        )
      );
    }
    if (!staged.preview_json) {
      return res.send(
        layout(
          'Upload Rejected',
          `<p class="error">This workbook could not be staged. Nothing was submitted.</p>
${renderErrorReport(staged.errors_json)}
<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}/excel">Upload a corrected workbook</a></p>`,
          req.factorySession.csrf_token
        )
      );
    }
    const itemBlocks = staged.preview_json
      .map((entry) => {
        const fieldRows = entry.technical_fields.map(renderFieldRow).join('');
        return `<h3>Product ${escapeHtml(entry.batch_item_id)}</h3>
<p>FOB: ${escapeHtml(entry.fob_price || '—')} ${escapeHtml(entry.currency || '')} · MOQ: ${escapeHtml(entry.moq || '—')} · Lead time: ${escapeHtml(entry.lead_time_days || '—')} days</p>
<table><thead><tr><th>Field</th><th>Offered value</th><th>Unit</th><th>Tolerance</th><th>Completeness</th><th>Note</th></tr></thead><tbody>${fieldRows}</tbody></table>`;
      })
      .join('<hr>');
    res.send(
      layout(
        'Review Before Submitting',
        `<p>Review the parsed offer below. Nothing has been submitted yet — confirm to create these offers, or go back and upload a corrected file.</p>
${itemBlocks}
<form method="post" action="/portal/batches/${escapeHtml(batch.batch_code)}/excel/confirm">
  <input type="hidden" name="staging_id" value="${escapeHtml(req.params.staging_id)}">
  <input type="hidden" name="_csrf" value="${escapeHtml(req.factorySession.csrf_token)}">
  <button type="submit">Confirm &amp; Submit Offers</button>
</form>
<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}/excel">Discard and upload a different file</a></p>`,
        req.factorySession.csrf_token
      )
    );
  });

  router.post('/batches/:batch_code/excel/confirm', express.urlencoded({ extended: false }), verifyCsrf, async (req, res) => {
    let batch;
    try {
      batch = await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
    } catch {
      return res.status(404).send(layout('Not Found', '<p>Batch not found.</p>', req.factorySession.csrf_token));
    }
    const { staging_id: stagingId } = req.body || {};
    const preview = await staging.take(pool, stagingId, batch.id, req.factorySession.manufacturer_id);
    if (!preview) {
      return res.send(
        layout(
          'Could Not Confirm',
          `<p class="error">This staged upload is invalid, expired, or was already confirmed. Please upload the workbook again.</p>
<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}/excel">Back to Excel upload</a></p>`,
          req.factorySession.csrf_token
        )
      );
    }
    const actor = { declared_actor: req.factorySession.factory_user_id, identity_mechanism: 'FACTORY_SESSION', factory_user_id: req.factorySession.factory_user_id };
    const results = [];
    const itemErrors = [];
    for (const entry of preview) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const created = await service.createOfferRevision(
          pool,
          batch.batch_code,
          entry.batch_item_id,
          {
            submit: true,
            fob_price: entry.fob_price ? String(entry.fob_price) : undefined,
            currency: entry.currency || undefined,
            moq: entry.moq ? Number(entry.moq) : undefined,
            lead_time_days: entry.lead_time_days ? Number(entry.lead_time_days) : undefined,
            technical_fields: entry.technical_fields,
          },
          actor
        );
        // eslint-disable-next-line no-await-in-loop
        const offer = await service.getOfferWithDetail(pool, created.offer_code);
        results.push(dto.toFactoryOfferDTO(offer));
      } catch (err) {
        itemErrors.push({ batch_item_id: entry.batch_item_id, error: errorUtils.safeMessage(err, req.requestId, 'portal excel confirm') });
      }
    }
    const successRows = results
      .map((o) => `<tr><td>${escapeHtml(o.offer_code)}</td><td>${escapeHtml(o.batch_item_id)}</td><td><span class="status">${escapeHtml(o.status)}</span></td></tr>`)
      .join('');
    const errorRows = itemErrors.map((e) => `<tr><td>${escapeHtml(e.batch_item_id)}</td><td class="error">${escapeHtml(e.error)}</td></tr>`).join('');
    res.send(
      layout(
        itemErrors.length ? 'Submitted With Errors' : 'Offers Submitted',
        `${results.length ? `<h3>Submitted</h3><table><thead><tr><th>Offer</th><th>Product</th><th>Status</th></tr></thead><tbody>${successRows}</tbody></table>` : ''}
${itemErrors.length ? `<h3 class="error">Rejected</h3><table><thead><tr><th>Product</th><th>Reason</th></tr></thead><tbody>${errorRows}</tbody></table>` : ''}
<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}">Back to batch</a></p>`,
        req.factorySession.csrf_token
      )
    );
  });

  return router;
}

module.exports = createPortalRouter;
