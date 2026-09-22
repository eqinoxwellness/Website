import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { services } from '../../data/services';

/**
 * POST /api/lead — the only server route. Runs as a Vercel serverless function.
 * 1. Validates and spam-checks the request.
 * 2. Sends it to a Google Apps Script web app, which appends a row to the Google Sheet and emails the clinic.
 * 3. If the visitor allowed marketing cookies, sends a Meta Conversions API "Lead" with a hashed phone only.
 */
export const prerender = false;

const env = (k: string) => (process.env[k] || '').trim();
const sha256 = (v: string) => createHash('sha256').update(v.trim().toLowerCase()).digest('hex');
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Best-effort per-instance rate limit: 5 requests per 10 minutes per IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || '';
  if (ip && limited(ip)) return json({ ok: false, error: 'rate_limited' }, 429);

  // Spam: honeypot filled, or submitted faster than a person can type.
  const tooFast = typeof body.startedAt === 'number' && Date.now() - body.startedAt < 2500;
  if (str(body.website) || tooFast) return json({ ok: true, leadId: 'EQX-SKIP' });

  const name = str(body.name, 80).trim();
  let phone = str(body.phone, 20).replace(/\D/g, '');
  if (phone.length === 12 && phone.startsWith('91')) phone = phone.slice(2);
  const svc = services.find((s) => s.slug === body.service);
  const serviceName = svc ? svc.name : body.service === 'not-sure' ? 'Not sure yet' : '';
  if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone) || !serviceName || body.consent !== true) {
    return json({ ok: false, error: 'invalid' }, 422);
  }

  const j = body.journey && typeof body.journey === 'object' ? body.journey : {};
  const first = j.first || {};
  const last = j.last || {};
  const userAgent = request.headers.get('user-agent') || '';
  const eventId = str(body.eventId, 80) || crypto.randomUUID();
  const origin = new URL(request.url).origin;

  const lead = {
    name, phone, serviceName, service: str(body.service, 40), preferredTime: str(body.preferredTime, 20),
    page: str(body.page, 120), eventId,
    last: {
      source: str(last.source, 80), medium: str(last.medium, 40), campaign: str(last.campaign, 120),
      term: str(last.term, 120), content: str(last.content, 120), gclid: str(last.gclid, 200),
      fbclid: str(last.fbclid, 200), msclkid: str(last.msclkid, 200), referrer: str(last.referrer, 120), landing: str(last.landing, 120),
    },
    first: { source: str(first.source, 80), medium: str(first.medium, 40), campaign: str(first.campaign, 120), landing: str(first.landing, 120) },
    pages: Array.isArray(j.pages) ? j.pages.slice(-25).map((p: unknown) => str(p, 80)).join(' > ') : '',
    pagesCount: Number(j.pagesCount) || 0,
    sections: Array.isArray(j.sections) ? j.sections.slice(-30).map((p: unknown) => str(p, 80)).join(', ') : '',
    maxScroll: Number(j.maxScroll) || 0,
    secondsOnSite: Number(j.secondsOnSite) || 0,
    device: str(j.device, 12),
  };

  // 1. Google Sheet + email via Apps Script
  const scriptUrl = env('APPS_SCRIPT_URL');
  let leadId = '';
  if (scriptUrl) {
    try {
      const r = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env('APPS_SCRIPT_SECRET'), lead }),
        redirect: 'follow',
        signal: AbortSignal.timeout(9000),
      });
      const out = await r.json().catch(() => ({}));
      if (!out.ok) throw new Error(out.error || `apps_script_${r.status}`);
      leadId = out.leadId;
    } catch (e) {
      // Keep the lead recoverable from Vercel logs even if the sheet is down.
      console.error('LEAD_SHEET_FAILED', JSON.stringify({ lead, error: String(e) }));
      return json({ ok: false, error: 'sheet_unavailable' }, 502);
    }
  } else {
    leadId = `EQX-DEV-${Date.now().toString().slice(-6)}`;
    console.log('LEAD_DEV_MODE (APPS_SCRIPT_URL not set)', JSON.stringify(lead));
  }

  // 2. Meta Conversions API — only with marketing consent, and only a hashed phone.
  const pixel = env('PUBLIC_META_PIXEL_ID');
  const token = env('META_CAPI_TOKEN');
  const marketing = !!j.consent?.marketing;
  if (pixel && token && marketing) {
    const firstName = name.split(/\s+/)[0] || '';
    const payload: any = {
      data: [{
        event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId,
        action_source: 'website', event_source_url: `${origin}/thank-you`,
        user_data: {
          ph: [sha256(`91${phone}`)], fn: firstName ? [sha256(firstName)] : undefined, country: [sha256('in')],
          client_ip_address: ip || undefined, client_user_agent: userAgent || undefined,
          fbp: str(j.fbp, 120) || undefined, fbc: str(j.fbc, 250) || undefined,
        },
      }],
    };
    if (env('META_TEST_EVENT_CODE')) payload.test_event_code = env('META_TEST_EVENT_CODE');
    const version = env('META_GRAPH_VERSION') || 'v23.0';
    try {
      const r = await fetch(`https://graph.facebook.com/${version}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) console.error('META_CAPI_FAILED', r.status, await r.text());
    } catch (e) { console.error('META_CAPI_ERROR', String(e)); }
  }

  return json({ ok: true, leadId });
};

export const ALL: APIRoute = () => json({ ok: false, error: 'method_not_allowed' }, 405);
