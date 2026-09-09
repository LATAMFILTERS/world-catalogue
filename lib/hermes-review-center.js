'use strict';

const express = require('express');
const { verifyReviewPayload } = require('./hermes-review-token');
const { recordDecision } = require('./hermes-review-store');

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

function page(title, body) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><style>
  :root{color-scheme:dark}body{margin:0;background:#080808;color:#fff;font-family:Arial,sans-serif}.wrap{max-width:720px;margin:0 auto;padding:48px 20px}.brand{font-weight:900;letter-spacing:.08em;color:#fff12d}.card{margin-top:24px;border:1px solid #333;background:#111;padding:24px;border-radius:10px}.muted{color:#aaa}.decision{font-weight:800;color:#fff12d}.btn{display:inline-block;border:0;border-radius:6px;background:#fff12d;color:#000;font-weight:800;padding:13px 18px;cursor:pointer}.reason{width:100%;box-sizing:border-box;background:#090909;color:#fff;border:1px solid #444;border-radius:6px;padding:12px;min-height:100px;margin:8px 0 18px}.notice{font-size:13px;color:#aaa;line-height:1.5}.error{border:1px solid #7b2b2b;background:#2a1010;padding:12px;border-radius:6px;color:#ffd6d6}</style></head><body><main class="wrap"><div class="brand">ELIMFILTERS · HERMES</div>${body}</main></body></html>`;
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

function requiresReason(decision) {
  return decision === 'reject' || decision === 'research';
}

function installHermesReviewCenter(app) {
  const path = '/hermes/review';
  app.use(path, express.urlencoded({ extended: false, limit: '32kb' }));

  app.get(path, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const payload = parsePayload(req.query);
    if (!verifyReviewPayload(payload, req.query.sig, reviewSecret())) {
      return res.status(403).send(page('Enlace inválido', '<div class="card"><h1>Enlace inválido o vencido</h1><p class="muted">Solicita un nuevo correo de revisión de HERMES.</p></div>'));
    }

    const label = LABELS[payload.decision] || payload.decision;
    const reasonPrompt = payload.decision === 'research'
      ? 'Indica exactamente qué debe revisar o investigar HERMES antes de volver a presentar este hallazgo.'
      : payload.decision === 'reject'
        ? 'Indica por qué debe eliminarse este candidato de la cola de revisión. Esto no borra datos del catálogo.'
        : 'Comentario opcional para el registro de auditoría.';
    const required = requiresReason(payload.decision) ? ' required' : '';
    const placeholder = payload.decision === 'research' ? 'Instrucción para HERMES' : payload.decision === 'reject' ? 'Motivo para eliminar el candidato' : 'Comentario';

    return res.status(200).send(page('Confirmar decisión HERMES', `<div class="card">
      <h1>Confirmar decisión</h1>
      <p><strong>Candidato:</strong> ${esc(payload.candidate)}</p>
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
    if (!verifyReviewPayload(payload, req.body.sig, reviewSecret())) {
      return res.status(403).send(page('Enlace inválido', '<div class="card"><h1>Solicitud inválida o vencida</h1></div>'));
    }

    const reason = String(req.body.reason || '').trim();
    if (requiresReason(payload.decision) && !reason) {
      return res.status(400).send(page('Falta información', `<div class="card"><h1>No se registró la decisión</h1><p class="error">${payload.decision === 'research' ? 'Debes indicar qué debe revisar HERMES.' : 'Debes indicar por qué se elimina este candidato.'}</p></div>`));
    }

    try {
      await recordDecision({
        candidateCode: payload.candidate,
        decision: payload.decision,
        reason: reason || null,
        actor: 'Victor Abreu',
      });
      const label = LABELS[payload.decision] || payload.decision;
      console.log('[hermes-review] queued', JSON.stringify({ candidate: payload.candidate, decision: payload.decision, cycle_id: payload.run_id }));
      return res.status(202).send(page('Decisión registrada', `<div class="card"><h1>Decisión registrada</h1><p><strong>${esc(payload.candidate)}</strong></p><p class="decision">${esc(label)}</p><p class="muted">La decisión quedó guardada en la cola durable de HERMES. La Lenovo la aplicará y auditará en su siguiente ciclo de procesamiento.</p></div>`));
    } catch (error) {
      console.error('[hermes-review]', error.message);
      return res.status(502).send(page('Error de registro', '<div class="card"><h1>No se pudo registrar la decisión</h1><p class="muted">No se aplicó ningún cambio. Intenta nuevamente desde el correo.</p></div>'));
    }
  });
}

module.exports = { installHermesReviewCenter };
