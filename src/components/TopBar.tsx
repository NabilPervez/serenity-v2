import { Link, useLocation } from 'react-router-dom';

interface TopBarProps {
  title: string;
  icon: string;
  right?: React.ReactNode;
}

/** Shared top bar. SOS is always one tap away (Nabil, 2026-11-03). */
export default function TopBar({ title, icon, right }: TopBarProps) {
  const { pathname } = useLocation();
  return (
    <header className="top-bar">
      <div className="top-bar-title">
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>
          {icon}
        </span>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {right}
        {pathname !== '/sos' && (
          <Link to="/sos" className="sos-link" aria-label="SOS: emergency reset">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">emergency</span>SOS
          </Link>
        )}
      </div>
    </header>
  );
}
