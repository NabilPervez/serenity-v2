import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/today', icon: 'today', label: 'Today' },
  { to: '/practice', icon: 'self_improvement', label: 'Practice' },
  { to: '/reflect', icon: 'auto_stories', label: 'Reflect' },
  { to: '/progress', icon: 'monitoring', label: 'Progress' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <nav className="nav-drawer">
        <div className="nav-brand">
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>spa</span>
          Serenity
        </div>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
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
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
