import { useState } from 'react';

type Option = { label: string; slug: string; name: string; line: string; href: string; wa: string };
type Props = { options: Option[] };

export default function ConcernFinder({ options }: Props) {
  const [pick, setPick] = useState<Option | null>(null);

  const choose = (o: Option) => {
    setPick(o);
    window.eqx?.track('concern_finder_result', { topic: o.slug });
  };

  return (
    <div className="finder">
      <fieldset className="finder__options">
        <legend>Pick the one closest to what is on your mind</legend>
        {options.map((o) => (
          <label className="chip" key={o.slug}>
            <input type="radio" name="concern" value={o.slug} checked={pick?.slug === o.slug} onChange={() => choose(o)} />
            <span>{o.label}</span>
          </label>
        ))}
      </fieldset>
      <div aria-live="polite">
        {pick && (
          <div className="finder__result">
            <h3>{pick.name}</h3>
            <p>{pick.line}</p>
            <p className="muted small">This is a starting point for a conversation, not a diagnosis. The doctor will tell you if a different consultation suits you better.</p>
            <div className="btn-row" style={{ marginTop: '1rem' }}>
              <a className="btn btn--wa" href={pick.wa} data-cta="concern-finder" rel="noopener">Ask about this on WhatsApp</a>
              <a className="btn btn--line" href={pick.href}>Read about the {pick.name.toLowerCase()}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
