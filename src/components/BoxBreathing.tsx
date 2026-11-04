import { useState, useEffect, useRef } from 'react';
import { playBreathePhaseSound, playCompletionSound } from '../utils/audio';

// Box breathing: inhale 4s → hold 4s → exhale 5s → rest 4s
const PHASES = [
  { key: 'inhale', label: 'Inhale', seconds: 4, circleScale: 1.15, instruction: 'Breathe in slowly through your nose. Let your belly rise and push out.' },
  { key: 'hold-in', label: 'Hold', seconds: 4, circleScale: 1.15, instruction: 'Rest here at the top of your breath. You are safe in this moment.' },
  { key: 'exhale', label: 'Exhale', seconds: 5, circleScale: 0.88, instruction: 'Breathe out slowly through your mouth. Let your belly fall as tension releases.' },
  { key: 'rest', label: 'Rest', seconds: 4, circleScale: 0.88, instruction: 'Pause gently at the bottom. Notice the stillness.' },
] as const;

const TOTAL_CYCLES = 10;

interface BoxBreathingProps {
  onSessionComplete?: () => void;
  onClose?: () => void;
}

export default function BoxBreathing({ onSessionComplete, onClose }: BoxBreathingProps) {
  const sessionRef = useRef<{ running: boolean; phaseIdx: number; cycle: number; countdown: number }>({
    running: false, phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [display, setDisplay] = useState<{
    status: 'idle' | 'running' | 'paused' | 'complete';
    phaseIdx: number;
    cycle: number;
    countdown: number;
  }>({ status: 'idle', phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds });

  const flush = () => {
    const s = sessionRef.current;
    setDisplay((prev) => ({ ...prev, phaseIdx: s.phaseIdx, cycle: s.cycle, countdown: s.countdown }));
  };

  const stopInterval = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const tick = () => {
    const s = sessionRef.current;
    if (!s.running) return;
    s.countdown -= 1;

    if (s.countdown <= 0) {
      const nextIdx = (s.phaseIdx + 1) % PHASES.length;
      const isNewCycle = nextIdx === 0;

      if (isNewCycle) {
        if (s.cycle >= TOTAL_CYCLES) {
          s.running = false;
          stopInterval();
          playCompletionSound('set');
          setDisplay((prev) => ({ ...prev, status: 'complete' }));
          onSessionComplete?.();
          return;
        }
        playCompletionSound('rep');
        s.cycle += 1;
      }

      s.phaseIdx = nextIdx;
      s.countdown = PHASES[nextIdx].seconds;
      playBreathePhaseSound(PHASES[nextIdx].key);
    }
    flush();
  };

  const handleStart = () => {
    sessionRef.current = { running: true, phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds };
    setDisplay({ status: 'running', phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds });
    stopInterval();
    playBreathePhaseSound(PHASES[0].key);
    intervalRef.current = setInterval(tick, 1000);
  };

  const handlePause = () => {
    sessionRef.current.running = false;
    stopInterval();
    setDisplay((prev) => ({ ...prev, status: 'paused' }));
  };

  const handleResume = () => {
    sessionRef.current.running = true;
    setDisplay((prev) => ({ ...prev, status: 'running' }));
    intervalRef.current = setInterval(tick, 1000);
  };

  const handleStop = () => {
    sessionRef.current.running = false;
    stopInterval();
    setDisplay({ status: 'idle', phaseIdx: 0, cycle: 1, countdown: PHASES[0].seconds });
  };

  useEffect(() => stopInterval, []);

  const { status, phaseIdx, cycle, countdown } = display;
  const phase = PHASES[phaseIdx];
  const nextPhase = PHASES[(phaseIdx + 1) % PHASES.length];
  const isActive = status === 'running' || status === 'paused';

  const circleStyle: React.CSSProperties = {
    width: 220,
    height: 220,
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 24px 48px rgba(44, 61, 48, 0.08)',
    position: 'relative',
    zIndex: 1,
    transition: `transform ${phase.key === 'inhale' ? '4s' : phase.key === 'hold-in' ? '0.3s' : phase.key === 'exhale' ? '5s' : '0.3s'} cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: isActive ? `scale(${phase.circleScale})` : 'scale(1)',
  };

  const phaseColor = phase.key === 'inhale' || phase.key === 'hold-in' ? 'var(--color-primary)' : 'var(--color-secondary)';

  const solidSecondaryBtn: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 2rem',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-surface-container)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-headline)',
    fontWeight: 600,
    fontSize: '16px',
    color: 'var(--color-on-surface-variant)',
  };

  return (
    <div style={{
      background: 'radial-gradient(circle at 50% 40%, rgba(156, 175, 136, 0.08) 0%, var(--color-surface) 70%)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ maxWidth: 380, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '13px', color: 'rgba(68,72,63,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            {status === 'complete' ? 'Session Complete \uD83C\uDF3F' : status === 'idle' ? 'Ready to begin' : status === 'paused' ? 'Paused' : `Cycle ${cycle} of ${TOTAL_CYCLES}`}
          </p>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '32px', fontWeight: 600, color: isActive ? phaseColor : 'var(--color-on-surface)' }}>
            {status === 'complete' ? 'Well done.' : status === 'idle' ? 'Center yourself' : phase.label}
          </h2>
        </div>

        <div className="breathing-circle-wrap">
          <div className="breathing-glow" />
          <div style={circleStyle}>
            <div className="breathing-inner" style={{ borderColor: `${phaseColor}25`, width: 164, height: 164 }}>
              {status === 'idle' ? (
                <><span style={{ fontSize: '32px' }}>{'\ud83c\udf2c\ufe0f'}</span><span style={{ fontSize: '13px', color: 'rgba(68,72,63,0.6)' }}>Let's breathe</span></>
              ) : status === 'complete' ? (
                <><span style={{ fontSize: '32px' }}>{'\ud83c\udf3f'}</span><span style={{ fontSize: '13px', color: 'rgba(68,72,63,0.6)' }}>Beautiful</span></>
              ) : (
                <><span className="breathing-phase-text" style={{ color: phaseColor }}>{phase.label}</span><span className="breathing-count">{countdown}s</span></>
              )}
            </div>
          </div>
          {isActive && (
            <div style={{ position: 'absolute', top: '-40px', right: '-30px', padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(197,200,188,0.2)' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '13px', marginBottom: '0.125rem' }}>Coming next</p>
              <p style={{ fontWeight: 500, color: 'var(--color-on-surface)', fontSize: '13px' }}>{nextPhase.label} {'\u00b7'} {nextPhase.seconds}s</p>
            </div>
          )}
        </div>

        {isActive && (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {PHASES.map((p, i) => (
              <div key={p.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: i === phaseIdx ? 24 : 7, height: 7, borderRadius: 999, background: i === phaseIdx ? phaseColor : 'var(--color-surface-container-high)', transition: 'all 0.3s var(--ease-standard)' }} />
              </div>
            ))}
          </div>
        )}

        <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6, fontSize: '14px', maxWidth: 300 }}>
          {status === 'complete'
            ? 'You completed 10 cycles. Your nervous system has been reset — notice how you feel.'
            : status === 'idle'
              ? 'In for 4 \u00b7 Hold for 4 \u00b7 Out for 5 \u00b7 Rest for 4. Ten cycles for a full reset.'
              : phase.instruction}
        </p>

        {(isActive || status === 'complete') && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(68,72,63,0.45)' }}>Reps</span>
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(68,72,63,0.45)' }}>
                {status === 'complete' ? `${TOTAL_CYCLES}/${TOTAL_CYCLES}` : `${cycle - 1}/${TOTAL_CYCLES}`} done
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {Array.from({ length: TOTAL_CYCLES }).map((_, i) => {
                const completed = status === 'complete' || i < cycle - 1;
                const current = isActive && i === cycle - 1;
                return <div key={i} style={{ flex: 1, height: 7, borderRadius: 999, background: completed ? 'var(--color-primary)' : current ? 'var(--color-primary-container)' : 'var(--color-surface-container-high)', transition: 'background 0.5s var(--ease-standard)' }} />;
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
          {status === 'idle' && (
            <button className="btn-primary" onClick={handleStart}>
              <span className="material-symbols-outlined">play_arrow</span>Begin Session
            </button>
          )}
          {status === 'running' && (
            <>
              <button className="btn-primary" onClick={handlePause}><span className="material-symbols-outlined">pause</span>Pause Session</button>
              <button onClick={handleStop} style={solidSecondaryBtn}>End Session</button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button className="btn-primary" onClick={handleResume}><span className="material-symbols-outlined">play_arrow</span>Resume</button>
              <button onClick={handleStop} style={solidSecondaryBtn}>End Session</button>
            </>
          )}
          {status === 'complete' && (
            <>
              <button className="btn-primary" onClick={handleStart}><span className="material-symbols-outlined">refresh</span>New Session</button>
              {onClose && <button onClick={onClose} style={solidSecondaryBtn}>Close</button>}
            </>
          )}
          {status === 'idle' && onClose && (
            <button onClick={onClose} style={{ ...solidSecondaryBtn, background: 'transparent' }}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
