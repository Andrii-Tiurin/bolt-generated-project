import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/content', label: 'Inhalte', icon: '📰' },
  { to: '/offers', label: 'Hot Deals', icon: '🔥' },
  { to: '/products', label: 'Produkte', icon: '🧳' },
  { to: '/users', label: 'Kunden & Partner', icon: '👥' },
  { to: '/bookings', label: 'Buchungen', icon: '📑' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️' },
  { to: '/logs', label: 'Aktivitäten', icon: '📜' }
];

export default function Sidebar() {
  const { branding } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
      <div className="sidebar-brand">
        {branding?.logoUrl ? (
          <img src={branding.logoUrl} alt={branding.brandName || 'Monotours24'} className="sidebar-logo" />
        ) : (
          <span className="sidebar-fallback">✈️</span>
        )}
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">{branding?.brandName || 'Monotours24'}</span>
          {branding?.tagline && <span className="sidebar-brand-tagline">{branding.tagline}</span>}
        </div>
        <button type="button" className="sidebar-toggle" onClick={() => setOpen((state) => !state)} aria-label="Navigation umschalten">
          ☰
        </button>
      </div>
      <nav className="sidebar-nav" aria-label="Admin Navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <span className="sidebar-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
