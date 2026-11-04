import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { db, type QuickReframe } from '../../data/db';
import { today, nowMs } from '../present/presentUtils';
import '../../present.css';

const SEED: QuickReframe = {
  happened: 'Jackhammers on the house for two days for foundation work.',
  reframe: 'The landlord paid to fix the foundation, so for the rest of the lease we will have no structural issues and every door will work.',
  createdAt: 0,
  date: '',
};

/** Reflect › Quick reframe — two fields, one minute. The guided version is Reflect › Reframe. */
export default function QuickReframePage() {
  const [items, setItems] = useState<QuickReframe[]>([]);
  const [happened, setHappened] = useState('');
  const [reframe, setReframe] = useState('');
  const { toast, showToast } = useToast();

  const load = useCallback(async () => {
    setItems(await db.quickReframes.orderBy('createdAt').reverse().toArray());
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- async Dexie load
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!happened.trim() || !reframe.trim()) return;
    await db.quickReframes.add({ happened: happened.trim(), reframe: reframe.trim(), createdAt: nowMs(), date: today() });
    setHappened(''); setReframe('');
    showToast('Reframed.');
    load();
  };

  return (
    <>
      <Toast message={toast.message} show={toast.show} />
      <TopBar title="Reflect" icon="auto_stories" />
      <div className="pr-page">
        <Link to="/reflect" className="back-link"><span className="material-symbols-outlined">arrow_back</span>Reflect</Link>
        <header className="pr-hero">
          <h1 className="pr-h1">Reframe it. <span>Find the good.</span></h1>
          <p className="pr-lede">Write what happened, just the facts. Then the version that helps you.</p>
        </header>
        <div className="pr-form">
          <label className="pr-label" htmlFor="rf-what">What happened</label>
          <textarea id="rf-what" className="qp-input qp-textarea" value={happened} onChange={(e) => setHappened(e.target.value)} placeholder="Just the facts" />
          <label className="pr-label" htmlFor="rf-new">Reframe</label>
          <textarea id="rf-new" className="qp-input qp-textarea" value={reframe} onChange={(e) => setReframe(e.target.value)} placeholder="What's the good in it?" />
          <div className="pr-actions">
            <button className="qp-btn qp-btn-primary" disabled={!happened.trim() || !reframe.trim()} onClick={save}>Save reframe</button>
          </div>
        </div>
        <section className="pr-journal" aria-label="Saved reframes">
          {(items.length ? items : [SEED]).map((r, i) => (
            <div key={r.id ?? `seed-${i}`} className="pr-pair">
              <p className="pr-before">{r.happened}</p>
              <p className="pr-after">{r.reframe}</p>
              {!r.id && <span className="pr-hint">Example</span>}
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
