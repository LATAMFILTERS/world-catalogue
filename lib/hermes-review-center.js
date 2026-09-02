'use strict';

const express = require('express');
const { verifyReviewPayload } = require('./hermes-review-token');

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const LABELS = {
  approve: 'APROBAR',
  reject: 'RECHAZAR',
  research: 'INVESTIGAR MÁS',
};

function page(title, body) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><style>
  :root{color-scheme:dark}body{margin:0;background:#080808;color:#fff;font-family:Arial,sans-serif}.wrap{max-width:720px;margin:0 auto;padding:48px 20px}.brand{font-weight:900;letter-spacing:.08em;color:#fff12d}.card{margin-top:24px;border:1px solid #333;background:#111;padding:24px;border-radius:10px}.muted{color:#aaa}.decision{font-weight:800;color:#fff12d}.btn{display:inline-block;border:0;border-radius:6px;background:#fff12d;color:#000;font-weight:800;padding:13px 18px;cursor:pointer}.cancel{margin-left:12px;color:#bbb}.reason{width:100%;box-sizing:border-box;background:#090909;color:#fff;border:1px solid #444;border-radius:6px;padding:12px;min-height:100px;margin:8px 0 18px}.notice{font-size:13px;color:#aaa;line-height:1.5}</style></head><body><main class="wrap"><div class="brand">ELIMFILTERS · HERMES</div>${body}</main></body></html>`;
}

function parsePayload(source) {
  return {
    candidate: String(source.candidate || '').trim(),
    decision: String(source.decision || '').trim().toLowerCase(),
    run_id: String(source.run_id || '').trim(),
    exp: Number(source.exp || 0),
  };
}

async function dispatchDecision({ token, repository, ref, workflow, payload, reason }) {
  const url = `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ELIMFILTERS-HERMES-Review-Center',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref,
      inputs: {
        run_id: payload.run_id,
        candidate: payload.candidate,
        decision: payload.decision,
        reason: String(reason || '').slice(0, 1000),
      },
    }),
  });
  if (response.status !== 204) {
    const text = await response.text();
    throw new Error(`GitHub workflow dispatch failed (${response.status}): ${text.slice(0, 300)}`);
  }
}

function installHermesReviewCenter(app) {
  const path = '/hermes/review';
  app.use(path, express.urlencoded({ extended: false, limit: '32kb' }));

  app.get(path, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const secret = process.env.HERMES_REVIEW_TOKEN_SECRET || '';
    const payload = parsePayload(req.query);
    if (!verifyReviewPayload(payload, req.query.sig, secret)) {
      return res.status(403).send(page('Enlace inválido', '<div class="card"><h1>Enlace inválido o vencido</h1><p class="muted">Solicita un nuevo correo de revisión de HERMES.</p></div>'));
    }

    const label = LABELS[payload.decision] || payload.decision;
    const reasonPrompt = payload.decision === 'research'
      ? 'Indica qué debe investigar HERMES antes de volver a presentar este hallazgo.'
      : 'Comentario opcional para el registro de auditoría.';

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
        <textarea class="reason" name="reason" maxlength="1000" placeholder="Comentario"></textarea>
        <button class="btn" type="submit">CONFIRMAR ${esc(label)}</button>
      </form>
      <p class="notice">El primer clic desde el email no ejecuta ningún cambio. La decisión se envía a HERMES únicamente después de esta confirmación.</p>
    </div>`));
  });

  app.post(path, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const secret = process.env.HERMES_REVIEW_TOKEN_SECRET || '';
    const payload = parsePayload(req.body);
    if (!verifyReviewPayload(payload, req.body.sig, secret)) {
      return res.status(403).send(page('Enlace inválido', '<div class="card"><h1>Solicitud inválida o vencida</h1></div>'));
    }

    const githubToken = process.env.HERMES_GITHUB_TOKEN || '';
    const repository = process.env.HERMES_GITHUB_REPOSITORY || 'LATAMFILTERS/world-catalogue';
    const ref = process.env.HERMES_GITHUB_REF || 'main';
    const workflow = process.env.HERMES_REVIEW_WORKFLOW || 'hermes-review-decision.yml';
    if (!githubToken) {
      console.error('[hermes-review] HERMES_GITHUB_TOKEN is not configured');
      return res.status(503).send(page('Servicio no configurado', '<div class="card"><h1>La decisión no fue enviada</h1><p class="muted">El Review Center todavía no tiene configurada su credencial de ejecución. No se registró ningún cambio.</p></div>'));
    }

    try {
      await dispatchDecision({ token: githubToken, repository, ref, workflow, payload, reason: req.body.reason });
      const label = LABELS[payload.decision] || payload.decision;
      console.log('[hermes-review] dispatched', JSON.stringify({ candidate: payload.candidate, decision: payload.decision, run_id: payload.run_id }));
      return res.status(202).send(page('Decisión enviada', `<div class="card"><h1>Decisión enviada a HERMES</h1><p><strong>${esc(payload.candidate)}</strong></p><p class="decision">${esc(label)}</p><p class="muted">La decisión quedó en cola para ejecución y auditoría en GitHub Actions.</p></div>`));
    } catch (error) {
      console.error('[hermes-review]', error.message);
      return res.status(502).send(page('Error de envío', '<div class="card"><h1>No se pudo registrar la decisión</h1><p class="muted">No se aplicó ningún cambio. Intenta nuevamente desde el correo.</p></div>'));
    }
  });
}

module.exports = { installHermesReviewCenter, dispatchDecision };
