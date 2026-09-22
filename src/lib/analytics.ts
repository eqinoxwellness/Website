/**
 * Equinox measurement layer.
 *
 * 1. Consent first. Nothing third-party loads until the visitor chooses. Analytics consent
 *    unlocks GA4 + Microsoft Clarity; marketing consent unlocks Google Ads + Meta Pixel.
 * 2. First-party journey. Source, campaign, click IDs, pages, scroll and sections read are kept in
 *    sessionStorage and only leave the browser when the visitor submits the form with consent.
 * 3. One event API. window.eqx.track(name, params) fans out to every tool the visitor allowed.
 *    Ad platforms never receive health details: no concern, no service, no form contents.
 */

type Consent = { analytics: boolean; marketing: boolean; ts: number };
type Touch = {
  source: string; medium: string; campaign: string; term: string; content: string;
  gclid: string; fbclid: string; msclkid: string; referrer: string; landing: string; ts: number;
};
type Journey = {
  first: Touch; last: Touch; pages: string[]; start: number;
  maxScroll: Record<string, number>; sections: string[]; fbc?: string;
};
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: unknown; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
    eqx: {
      track: (name: string, params?: Params) => void;
      leadConversion: (lead: { eventId: string; phone?: string }) => void;
      journey: () => ReturnType<typeof journeyExport>;
      openConsent: () => void;
    };
  }
}

const cfgEl = document.getElementById('eqx-config');
const cfg: {
  ga4?: string; gadsId?: string; gadsLeadLabel?: string; gadsWhatsappLabel?: string; gadsCallLabel?: string;
  metaPixel?: string; clarity?: string; gtm?: string;
} = cfgEl ? JSON.parse(cfgEl.textContent || '{}') : {};

const CONSENT_KEY = 'eqx_consent';
const JOURNEY_KEY = 'eqx_journey';
const FIRST_TOUCH_KEY = 'eqx_ft';
const FIRST_TOUCH_DAYS = 30;

const safe = <T>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };

/* ---------------- Consent ---------------- */
const readConsent = (): Consent | null =>
  safe(() => JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'), null);

let consent: Consent | null = readConsent();

/* ---------------- Journey (first-party) ---------------- */
const AI_SOURCES: Record<string, string> = {
  'chatgpt.com': 'chatgpt', 'chat.openai.com': 'chatgpt', 'perplexity.ai': 'perplexity',
  'www.perplexity.ai': 'perplexity', 'gemini.google.com': 'gemini', 'copilot.microsoft.com': 'copilot',
  'claude.ai': 'claude', 'www.bing.com/chat': 'copilot',
};

function classify(url: URL, referrer: string): Touch {
  const q = url.searchParams;
  const t: Touch = {
    source: q.get('utm_source') || '', medium: q.get('utm_medium') || '',
    campaign: q.get('utm_campaign') || '', term: q.get('utm_term') || '', content: q.get('utm_content') || '',
    gclid: q.get('gclid') || q.get('gbraid') || q.get('wbraid') || '', fbclid: q.get('fbclid') || '',
    msclkid: q.get('msclkid') || '', referrer: '', landing: url.pathname, ts: Date.now(),
  };
  let refHost = '';
  if (referrer) {
    const r = safe(() => new URL(referrer), null as URL | null);
    if (r && r.hostname !== location.hostname) { refHost = r.hostname; t.referrer = r.hostname; }
  }
  if (!t.source) {
    if (t.gclid) { t.source = 'google'; t.medium = 'cpc'; }
    else if (t.msclkid) { t.source = 'bing'; t.medium = 'cpc'; }
    else if (t.fbclid) { t.source = /instagram/.test(refHost) ? 'instagram' : 'facebook'; t.medium = 'paid-or-social'; }
    else if (refHost) {
      const ai = AI_SOURCES[refHost];
      if (ai) { t.source = ai; t.medium = 'ai-assistant'; }
      else if (/(^|\.)google\./.test(refHost)) { t.source = 'google'; t.medium = 'organic'; }
      else if (/(^|\.)bing\.com$/.test(refHost)) { t.source = 'bing'; t.medium = 'organic'; }
      else if (/duckduckgo|yahoo|yandex|ecosia/.test(refHost)) { t.source = refHost.split('.').slice(-2, -1)[0]; t.medium = 'organic'; }
      else if (/instagram\.com$/.test(refHost)) { t.source = 'instagram'; t.medium = 'social'; }
      else if (/facebook\.com$|fb\.me$/.test(refHost)) { t.source = 'facebook'; t.medium = 'social'; }
      else if (/whatsapp|wa\.me/.test(refHost)) { t.source = 'whatsapp'; t.medium = 'social'; }
      else if (/youtube\.com$/.test(refHost)) { t.source = 'youtube'; t.medium = 'social'; }
      else { t.source = refHost; t.medium = 'referral'; }
    } else { t.source = '(direct)'; t.medium = '(none)'; }
  }
  return t;
}

const isDirect = (t: Touch) => t.source === '(direct)';

function loadJourney(): Journey {
  const now = classify(new URL(location.href), document.referrer);
  const stored = safe(() => JSON.parse(sessionStorage.getItem(JOURNEY_KEY) || 'null'), null) as Journey | null;
  let j: Journey;
  if (stored) {
    j = stored;
    // A fresh campaign click mid-session becomes the new last touch.
    if (!isDirect(now) && (now.gclid || now.fbclid || now.msclkid || now.campaign || now.referrer)) j.last = now;
  } else {
    let first = now;
    if (consent?.analytics || consent?.marketing) {
      const ft = safe(() => JSON.parse(localStorage.getItem(FIRST_TOUCH_KEY) || 'null'), null) as Touch | null;
      if (ft && Date.now() - ft.ts < FIRST_TOUCH_DAYS * 864e5) first = ft;
    }
    j = { first, last: now, pages: [], start: Date.now(), maxScroll: {}, sections: [] };
  }
  if (now.fbclid && !j.fbc) j.fbc = `fb.1.${Date.now()}.${now.fbclid}`;
  if (j.pages[j.pages.length - 1] !== location.pathname) j.pages.push(location.pathname);
  j.pages = j.pages.slice(-25);
  return j;
}

const journey = loadJourney();
const saveJourney = () => safe(() => sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(journey)), undefined);
saveJourney();

