import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { db, type DistractionReset, type Judgment, type PracticeSession, type QuickReframe } from '../../data/db';
import PracticeFlow from './PracticeFlow';
import BackToIt from './BackToIt';
import { FOOD_UNLOCK, JUDGMENT_TAGS, nowMs, streak, today } from './presentUtils';
import '../../present.css';

type Row = 'observe' | 'body' | 'judge' | 'reframe' | 'reset';

const SEED: QuickReframe = {
  happened: 'Jackhammers on the house for two days for foundation work.',
  reframe: 'The landlord paid to fix the foundation, so for the rest of the lease we will have no structural issues and every door will work.',
  createdAt: 0,
  date: '',
};

export default function PresentPage() {
  const [params, setParams] = useSearchParams();
  const resetFromShortcut = params.get('reset') === '1';
  const [open, setOpen] = useState<Row | null>(resetFromShortcut ? 'reset' : null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [resets, setResets] = useState<DistractionReset[]>([]);
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [reframes, setReframes] = useState<QuickReframe[]>([]);
  const [happened, setHappened] = useState('');
  const [reframe, setReframe] = useState('');
  const { toast, showToast } = useToast();

  const load = useCallback(async () => {
    const [s, r, j, q] = await Promise.all([
      db.practiceSessions.toArray(),
      db.distractionResets.toArray(),
      db.judgments.toArray(),
      db.quickReframes.orderBy('createdAt').reverse().toArray(),
    ]);
    setSessions(s); setResets(r); setJudgments(j); setReframes(q);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async Dexie load
    load();
    if (resetFromShortcut) { params.delete('reset'); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = today();
  const stats = useMemo(() => {
    const todayS = sessions.filter((s) => s.date === t);
    const observe = todayS.filter((s) => s.type !== 'body').length;
    const body = todayS.filter((s) => s.type === 'body').length;
    const todayR = resets.filter((r) => r.date === t && r.outcome !== 'pending');
    const started = todayR.filter((r) => r.outcome === 'started').length;
    const objectCount = sessions.filter((s) => s.type === 'object').length;
    return {
      observe, body,
      resets: todayR.length,
      startedPct: todayR.length ? Math.round((started / todayR.length) * 100) : null,
      judged: judgments.filter((j) => j.date === t).length,
      reframed: reframes.filter((r) => r.date === t).length,
      streak: streak(sessions.filter((s) => s.type !== 'body').map((s) => s.date)),
      foodUnlocked: objectCount >= FOOD_UNLOCK,
      objectCount,
    };
  }, [sessions, resets, judgments, reframes, t]);

  const weekTags = useMemo(() => {
    const since = nowMs() - 7 * 864e5;
    const counts: Record<string, number> = {};
    judgments.filter((j) => j.createdAt >= since).forEach((j) => { counts[j.tag] = (counts[j.tag] ?? 0) + 1; });
    const max = Math.max(1, ...Object.values(counts));
    return JUDGMENT_TAGS.map((tag) => ({ tag, n: counts[tag] ?? 0, w: ((counts[tag] ?? 0) / max) * 100 }));
  }, [judgments]);

  const toggle = (r: Row) => setOpen((o) => (o === r ? null : r));

  const catchOne = async (tag: string) => {
    await db.judgments.add({ tag, createdAt: nowMs(), date: today() });
    showToast("Noticed. That's the practice.");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async Dexie load
    load();
  };

  const saveReframe = async () => {
    if (!happened.trim() || !reframe.trim()) return;
    await db.quickReframes.add({ happened: happened.trim(), reframe: reframe.trim(), createdAt: nowMs(), date: today() });
    setHappened(''); setReframe('');
    showToast('Reframed.');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async Dexie load
    load();
  };

  const practiceDone = (label: string) => () => { showToast(label); setOpen(null); load(); };

  const rows: { id: Row; title: string; meta: string; body: React.ReactNode }[] = [
    {
      id: 'observe',
      title: 'Observe an object.',
      meta: `${stats.observe}/3 today`,
      body: <PracticeFlow kind="observe" foodUnlocked={stats.foodUnlocked} onDone={practiceDone('Session saved.')} />,
    },
    {
      id: 'body',
      title: 'Feel one body part.',
      meta: `${stats.body} today`,
      body: <PracticeFlow kind="body" foodUnlocked={false} onDone={practiceDone('Session saved.')} />,
    },
    {
      id: 'reset',
      title: 'Back to it.',
      meta: stats.resets ? `${stats.resets} today${stats.startedPct !== null ? ` · ${stats.startedPct}% started` : ''}` : 'When distracted',
      body: (
        <div className="pr-form">
          <p className="pr-lede">Got pulled away? Set five minutes. When it rings, do the thing — right away.</p>
          <BackToIt autoStart={resetFromShortcut} onChange={load} />
        </div>
      ),
    },
    {
      id: 'judge',
      title: 'Catch a judgment.',
      meta: `${stats.judged} noticed today`,
      body: (
        <div className="pr-form">
          <p className="pr-lede">About yourself, your cooking, how you did something. Noticing it is the win.</p>
          <div className="qp-chips">
            {JUDGMENT_TAGS.map((tag) => <button key={tag} className="qp-chip" onClick={() => catchOne(tag)}>{tag}</button>)}
          </div>
          <div className="pr-bars" aria-label="Judgments noticed this week, by area">
            <span className="pr-label">This week</span>
            {weekTags.map((b) => (
              <div key={b.tag} className="pr-bar-row">
                <span>{b.tag}</span>
                <div className="pr-bar"><i style={{ width: `${b.w}%` }} /></div>
                <span className="pr-bar-n">{b.n}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'reframe',
      title: 'Reframe it.',
      meta: `${reframes.length} saved`,
      body: (
        <div className="pr-form">
          <label className="pr-label" htmlFor="rf-what">What happened</label>
          <textarea id="rf-what" className="qp-input qp-textarea" value={happened} onChange={(e) => setHappened(e.target.value)} placeholder="Just the facts" />
          <label className="pr-label" htmlFor="rf-new">Reframe</label>
          <textarea id="rf-new" className="qp-input qp-textarea" value={reframe} onChange={(e) => setReframe(e.target.value)} placeholder="What's the good in it?" />
          <div className="pr-actions">
            <button className="qp-btn qp-btn-primary" disabled={!happened.trim() || !reframe.trim()} onClick={saveReframe}>Save reframe</button>
          </div>
          <div className="pr-journal">
            {(reframes.length ? reframes : [SEED]).slice(0, 10).map((r, i) => (
              <div key={r.id ?? `seed-${i}`} className="pr-pair">
                <p className="pr-before">{r.happened}</p>
                <p className="pr-after">{r.reframe}</p>
                {!r.id && <span className="pr-hint">Example</span>}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Toast message={toast.message} show={toast.show} />
      <TopBar title="Present" icon="self_improvement" />
      <div className="pr-page">
        <header className="pr-hero animate-fade-up">
          <h1 className="pr-h1">Be here. <span>No judgment.</span></h1>
          <p className="pr-lede">Happiness is existing in the moment. One minute at a time.</p>
        </header>

        <section className="pr-stats" aria-label="Today">
          <div className="pr-stat">
            <span className="pr-stat-label">Observe</span>
            <span className="pr-dots" aria-label={`${stats.observe} of 3`}>
              {[0, 1, 2].map((i) => <i key={i} className={i < stats.observe ? 'on' : ''} />)}
            </span>
          </div>
          <div className="pr-stat"><span className="pr-stat-label">Streak</span><span className="pr-stat-n">{stats.streak}d</span></div>
          <div className="pr-stat"><span className="pr-stat-label">Noticed</span><span className="pr-stat-n">{stats.judged}</span></div>
          <div className="pr-stat"><span className="pr-stat-label">Resets</span><span className="pr-stat-n">{stats.resets}</span></div>
        </section>

        <section className="pr-spine">
          {rows.map((r, i) => (
            <div key={r.id} className={`pr-row${open === r.id ? ' open' : ''}`}>
              <button className="pr-row-head" aria-expanded={open === r.id} onClick={() => toggle(r.id)}>
                <span className="pr-row-n">0{i + 1}</span>
                <span className="pr-row-title">{r.title}</span>
                <span className="pr-row-meta">{r.meta}</span>
                <span className="material-symbols-outlined pr-row-chev" aria-hidden="true">expand_more</span>
              </button>
              {open === r.id && <div className="pr-row-body">{r.body}</div>}
            </div>
          ))}
        </section>

        {!stats.foodUnlocked && (
          <p className="pr-foot">{FOOD_UNLOCK - stats.objectCount} more object sessions until food is suggested.</p>
        )}
      </div>
    </>
  );
}
