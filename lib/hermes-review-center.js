'use strict';

const express = require('express');
const { verifyReviewPayload, signReviewPayload } = require('./hermes-review-token');
const { emailShell, BRAND_YELLOW } = require('./hermes-email-layout');
const store = require('./hermes-review-store');

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const LABELS = {
  approve: 'ACEPTAR',
  reject: 'ELIMINAR',
  research: 'REVISAR',
};
// Headlines (annex / highlights) are unread: they can only be sent to research or discarded.
const HEADLINE_LABELS = { research: 'INVESTIGAR', reject: 'DESCARTAR' };
const isHeadline = (code) => String(code).startsWith('HERMES_HEADLINE_');
const labelFor = (code, decision) => (isHeadline(code) ? HEADLINE_LABELS[decision] : LABELS[decision]) || decision;

// Same branded dashboard shell as the weekly email, so email and review pages read as one dashboard.
const PAGE_CSS = `body{margin:0;background:#eeeeee}h1{font-size:22px;margin:18px 0 8px}h2{font-size:17px}.muted{color:#666}.decision{font-weight:800;background:${BRAND_YELLOW};padding:2px 8px}
.btn{display:inline-block;border:0;background:#111;color:${BRAND_YELLOW};font-weight:800;padding:13px 18px;cursor:pointer;font-size:13px}.reason{width:100%;box-sizing:border-box;border:1px solid #ccc;padding:12px;min-height:100px;margin:8px 0 18px;font:inherit}
.notice{font-size:12px;color:#777;line-height:1.5}.error{border-left:4px solid #b42318;background:#fdecea;padding:12px;color:#7a1a12}
.row{display:flex;gap:12px;align-items:center;justify-content:space-between;border-bottom:1px solid #eee;padding:10px 0}.row a{color:#111;font-weight:700}.meta{font-size:12px;color:#777}.acts{display:flex;gap:6px;flex-shrink:0}.acts form{margin:0}
.mini{display:inline-block;border:0;background:${BRAND_YELLOW};color:#000;font-weight:800;font-size:11px;padding:8px 12px;cursor:pointer;list-style:none}.mini.dark{background:#222;color:#fff}.mini.light{background:#fff;border:1px solid #bbb}.why summary::-webkit-details-marker{display:none}.why[open]{flex-basis:100%}.acts{flex-wrap:wrap;align-items:flex-start}.done{display:inline-block;font-size:11px;font-weight:800;color:#1a7f37;padding:4px 0}@media(max-width:640px){.row{flex-direction:column;align-items:flex-start}}`;

