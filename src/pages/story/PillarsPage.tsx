import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { getAllPillarWeeks, getPillarWeek, savePillarWeek, type PillarWeek } from '../../data/db';
import { getWeekStart } from '../../data/storyContent';

type Field = 'community' | 'purpose' | 'charity';
const PILLARS: { key: Field; icon: string; title: string; prompt: string }[] = [
  { key: 'community', icon: 'groups', title: 'Community', prompt: 'Who did I connect with this week?' },
  { key: 'purpose', icon: 'explore', title: 'Purpose', prompt: 'What did I do that mattered to me?' },
  { key: 'charity', icon: 'volunteer_activism', title: 'Charity', prompt: 'What did I give — sadaqah, time or kindness?' },
];

export default function PillarsPage() {
  const weekStart = getWeekStart();
  const [form, setForm] = useState({ community: '', purpose: '', charity: '', headline: '' });
  const [weeks, setWeeks] = useState<PillarWeek[]>([]);
  const { toast, showToast } = useToast();

  useEffect(() => {
    getPillarWeek(weekStart).then((w) => w && setForm({ community: w.community, purpose: w.purpose, charity: w.charity, headline: w.headline }));
    getAllPillarWeeks().then(setWeeks);
  }, [weekStart]);

  const save = async () => {
    await savePillarWeek({ weekStart, ...form, createdAt: Date.now() });
    setWeeks(await getAllPillarWeeks());
    showToast('Chapter saved 📖');
  };

  const exportChapters = async () => {
    const text = [...weeks].reverse().filter((w) => w.headline).map((w) => `Week of ${w.weekStart}: ${w.headline}`).join('\n');
    try { await navigator.clipboard.writeText(text); showToast('Chapters copied'); }
    catch { showToast('Copy not available here'); }
  };

  return (
    <>
      <Toast message={toast.message} show={toast.show} />
      <TopBar title="Four Pillars" icon="foundation" />
      <div className="story-page">
        <Link to="/reflect" className="back-link"><span className="material-symbols-outlined">arrow_back</span>Reflect</Link>
        <p className="story-lead">Week of {weekStart}. Write a little or a lot — any entry counts.</p>

        <div className="pillar-grid">
          {PILLARS.map((p) => (
            <div key={p.key} className="card pillar-card">
              <div className="pillar-head"><span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{p.icon}</span>{p.title}</div>
              <label htmlFor={p.key} className="prompt-hint">{p.prompt}</label>
              <textarea id={p.key} className="story-textarea" value={form[p.key]} onChange={(e) => setForm({ ...form, [p.key]: e.target.value })} />
            </div>
          ))}
        </div>

        <div className="card prompt-card">
          <div className="pillar-head"><span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>auto_stories</span>Storytelling</div>
          <label htmlFor="headline" className="prompt-hint">This week's headline, told kindly</label>
          <div className="headline-bar">
            <input id="headline" className="story-input" maxLength={80} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            <button className="btn-primary" onClick={save}>Save week</button>
          </div>
        </div>

        {weeks.length > 0 && (
          <section className="card">
            <div className="step-header">
              <p className="story-section-title"><span className="material-symbols-outlined">menu_book</span>Chapters</p>
              <button className="btn-ghost" onClick={exportChapters}>Export</button>
            </div>
            <div className="chapter-list">
              {weeks.map((w) => (
                <div key={w.id} className="chapter">
                  <span className="chapter-week">{w.weekStart}</span>
                  <div className="chapter-headline">
                    {w.headline || <em style={{ opacity: 0.6 }}>No headline</em>}
                    <div className="chapter-dots" aria-label="Pillars with an entry">
                      {[w.community, w.purpose, w.charity, w.headline].map((v, i) => <span key={i} className={`chapter-dot${v.trim() ? ' on' : ''}`} />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
