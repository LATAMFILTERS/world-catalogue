'use strict';

// EBP Phase 3 — Factory Portal frontend (ADR-0029). Server-rendered pages
// mounted directly in server.js under /portal. No new frontend framework,
// no build step. Every page: requires a valid session cookie (checked
// server-side before any HTML renders), sets noindex/nofollow, sets the
// session cookie HttpOnly/Secure/SameSite=Strict, and is never linked from
// the public Next.js site's navigation/sitemap.

const express = require('express');
const service = require('./service');

const SESSION_COOKIE = 'ebp_factory_session';

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

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.set('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/portal${secure}`);
}

function clearSessionCookie(res) {
  res.set('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/portal; Max-Age=0`);
}

function layout(title, bodyHtml) {
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
<nav><a href="/portal/dashboard">Dashboard</a> <a href="/portal/logout">Log out</a></nav>
<h1>${escapeHtml(title)}</h1>
${bodyHtml}
</body>
</html>`;
}

function createPortalRouter(pool) {
  const router = express.Router();

  // Auth gate — applied to every route below except /login.
  router.use(async (req, res, next) => {
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
    const error = req.query.error ? '<p class="error">Invalid email or password.</p>' : '';
    res.send(
      layout(
        'Log in',
        `${error}
<form method="post" action="/portal/login">
  <label>Email<input type="email" name="email" required></label>
  <label>Password<input type="password" name="password" required></label>
  <button type="submit">Log in</button>
</form>`
      )
    );
  });

  router.post('/login', express.urlencoded({ extended: false }), async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const { sessionToken } = await service.login(pool, email, password, { ip: req.ip, userAgent: req.get('user-agent') });
      setSessionCookie(res, sessionToken);
      res.redirect('/portal/dashboard');
    } catch {
      res.redirect('/portal/login?error=1');
    }
  });

  router.get('/logout', async (req, res) => {
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
              `<td>${escapeHtml(b.purpose)}</td><td><span class="status">${escapeHtml(b.status)}</span></td>` +
              `<td>${escapeHtml(b.response_due_at || '—')}</td></tr>`
          )
          .join('')
      : '<tr><td colspan="4">No batches yet.</td></tr>';
    res.send(
      layout(
        'Your Batches',
        `<table><thead><tr><th>Batch</th><th>Purpose</th><th>Status</th><th>Response Due</th></tr></thead><tbody>${rows}</tbody></table>`
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
          `<p>Purpose: ${escapeHtml(batch.purpose)} · Status: <span class="status">${escapeHtml(batch.status)}</span> · Due: ${escapeHtml(batch.response_due_at || '—')}</p>` +
            `<p><a href="/portal/batches/${escapeHtml(batch.batch_code)}/excel">Excel export/import</a></p>` +
            `<table><thead><tr><th>Product</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
        )
      );
    } catch {
      res.status(404).send(layout('Not Found', '<p>Batch not found.</p>'));
    }
  });

  router.get('/batches/:batch_code/items/:item_id/offer', async (req, res) => {
    try {
      await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
      const error = req.query.error ? `<p class="error">${escapeHtml(req.query.error)}</p>` : '';
      res.send(
        layout(
          'Submit Offer',
          `${error}
<form method="post" action="/portal/batches/${escapeHtml(req.params.batch_code)}/items/${escapeHtml(req.params.item_id)}/offer">
  <label>FOB Price (decimal, e.g. 12.50)<input type="text" name="fob_price" required pattern="-?\\d+(\\.\\d+)?"></label>
  <label>Currency (3-letter)<input type="text" name="currency" maxlength="3" required></label>
  <label>MOQ<input type="number" name="moq"></label>
  <label>Lead time (days)<input type="number" name="lead_time_days"></label>
  <label>Field name<input type="text" name="field_name" required></label>
  <label>Completeness
    <select name="completeness_status">
      <option value="ANSWERED">Answered</option>
      <option value="CANNOT_MEET">Cannot meet</option>
      <option value="NOT_APPLICABLE">Not applicable</option>
    </select>
  </label>
  <label>Offered value<input type="text" name="offered_value"></label>
  <label>Note<textarea name="manufacturer_note"></textarea></label>
  <button type="submit">Submit Offer</button>
</form>`
        )
      );
    } catch {
      res.status(404).send(layout('Not Found', '<p>Batch or item not found.</p>'));
    }
  });

  router.post('/batches/:batch_code/items/:item_id/offer', express.urlencoded({ extended: false }), async (req, res) => {
    try {
      await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
      const body = req.body || {};
      await service.createOfferRevision(
        pool,
        req.params.batch_code,
        req.params.item_id,
        {
          submit: true,
          fob_price: body.fob_price,
          currency: body.currency,
          moq: body.moq ? Number(body.moq) : undefined,
          lead_time_days: body.lead_time_days ? Number(body.lead_time_days) : undefined,
          technical_fields: [
            {
              field_name: body.field_name,
              offered_value: body.offered_value,
              completeness_status: body.completeness_status,
              manufacturer_note: body.manufacturer_note || null,
            },
          ],
        },
        { declared_actor: req.factorySession.factory_user_id, identity_mechanism: 'FACTORY_SESSION', factory_user_id: req.factorySession.factory_user_id }
      );
      res.redirect(`/portal/batches/${encodeURIComponent(req.params.batch_code)}`);
    } catch (err) {
      res.redirect(
        `/portal/batches/${encodeURIComponent(req.params.batch_code)}/items/${encodeURIComponent(req.params.item_id)}/offer?error=${encodeURIComponent(err.message || 'Could not submit offer')}`
      );
    }
  });

  router.get('/batches/:batch_code/excel', async (req, res) => {
    try {
      const batch = await service.getBatchForManufacturer(pool, req.params.batch_code, req.factorySession.manufacturer_id);
      res.send(
        layout(
          'Excel Export / Import',
          `<p><a href="/api/ebp/factory/batches/${escapeHtml(batch.batch_code)}/excel/export">Download current workbook</a></p>
<p>To submit via Excel: download, fill in the editable columns, then use the API endpoints
<code>POST /api/ebp/factory/batches/${escapeHtml(batch.batch_code)}/excel/stage</code> and
<code>/excel/confirm</code> with your session token (form-based upload is not yet wired into this minimal portal UI).</p>`
        )
      );
    } catch {
      res.status(404).send(layout('Not Found', '<p>Batch not found.</p>'));
    }
  });

  return router;
}

module.exports = createPortalRouter;
