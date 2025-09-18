import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const EMPTY_DEAL = {
  title: '',
  destination: '',
  description: '',
  price: '',
  nights: '',
  imageUrl: '',
  endDate: '',
  perksText: '',
  isHot: true
};

export default function OffersPage() {
  const { request } = useApi();
  const [deals, setDeals] = useState([]);
  const [newDeal, setNewDeal] = useState(EMPTY_DEAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request('/api/admin/deals');
        if (!active) return;
        setDeals(response.map((deal) => ({ ...deal, perksText: (deal.perks || []).join('\n') })));
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

  const handleDealChange = (id, field, value) => {
    setDeals((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSaveDeal = async (deal) => {
    try {
      const payload = {
        title: deal.title,
        destination: deal.destination,
        description: deal.description,
        price: deal.price ? Number(deal.price) : null,
        nights: deal.nights ? Number(deal.nights) : null,
        imageUrl: deal.imageUrl,
        endDate: deal.endDate || null,
        perks: deal.perksText
          ? deal.perksText
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        isHot: Boolean(deal.isHot)
      };
      const updated = await request(`/api/admin/deals/${deal.id}`, { method: 'PUT', body: payload });
      setDeals((items) => items.map((item) => (item.id === deal.id ? { ...updated, perksText: (updated.perks || []).join('\n') } : item)));
      showMessage('Angebot gespeichert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDeal = async (id) => {
    try {
      await request(`/api/admin/deals/${id}`, { method: 'DELETE' });
      setDeals((items) => items.filter((item) => item.id !== id));
      showMessage('Angebot entfernt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateDeal = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        title: newDeal.title,
        destination: newDeal.destination,
        description: newDeal.description,
        price: newDeal.price ? Number(newDeal.price) : null,
        nights: newDeal.nights ? Number(newDeal.nights) : null,
        imageUrl: newDeal.imageUrl,
        endDate: newDeal.endDate || null,
        perks: newDeal.perksText
          ? newDeal.perksText
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        isHot: Boolean(newDeal.isHot)
      };
      const created = await request('/api/admin/deals', { method: 'POST', body: payload });
      setDeals((items) => [{ ...created, perksText: (created.perks || []).join('\n') }, ...items]);
      setNewDeal(EMPTY_DEAL);
      showMessage('Neues Angebot angelegt.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingScreen message="Angebote werden geladen …" />;
  }

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  return (
    <div className="offers-page">
      {message && <InlineAlert type={message.type} message={message.text} />}
      <SectionCard
        title="Hot Deals & Last Minute"
        description="Sonderangebote mit Countdown und Highlights"
        footer={<small>Der Countdown orientiert sich am Enddatum. Angebote lassen sich als Last Minute markieren.</small>}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Angebot</th>
              <th>Ziel</th>
              <th>Preis</th>
              <th>Nächte</th>
              <th>Enddatum</th>
              <th>Hot</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id}>
                <td>
                  <input value={deal.title} onChange={(event) => handleDealChange(deal.id, 'title', event.target.value)} />
                  <textarea
                    value={deal.description || ''}
                    onChange={(event) => handleDealChange(deal.id, 'description', event.target.value)}
                    className="table-textarea"
                  ></textarea>
                </td>
                <td>
                  <input value={deal.destination || ''} onChange={(event) => handleDealChange(deal.id, 'destination', event.target.value)} />
                </td>
                <td>
                  <input
                    type="number"
                    value={deal.price ?? ''}
                    onChange={(event) => handleDealChange(deal.id, 'price', event.target.value)}
                  />
                  <div className="table-meta">{formatCurrency(deal.price)}</div>
                </td>
                <td>
                  <input
                    type="number"
                    value={deal.nights ?? ''}
                    onChange={(event) => handleDealChange(deal.id, 'nights', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={deal.endDate ? deal.endDate.substring(0, 10) : ''}
                    onChange={(event) => handleDealChange(deal.id, 'endDate', event.target.value)}
                  />
                  <div className="table-meta">{deal.endDate ? formatDate(deal.endDate) : '—'}</div>
                </td>
                <td>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(deal.isHot)}
                      onChange={(event) => handleDealChange(deal.id, 'isHot', event.target.checked)}
                    />
                    <span className="toggle-indicator"></span>
                  </label>
                </td>
                <td className="table-actions">
                  <button type="button" className="btn btn-small" onClick={() => handleSaveDeal(deal)}>
                    Speichern
                  </button>
                  <button type="button" className="btn btn-link" onClick={() => handleDeleteDeal(deal.id)}>
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="deal-details">
          {deals.map((deal) => (
            <details key={`perks-${deal.id}`} className="collapsible">
              <summary>
                <strong>{deal.title}</strong>
                <span className="collapsible-meta">Highlights</span>
              </summary>
              <textarea
                value={deal.perksText || ''}
                onChange={(event) => handleDealChange(deal.id, 'perksText', event.target.value)}
                className="table-textarea"
                placeholder={'Vorteil 1\nVorteil 2'}
              ></textarea>
            </details>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Neues Angebot" description="Schnelles Anlegen eines weiteren Deals">
        <form className="form-grid" onSubmit={handleCreateDeal}>
          <label className="full-width">
            <span>Titel</span>
            <input value={newDeal.title} onChange={(event) => setNewDeal((prev) => ({ ...prev, title: event.target.value }))} required />
          </label>
          <label>
            <span>Destination</span>
            <input value={newDeal.destination} onChange={(event) => setNewDeal((prev) => ({ ...prev, destination: event.target.value }))} />
          </label>
          <label>
            <span>Preis (EUR)</span>
            <input
              type="number"
              value={newDeal.price}
              onChange={(event) => setNewDeal((prev) => ({ ...prev, price: event.target.value }))}
            />
          </label>
          <label>
            <span>Nächte</span>
            <input
              type="number"
              value={newDeal.nights}
              onChange={(event) => setNewDeal((prev) => ({ ...prev, nights: event.target.value }))}
            />
          </label>
          <label className="full-width">
            <span>Beschreibung</span>
            <textarea
              value={newDeal.description}
              onChange={(event) => setNewDeal((prev) => ({ ...prev, description: event.target.value }))}
            ></textarea>
          </label>
          <label className="full-width">
            <span>Bild-URL</span>
            <input value={newDeal.imageUrl} onChange={(event) => setNewDeal((prev) => ({ ...prev, imageUrl: event.target.value }))} />
          </label>
          <label>
            <span>Enddatum</span>
            <input
              type="date"
              value={newDeal.endDate}
              onChange={(event) => setNewDeal((prev) => ({ ...prev, endDate: event.target.value }))}
            />
          </label>
          <label className="full-width">
            <span>Highlights</span>
            <textarea
              placeholder={'Vorteil 1\nVorteil 2'}
              value={newDeal.perksText}
              onChange={(event) => setNewDeal((prev) => ({ ...prev, perksText: event.target.value }))}
            ></textarea>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={newDeal.isHot}
              onChange={(event) => setNewDeal((prev) => ({ ...prev, isHot: event.target.checked }))}
            />
            <span className="toggle-indicator"></span>
            <span>Als Hot Deal markieren</span>
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary">
              Angebot speichern
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
