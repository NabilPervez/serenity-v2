import { useEffect, useRef, useState } from 'react';
import { db, type PracticeSession } from '../../data/db';
import { BODY_PARTS, BODY_PROMPTS, FOOD_PROMPTS, OBSERVE_PROMPTS, chime, today } from './presentUtils';

type Kind = 'observe' | 'body';
type Mode = PracticeSession['mode'];
const DURATION = 60;

interface Props {
  kind: Kind;
  foodUnlocked: boolean;
  onDone: () => void;
}

/** Pick → 60s timer → optional note. Shared by object/food observation and body focus. */
export default function PracticeFlow({ kind, foodUnlocked, onDone }: Props) {
  const [stage, setStage] = useState<'object' | 'food'>(foodUnlocked ? 'food' : 'object');
  const [target, setTarget] = useState(kind === 'body' ? BODY_PARTS[0] : '');
  const [mode, setMode] = useState<Mode>('both');
  const [phase, setPhase] = useState<'setup' | 'run' | 'note'>('setup');
  const [left, setLeft] = useState(DURATION);
  const [note, setNote] = useState('');
  const startedAt = useRef(0);

  const prompts = kind === 'body' ? BODY_PROMPTS : stage === 'food' ? FOOD_PROMPTS : OBSERVE_PROMPTS;
  const prompt = prompts[Math.floor((DURATION - left) / 10) % prompts.length];

  useEffect(() => {
    if (phase !== 'run') return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, DURATION - Math.floor((Date.now() - startedAt.current) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(id);
        chime(396);
        setPhase('note');
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase]);

  const start = () => {
    if (kind === 'body' && target === 'Random') setTarget(BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)]);
    startedAt.current = Date.now();
    setLeft(DURATION);
    chime();
    setPhase('run');
  };

  const save = async () => {
    await db.practiceSessions.add({
      type: kind === 'body' ? 'body' : stage,
      mode,
      target: target.trim(),
      note: note.trim(),
      startedAt: startedAt.current,
      date: today(),
      durationSec: DURATION,
    });
    onDone();
  };

  if (phase === 'run') {
    const pct = (DURATION - left) / DURATION;
    const r = 88;
    const c = 2 * Math.PI * r;
    return (
      <div className="pr-run">
        <svg viewBox="0 0 200 200" className="pr-ring" aria-hidden="true">
          <circle cx="100" cy="100" r={r} className="pr-ring-track" />
          <circle cx="100" cy="100" r={r} className="pr-ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        </svg>
        <div className="pr-run-center">
          <span className="pr-run-time" aria-live="polite">{left}</span>
          <span className="pr-run-target">{target || (stage === 'food' ? 'Your food' : 'Your object')}</span>
        </div>
        <p className="pr-prompt">{prompt}</p>
        <p className="pr-hint">
          {mode === 'internal' ? 'Describe it silently.' : mode === 'external' ? 'Describe it out loud.' : 'Silently first, then out loud.'} Facts only.
        </p>
        <button className="qp-btn qp-btn-ghost" onClick={() => setPhase('note')}>End early</button>
      </div>
    );
  }

  if (phase === 'note') {
    return (
      <div className="pr-form">
        <p className="pr-done">Done. <span>You were here for a minute.</span></p>
        <label className="pr-label" htmlFor="pr-note">What did you notice? <span>(optional)</span></label>
        <input id="pr-note" className="qp-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="One line, no judgment" autoFocus />
        <div className="pr-actions">
          <button className="qp-btn qp-btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-form">
      {kind === 'observe' && (
        <div className="pr-field">
          <span className="pr-label">Stage</span>
          <div className="qp-seg" role="radiogroup">
            <button role="radio" aria-checked={stage === 'object'} className={stage === 'object' ? 'on' : ''} onClick={() => setStage('object')}>Objects</button>
            <button role="radio" aria-checked={stage === 'food'} className={stage === 'food' ? 'on' : ''} onClick={() => setStage('food')}>
              Food{!foodUnlocked && ' ·'}
            </button>
          </div>
          {!foodUnlocked && stage === 'food' && <p className="pr-hint">Early for food — that's fine. Objects first builds the habit.</p>}
        </div>
      )}

      {kind === 'observe' ? (
        <div className="pr-field">
          <label className="pr-label" htmlFor="pr-target">{stage === 'food' ? 'What food?' : 'What object?'} <span>(optional)</span></label>
          <input id="pr-target" className="qp-input" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={stage === 'food' ? 'An orange' : 'The mug on my desk'} />
        </div>
      ) : (
        <div className="pr-field">
          <span className="pr-label">Body part</span>
          <div className="qp-chips">
            {[...BODY_PARTS, 'Random'].map((b) => (
              <button key={b} className={`qp-chip${target === b ? ' on' : ''}`} onClick={() => setTarget(b)}>{b}</button>
            ))}
          </div>
        </div>
      )}

      <div className="pr-field">
        <span className="pr-label">Monologue</span>
        <div className="qp-seg" role="radiogroup">
          {(['internal', 'external', 'both'] as Mode[]).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
              {m === 'internal' ? 'Internal' : m === 'external' ? 'Out loud' : 'Both'}
            </button>
          ))}
        </div>
      </div>

      <div className="pr-actions">
        <button className="qp-btn qp-btn-primary" onClick={start}>Start 60 seconds</button>
      </div>
    </div>
  );
}