function page(title, body, { kpis = [], notice = '', period = '' } = {}) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><style>${PAGE_CSS}</style></head><body>${emailShell({ title, notice, period, kpis, body })}</body></html>`;
}

function parsePayload(source) {
  return {
    candidate: String(source.candidate || '').trim(),
    decision: String(source.decision || '').trim().toLowerCase(),
    run_id: String(source.run_id || '').trim(),
    exp: Number(source.exp || 0),
  };
}

function reviewSecret() {
  return process.env.HERMES_REVIEW_TOKEN_SECRET || process.env.ADMIN_KEY || '';
}

function requiresReason(decision, code = '') {
  return !isHeadline(code) && (decision === 'reject' || decision === 'research');
}

// Only this run's dashboard may be the return target after a one-click decision.
const safeBack = (v) => (/^\/hermes\/weekly\?[\w=&%.-]+(#HERMES_[A-Z0-9_]+)?$/.test(String(v || '')) ? String(v) : '');

function installHermesReviewCenter(app) {
  const path = '/hermes/review';
  app.use(path, express.urlencoded({ extended: false, limit: '32kb' }));

  app.get(path, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const payload = parsePayload(req.query);
    if (payload.decision === 'view' || !verifyReviewPayload(payload, req.query.sig, reviewSecret())) {
      return res.status(403).send(page('Enlace inválido', '<div class="card"><h1>Enlace inválido o vencido</h1><p class="muted">Solicita un nuevo correo de revisión de HERMES.</p></div>'));
    }

    const headline = isHeadline(payload.candidate);
    const label = labelFor(payload.candidate, payload.decision);
    const reasonPrompt = headline
      ? (payload.decision === 'research' ? 'HERMES leerá la nota completa y la presentará como tarjeta con ACEPTAR / REVISAR / ELIMINAR en el próximo correo.' : 'Este titular no volverá a aparecer.')
      : payload.decision === 'research'
        ? 'Indica exactamente qué debe revisar o investigar HERMES antes de volver a presentar este hallazgo.'
        : payload.decision === 'reject'
          ? 'Indica por qué debe eliminarse este candidato de la cola de revisión. Esto no borra datos del catálogo.'
          : 'Comentario opcional para el registro de auditoría.';
    const required = requiresReason(payload.decision, payload.candidate) ? ' required' : '';
    const placeholder = headline ? 'Comentario opcional' : payload.decision === 'research' ? 'Instrucción para HERMES' : payload.decision === 'reject' ? 'Motivo para eliminar el candidato' : 'Comentario';
    let title = '';
    if (headline) { try { const c = await store.getCandidate(payload.candidate); title = c ? `${c.title_es || c.headline} — ${c.source} · ${c.date}` : ''; } catch {} }

    return res.status(200).send(page('Confirmar decisión HERMES', `<div class="card" style="padding-top:18px">
      <p><strong>${headline ? 'Titular' : 'Candidato'}:</strong> ${esc(title || payload.candidate)}</p>
      <p><strong>Decisión:</strong> <span class="decision">${esc(label)}</span></p>
      <p class="muted">${esc(reasonPrompt)}</p>
      <form method="post" action="${path}">
        <input type="hidden" name="candidate" value="${esc(payload.candidate)}">
        <input type="hidden" name="decision" value="${esc(payload.decision)}">
        <input type="hidden" name="run_id" value="${esc(payload.run_id)}">
        <input type="hidden" name="exp" value="${esc(payload.exp)}">
        <input type="hidden" name="sig" value="${esc(req.query.sig)}">
        <textarea class="reason" name="reason" maxlength="1000" placeholder="${esc(placeholder)}"${required}></textarea>
        <button class="btn" type="submit">CONFIRMAR ${esc(label)}</button>
      </form>
      <p class="notice">El primer clic desde Outlook no ejecuta ningún cambio. La decisión se registra únicamente después de esta confirmación.</p>
    </div>`));
  });

  app.post(path, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const payload = parsePayload(req.body);
    if (payload.decision === 'view' || payload.candidate.startsWith('HERMES_WEEK_') || !verifyReviewPayload(payload, req.body.sig, reviewSecret())) {
      return res.status(403).send(page('Enlace inválido', '<div class="card"><h1>Solicitud inválida o vencida</h1></div>'));
    }

    const reason = String(req.body.reason || '').trim();
    if (requiresReason(payload.decision, payload.candidate) && !reason) {
      return res.status(400).send(page('Falta información', `<div class="card"><h1>No se registró la decisión</h1><p class="error">${payload.decision === 'research' ? 'Debes indicar qué debe revisar HERMES.' : 'Debes indicar por qué se elimina este candidato.'}</p></div>`));
    }

    try {
      await store.recordDecision({
        candidateCode: payload.candidate,
        decision: payload.decision,
        reason: reason || null,
        actor: 'Victor Abreu',
      });
      const label = labelFor(payload.candidate, payload.decision);
      console.log('[hermes-review] queued', JSON.stringify({ candidate: payload.candidate, decision: payload.decision, cycle_id: payload.run_id }));
      const back = safeBack(req.body.back);
      if (back) return res.redirect(303, back);
      return res.status(202).send(page('Decisión registrada', `<div class="card"><h1>Decisión registrada</h1><p><strong>${esc(payload.candidate)}</strong></p><p class="decision">${esc(label)}</p><p class="muted">La decisión quedó guardada en la cola durable de HERMES. La Lenovo la aplicará y auditará en su siguiente ciclo de procesamiento.</p></div>`));
    } catch (error) {
      console.error('[hermes-review]', error.message);
      return res.status(502).send(page('Error de registro', '<div class="card"><h1>No se pudo registrar la decisión</h1><p class="muted">No se aplicó ningún cambio. Intenta nuevamente desde el correo.</p></div>'));
    }
  });

  // Signed weekly dashboard: the whole week (news, highlights, full annex, catalogue candidates) on one page.
  // HERMES stages the content when the email goes out; here each placeholder becomes live buttons or a
  // "decided" badge. Opening this signed page is the confirmation context, so its buttons post directly.
  app.get('/hermes/weekly', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const payload = parsePayload(req.query);
    const secret = reviewSecret();
    if (payload.decision !== 'view' || payload.candidate !== `HERMES_WEEK_${payload.run_id}` || !verifyReviewPayload(payload, req.query.sig, secret)) {
      return res.status(403).send(page('Enlace inválido', '<div class="card"><h1>Enlace inválido o vencido</h1><p class="muted">Abre el dashboard desde el último correo de HERMES.</p></div>'));
    }
    let week; let statuses;
    try { [week, statuses] = await Promise.all([store.getCandidate(payload.candidate), store.runStatuses(payload.run_id)]); } catch (error) {
      console.error('[hermes-weekly]', error.message);
      return res.status(502).send(page('Dashboard no disponible', '<div class="card"><h1>No se pudo cargar el dashboard</h1><p class="muted">Intenta nuevamente en unos minutos.</p></div>'));
    }
    if (!week?.body_html) return res.status(404).send(page('Dashboard no encontrado', '<div class="card"><h1>Esta semana no tiene dashboard</h1></div>'));
    const state = new Map(statuses.map((r) => [r.candidate_code, r]));
    const self = `/hermes/weekly?${new URLSearchParams({ candidate: payload.candidate, decision: 'view', run_id: payload.run_id, exp: String(payload.exp), sig: String(req.query.sig) })}`;
    const hidden = (code, decision) => `<input type="hidden" name="candidate" value="${esc(code)}"><input type="hidden" name="decision" value="${decision}"><input type="hidden" name="run_id" value="${esc(payload.run_id)}"><input type="hidden" name="exp" value="${esc(payload.exp)}"><input type="hidden" name="sig" value="${signReviewPayload({ candidate: code, decision, run_id: payload.run_id, exp: payload.exp }, secret)}"><input type="hidden" name="back" value="${esc(`${self}#${code}`)}">`;
    const oneClick = (code, decision, cls = '') => `<form method="post" action="${path}">${hidden(code, decision)}<button class="mini${cls}" type="submit">${esc(labelFor(code, decision))}</button></form>`;
    const withReason = (code, decision, cls = '') => `<details class="why"><summary class="mini${cls}">${esc(labelFor(code, decision))}</summary><form method="post" action="${path}">${hidden(code, decision)}<textarea class="reason" name="reason" maxlength="1000" required placeholder="${decision === 'research' ? 'Qué debe revisar HERMES' : 'Motivo para eliminar'}"></textarea><button class="btn" type="submit">CONFIRMAR ${esc(labelFor(code, decision))}</button></form></details>`;
    const DONE = { approve: 'ACEPTADO', research: 'EN REVISIÓN', reject: 'ELIMINADO' };
    const HEADLINE_DONE = { research: 'INVESTIGAR registrado', reject: 'DESCARTADO' };
    const body = String(week.body_html).replace(/<!--HERMES_ACT:(card|headline):(HERMES_[A-Z0-9_]+)-->/g, (_, kind, code) => {
      const row = state.get(code);
      if (!row) return '';
      if (row.review_status !== 'READY') return `<span id="${esc(code)}" class="done">✓ ${esc((kind === 'headline' ? HEADLINE_DONE : DONE)[row.decision] || 'Decidido')}</span>`;
      return kind === 'headline'
        ? `<span id="${esc(code)}" class="acts">${oneClick(code, 'research')}${oneClick(code, 'reject', ' dark')}</span>`
        : `<div id="${esc(code)}" class="acts" style="margin-top:12px">${oneClick(code, 'approve')}${withReason(code, 'research', ' light')}${withReason(code, 'reject', ' dark')}</div>`;
    });
    return res.status(200).send(page(week.title || 'Dashboard semanal HERMES', body, { kpis: week.kpis || [], period: week.period || '', notice: 'ACEPTAR e INVESTIGAR se registran con un clic; REVISAR y ELIMINAR piden el motivo. Nada se aplica al catálogo ni al Knowledge Center sin pasar por tu ACEPTAR.' }));
  });
}

module.exports = { installHermesReviewCenter };
