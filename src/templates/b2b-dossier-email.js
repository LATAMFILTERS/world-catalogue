/**
 * b2b-dossier-email.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates high-tech, executive HTML email for B2B distributor welcome dossier.
 */

'use strict';

export function getB2BDossierHtml({ companyName, contactName, country }) {
  const safeCompany = companyName || 'Estimado Partner';
  const safeContact = contactName || 'Director Comercial';
  const safeCountry = country || 'Latinoamérica';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dossier Oficial de Distribución — ELIMFILTERS®</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#131b2e;border:1px solid #1e293b;border-radius:12px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5)">
          <!-- Header -->
          <tr>
            <td style="padding:30px 40px;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border-bottom:1px solid #334155">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:1px;color:#ffffff">ELIMFILTERS<span style="color:#38bdf8">®</span></h1>
                    <p style="margin:4px 0 0 0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Asset Protection Technology</p>
                  </td>
                  <td align="right">
                    <span style="background-color:rgba(56,189,248,0.1);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:1px">Dossier B2B Oficial</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:40px">
              <h2 style="margin:0 0 16px 0;font-size:20px;color:#f8fafc;font-weight:700">Bienvenido al Programa de Alianza Comercial, ${safeContact}</h2>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#cbd5e1">
                Agradecemos su interés en representar a <strong>ELIMFILTERS®</strong> en <strong>${safeCountry}</strong> para <strong>${safeCompany}</strong>. Nuestra plataforma ha procesado su precalificación comercial en tiempo real.
              </p>

              <!-- Feature Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr>
                  <td style="background-color:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;margin-bottom:12px">
                    <h3 style="margin:0 0 6px 0;font-size:14px;color:#38bdf8">🔒 Exclusividad Territorial Regulada</h3>
                    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5">Garantía contractual de territorio por región con márgenes protegidos del 45% al 65%.</p>
                  </td>
                </tr>
                <tr><td height="12"></td></tr>
                <tr>
                  <td style="background-color:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px">
                    <h3 style="margin:0 0 6px 0;font-size:14px;color:#38bdf8">📦 Kits DURATECH™ Make-to-Order (FOB)</h3>
                    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5">Kits de mantenimiento preventivo (250h / 500h / 1000h) fabricados a la medida sin almacenamiento inmovilizado.</p>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
                <tr>
                  <td align="center">
                    <a href="https://elimfilters.com/b2b-distributors" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:700;display:inline-block;box-shadow:0 4px 12px rgba(2,132,199,0.3)">
                      Acceder al Portal del Distribuidor &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#0f172a;border-top:1px solid #1e293b;text-align:center">
              <p style="margin:0 0 8px 0;font-size:12px;color:#64748b">
                ELIMFILTERS® — Corporate Commercial Office | <a href="https://elimfilters.com" style="color:#38bdf8;text-decoration:none">elimfilters.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#475569">
                Este es un mensaje automatizado generado por el motor de precalificación comercial en menos de 5 segundos.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
