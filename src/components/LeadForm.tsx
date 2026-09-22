import { useEffect, useRef, useState, type FormEvent } from 'react';

type Option = { slug: string; name: string };
type Props = { services: Option[]; defaultService?: string; whatsappHref: string };
type Errors = Partial<Record<'name' | 'phone' | 'service' | 'consent', string>>;

const TIMES = ['Morning', 'Afternoon', 'Evening'];

export function normalisePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

const uid = () =>
  (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function LeadForm({ services, defaultService = '', whatsappHref }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(defaultService);
  const [time, setTime] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const started = useRef(false);
  const startedAt = useRef(Date.now());
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => { startedAt.current = Date.now(); }, []);

  const onFirstFocus = () => {
    if (started.current) return;
    started.current = true;
    window.eqx?.track('form_start', { form: 'callback' });
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Enter your name so we know who to ask for.';
    if (!normalisePhone(phone)) e.phone = 'Enter a 10-digit Indian mobile number, for example 98765 43210.';
    if (!service) e.service = 'Choose what you would like to talk about.';
    if (!consent) e.consent = 'Tick the box so we are allowed to contact you.';
    return e;
  };

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    setStatus('sending');
    const eventId = uid();
    const tenDigit = normalisePhone(phone)!;
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: tenDigit, service, preferredTime: time, consent: true,
          website: hp, startedAt: startedAt.current, page: location.pathname, eventId,
          journey: window.eqx?.journey?.() ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'failed');
      try { sessionStorage.setItem('eqx_lead', JSON.stringify({ eventId, phone: `+91${tenDigit}`, leadId: data.leadId })); } catch {}
      location.href = '/thank-you';
    } catch {
      setStatus('error');
    }
  }

  const err = (k: keyof Errors) => errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${k}-err` } : {};
  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <form className="lead-form" onSubmit={submit} noValidate data-clarity-mask="true" onFocus={onFirstFocus}>
      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} className="form-status form-status--error" role="alert">
          <strong>Please fix {errorList.length === 1 ? 'one thing' : `${errorList.length} things`}:</strong>
          <ul>{errorList.map(([k, v]) => <li key={k}><a href={`#lf-${k}`}>{v}</a></li>)}</ul>
        </div>
      )}
      {status === 'error' && (
        <div className="form-status form-status--error" role="alert">
          The request did not go through. Please try again, or <a href={whatsappHref}>message us on WhatsApp</a> and we will reply there.
        </div>
      )}

      <div className="field">
        <label htmlFor="lf-name">Your name</label>
        <input id="lf-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...err('name')} />
        {errors.name && <p id="name-err" className="field__error">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor="lf-phone">Mobile number</label>
        <input id="lf-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} {...err('phone')} />
        {errors.phone && <p id="phone-err" className="field__error">{errors.phone}</p>}
      </div>

      <div className="field">
        <label htmlFor="lf-service">What would you like to talk about?</label>
        <select id="lf-service" value={service} onChange={(e) => setService(e.target.value)} {...err('service')}>
          <option value="">Choose one</option>
          {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          <option value="not-sure">I am not sure yet</option>
        </select>
        {errors.service && <p id="service-err" className="field__error">{errors.service}</p>}
      </div>

      <div className="field">
        <fieldset>
          <legend>When should we call? <span className="muted">(optional)</span></legend>
          <div className="finder__options" style={{ marginTop: '0.5rem' }}>
            {TIMES.map((t) => (
              <label className="chip" key={t}>
                <input type="radio" name="lf-time" value={t} checked={time === t} onChange={() => setTime(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="lf-website">Leave this empty</label>
        <input id="lf-website" type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      <div className="field">
        <label className="consent-row" htmlFor="lf-consent">
          <input id="lf-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} {...err('consent')} />
          <span>Equinox may contact me about this request by phone or WhatsApp, and keep these details together with how I found this website, as described in the <a href="/privacy-policy">privacy policy</a>.</span>
        </label>
        {errors.consent && <p id="consent-err" className="field__error">{errors.consent}</p>}
      </div>

      <div>
        <button className="btn btn--dusk" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending your request…' : 'Request a call back'}
        </button>
      </div>
      <p className="muted small" style={{ margin: 0 }}>We call during clinic hours. For a faster reply, message us on WhatsApp.</p>
    </form>
  );
}
