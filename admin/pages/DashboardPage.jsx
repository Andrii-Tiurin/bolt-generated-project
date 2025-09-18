import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard.jsx';
import SectionCard from '../components/SectionCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export default function DashboardPage() {
  const { request } = useApi();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request('/api/admin/dashboard');
        if (active) {
          setData(response);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  if (!data) {
    return <LoadingScreen message="Dashboard wird geladen …" />;
  }

  const { totals, revenue, upcoming, latestLogs } = data;

  return (
    <div className="dashboard-grid">
      <div className="stat-grid">
        <StatCard title="Buchungen gesamt" value={totals.bookings} icon="📦" />
        <StatCard title="Offene Buchungen" value={totals.openBookings} icon="🕒" trend={{ type: 'warning', label: 'Follow-up nötig' }} />
        <StatCard title="Partner" value={totals.partners} icon="🤝" />
        <StatCard title="Kunden" value={totals.customers} icon="👥" />
        <StatCard title="Hot Deals" value={totals.hotDeals} icon="🔥" />
        <StatCard title="Veröff. Beiträge" value={totals.publishedPosts} icon="📰" />
        <StatCard
          title="Bestätigtes Volumen"
          value={formatCurrency(revenue)}
          icon="💶"
          trend={{ type: 'success', label: 'Aktualisiert heute' }}
        />
      </div>

      <SectionCard
        title="Anstehende Reisen"
        description="Reisen mit Reisebeginn in den nächsten Wochen"
        actions={<span className="section-hint">Automatische Erinnerung 7 Tage vorher</span>}
      >
        {upcoming.length === 0 ? (
          <p className="empty-state">Aktuell stehen keine Reisen an.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Buchung</th>
                <th>Status</th>
                <th>Reisedatum</th>
                <th>Betrag</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((item) => (
                <tr key={item.bookingReference}>
                  <td>{item.bookingReference}</td>
                  <td>
                    <span className={`badge badge--${statusToBadge(item.status)}`}>{item.status}</span>
                  </td>
                  <td>{formatDate(item.travelDate)}</td>
                  <td>{formatCurrency(item.amount, item.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      <SectionCard title="Letzte Aktivitäten" description="Änderungen im Admin-Panel der letzten Stunden">
        {latestLogs.length === 0 ? (
          <p className="empty-state">Noch keine Aktivitäten erfasst.</p>
        ) : (
          <ul className="activity-list">
            {latestLogs.map((log) => (
              <li key={log.id}>
                <div>
                  <strong>{log.adminName || 'System'}</strong>
                  <span className="activity-action">{log.action}</span>
                  {log.entity && <span className="activity-entity">{log.entity}</span>}
                </div>
                <div className="activity-meta">
                  <span>{formatDate(log.createdAt)}</span>
                  {log.details && <span className="activity-details">{summarizeDetails(log.details)}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function statusToBadge(status) {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('offen')) return 'warning';
  if (normalized.includes('bestätigt') || normalized.includes('abgeschlossen')) return 'success';
  if (normalized.includes('storniert')) return 'danger';
  return 'neutral';
}

function summarizeDetails(details) {
  if (typeof details === 'string') return details;
  try {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' · ');
  } catch (error) {
    return null;
  }
}
