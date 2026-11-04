import { useCallback, useEffect, useState } from 'react';
import { db, type DistractionReset } from '../../data/db';
import { chime, today } from './presentUtils';

const FIVE_MIN = 5 * 60 * 1000;

async function notify(task: string) {
  const body = task ? `Do it now: ${task}.` : 'Do it now.';
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) reg.showNotification('Back to it.', { body, tag: 'back-to-it' });
    else new Notification('Back to it.', { body, tag: 'back-to-it' });
  } catch { /* notifications unavailable */ }
}

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * "Back to it" — the 5-minute distraction reset (PRD §5.3).
 * The pending reset lives in Dexie, so a reload or app switch keeps the countdown.
 * Limitation: the alert only fires while Serenity is open (web can't schedule
 * background alarms reliably, especially on iOS) — so we also offer a phone timer hint.
 */
export default function BackToIt({ autoStart, onChange }: { autoStart?: boolean; onChange: () => void }) {
  const [active, setActive] = useState<DistractionReset | null>(null);
  const [task, setTask] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [asking, setAsking] = useState(!!autoStart);

  const load = useCallback(async () => {
    const pending = await db.distractionResets.filter((r) => r.outcome === 'pending').last();
    setActive(pending ?? null);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async Dexie load
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    const wait = active.firesAt - Date.now();
    const t = wait > 0 ? window.setTimeout(() => { chime(440); notify(active.task); }, wait) : undefined;
    return () => { window.clearInterval(id); if (t) window.clearTimeout(t); };
  }, [active]);

  const begin = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { /* ignore */ }
    }
    const createdAt = Date.now();
    const row: DistractionReset = { task: task.trim(), createdAt, date: today(), firesAt: createdAt + FIVE_MIN, outcome: 'pending', snoozed: false };
    row.id = await db.distractionResets.add(row);
    setTask('');
    setAsking(false);
    setActive(row);
    onChange();
  };

  const finish = async (outcome: 'started' | 'missed') => {
    if (!active?.id) return;
    await db.distractionResets.update(active.id, { outcome });
    setActive(null);
    onChange();
  };

  const snooze = async () => {
    if (!active?.id || active.snoozed) return;
    const firesAt = Date.now() + FIVE_MIN;
    await db.distractionResets.update(active.id, { firesAt, snoozed: true });
    setActive({ ...active, firesAt, snoozed: true });
  };

  if (active) {
    const due = now >= active.firesAt;
    return (
      <div className={`bti${due ? ' due' : ''}`}>
        <div className="bti-row">
          <div>
            <p className="bti-title">{due ? 'Now.' : 'Back to it in'}</p>
            <p className="bti-task">{active.task || 'The thing you were doing'}</p>
          </div>
          {!due && <span className="bti-time" aria-live="polite">{fmt(active.firesAt - now)}</span>}
        </div>
        <div className="pr-actions">
          {due ? (
            <>
              <button className="qp-btn qp-btn-primary" onClick={() => finish('started')}>Started</button>
              {!active.snoozed && <button className="qp-btn qp-btn-ghost" onClick={snooze}>Snooze 5 (once)</button>}
            </>
          ) : (
            <>
              <button className="qp-btn qp-btn-primary" onClick={() => finish('started')}>Started early</button>
              <button className="qp-btn qp-btn-ghost" onClick={() => finish('missed')}>Cancel</button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (asking) {
    return (
      <div className="bti">
        <label className="pr-label" htmlFor="bti-task">What was I doing? <span>(optional)</span></label>
        <input
          id="bti-task" className="qp-input" value={task} autoFocus placeholder="Reply to the email"
          onChange={(e) => setTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && begin()}
        />
        <div className="pr-actions">
          <button className="qp-btn qp-btn-primary" onClick={begin}>Start 5 minutes</button>
          <button className="qp-btn qp-btn-ghost" onClick={() => setAsking(false)}>Not now</button>
        </div>
        <p className="pr-hint">Alert rings while Serenity is open. Leaving the app? Set a 5-minute phone timer too.</p>
      </div>
    );
  }

  return (
    <button className="qp-btn qp-btn-primary bti-cta" onClick={() => setAsking(true)}>
      <span className="material-symbols-outlined" aria-hidden="true">alarm</span> Back to it
    </button>
  );
}
