import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAppStore, getTodayDateString } from '../store/useAppStore';
import { CHECKLIST_TASKS, TASKS_BY_PHASE, PHASE_META, type Phase } from '../data/checklist';
import { getChecklistDay, saveChecklistDay } from '../data/db';
import Modal from '../components/Modal';
import EmotionalCheckIn from '../components/EmotionalCheckIn';
import '../present.css';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const PHASES: Phase[] = ['morning', 'afternoon', 'evening'];

/** Current phase by clock — shown first and open; the rest collapse (Nabil, 2026-11-03). */
function currentPhase(): Phase {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

export default function ChecklistPage() {
  const { currentStreak, updateStreak } = useAppStore();
  const { toast, showToast } = useToast();

  const [completed, setCompleted] = useState<string[]>([]);
  const [dayId, setDayId] = useState<number | undefined>(undefined);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [nowPhase] = useState<Phase>(currentPhase);
  const [openPhases, setOpenPhases] = useState<Phase[]>(() => [currentPhase()]);
  const [checkIn, setCheckIn] = useState(false);
  const orderedPhases = [nowPhase, ...PHASES.filter((p) => p !== nowPhase)];
  const togglePhase = (p: Phase) => setOpenPhases((o) => (o.includes(p) ? o.filter((x) => x !== p) : [...o, p]));
  const today = getTodayDateString();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  useEffect(() => {
    getChecklistDay(today).then((existing) => {
      if (existing) {
        setCompleted(existing.completedTaskIds);
        setDayId(existing.id);
      }
    });
  }, [today]);

  const persist = useCallback((next: string[]) => {
    saveChecklistDay({ date: today, completedTaskIds: next }, dayId).then((id) => {
      if (!dayId) setDayId(id);
    });
  }, [today, dayId]);

  const toggleTask = (id: string) => {
    const isChecking = !completed.includes(id);
    const next = isChecking ? [...completed, id] : completed.filter((t) => t !== id);
    setCompleted(next);
    persist(next);
    if (isChecking) showToast('Nice work \u2713');
  };

  const totalTasks = CHECKLIST_TASKS.length;
  const completedCount = completed.length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;


  return (
    <>
      <Toast message={toast.message} show={toast.show} />

      <TopBar
        title="Today"
        icon="fact_check"
        right={
          currentStreak > 0 ? (
            <div className="streak-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_fire_department</span>
              {currentStreak} day streak
            </div>
          ) : undefined
        }
      />

      <div className="page-content">
        <header className="pr-hero animate-fade-up" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <h1 className="pr-h1">{getGreeting()}. <span>{progressPct === 100 ? 'All done today.' : 'One step at a time.'}</span></h1>
            <p className="pr-lede">{completedCount} of {totalTasks} steps done today.</p>
          </div>
          <div className="progress-ring-container" style={{ width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="36" cy="36" r="32" fill="transparent" stroke="var(--hairline)" strokeWidth="3" />
              <circle cx="36" cy="36" r="32" fill="transparent" stroke="var(--sage-600)" strokeWidth="3"
                strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - progressPct / 100)} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.9s var(--ease-standard)' }} />
            </svg>
            <span className="progress-ring-text" style={{ fontSize: '14px' }}>{progressPct}%</span>
          </div>
        </header>

        <nav className="today-actions" aria-label="Quick actions">
          <button className="today-action" onClick={() => setCheckIn(true)}>
            <span className="material-symbols-outlined" aria-hidden="true">favorite</span>Check in
          </button>
          <Link className="today-action" to="/practice?open=breathe">
            <span className="material-symbols-outlined" aria-hidden="true">air</span>Breathe
          </Link>
          <Link className="today-action" to="/practice?reset=1">
            <span className="material-symbols-outlined" aria-hidden="true">alarm</span>Back to it
          </Link>
          <Link className="today-action" to="/practice">
            <span className="material-symbols-outlined" aria-hidden="true">self_improvement</span>Be present
          </Link>
        </nav>

        {orderedPhases.map((phase, phaseIdx) => {
          const tasks = TASKS_BY_PHASE[phase];
          const meta = PHASE_META[phase];
          const phaseCompleted = tasks.filter((t) => completed.includes(t.id)).length;
          const phaseOpen = openPhases.includes(phase);

          return (
            <section key={phase} className="animate-fade-up" style={{ animationDelay: `${0.05 + phaseIdx * 0.05}s` }}>
              <button className="section-header phase-head" aria-expanded={phaseOpen} onClick={() => togglePhase(phase)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined">{meta.icon}</span>
                  <div>
                    <h3 className="section-title" style={{ marginBottom: 0 }}>
                      {meta.label}{phase === nowPhase && <span className="phase-now">Now</span>}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>{meta.subtitle}</p>
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-outline)' }}>
                  {phaseCompleted}/{tasks.length}
                  <span className="material-symbols-outlined pr-row-chev" style={{ transform: phaseOpen ? 'rotate(180deg)' : 'none', marginLeft: 8 }} aria-hidden="true">expand_more</span>
                </span>
              </button>

              {phaseOpen && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {tasks.map((task) => {
                  const checked = completed.includes(task.id);
                  const expanded = expandedTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      className={`coping-card${checked ? ' checked' : ''}`}
                      style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0, cursor: 'default' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
                        onClick={() => setExpandedTaskId(expanded ? null : task.id)}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setExpandedTaskId(expanded ? null : task.id)}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ minWidth: 24, minHeight: 24 }}
                          aria-label={task.title}
                        />
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px', marginTop: 2 }}>{task.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p className="coping-title" style={{ fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: '0.125rem' }}>{task.title}</p>
                          <p style={{ fontSize: '13px', color: 'var(--color-outline)' }}>{task.frequency}</p>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', fontSize: '18px', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s var(--ease-standard)' }}>
                          expand_more
                        </span>
                      </div>

                      {expanded && (
                        <div style={{ padding: '0 0.25rem 0.75rem 3.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                            <strong style={{ color: 'var(--color-on-surface)' }}>What to do: </strong>{task.whatToDo}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: 1.6, fontStyle: 'italic' }}>
                            <strong style={{ color: 'var(--color-on-surface)', fontStyle: 'normal' }}>Why: </strong>{task.whyWeDoIt}
                          </p>
                          {task.toolLink && (
                            <Link
                              to={task.toolLink}
                              style={{
                                alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                                background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)',
                                textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginTop: '0.25rem',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                              Open in Practice
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>}
            </section>
          );
        })}
      </div>

      {checkIn && (
        <Modal title="Emotional Check-in" icon="favorite" onClose={() => setCheckIn(false)} maxWidth={480}>
          <EmotionalCheckIn onSaved={() => { setCheckIn(false); showToast('Check-in saved.'); }} />
        </Modal>
      )}
    </>
  );
}
