import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import BoxBreathing from '../components/BoxBreathing';
import EmotionalCheckIn from '../components/EmotionalCheckIn';
import AffirmationsCopingModal from '../components/AffirmationsCopingModal';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { EMERGENCY_TOOLS } from '../data/emergencyTools';

type ActiveModal = 'breathe' | 'checkin' | 'affirmations' | null;

const MODULES = [
  {
    id: 'breathe' as const,
    title: 'Box Breathing',
    blurb: '4-4-6 cycle \u00b7 10 reps to reset your nervous system',
    icon: 'air',
  },
  {
    id: 'checkin' as const,
    title: 'Emotional Check-in',
    blurb: 'Log your mood and anxiety level in the moment',
    icon: 'favorite',
  },
  {
    id: 'affirmations' as const,
    title: 'Affirmations & Coping',
    blurb: '101 affirmations \u00b7 26 coping skills to choose from',
    icon: 'auto_awesome',
  },
];

export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOpen = searchParams.get('open');
  const [activeModal, setActiveModal] = useState<ActiveModal>(
    initialOpen === 'breathe' || initialOpen === 'checkin' || initialOpen === 'affirmations' ? initialOpen : null
  );
  const [expandedEmergencyId, setExpandedEmergencyId] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (initialOpen) {
      searchParams.delete('open');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <Toast message={toast.message} show={toast.show} />
      <TopBar title="Tools" icon="spa" />

      <div className="page-content">
        {/* ── Module grid ── */}
        <section className="animate-fade-up">
          <div className="section-header">
            <span className="material-symbols-outlined">grid_view</span>
            <h3 className="section-title">Interactive Modules</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {MODULES.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModal(mod.id)}
                className="card"
                style={{
                  textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  gap: '0.75rem', minHeight: 44,
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{mod.icon}</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '16px', color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>{mod.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>{mod.blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Emergency Reset ── */}
        <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <span className="material-symbols-outlined">emergency</span>
            <h3 className="section-title">Emergency Reset</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', margin: '0 0.25rem 0.75rem' }}>
            Use these the moment a panic attack or high-stress moment hits.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {EMERGENCY_TOOLS.map((tool) => {
              const expanded = expandedEmergencyId === tool.id;
              return (
                <div key={tool.id} className="card" style={{ padding: '1.25rem', cursor: 'pointer' }}
                  onClick={() => setExpandedEmergencyId(expanded ? null : tool.id)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandedEmergencyId(expanded ? null : tool.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined">{tool.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, color: 'var(--color-on-surface)' }}>{tool.title}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>{tool.subtitle}</p>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s var(--ease-standard)' }}>
                      expand_more
                    </span>
                  </div>

                  {expanded && (
                    <div style={{ marginTop: '1rem', paddingLeft: '3.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <ol style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {tool.steps.map((step, i) => (
                          <li key={i} style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>{step}</li>
                        ))}
                      </ol>
                      <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        {tool.why}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {activeModal === 'breathe' && (
        <Modal title="Box Breathing" icon="air" onClose={closeModal} maxWidth={480}>
          <BoxBreathing onSessionComplete={() => showToast('Session logged \ud83c\udf3f')} onClose={closeModal} />
        </Modal>
      )}

      {activeModal === 'checkin' && (
        <Modal title="Emotional Check-in" icon="favorite" onClose={closeModal} maxWidth={480}>
          <EmotionalCheckIn onSaved={() => { closeModal(); showToast('Check-in saved \u2713'); }} />
        </Modal>
      )}

      {activeModal === 'affirmations' && (
        <Modal title="Affirmations & Coping" icon="auto_awesome" onClose={closeModal} maxWidth={560}>
          <AffirmationsCopingModal />
        </Modal>
      )}
    </>
  );
}
