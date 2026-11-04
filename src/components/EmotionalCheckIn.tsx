import { useState } from 'react';
import { MOODS } from '../data/constants';
import { addCheckIn } from '../data/db';
import { getTodayDateString } from '../store/useAppStore';

interface EmotionalCheckInProps {
  onSaved: () => void;
}

export default function EmotionalCheckIn({ onSaved }: EmotionalCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[number] | null>(null);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectMood = (mood: typeof MOODS[number]) => {
    setSelectedMood(mood);
    setAnxietyLevel(mood.defaultAnxietyLevel);
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);
    await addCheckIn({
      timestamp: Date.now(),
      date: getTodayDateString(),
      mood: selectedMood.label,
      moodIcon: selectedMood.icon,
      anxietyLevel,
      notes: notes.trim(),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          How are you feeling right now?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              className={`mood-chip ${selectedMood?.label === mood.label ? 'selected' : 'idle'}`}
              onClick={() => selectMood(mood)}
              style={{ minHeight: 44 }}
            >
              <span>{mood.icon}</span>{mood.label}
            </button>
          ))}
        </div>
      </div>

      {selectedMood && (
        <>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Anxiety Level
              </p>
              <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{anxietyLevel}/10</span>
            </div>
            <input
              type="range" min={1} max={10} value={anxietyLevel}
              onChange={(e) => setAnxietyLevel(Number(e.target.value))}
              aria-label="Anxiety level"
            />
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Notes (optional)
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind?"
            />
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <span className="material-symbols-outlined">check</span>
            {saving ? 'Saving\u2026' : 'Save Check-in'}
          </button>
        </>
      )}
    </div>
  );
}
