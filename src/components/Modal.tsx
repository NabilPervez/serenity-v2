import { useEffect } from 'react';

interface ModalProps {
  title: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ title, icon, onClose, children, maxWidth = 560 }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(28, 28, 24, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          background: 'var(--color-surface)',
          width: '100%',
          maxWidth,
          maxHeight: '85vh',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -16px 48px rgba(28,28,24,0.2)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-outline-variant)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.1rem' }}>
            {icon && <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{icon}</span>}
            {title}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 40, height: 40, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', border: 'none', background: 'var(--color-surface-container)', cursor: 'pointer',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
