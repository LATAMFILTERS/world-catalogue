import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const text = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.CRM_API_BASE_URL;
    const token = process.env.CRM_INGEST_TOKEN;
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

    if (!baseUrl || !token || !turnstileSecret) {
      return NextResponse.json(
        { error: 'service_unavailable' },
        { status: 503 }
      );
    }

    const raw = await request.text();
    if (raw.length > 16000) {
      return NextResponse.json(
        { error: 'payload_too_large' },
        { status: 413 }
      );
    }

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const companyName = text(data.companyName, 200);
    const contactName = text(data.contactName, 200);
    const email = text(data.email, 254);
    const country = text(data.country, 120);
    const turnstileToken = text(data.turnstileToken, 2048);

    if (!companyName || !contactName || !country ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !turnstileToken) {
      return NextResponse.json(
        { error: 'invalid_fields' },
        { status: 400 }
      );
    }

    const captcha = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken
        }),
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!captcha.ok) {
      return NextResponse.json({ error: 'captcha_unavailable' }, { status: 503 });
    }

    const captchaText = await captcha.text();
    let verification: { success?: boolean; 'error-codes'?: string[] };

    try {
      verification = JSON.parse(captchaText);
    } catch {
      console.error('[partner-application] Invalid Turnstile response', {
        status: captcha.status,
        empty: !captchaText.trim()
      });
      return NextResponse.json(
        { error: 'captcha_invalid_response' },
        { status: 503 }
      );
    }
    if (!verification.success) {
      return NextResponse.json({ error: 'captcha_failed' }, { status: 400 });
    }

    const application = {
      companyName,
      legalName: text(data.legalName, 200),
      contactName,
      email,
      phone: text(data.phone, 30),
      country,
      state: text(data.state, 120),
      employees: text(data.employees, 60),
      yearsInBusiness: text(data.yearsInBusiness, 60),
      currentProducts: text(data.currentProducts, 2000),
      serviceArea: text(data.serviceArea, 1000),
      message: text(data.message, 5000)
    };

    const payload = {
      leadType: 'partner_application',
      sourceChannel: 'website',
      sourceDomain: 'elimfilters.com',
      landingPage: '/partners/',
      conversionPage: '/distributor-application/?program=partner',
      conversionAction: 'partner_application_submit',
      applicationContext: {
        program: 'partner',
        reviewStatus: 'PENDING_INTERNAL_REVIEW',
        outreachAuthorized: false
      },
      contact: {
        name: contactName,
        company: companyName,
        email,
        phone: application.phone
      },
      rawPayload: application
    };

    const endpoint = new URL('/v1/web/leads', baseUrl).toString();

    const idempotencyKey = text(data.idempotencyKey, 128);

    if (!/^[a-zA-Z0-9:_-]{16,128}$/.test(idempotencyKey)) {
      return NextResponse.json(
        { error: 'invalid_idempotency_key' },
        { status: 400 }
      );
    }

    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
      cache: 'no-store'
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: 'crm_unavailable' },
        { status: 502 }
      );
    }

    const responseText = await result.text();

    if (!responseText.trim()) {
      console.error('[partner-application] CRM returned an empty response', {
        status: result.status,
        idempotencyKey
      });
      return NextResponse.json(
        { error: 'crm_empty_response' },
        { status: 502 }
      );
    }

    let saved: {
      accepted?: boolean;
      leadId?: string;
      status?: string;
    };

    try {
      saved = JSON.parse(responseText);
    } catch {
      console.error('[partner-application] CRM returned invalid JSON', {
        status: result.status,
        idempotencyKey
      });
      return NextResponse.json(
        { error: 'crm_invalid_response' },
        { status: 502 }
      );
    }
    if (!saved.accepted || !saved.leadId ||
        saved.status !== 'NEW') {
      return NextResponse.json(
        { error: 'crm_unconfirmed' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      applicationId: saved.leadId,
      reviewStatus: 'PENDING_INTERNAL_REVIEW'
    });
  } catch (error) {
    console.error(
      '[partner-application] Request failed:',
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      { error: 'application_failed' },
      { status: 500 }
    );
  }
}