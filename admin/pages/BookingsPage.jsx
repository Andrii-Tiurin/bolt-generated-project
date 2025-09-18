import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const STATUS_OPTIONS = ['offen', 'bestätigt', 'abgeschlossen', 'storniert'];

export default function BookingsPage() {
  const { request } = useApi();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request('/api/admin/bookings');
        if (!active) return;
        setBookings(response);
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

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleStatusChange = (id, value) => {
    setBookings((items) => items.map((item) => (item.id === id ? { ...item, status: value } : item)));
  };

  const handleSaveBooking = async (booking) => {
    try {
      const updated = await request(`/api/admin/bookings/${booking.id}`, {
        method: 'PUT',
        body: { status: booking.status }
      });
      setBookings((items) => items.map((item) => (item.id === booking.id ? { ...item, ...updated } : item)));
      showMessage('Buchung aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    try {
      const response = await request('/api/admin/bookings/export', { rawResponse: true });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'monotours24-buchungen.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage('Export erstellt.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingScreen message="Buchungen werden geladen …" />;
  }

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  return (
    <div className="bookings-page">
      {message && <InlineAlert type={message.type} message={message.text} />}
      <SectionCard
        title="Buchungsverwaltung"
        description="Statusänderungen werden live an das Portal zurückgespielt"
        actions={
          <button type="button" className="btn" onClick={handleExport}>
            Export als CSV
          </button>
        }
      >
        {bookings.length === 0 ? (
          <p className="empty-state">Keine Buchungen vorhanden.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Referenz</th>
                <th>Kunde</th>
                <th>Partner</th>
                <th>Typ</th>
                <th>Betrag</th>
                <th>Status</th>
                <th>Reisedatum</th>
                <th>Erstellt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.bookingReference}</td>
                  <td>{booking.customerName || '—'}</td>
                  <td>{booking.partnerName || '—'}</td>
                  <td>{booking.productType || '—'}</td>
                  <td>{formatCurrency(booking.amount, booking.currency)}</td>
                  <td>
                    <select value={booking.status} onChange={(event) => handleStatusChange(booking.id, event.target.value)}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{booking.travelDate ? formatDate(booking.travelDate) : '—'}</td>
                  <td>{formatDate(booking.createdAt)}</td>
                  <td className="table-actions">
                    <button type="button" className="btn btn-small" onClick={() => handleSaveBooking(booking)}>
                      Speichern
                    </button>
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
