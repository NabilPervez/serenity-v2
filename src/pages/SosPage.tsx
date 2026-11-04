import { useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { EMERGENCY_TOOLS } from '../data/emergencyTools';
import '../present.css';

/**
 * SOS — Emergency Reset, one tap from every screen (top bar).
 * Nabil, 2026-11-03: moved out of Tools so a panic moment never needs navigation.
 */
export default function SosPage() {
  const [open, setOpen] = useState<string | null>(EMERGENCY_TOOLS[0]?.id ?? null);

  return (
    <>
      <TopBar title="SOS" icon="emergency" />
      <div className="pr-page">
        <header className="pr-hero animate-fade-up">
          <h1 className="pr-h1">Stop. <span>One step at a time.</span></h1>
          <p className="pr-lede">Pick the one that fits right now. Follow the steps in order.</p>
          <div className="pr-actions">
            <Link to="/practice?open=breathe" className="qp-btn qp-btn-primary">
              <span className="material-symbols-outlined" aria-hidden="true">air</span> Breathe now
            </Link>
          </div>
        </header>

        <section className="pr-spine">
          {EMERGENCY_TOOLS.map((tool, i) => (
            <div key={tool.id} className={`pr-row${open === tool.id ? ' open' : ''}`}>
              <button className="pr-row-head" aria-expanded={open === tool.id} onClick={() => setOpen(open === tool.id ? null : tool.id)}>
                <span className="pr-row-n">0{i + 1}</span>
                <span className="pr-row-title">{tool.title}</span>
                <span className="material-symbols-outlined pr-row-chev" aria-hidden="true">expand_more</span>
              </button>
              {open === tool.id && (
                <div className="pr-row-body">
                  <p className="pr-lede">{tool.subtitle}</p>
                  <ol className="sos-steps">
                    {tool.steps.map((s, n) => <li key={n}>{s}</li>)}
                  </ol>
                  <p className="pr-hint">{tool.why}</p>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
