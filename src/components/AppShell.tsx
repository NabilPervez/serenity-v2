import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/checklist', icon: 'fact_check', label: 'Checklist' },
  { to: '/tools', icon: 'spa', label: 'Tools' },
  { to: '/analytics', icon: 'monitoring', label: 'Analytics' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <nav className="nav-drawer">
        <div className="nav-brand">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>spa</span>
          Serenity
        </div>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
