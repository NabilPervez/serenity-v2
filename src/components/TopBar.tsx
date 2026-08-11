interface TopBarProps {
  title: string;
  icon: string;
  right?: React.ReactNode;
}

/** Shared top bar used on every main page. */
export default function TopBar({ title, icon, right }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-title">
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.3rem' }}>
          {icon}
        </span>
        {title}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{right}</div>}
    </header>
  );
}