function persistFirstTouch() {
  if (!(consent?.analytics || consent?.marketing)) return;
  safe(() => { if (!localStorage.getItem(FIRST_TOUCH_KEY)) localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(journey.first)); }, undefined);
}

const cookie = (name: string) =>
  document.cookie.split('; ').find((c) => c.startsWith(name + '='))?.split('=')[1] || '';

function device(): string {
  const w = window.innerWidth;
  return w < 768 ? 'mobile' : w < 1100 ? 'tablet' : 'desktop';
}

function journeyExport() {
  return {
    first: journey.first,
    last: journey.last,
    pages: journey.pages,
    pagesCount: journey.pages.length,
    sections: journey.sections.slice(-30),
    maxScroll: journey.maxScroll[location.pathname] || 0,
    secondsOnSite: Math.round((Date.now() - journey.start) / 1000),
    device: device(),
    fbp: cookie('_fbp'),
    fbc: cookie('_fbc') || journey.fbc || '',
    consent: { analytics: !!consent?.analytics, marketing: !!consent?.marketing },
  };
}

/* ---------------- Tag loading ---------------- */
const loaded = { google: false, meta: false, clarity: false, gtm: false };
const queue: Array<[string, Params]> = [];
window.dataLayer = window.dataLayer || [];

function inject(src: string) {
  const s = document.createElement('script');
  s.async = true; s.src = src;
  document.head.appendChild(s);
}

function loadGoogle(c: Consent) {
  if (loaded.google) return;
  const wantGa = !!(cfg.ga4 && c.analytics);
  const wantAds = !!(cfg.gadsId && c.marketing);
  if (!wantGa && !wantAds) return;
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  const g = window.gtag;
  g('consent', 'default', {
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: c.marketing ? 'granted' : 'denied',
    ad_user_data: c.marketing ? 'granted' : 'denied',
    ad_personalization: 'denied',
  });
  g('js', new Date());
  if (wantGa) g('config', cfg.ga4, { page_path: location.pathname });
  if (wantAds) g('config', cfg.gadsId, { allow_enhanced_conversions: true });
  inject(`https://www.googletagmanager.com/gtag/js?id=${wantGa ? cfg.ga4 : cfg.gadsId}`);
  loaded.google = true;
}

