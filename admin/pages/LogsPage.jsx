import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatDate } from '../utils/format.js';

export default function LogsPage() {
  const { request } = useApi();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request('/api/admin/logs');
        if (!active) return;
        setLogs(response);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);

  if (loading) {
    return <LoadingScreen message="Aktivitätsprotokoll wird geladen …" />;
  }

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  return (
    <div className="logs-page">
      <SectionCard title="Admin-Aktivitäten" description="Protokoll der letzten Änderungen">
        {logs.length === 0 ? (
          <p className="empty-state">Noch keine Aktivitäten dokumentiert.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Benutzer</th>
                <th>Aktion</th>
                <th>Bereich</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.createdAt)}</td>
                  <td>{log.adminName || 'System'}</td>
                  <td>{log.action}</td>
                  <td>{log.entity || '—'}</td>
                  <td>
                    {log.details ? (
                      <pre className="log-details">{typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}</pre>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
