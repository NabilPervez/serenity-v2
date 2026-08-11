import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAppStore, getTodayDateString } from '../store/useAppStore';
import { CHECKLIST_TASKS, TASKS_BY_PHASE, PHASE_META, type Phase } from '../data/checklist';
import { getChecklistDay, saveChecklistDay } from '../data/db';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const PHASES: Phase[] = ['morning', 'afternoon', 'evening'];

export default function ChecklistPage() {
  const { currentStreak, updateStreak } = useAppStore();
  const { toast, showToast } = useToast();

  const [completed, setCompleted] = useState<string[]>([]);
  const [dayId, setDayId] = useState<number | undefined>(undefined);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
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

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference - (progressPct / 100) * circumference;

  return (
    <>
      <Toast message={toast.message} show={toast.show} />

      <TopBar
        title={`${getGreeting()}`}
        icon="fact_check"
        right={
          currentStreak > 0 ? (
            <div className="streak-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>local_fire_department</span>
              {currentStreak} day streak
            </div>
          ) : undefined
        }
      />

      <div className="page-content">
        {/* Overall progress */}
        <section className="card animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-16px', top: '-16px', width: '128px', height: '128px', background: 'rgba(156, 175, 136, 0.08)', borderRadius: '50%', filter: 'blur(24px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-on-surface)', marginBottom: '0.375rem' }}>
              Today's Action Plan
            </h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
              {progressPct === 100 ? '\ud83c\udf89 Every step complete — well done today.' : progressPct > 50 ? "You're more than halfway there." : "Let's reset your nervous system, step by step."}
            </p>
          </div>
          <div className="progress-ring-container" style={{ width: 88, height: 88, flexShrink: 0 }}>
            <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="44" cy="44" r={radius} fill="transparent" stroke="var(--color-surface-container-high)" strokeWidth="8" />
              <circle
                cx="44" cy="44" r={radius} fill="transparent"
                stroke="var(--color-primary-container)" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={strokeDash} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s var(--ease-standard)' }}
              />
            </svg>
            <span className="progress-ring-text" style={{ fontSize: '1.05rem' }}>{progressPct}%</span>
          </div>
        </section>

        {PHASES.map((phase, phaseIdx) => {
          const tasks = TASKS_BY_PHASE[phase];
          const meta = PHASE_META[phase];
          const phaseCompleted = tasks.filter((t) => completed.includes(t.id)).length;

          return (
            <section key={phase} className="animate-fade-up" style={{ animationDelay: `${0.05 + phaseIdx * 0.05}s` }}>
              <div className="section-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined">{meta.icon}</span>
                  <div>
                    <h3 className="section-title" style={{ marginBottom: 0 }}>{meta.label}</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)' }}>{meta.subtitle}</p>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-outline)' }}>
                  {phaseCompleted}/{tasks.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
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
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.3rem', marginTop: 2 }}>{task.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p className="coping-title" style={{ fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.125rem' }}>{task.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)' }}>{task.frequency}</p>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', fontSize: '1.2rem', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s var(--ease-standard)' }}>
                          expand_more
                        </span>
                      </div>

                      {expanded && (
                        <div style={{ padding: '0 0.25rem 0.75rem 3.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                            <strong style={{ color: 'var(--color-on-surface)' }}>What to do: </strong>{task.whatToDo}
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.6, fontStyle: 'italic' }}>
                            <strong style={{ color: 'var(--color-on-surface)', fontStyle: 'normal' }}>Why: </strong>{task.whyWeDoIt}
                          </p>
                          {task.toolLink && (
                            <Link
                              to={task.toolLink}
                              style={{
                                alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                                background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)',
                                textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                              Open in Tools
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
