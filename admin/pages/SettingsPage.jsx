import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Redaktion' },
  { value: 'support', label: 'Support' }
];

const NEW_ADMIN = {
  name: '',
  email: '',
  password: '',
  role: 'editor'
};

export default function SettingsPage() {
  const { request } = useApi();
  const [settings, setSettings] = useState(null);
  const [seo, setSeo] = useState([]);
  const [legal, setLegal] = useState([]);
  const [payments, setPayments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState(NEW_ADMIN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [settingsRes, seoRes, legalRes, paymentRes, adminRes] = await Promise.all([
          request('/api/admin/settings'),
          request('/api/admin/seo'),
          request('/api/admin/legal'),
          request('/api/admin/payment'),
          request('/api/admin/admin-users')
        ]);
        if (!active) return;
        setSettings(settingsRes);
        setSeo(seoRes);
        setLegal(legalRes);
        setPayments(paymentRes);
        setAdmins(adminRes);
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

  const handleSaveSettings = async (key, value) => {
    try {
      const updated = await request(`/api/admin/settings/${key}`, { method: 'PUT', body: value });
      setSettings((prev) => ({ ...prev, [key]: updated }));
      showMessage('Einstellungen aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const branding = await request('/api/admin/settings/logo', { method: 'POST', body: formData });
      setSettings((prev) => ({ ...prev, branding }));
      showMessage('Logo aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveSeo = async (entry) => {
    try {
      const payload = {
        title: entry.title,
        description: entry.description,
        keywords: entry.keywords?.split(',').map((item) => item.trim()).filter(Boolean) || []
      };
      const updated = await request(`/api/admin/seo/${entry.page}`, { method: 'PUT', body: payload });
      setSeo((items) => items.map((item) => (item.page === entry.page ? { ...updated, keywords: payload.keywords } : item)));
      showMessage('SEO-Daten gespeichert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveLegal = async (entry) => {
    try {
      const updated = await request(`/api/admin/legal/${entry.slug}`, {
        method: 'PUT',
        body: { title: entry.title, content: entry.content }
      });
      setLegal((items) => items.map((item) => (item.slug === entry.slug ? updated : item)));
      showMessage('Rechtstext aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSavePayment = async (gateway) => {
    try {
      const payload = {
        enabled: Boolean(gateway.enabled),
        config: gateway.config
      };
      const updated = await request(`/api/admin/payment/${gateway.code}`, { method: 'PUT', body: payload });
      setPayments((items) => items.map((item) => (item.code === gateway.code ? { ...updated, config: payload.config } : item)));
      showMessage('Zahlungsoption gespeichert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveAdmin = async (admin) => {
    try {
      const payload = {
        name: admin.name,
        role: admin.role,
        status: admin.status
      };
      const updated = await request(`/api/admin/admin-users/${admin.id}`, { method: 'PUT', body: payload });
      setAdmins((items) => items.map((item) => (item.id === admin.id ? updated : item)));
      showMessage('Admin aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...newAdmin };
      if (!payload.password) {
        delete payload.password;
      }
      const created = await request('/api/admin/admin-users', { method: 'POST', body: payload });
      setAdmins((items) => [created, ...items]);
      setNewAdmin(NEW_ADMIN);
      showMessage('Neues Admin-Profil erstellt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePaymentConfigChange = (code, key, value) => {
    setPayments((items) =>
      items.map((item) =>
        item.code === code ? { ...item, config: { ...(item.config || {}), [key]: value } } : item
      )
    );
  };

  if (loading) {
    return <LoadingScreen message="Einstellungen werden geladen …" />;
  }

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  const branding = settings?.branding || {};
  const theme = settings?.theme || {};
  const multilingual = settings?.multilingual || { defaultLocale: 'de', availableLocales: ['de'], englishEnabled: false };

  return (
    <div className="settings-page">
      {message && <InlineAlert type={message.type} message={message.text} />}

      <SectionCard title="Branding" description="Logo, Claim und Unternehmensfarben">
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.target;
            const value = {
              brandName: form.brandName.value,
              tagline: form.tagline.value,
              logoUrl: branding.logoUrl || '',
              logoUpdatedAt: branding.logoUpdatedAt || null
            };
            handleSaveSettings('branding', value);
          }}
        >
          <label className="full-width">
            <span>Markenname</span>
            <input name="brandName" defaultValue={branding.brandName || ''} />
          </label>
          <label className="full-width">
            <span>Claim</span>
            <input name="tagline" defaultValue={branding.tagline || ''} />
          </label>
          <label className="full-width">
            <span>Aktuelles Logo</span>
            {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo" className="logo-preview" /> : <p>Kein Logo hinterlegt</p>}
          </label>
          <label className="full-width">
            <span>Logo austauschen</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary">
              Branding speichern
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Designsystem" description="Farben und Typografie">
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.target;
            const value = {
              primaryColor: form.primaryColor.value,
              secondaryColor: form.secondaryColor.value,
              accentColor: form.accentColor.value,
              neutralColor: form.neutralColor.value,
              fontHeading: form.fontHeading.value,
              fontBody: form.fontBody.value,
              buttonShape: form.buttonShape.value
            };
            handleSaveSettings('theme', value);
          }}
        >
          <label>
            <span>Primärfarbe</span>
            <input type="color" name="primaryColor" defaultValue={theme.primaryColor || '#0a6cff'} />
          </label>
          <label>
            <span>Sekundärfarbe</span>
            <input type="color" name="secondaryColor" defaultValue={theme.secondaryColor || '#06b6d4'} />
          </label>
          <label>
            <span>Akzent</span>
            <input type="color" name="accentColor" defaultValue={theme.accentColor || '#f97316'} />
          </label>
          <label>
            <span>Neutral</span>
            <input type="color" name="neutralColor" defaultValue={theme.neutralColor || '#0f172a'} />
          </label>
          <label>
            <span>Schrift Headlines</span>
            <input name="fontHeading" defaultValue={theme.fontHeading || 'Montserrat'} />
          </label>
          <label>
            <span>Schrift Fließtext</span>
            <input name="fontBody" defaultValue={theme.fontBody || 'Poppins'} />
          </label>
          <label>
            <span>Button-Form</span>
            <select name="buttonShape" defaultValue={theme.buttonShape || 'rounded'}>
              <option value="rounded">Abgerundet</option>
              <option value="pill">Pill</option>
              <option value="square">Eckig</option>
            </select>
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="btn">
              Design speichern
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Sprachen" description="Mehrsprachigkeit steuern">
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.target;
            const value = {
              defaultLocale: form.defaultLocale.value,
              availableLocales: form.availableLocales.value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
              englishEnabled: form.englishEnabled.checked
            };
            handleSaveSettings('multilingual', value);
          }}
        >
          <label>
            <span>Standardsprache</span>
            <input name="defaultLocale" defaultValue={multilingual.defaultLocale || 'de'} />
          </label>
          <label className="full-width">
            <span>Verfügbare Sprachen (Kommagetrennt)</span>
            <input
              name="availableLocales"
              defaultValue={(multilingual.availableLocales || ['de']).join(', ')}
            />
          </label>
          <label className="toggle">
            <input name="englishEnabled" type="checkbox" defaultChecked={Boolean(multilingual.englishEnabled)} />
            <span className="toggle-indicator"></span>
            <span>Englische Version aktivieren</span>
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="btn">
              Sprachoptionen speichern
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="SEO" description="Metadaten pro Seite">
        {seo.map((entry) => (
          <form
            key={entry.page}
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.target;
              const updated = {
                page: entry.page,
                title: form.title.value,
                description: form.description.value,
                keywords: form.keywords.value
              };
              handleSaveSeo(updated);
            }}
          >
            <h3>{entry.page}</h3>
            <label className="full-width">
              <span>Titel</span>
              <input name="title" defaultValue={entry.title || ''} />
            </label>
            <label className="full-width">
              <span>Beschreibung</span>
              <textarea name="description" defaultValue={entry.description || ''}></textarea>
            </label>
            <label className="full-width">
              <span>Keywords</span>
              <input name="keywords" defaultValue={Array.isArray(entry.keywords) ? entry.keywords.join(', ') : ''} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-small">
                Speichern
              </button>
            </div>
          </form>
        ))}
      </SectionCard>

      <SectionCard title="Rechtliche Seiten" description="Impressum, Datenschutz & Cookies">
        {legal.map((entry) => (
          <form
            key={entry.slug}
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.target;
              handleSaveLegal({ slug: entry.slug, title: form.title.value, content: form.content.value });
            }}
          >
            <h3>{entry.title}</h3>
            <label className="full-width">
              <span>Titel</span>
              <input name="title" defaultValue={entry.title || ''} />
            </label>
            <label className="full-width">
              <span>Inhalt</span>
              <textarea name="content" defaultValue={entry.content || ''} rows={6}></textarea>
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-small">
                Aktualisieren
              </button>
            </div>
          </form>
        ))}
      </SectionCard>

      <SectionCard title="Zahlungsanbieter" description="Checkout-Konfiguration und Aktivierung">
        {payments.map((gateway) => (
          <form
            key={gateway.code}
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              handleSavePayment(gateway);
            }}
          >
            <h3>{gateway.name}</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={Boolean(gateway.enabled)}
                onChange={(event) => setPayments((items) => items.map((item) => (item.code === gateway.code ? { ...item, enabled: event.target.checked ? 1 : 0 } : item)))}
              />
              <span className="toggle-indicator"></span>
              <span>Aktiv</span>
            </label>
            {Object.entries(gateway.config || {}).map(([key, value]) => (
              <label key={key} className="full-width">
                <span>{key}</span>
                <input
                  value={value}
                  onChange={(event) => handlePaymentConfigChange(gateway.code, key, event.target.value)}
                />
              </label>
            ))}
            <div className="form-actions">
              <button type="submit" className="btn btn-small">
                Speichern
              </button>
            </div>
          </form>
        ))}
      </SectionCard>

      <SectionCard title="Admin-Benutzer" description="Zugriffsrechte verwalten">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>
                  <select
                    value={admin.role}
                    onChange={(event) => setAdmins((items) => items.map((item) => (item.id === admin.id ? { ...item, role: event.target.value } : item)))}
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={admin.status}
                    onChange={(event) => setAdmins((items) => items.map((item) => (item.id === admin.id ? { ...item, status: event.target.value } : item)))}
                  >
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
                </td>
                <td className="table-actions">
                  <button type="button" className="btn btn-small" onClick={() => handleSaveAdmin(admin)}>
                    Aktualisieren
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form className="inline-form" onSubmit={handleCreateAdmin}>
          <input
            placeholder="Name"
            value={newAdmin.name}
            onChange={(event) => setNewAdmin((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="E-Mail"
            value={newAdmin.email}
            onChange={(event) => setNewAdmin((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <select value={newAdmin.role} onChange={(event) => setNewAdmin((prev) => ({ ...prev, role: event.target.value }))}>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <input
            type="password"
            placeholder="Passwort (optional)"
            value={newAdmin.password}
            onChange={(event) => setNewAdmin((prev) => ({ ...prev, password: event.target.value }))}
          />
          <button type="submit" className="btn btn-primary">
            Admin hinzufügen
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
