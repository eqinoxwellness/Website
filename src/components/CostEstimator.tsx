import React, { useState } from 'react';

type ConcernKey = 'acne' | 'pigmentation' | 'rejuvenation' | 'hair' | 'wellness';

interface ConcernData {
  title: string;
  modalities: string[];
  sessions: string;
  interval: string;
  note: string;
}

const CONCERNS: Record<ConcernKey, ConcernData> = {
  acne: {
    title: 'Acne & Acne Scar Protocol',
    modalities: ['Fractional MNRF', 'Salicylic Chemical Peels', 'HydraFacial Vortex'],
    sessions: '4 – 6 Sessions',
    interval: '3 to 4 weeks apart',
    note: 'Active inflammation is addressed first before deep scar tissue remodeling begins.'
  },
  pigmentation: {
    title: 'Pigmentation & Melasma Care',
    modalities: ['Q-Switched Pico Laser', 'Tranexamic Micro-Infusion', 'Targeted Peels'],
    sessions: '5 – 8 Sessions',
    interval: '2 to 4 weeks apart',
    note: 'Phototype and sun exposure history guide pulse energy parameters.'
  },
  rejuvenation: {
    title: 'Skin Hydration & Texture Rejuvenation',
    modalities: ['Advanced HydraFacial', 'Skin Boosters (Hyaluronic Acid)', 'PDRN Polynucleotides'],
    sessions: '3 – 4 Sessions',
    interval: '3 to 4 weeks apart',
    note: 'Supports natural skin barrier repair and internal hydration.'
  },
  hair: {
    title: 'Hair Growth & Scalp Trichology',
    modalities: ['Growth Factor Concentrate (GFC)', 'PRP Biostimulation', 'Scalp Microneedling'],
    sessions: '6 – 8 Sessions',
    interval: 'Monthly protocol',
    note: 'In-person scalp dermoscopy evaluates follicular bulb viability.'
  },
  wellness: {
    title: 'Hormonal & Holistic Wellness',
    modalities: ['Individualized Homeopathy', 'Nutritional Assessment', 'Hormonal Screening'],
    sessions: 'Ongoing Follow-ups',
    interval: 'Monthly review',
    note: 'Addresses root systemic factors alongside topical aesthetic care.'
  }
};

export default function CostEstimator() {
  const [activeConcern, setActiveConcern] = useState<ConcernKey>('acne');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'extensive'>('moderate');

  const data = CONCERNS[activeConcern];

  const getWaUrl = () => {
    const text = encodeURIComponent(
      `Hi, I calculated an estimate for ${data.title} (${severity} level) on the Equinox website. I would like to book a doctor assessment. #EQ-CALC`
    );
    return `https://wa.me/916372528534?text=${text}`;
  };

  return (
    <div className="estimator-box">
      <div className="estimator-header">
        <span className="eyebrow" style={{ marginBottom: '0.5rem' }}>
          <span>✦</span> Dynamic Interactive Calculator
        </span>
        <h3>Interactive Consultation & Protocol Planner</h3>
        <p className="muted small">
          Select your concern and severity below to see typical clinical modalities, session intervals, and consultation expectations.
        </p>
      </div>

      {/* Concern Selector Tabs */}
      <div className="estimator-tabs" role="tablist" aria-label="Select Concern">
        {(Object.keys(CONCERNS) as ConcernKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`estimator-tab ${activeConcern === key ? 'is-active' : ''}`}
            onClick={() => setActiveConcern(key)}
            role="tab"
            aria-selected={activeConcern === key}
          >
            {key === 'acne' && 'Breakouts & Scars'}
            {key === 'pigmentation' && 'Pigmentation'}
            {key === 'rejuvenation' && 'Skin Rejuvenation'}
            {key === 'hair' && 'Hair & Scalp'}
            {key === 'wellness' && 'Hormones & Homeopathy'}
          </button>
        ))}
      </div>

      {/* Severity Selector */}
      <div className="estimator-severity">
        <label>Select Concern Extent / Duration:</label>
        <div className="severity-options">
          <button
            type="button"
            className={`severity-btn ${severity === 'mild' ? 'is-selected' : ''}`}
            onClick={() => setSeverity('mild')}
          >
            Recent / Mild
          </button>
          <button
            type="button"
            className={`severity-btn ${severity === 'moderate' ? 'is-selected' : ''}`}
            onClick={() => setSeverity('moderate')}
          >
            Moderate / Recurring
          </button>
          <button
            type="button"
            className={`severity-btn ${severity === 'extensive' ? 'is-selected' : ''}`}
            onClick={() => setSeverity('extensive')}
          >
            Long-Standing / Deep
          </button>
        </div>
      </div>

      {/* Dynamic Results Card */}
      <div className="estimator-results">
        <div className="results-header">
          <h4>{data.title}</h4>
          <span className="results-badge">{data.sessions}</span>
        </div>

        <div className="results-grid">
          <div>
            <strong>Recommended Clinical Modalities:</strong>
            <ul>
              {data.modalities.map((m, idx) => (
                <li key={idx}>✦ {m}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Typical Session Cadence:</strong>
            <p className="small">{data.interval}</p>
            <strong>Diagnostic Note:</strong>
            <p className="small muted">{data.note}</p>
          </div>
        </div>

        <div className="results-footer">
          <p className="small muted" style={{ margin: 0 }}>
            Fees are discussed upfront during consultation. No surprises.
          </p>
          <a className="btn btn--wa" href={getWaUrl()} target="_blank" rel="noopener noreferrer">
            Discuss Estimate on WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
}
