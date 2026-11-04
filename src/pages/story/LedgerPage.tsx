import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import BoxBreathing from '../../components/BoxBreathing';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { getAllEffortNights, getEffortNight, saveEffortNight, type EffortNight } from '../../data/db';
import { DUAS, pickBySeed } from '../../data/storyContent';
import { getTodayDateString } from '../../store/useAppStore';

export default function LedgerPage() {
  const today = getTodayDateString();
  const dua = pickBySeed(DUAS, today);
  const [entries, setEntries] = useState<string[]>(['']);
  const [handedOver, setHandedOver] = useState('');
  const [past, setPast] = useState<EffortNight[]>([]);
  const [breathing, setBreathing] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    getEffortNight(today).then((n) => {
      if (n) { setEntries(n.entries.length ? n.entries : ['']); setHandedOver(n.handedOver); }
    });
    getAllEffortNights().then(setPast);
  }, [today]);

  const setEntry = (i: number, v: string) => setEntries(entries.map((e, j) => (j === i ? v : e)));
  const filled = entries.filter((e) => e.trim());

  const save = async () => {
    await saveEffortNight({ date: today, entries: filled, handedOver, duaId: dua.id, createdAt: Date.now() });
    setPast(await getAllEffortNights());
    showToast('You showed up today ✓');
  };

  return (
    <>
      <Toast message={toast.message} show={toast.show} />
      <TopBar title="Effort Ledger" icon="nightlight" />
      <div className="story-page">
        <Link to="/reflect" className="back-link"><span className="material-symbols-outlined">arrow_back</span>Reflect</Link>
        <p className="story-lead">Efforts, not outcomes. One is enough.</p>

        <div className="card prompt-card">
          <label>Today I made an effort to…</label>
          {entries.map((e, i) => (
            <div key={i} className="effort-row">
              <span className="effort-badge">{i + 1}</span>
              <input className="story-input" value={e} aria-label={`Effort ${i + 1}`} onChange={(ev) => setEntry(i, ev.target.value)} />
              {entries.length > 1 && (
                <button className="icon-btn" aria-label="Remove" onClick={() => setEntries(entries.filter((_, j) => j !== i))}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          ))}
          {entries.length < 3 && (
            <button className="btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setEntries([...entries, ''])}>+ Add another</button>
          )}
        </div>

        <div className="card handover-card">
          <label htmlFor="handover" className="story-section-title">I hand this over to Allah</label>
          <textarea id="handover" className="story-textarea" style={{ minHeight: 80 }} value={handedOver} onChange={(e) => setHandedOver(e.target.value)} />
        </div>

        <div className="card dua-card">
          <p className="dua-arabic" dir="rtl" lang="ar">{dua.arabic}</p>
          <p className="dua-translit">{dua.transliteration}</p>
          <p className="dua-meaning">{dua.meaning}</p>
          <p className="verse-ref">{dua.ref}</p>
        </div>

        <div className="step-actions">
          <button className="btn-ghost" onClick={() => setBreathing(true)}>Breathe</button>
          <button className="btn-primary" disabled={filled.length === 0} onClick={save}>Save tonight</button>
        </div>

        {past.length > 0 && (
          <section className="card">
            <p className="story-section-title"><span className="material-symbols-outlined">history</span>Past nights</p>
            {past.map((n) => (
              <div key={n.id} className="past-row"><span>{n.date}</span><span>{n.entries[0]}</span></div>
            ))}
          </section>
        )}
      </div>

      {breathing && (
        <Modal title="Box Breathing" icon="air" onClose={() => setBreathing(false)} maxWidth={480}>
          <BoxBreathing onClose={() => setBreathing(false)} />
        </Modal>
      )}
    </>
  );
}