function loadMeta(c: Consent) {
  if (loaded.meta || !cfg.metaPixel || !c.marketing) return;
  const w = window as Window;
  if (!w.fbq) {
    const n = function (...args: unknown[]) {
      (n as any).callMethod ? (n as any).callMethod.apply(n, args) : (n as any).queue.push(args);
    } as any;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    w.fbq = n; w._fbq = n;
    inject('https://connect.facebook.net/en_US/fbevents.js');
  }
  w.fbq!('init', cfg.metaPixel);
  w.fbq!('track', 'PageView');
  loaded.meta = true;
}

function loadClarity(c: Consent) {
  if (loaded.clarity || !cfg.clarity || !c.analytics) return;
  const cl = function (...args: unknown[]) { (cl.q = cl.q || []).push(args); } as any;
  window.clarity = cl;
  inject(`https://www.clarity.ms/tag/${cfg.clarity}`);
  cl('set', 'page_type', document.body.dataset.pageType || 'page');
  loaded.clarity = true;
}

function loadGtm(c: Consent) {
  if (loaded.gtm || !cfg.gtm || !(c.analytics || c.marketing)) return;
  window.dataLayer.push({ event: 'eqx_consent', analytics: c.analytics, marketing: c.marketing });
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  inject(`https://www.googletagmanager.com/gtm.js?id=${cfg.gtm}`);
  loaded.gtm = true;
}

function whenIdle(fn: () => void) {
  const ric = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => void) | undefined;
  ric ? ric(fn, { timeout: 2500 }) : setTimeout(fn, 1200);
}

function applyConsent(c: Consent) {
  whenIdle(() => {
    loadGoogle(c); loadMeta(c); loadClarity(c); loadGtm(c);
    persistFirstTouch();
    queue.splice(0).forEach(([n, p]) => dispatch(n, p));
  });
}

/* ---------------- Event dispatch ---------------- */
const META_STANDARD: Record<string, string> = {
  whatsapp_click: 'Contact', call_click: 'Contact', directions_click: 'FindLocation',
};
const ADS_LABEL: Record<string, string | undefined> = {
  whatsapp_click: cfg.gadsWhatsappLabel, call_click: cfg.gadsCallLabel,
};

function dispatch(name: string, params: Params) {
  const c = consent;
  if (!c) return;
  if (cfg.gtm) window.dataLayer.push({ event: name, ...params });
  if (window.gtag && c.analytics && cfg.ga4) window.gtag('event', name, { ...params, send_to: cfg.ga4 });
  if (window.gtag && c.marketing && cfg.gadsId && ADS_LABEL[name]) {
    window.gtag('event', 'conversion', { send_to: `${cfg.gadsId}/${ADS_LABEL[name]}` });
  }
  // Meta receives the event name only. Never page topic, concern or form data.
  if (window.fbq && c.marketing && META_STANDARD[name]) window.fbq('track', META_STANDARD[name]);
  if (window.clarity && c.analytics) window.clarity('event', name);
}

function track(name: string, params: Params = {}) {
  if (!consent || !(consent.analytics || consent.marketing)) return;
  const anyLoaded = loaded.google || loaded.meta || loaded.clarity || loaded.gtm;
  if (!anyLoaded) { if (queue.length < 50) queue.push([name, params]); return; }
  dispatch(name, params);
}

function leadConversion(lead: { eventId: string; phone?: string }) {
  const fire = () => {
    const c = consent;
    if (!c) return;
    if (window.gtag && c.analytics && cfg.ga4) window.gtag('event', 'generate_lead', { send_to: cfg.ga4 });
    if (window.gtag && c.marketing && cfg.gadsId && cfg.gadsLeadLabel) {
      if (lead.phone) window.gtag('set', 'user_data', { phone_number: lead.phone });
      window.gtag('event', 'conversion', { send_to: `${cfg.gadsId}/${cfg.gadsLeadLabel}`, transaction_id: lead.eventId });
    }
    if (window.fbq && c.marketing) window.fbq('track', 'Lead', {}, { eventID: lead.eventId });
    if (window.clarity && c.analytics) window.clarity('event', 'generate_lead');
    if (cfg.gtm) window.dataLayer.push({ event: 'generate_lead', event_id: lead.eventId });
  };
  if (loaded.google || loaded.meta || loaded.clarity || loaded.gtm) fire();
  else setTimeout(fire, 2600); // tags load at idle; give them a moment on the thank-you page
}

