import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function TopBar({ branding }) {
  const { user, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <div className="topbar-branding">
          <span className="topbar-title">{branding?.brandName || 'Monotours24 Admin'}</span>
          {branding?.tagline && <span className="topbar-tagline">{branding.tagline}</span>}
        </div>
        <div className="topbar-status">
          <span className="status-indicator" aria-hidden="true"></span>
          <span>Sicher verbunden</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="user-info" aria-label="Angemeldeter Benutzer">
          <div className="user-avatar" aria-hidden="true">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-role">{user?.role ? user.role.toUpperCase() : 'ADMIN'}</span>
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Abmelden
        </button>
      </div>
    </header>
  );
}
