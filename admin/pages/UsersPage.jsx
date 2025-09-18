import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatDate } from '../utils/format.js';

const NEW_CUSTOMER = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  status: 'active'
};

const NEW_PARTNER = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  commissionRate: 10,
  accessEnabled: true,
  notes: ''
};

export default function UsersPage() {
  const { request } = useApi();
  const [customers, setCustomers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  const [newCustomer, setNewCustomer] = useState(NEW_CUSTOMER);
  const [newPartner, setNewPartner] = useState(NEW_PARTNER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [customerRes, partnerRes, contactRes, partnerReqRes, newsletterRes] = await Promise.all([
          request('/api/admin/customers'),
          request('/api/admin/partners'),
          request('/api/admin/requests/contact'),
          request('/api/admin/requests/partners'),
          request('/api/admin/newsletter')
        ]);
        if (!active) return;
        setCustomers(customerRes);
        setPartners(partnerRes);
        setContactRequests(contactRes);
        setPartnerRequests(partnerReqRes);
        setNewsletter(newsletterRes);
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

  const handleCustomerChange = (id, field, value) => {
    setCustomers((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handlePartnerChange = (id, field, value) => {
    setPartners((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSaveCustomer = async (customer) => {
    try {
      const payload = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status
      };
      const updated = await request(`/api/admin/customers/${customer.id}`, { method: 'PUT', body: payload });
      setCustomers((items) => items.map((item) => (item.id === customer.id ? updated : item)));
      showMessage('Kundendaten gespeichert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCustomer = async (event) => {
    event.preventDefault();
    try {
      const created = await request('/api/admin/customers', { method: 'POST', body: newCustomer });
      setCustomers((items) => [created, ...items]);
      setNewCustomer(NEW_CUSTOMER);
      showMessage('Neuer Kunde angelegt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (id) => {
    const password = window.prompt('Neues Passwort für diesen Kunden setzen:');
    if (!password) return;
    try {
      await request(`/api/admin/customers/${id}/reset-password`, { method: 'POST', body: { password } });
      showMessage('Passwort aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSavePartner = async (partner) => {
    try {
      const payload = {
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
        phone: partner.phone,
        commissionRate: partner.commissionRate ? Number(partner.commissionRate) : 0,
        accessEnabled: Boolean(partner.accessEnabled),
        notes: partner.notes
      };
      const updated = await request(`/api/admin/partners/${partner.id}`, { method: 'PUT', body: payload });
      setPartners((items) => items.map((item) => (item.id === partner.id ? updated : item)));
      showMessage('Partner aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreatePartner = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...newPartner,
        commissionRate: newPartner.commissionRate ? Number(newPartner.commissionRate) : 0,
        accessEnabled: Boolean(newPartner.accessEnabled)
      };
      const created = await request('/api/admin/partners', { method: 'POST', body: payload });
      setPartners((items) => [created, ...items]);
      setNewPartner(NEW_PARTNER);
      showMessage('Partnerprofil erstellt.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingScreen message="Daten werden geladen …" />;
  }

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  return (
    <div className="users-page">
      {message && <InlineAlert type={message.type} message={message.text} />}
      <SectionCard title="Kunden" description="Buchungshistorie und Login-Verwaltung">
        {customers.length === 0 ? (
          <p className="empty-state">Noch keine Kunden angelegt.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Status</th>
                <th>Buchungen</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <input
                      value={customer.firstName || ''}
                      onChange={(event) => handleCustomerChange(customer.id, 'firstName', event.target.value)}
                      placeholder="Vorname"
                    />
                    <input
                      value={customer.lastName || ''}
                      onChange={(event) => handleCustomerChange(customer.id, 'lastName', event.target.value)}
                      placeholder="Nachname"
                    />
                  </td>
                  <td>
                    <input value={customer.email} onChange={(event) => handleCustomerChange(customer.id, 'email', event.target.value)} />
                  </td>
                  <td>
                    <input value={customer.phone || ''} onChange={(event) => handleCustomerChange(customer.id, 'phone', event.target.value)} />
                  </td>
                  <td>
                    <select value={customer.status} onChange={(event) => handleCustomerChange(customer.id, 'status', event.target.value)}>
                      <option value="active">Aktiv</option>
                      <option value="inactive">Inaktiv</option>
                    </select>
                  </td>
                  <td>{customer.bookingCount}</td>
                  <td className="table-actions">
                    <button type="button" className="btn btn-small" onClick={() => handleSaveCustomer(customer)}>
                      Speichern
                    </button>
                    <button type="button" className="btn btn-link" onClick={() => handleResetPassword(customer.id)}>
                      Passwort zurücksetzen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form className="inline-form" onSubmit={handleCreateCustomer}>
          <input
            placeholder="Vorname"
            value={newCustomer.firstName}
            onChange={(event) => setNewCustomer((prev) => ({ ...prev, firstName: event.target.value }))}
            required
          />
          <input
            placeholder="Nachname"
            value={newCustomer.lastName}
            onChange={(event) => setNewCustomer((prev) => ({ ...prev, lastName: event.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="E-Mail"
            value={newCustomer.email}
            onChange={(event) => setNewCustomer((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            placeholder="Telefon"
            value={newCustomer.phone}
            onChange={(event) => setNewCustomer((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <input
            placeholder="Initiales Passwort"
            value={newCustomer.password}
            onChange={(event) => setNewCustomer((prev) => ({ ...prev, password: event.target.value }))}
          />
          <button type="submit" className="btn btn-primary">
            Kunde hinzufügen
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Partneragenturen" description="Provisionen und Zugänge steuern">
        {partners.length === 0 ? (
          <p className="empty-state">Noch keine Partner hinterlegt.</p>
        ) : (
          partners.map((partner) => (
            <details key={partner.id} className="collapsible" open>
              <summary>
                <strong>{partner.companyName}</strong>
                <span className="collapsible-meta">{partner.email} · Provision {partner.commissionRate}%</span>
              </summary>
              <div className="collapsible-body">
                <div className="form-grid">
                  <label className="full-width">
                    <span>Firmenname</span>
                    <input
                      value={partner.companyName}
                      onChange={(event) => handlePartnerChange(partner.id, 'companyName', event.target.value)}
                    />
                  </label>
                  <label className="full-width">
                    <span>Ansprechpartner</span>
                    <input
                      value={partner.contactName || ''}
                      onChange={(event) => handlePartnerChange(partner.id, 'contactName', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>E-Mail</span>
                    <input
                      value={partner.email || ''}
                      onChange={(event) => handlePartnerChange(partner.id, 'email', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Telefon</span>
                    <input
                      value={partner.phone || ''}
                      onChange={(event) => handlePartnerChange(partner.id, 'phone', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Provision (%)</span>
                    <input
                      type="number"
                      value={partner.commissionRate ?? 0}
                      onChange={(event) => handlePartnerChange(partner.id, 'commissionRate', event.target.value)}
                    />
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(partner.accessEnabled)}
                      onChange={(event) => handlePartnerChange(partner.id, 'accessEnabled', event.target.checked)}
                    />
                    <span className="toggle-indicator"></span>
                    <span>Zugang aktiv</span>
                  </label>
                  <label className="full-width">
                    <span>Notizen</span>
                    <textarea
                      value={partner.notes || ''}
                      onChange={(event) => handlePartnerChange(partner.id, 'notes', event.target.value)}
                    ></textarea>
                  </label>
                </div>
                <div className="collapsible-actions">
                  <button type="button" className="btn" onClick={() => handleSavePartner(partner)}>
                    Speichern
                  </button>
                </div>
              </div>
            </details>
          ))
        )}

        <form className="form-grid" onSubmit={handleCreatePartner}>
          <h3>Neuer Partner</h3>
          <label className="full-width">
            <span>Firmenname</span>
            <input value={newPartner.companyName} onChange={(event) => setNewPartner((prev) => ({ ...prev, companyName: event.target.value }))} required />
          </label>
          <label className="full-width">
            <span>Ansprechpartner</span>
            <input value={newPartner.contactName} onChange={(event) => setNewPartner((prev) => ({ ...prev, contactName: event.target.value }))} />
          </label>
          <label>
            <span>E-Mail</span>
            <input value={newPartner.email} onChange={(event) => setNewPartner((prev) => ({ ...prev, email: event.target.value }))} />
          </label>
          <label>
            <span>Telefon</span>
            <input value={newPartner.phone} onChange={(event) => setNewPartner((prev) => ({ ...prev, phone: event.target.value }))} />
          </label>
          <label>
            <span>Provision (%)</span>
            <input
              type="number"
              value={newPartner.commissionRate}
              onChange={(event) => setNewPartner((prev) => ({ ...prev, commissionRate: event.target.value }))}
            />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={newPartner.accessEnabled}
              onChange={(event) => setNewPartner((prev) => ({ ...prev, accessEnabled: event.target.checked }))}
            />
            <span className="toggle-indicator"></span>
            <span>Zugang aktiv</span>
          </label>
          <label className="full-width">
            <span>Notizen</span>
            <textarea value={newPartner.notes} onChange={(event) => setNewPartner((prev) => ({ ...prev, notes: event.target.value }))}></textarea>
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary">
              Partner hinzufügen
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Kontaktanfragen"
        description="Lead-Verlauf aus dem Kontaktformular"
        actions={<span>{contactRequests.length} Anfragen</span>}
      >
        {contactRequests.length === 0 ? (
          <p className="empty-state">Keine neuen Kontaktanfragen.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Nachricht</th>
                <th>Eingang</th>
              </tr>
            </thead>
            <tbody>
              {contactRequests.map((request) => (
                <tr key={request.id}>
                  <td>{`${request.firstName || ''} ${request.lastName || ''}`.trim()}</td>
                  <td>{request.email}</td>
                  <td>{request.phone}</td>
                  <td>{request.message}</td>
                  <td>{formatDate(request.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      <SectionCard
        title="Partneranfragen"
        description="Agentur Leads via B2B Formular"
        actions={<span>{partnerRequests.length} offen</span>}
      >
        {partnerRequests.length === 0 ? (
          <p className="empty-state">Keine Partneranfragen.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Unternehmen</th>
                <th>Kontakt</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Nachricht</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {partnerRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.companyName}</td>
                  <td>{request.contactName}</td>
                  <td>{request.email}</td>
                  <td>{request.phone}</td>
                  <td>{request.message}</td>
                  <td>{formatDate(request.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      <SectionCard title="Newsletter" description="Opt-ins aus dem Portal">
        {newsletter.length === 0 ? (
          <p className="empty-state">Noch keine Newsletter-Abonnenten.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>E-Mail</th>
                <th>Name</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {newsletter.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.email}</td>
                  <td>{entry.firstName}</td>
                  <td>{formatDate(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
