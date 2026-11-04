import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { db, type DistractionReset, type Judgment, type PracticeSession } from '../../data/db';
import PracticeFlow from './PracticeFlow';
import BackToIt from './BackToIt';
import Modal from '../../components/Modal';
import BoxBreathing from '../../components/BoxBreathing';
import AffirmationsCopingModal from '../../components/AffirmationsCopingModal';
import { FOOD_UNLOCK, JUDGMENT_TAGS, nowMs, streak, today } from './presentUtils';
import '../../present.css';

type Row = 'observe' | 'body' | 'judge' | 'reset' | 'breathe' | 'affirm';

/**
 * Practice — every "do it now" exercise in one spine (Nabil, 2026-11-03).
 * Merges the old Present tab with the Tools modules (Box Breathing, Affirmations & Coping).
 */
export default function PracticePage() {
  const [params, setParams] = useSearchParams();
  const resetFromShortcut = params.get('reset') === '1';
  const openParam = params.get('open');
  const [open, setOpen] = useState<Row | null>(resetFromShortcut ? 'reset' : null);
  const [modal, setModal] = useState<'breathe' | 'affirm' | null>(
    openParam === 'breathe' ? 'breathe' : openParam === 'affirmations' ? 'affirm' : null
  );
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [resets, setResets] = useState<DistractionReset[]>([]);
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const { toast, showToast } = useToast();

  const load = useCallback(async () => {
    const [s, r, j] = await Promise.all([
      db.practiceSessions.toArray(),
      db.distractionResets.toArray(),
      db.judgments.toArray(),
    ]);
    setSessions(s); setResets(r); setJudgments(j);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async Dexie load
    load();
    if (resetFromShortcut || openParam) { params.delete('reset'); params.delete('open'); setParams(params, { replace: true }); }
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
      streak: streak(sessions.filter((s) => s.type !== 'body').map((s) => s.date)),
      foodUnlocked: objectCount >= FOOD_UNLOCK,
      objectCount,
    };
  }, [sessions, resets, judgments, t]);

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
      id: 'breathe',
      title: 'Box breathing.',
      meta: '4-4-6 · 10 reps',
      body: (
        <div className="pr-form">
          <p className="pr-lede">Reset your nervous system in about three minutes.</p>
          <div className="pr-actions"><button className="qp-btn qp-btn-primary" onClick={() => setModal('breathe')}>Start breathing</button></div>
        </div>
      ),
    },
    {
      id: 'affirm',
      title: 'Affirm and cope.',
      meta: '101 · 26 skills',
      body: (
        <div className="pr-form">
          <p className="pr-lede">Pick an affirmation or a coping skill for this moment.</p>
          <div className="pr-actions"><button className="qp-btn qp-btn-primary" onClick={() => setModal('affirm')}>Open library</button></div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Toast message={toast.message} show={toast.show} />
      <TopBar title="Practice" icon="self_improvement" />
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

        {modal === 'breathe' && (
          <Modal title="Box Breathing" icon="air" onClose={() => setModal(null)} maxWidth={480}>
            <BoxBreathing onSessionComplete={() => showToast('Session logged.')} onClose={() => setModal(null)} />
          </Modal>
        )}
        {modal === 'affirm' && (
          <Modal title="Affirmations & Coping" icon="auto_awesome" onClose={() => setModal(null)} maxWidth={560}>
            <AffirmationsCopingModal />
          </Modal>
        )}

        {!stats.foodUnlocked && (
          <p className="pr-foot">{FOOD_UNLOCK - stats.objectCount} more object sessions until food is suggested.</p>
        )}
      </div>
    </>
  );
}
