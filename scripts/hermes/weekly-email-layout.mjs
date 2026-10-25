// HERMES — branded dashboard shell for the weekly email.
//
// Email-client safe: tables + inline styles only (Outlook desktop ignores flex,
// grid and most CSS), hosted PNG logo (Gmail strips data: images; Outlook
// cannot show WebP). Returns a fragment so callers can still prepend notices.
export const LOGO_URL = 'https://elimfilters.com/assets/elimfilters-logo-transparent.png';
export const BRAND_YELLOW = '#FFF12D';

export const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function sectionHeader(title, subtitle = '') {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 12px"><tr><td style="border-bottom:2px solid #111;padding:0 0 6px">
    <span style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#111">${esc(title)}</span>
  </td></tr>${subtitle ? `<tr><td style="padding:6px 0 0;font-size:12px;color:#666;line-height:1.5">${esc(subtitle)}</td></tr>` : ''}</table>`;
}

/** KPI tiles from the weekly report data; zeros are shown, they are information too. */
export function weeklyKpis(data = {}) {
  const d = data.industry_digest || {};
  const items = Array.isArray(d.items) ? d.items : [];
  const verified = items.filter((i) => i.status === 'VERIFICADO').length;
  const annex = (Array.isArray(d.link_annex) ? d.link_annex : []).reduce((n, g) => n + (g.items?.length || 0), 0);
  return [
    { value: items.length, label: 'Noticias de la semana', note: `${verified} verificadas` },
    { value: Array.isArray(d.highlights) ? d.highlights.length : 0, label: 'Destacados', note: 'solo titular' },
    { value: annex, label: 'Titulares en anexo', note: 'sin revisar' },
    { value: data.totals?.review_ready ?? 0, label: 'Para tu decisión', note: 'catálogo / KC' }
  ];
}

export function emailShell({ title, period = '', kpis = [], notice = '', body = '' }) {
  const tiles = kpis.map((k) => `<td width="${Math.floor(100 / kpis.length)}%" valign="top" style="padding:4px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;border-top:3px solid ${BRAND_YELLOW}"><tr><td style="padding:12px 12px 10px">
        <div style="font-size:28px;line-height:1;font-weight:800;color:#111">${esc(k.value)}</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#333;padding-top:6px">${esc(k.label)}</div>
        ${k.note ? `<div style="font-size:11px;color:#777;padding-top:2px">${esc(k.note)}</div>` : ''}
      </td></tr></table></td>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eeeeee"><tr><td align="center" style="padding:12px 6px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:1100px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111">
    <tr><td style="padding:18px 24px;border-bottom:4px solid ${BRAND_YELLOW}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td valign="middle"><img src="${LOGO_URL}" width="170" alt="ELIMFILTERS" style="display:block;width:170px;max-width:170px;height:auto;border:0"></td>
        <td valign="middle" align="right" style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#777">HERMES · Inteligencia semanal${period ? `<br><span style="font-size:13px;letter-spacing:0;text-transform:none;color:#111;font-weight:700">${esc(period)}</span>` : ''}</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#111111;padding:18px 24px">
      <div style="font-size:20px;font-weight:800;color:#ffffff">${esc(title)}</div>
      ${notice ? `<div style="font-size:12px;line-height:1.5;color:#bbbbbb;padding-top:6px">${esc(notice)}</div>` : ''}
    </td></tr>
    ${tiles ? `<tr><td style="padding:16px 20px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${tiles}</tr></table></td></tr>` : ''}
    <tr><td style="padding:0 24px 24px;font-size:14px;line-height:1.55">${body}</td></tr>
    <tr><td style="background:#111111;padding:14px 24px;font-size:11px;line-height:1.6;color:#999999">
      <strong style="color:${BRAND_YELLOW}">Autoridad de decisión:</strong> solo Victor Abreu aprueba, rechaza o pide más investigación. HERMES no modifica catálogo, Knowledge Center, Obsidian ni PostgreSQL sin esa aprobación.<br>ELIMFILTERS · Total Assets Protection
    </td></tr>
  </table>
</td></tr></table>`;
}
