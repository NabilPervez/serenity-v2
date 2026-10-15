import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { addReframe, getAllReframes, type Reframe } from '../../data/db';
import { MERCY_VERSES, pickBySeed } from '../../data/storyContent';
import { getTodayDateString } from '../../store/useAppStore';

const TAGS = ['Effort', 'Emotions', 'Outlook'];

function Slider({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="slider-row">
      <input type="range" min={1} max={10} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="slider-value">{value}</span>
    </div>
  );
}

export default function ReframePage() {
  const [step, setStep] = useState(0);
  const [oldStory, setOldStory] = useState('');
  const [before, setBefore] = useState(7);
  const [tags, setTags] = useState<string[]>([]);
  const [myPart, setMyPart] = useState('');
  const [allahsPart, setAllahsPart] = useState('');
  const [newStory, setNewStory] = useState('');
  const [after, setAfter] = useState(5);
  const [history, setHistory] = useState<Reframe[]>([]);
  const { toast, showToast } = useToast();

  const verse = useMemo(() => pickBySeed(MERCY_VERSES, oldStory + getTodayDateString()), [oldStory]);

  useEffect(() => { getAllReframes().then(setHistory); }, []);

  const canNext = [oldStory.trim(), myPart.trim(), allahsPart.trim(), newStory.trim()][step].length > 0;

  const reset = () => {
    setStep(0); setOldStory(''); setBefore(7); setTags([]); setMyPart(''); setAllahsPart(''); setNewStory(''); setAfter(5);
  };

  const save = async () => {
    await addReframe({
      timestamp: Date.now(), date: getTodayDateString(), oldStory, intensityBefore: before,
      myPartTags: tags, myPart, allahsPart, newStory, intensityAfter: after, verseId: verse.id,
    });
    setHistory(await getAllReframes());
    reset();
    showToast('A kinder story, saved 🌿');
  };

  return (
    <>
      <Toast message={toast.message} show={toast.show} />
      <TopBar title="Reframe" icon="edit_note" />
      <div className="story-page">
        <Link to="/story" className="back-link"><span className="material-symbols-outlined">arrow_back</span>Story</Link>

        <div className="step-header">
          <div className="step-dots" aria-label={`Step ${step + 1} of 4`}>
            {[0, 1, 2, 3].map((i) => <span key={i} className={`step-dot${i <= step ? ' on' : ''}`} />)}
          </div>
          {step > 0 && <button className="btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
        </div>

        <div className="card prompt-card">
          {step === 0 && (<>
            <label htmlFor="old">The old story</label>
            <p className="prompt-hint">Write the harsh thought exactly as it sounds in your head.</p>
            <textarea id="old" className="story-textarea" value={oldStory} onChange={(e) => setOldStory(e.target.value)} />
            <p className="prompt-hint">How heavy does it feel?</p>
            <Slider value={before} onChange={setBefore} label="Intensity before" />
          </>)}
          {step === 1 && (<>
            <label htmlFor="mine">My part</label>
            <p className="prompt-hint">What was in my control here? What did I actually do or try?</p>
            <div className="tag-row">
              {TAGS.map((t) => (
                <button key={t} type="button" className={`tag-chip${tags.includes(t) ? ' on' : ''}`} aria-pressed={tags.includes(t)}
                  onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>
              ))}
            </div>
            <textarea id="mine" className="story-textarea" value={myPart} onChange={(e) => setMyPart(e.target.value)} />
          </>)}
          {step === 2 && (<>
            <label htmlFor="allah">Allah's part</label>
            <p className="prompt-hint">What was never mine to control?</p>
            <textarea id="allah" className="story-textarea" value={allahsPart} onChange={(e) => setAllahsPart(e.target.value)} />
          </>)}
          {step === 3 && (<>
            <label htmlFor="new">The new story</label>
            <p className="prompt-hint">Retell it the way a merciful voice would.</p>
            <textarea id="new" className="story-textarea" value={newStory} onChange={(e) => setNewStory(e.target.value)} />
            <p className="prompt-hint">How heavy does it feel now?</p>
            <Slider value={after} onChange={setAfter} label="Intensity after" />
          </>)}
        </div>

        {step === 3 && (
          <div className="card verse-card">
            <p className="verse-text">“{verse.text}”</p>
            <p className="verse-ref">{verse.ref}</p>
          </div>
        )}

        <div className="step-actions">
          {step < 3
            ? <button className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>
            : <button className="btn-primary" disabled={!canNext} onClick={save}>Save my new story</button>}
        </div>

        {history.length > 0 && (
          <section className="story-list">
            <p className="story-section-title"><span className="material-symbols-outlined">history</span>Kinder stories</p>
            {history.map((r) => (
              <div key={r.id} className="card story-list" style={{ gap: '0.5rem' }}>
                <div className="story-meta"><span>{r.date}</span><span>{r.intensityBefore} → {r.intensityAfter}</span></div>
                <div className="story-pair">
                  <div className="story-old"><span className="story-label">Old story</span>{r.oldStory}</div>
                  <div className="story-new"><span className="story-label">New story</span>{r.newStory}</div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