/* ---------------- Behaviour: scroll, sections, clicks, FAQ ---------------- */
const marks = [25, 50, 75, 90];
const fired = new Set<number>();
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const doc = document.documentElement;
    const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100));
    const path = location.pathname;
    if (pct > (journey.maxScroll[path] || 0)) { journey.maxScroll[path] = pct; saveJourney(); }
    for (const m of marks) if (pct >= m && !fired.has(m)) { fired.add(m); track('scroll_depth', { percent: m }); }
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

if ('IntersectionObserver' in window) {
  const timers = new Map<Element, { since: number; total: number; done: boolean }>();
  const io = new IntersectionObserver((entries) => {
    const now = performance.now();
    for (const e of entries) {
      const t = timers.get(e.target) || { since: 0, total: 0, done: false };
      if (e.intersectionRatio >= 0.5) { if (!t.since) t.since = now; }
      else if (t.since) { t.total += now - t.since; t.since = 0; }
      timers.set(e.target, t);
    }
  }, { threshold: [0, 0.5] });
  document.querySelectorAll('[data-section]').forEach((el) => io.observe(el));
  setInterval(() => {
    const now = performance.now();
    timers.forEach((t, el) => {
      const ms = t.total + (t.since ? now - t.since : 0);
      if (!t.done && ms >= 3000) {
        t.done = true;
        const id = (el as HTMLElement).dataset.section || 'section';
        const key = `${location.pathname}#${id}`;
        if (!journey.sections.includes(key)) { journey.sections.push(key); saveJourney(); }
        track('section_read', { section: id, seconds: Math.round(ms / 1000) });
      }
    });
  }, 1000);
}

document.addEventListener('click', (ev) => {
  const a = (ev.target as Element).closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  const where = a.dataset.cta || 'inline';
  if (href.startsWith('https://wa.me/')) track('whatsapp_click', { cta_location: where });
  else if (href.startsWith('tel:')) track('call_click', { cta_location: where });
  else if (a.dataset.track === 'directions') track('directions_click', { cta_location: where });
  else if (a.host && a.host !== location.host) track('outbound_click', { host: a.host });
});

document.addEventListener('toggle', (ev) => {
  const d = ev.target as HTMLDetailsElement;
  if (d.tagName === 'DETAILS' && d.open && d.closest('.faq')) {
    track('faq_open', { question: (d.querySelector('summary')?.textContent || '').trim().slice(0, 100) });
  }
}, true);

/* ---------------- Consent banner wiring ---------------- */
const banner = document.getElementById('consent');
function setConsent(c: Consent) {
  consent = c;
  safe(() => localStorage.setItem(CONSENT_KEY, JSON.stringify(c)), undefined);
  document.documentElement.dataset.consent = 'set';
  if (banner) banner.dataset.open = 'false';
  applyConsent(c);
}
function openConsent() {
  if (!banner) return;
  const a = banner.querySelector<HTMLInputElement>('[name="c-analytics"]');
  const m = banner.querySelector<HTMLInputElement>('[name="c-marketing"]');
  if (a) a.checked = !!consent?.analytics;
  if (m) m.checked = !!consent?.marketing;
  banner.dataset.open = 'true';
  const more = banner.querySelector('details');
  if (more) more.open = true;
  banner.querySelector<HTMLElement>('button')?.focus();
}
banner?.addEventListener('click', (ev) => {
  const btn = (ev.target as Element).closest('button');
  if (!btn) return;
  const action = btn.dataset.consentAction;
  if (action === 'all') setConsent({ analytics: true, marketing: true, ts: Date.now() });
  if (action === 'none') setConsent({ analytics: false, marketing: false, ts: Date.now() });
  if (action === 'save') {
    const a = banner.querySelector<HTMLInputElement>('[name="c-analytics"]')?.checked || false;
    const m = banner.querySelector<HTMLInputElement>('[name="c-marketing"]')?.checked || false;
    setConsent({ analytics: a, marketing: m, ts: Date.now() });
  }
});
document.querySelectorAll('[data-consent-open]').forEach((b) => b.addEventListener('click', openConsent));

window.eqx = { track, leadConversion, journey: journeyExport, openConsent };

if (consent) applyConsent(consent);
