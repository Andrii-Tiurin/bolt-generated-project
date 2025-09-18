import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Layout() {
  const { branding } = useAuth();

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-shell__main">
        <TopBar branding={branding} />
        <main className="admin-content" id="admin-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
