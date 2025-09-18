import React, { useEffect, useMemo, useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import TabNav from '../components/TabNav.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatDate } from '../utils/format.js';

const TABS = [
  { value: 'navigation', label: 'Navigation' },
  { value: 'hero', label: 'Hero Slider' },
  { value: 'contact', label: 'Kontakt & Footer' },
  { value: 'services', label: 'Services' },
  { value: 'blog', label: 'News & Blog' }
];

const INITIAL_POST = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  status: 'draft',
  tags: '',
  publishedAt: '',
  scheduledAt: ''
};

export default function ContentPage() {
  const { request } = useApi();
  const [tab, setTab] = useState('navigation');
  const [navigation, setNavigation] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [newNav, setNewNav] = useState({ label: '', href: '#', sortOrder: navigation.length + 1, visible: true });
  const [newSlide, setNewSlide] = useState({ title: '', imageUrl: '', ctaLabel: 'Jetzt buchen', ctaLink: '#angebote' });
  const [newPost, setNewPost] = useState(INITIAL_POST);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [navRes, heroRes, postRes, settingsRes] = await Promise.all([
          request('/api/admin/navigation'),
          request('/api/admin/hero-slides'),
          request('/api/admin/posts'),
          request('/api/admin/settings')
        ]);
        if (!active) return;
        setNavigation(navRes);
        setHeroSlides(heroRes);
        setPosts(postRes);
        setSettings(settingsRes);
        setNewNav((prev) => ({ ...prev, sortOrder: navRes.length + 1 }));
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

  useEffect(() => {
    if (!navigation.length) return;
    setNewNav((prev) => ({ ...prev, sortOrder: navigation.length + 1 }));
  }, [navigation]);

  const handleNavChange = (id, field, value) => {
    setNavigation((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleHeroChange = (id, field, value) => {
    setHeroSlides((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveNavigation = async (item) => {
    try {
      const payload = {
        label: item.label,
        href: item.href,
        sortOrder: Number(item.sortOrder) || 0,
        visible: Boolean(item.visible)
      };
      if (item.id) {
        const updated = await request(`/api/admin/navigation/${item.id}`, { method: 'PUT', body: payload });
        setNavigation((items) => items.map((entry) => (entry.id === item.id ? updated : entry)));
      }
      showMessage('Navigation aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNavigation = async (id) => {
    try {
      await request(`/api/admin/navigation/${id}`, { method: 'DELETE' });
      setNavigation((items) => items.filter((item) => item.id !== id));
      showMessage('Eintrag entfernt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateNavigation = async (event) => {
    event.preventDefault();
    try {
      const created = await request('/api/admin/navigation', {
        method: 'POST',
        body: { ...newNav, sortOrder: Number(newNav.sortOrder) || navigation.length + 1 }
      });
      setNavigation((items) => [...items, created]);
      setNewNav({ label: '', href: '#', sortOrder: navigation.length + 2, visible: true });
      showMessage('Navigationspunkt erstellt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveSlide = async (slide) => {
    try {
      const payload = {
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        tag: slide.tag,
        priceLabel: slide.priceLabel,
        ctaLabel: slide.ctaLabel,
        ctaLink: slide.ctaLink,
        secondaryLine: slide.secondaryLine,
        imageUrl: slide.imageUrl,
        sortOrder: Number(slide.sortOrder) || 0,
        active: Boolean(slide.active)
      };
      const updated = await request(`/api/admin/hero-slides/${slide.id}`, { method: 'PUT', body: payload });
      setHeroSlides((items) => items.map((entry) => (entry.id === slide.id ? updated : entry)));
      showMessage('Slide gespeichert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSlide = async (id) => {
    try {
      await request(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
      setHeroSlides((items) => items.filter((item) => item.id !== id));
      showMessage('Slide gelöscht.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSlide = async (event) => {
    event.preventDefault();
    try {
      const created = await request('/api/admin/hero-slides', {
        method: 'POST',
        body: {
          ...newSlide,
          sortOrder: Number(newSlide.sortOrder) || heroSlides.length + 1,
          active: true
        }
      });
      setHeroSlides((items) => [...items, created]);
      setNewSlide({ title: '', imageUrl: '', ctaLabel: 'Jetzt buchen', ctaLink: '#angebote' });
      showMessage('Neuer Slide angelegt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveSettings = async (key, value) => {
    try {
      const updated = await request(`/api/admin/settings/${key}`, { method: 'PUT', body: value });
      setSettings((prev) => ({ ...prev, [key]: updated }));
      showMessage('Einstellungen gespeichert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePost = async (post) => {
    try {
      const payload = {
        ...post,
        tags: post.tags?.split(',').map((tag) => tag.trim()).filter(Boolean),
        publishedAt: post.publishedAt || null,
        scheduledAt: post.scheduledAt || null
      };
      const updated = await request(`/api/admin/posts/${post.id}`, { method: 'PUT', body: payload });
      setPosts((items) => items.map((entry) => (entry.id === post.id ? updated : entry)));
      showMessage('Beitrag gespeichert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...newPost,
        tags: newPost.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        publishedAt: newPost.publishedAt || null,
        scheduledAt: newPost.scheduledAt || null
      };
      const created = await request('/api/admin/posts', { method: 'POST', body: payload });
      setPosts((items) => [created, ...items]);
      setNewPost(INITIAL_POST);
      showMessage('Neuer Beitrag erstellt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await request(`/api/admin/posts/${id}`, { method: 'DELETE' });
      setPosts((items) => items.filter((item) => item.id !== id));
      showMessage('Beitrag entfernt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const contactSettings = settings?.contact || {};
  const footerSettings = settings?.footer || {};
  const services = useMemo(() => settings?.services || [], [settings]);

  if (loading) {
    return <LoadingScreen message="Inhalte werden geladen …" />;
  }

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  return (
    <div className="content-page">
      <TabNav items={TABS} active={tab} onChange={setTab} />
      {message && <InlineAlert type={message.type} message={message.text} />}

      {tab === 'navigation' && (
        <SectionCard
          title="Navigation"
          description="Verwalten Sie die Hauptnavigation der Website, inklusive Sichtbarkeit und Reihenfolge."
          footer={<small>Menüpunkte lassen sich in Echtzeit auf der Website aktualisieren.</small>}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Link</th>
                <th>Reihenfolge</th>
                <th>Sichtbar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {navigation.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input value={item.label} onChange={(event) => handleNavChange(item.id, 'label', event.target.value)} />
                  </td>
                  <td>
                    <input value={item.href} onChange={(event) => handleNavChange(item.id, 'href', event.target.value)} />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.sortOrder}
                      onChange={(event) => handleNavChange(item.id, 'sortOrder', event.target.value)}
                    />
                  </td>
                  <td>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(item.visible)}
                        onChange={(event) => handleNavChange(item.id, 'visible', event.target.checked)}
                      />
                      <span className="toggle-indicator"></span>
                    </label>
                  </td>
                  <td className="table-actions">
                    <button type="button" className="btn btn-small" onClick={() => handleSaveNavigation(item)}>
                      Speichern
                    </button>
                    <button type="button" className="btn btn-link" onClick={() => handleDeleteNavigation(item.id)}>
                      Entfernen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <form className="inline-form" onSubmit={handleCreateNavigation}>
            <input
              placeholder="Label"
              value={newNav.label}
              onChange={(event) => setNewNav((prev) => ({ ...prev, label: event.target.value }))}
              required
            />
            <input
              placeholder="Link"
              value={newNav.href}
              onChange={(event) => setNewNav((prev) => ({ ...prev, href: event.target.value }))}
            />
            <input
              type="number"
              placeholder="Reihenfolge"
              value={newNav.sortOrder}
              onChange={(event) => setNewNav((prev) => ({ ...prev, sortOrder: event.target.value }))}
            />
            <label className="toggle">
              <input
                type="checkbox"
                checked={newNav.visible}
                onChange={(event) => setNewNav((prev) => ({ ...prev, visible: event.target.checked }))}
              />
              <span className="toggle-indicator"></span>
              <span>sichtbar</span>
            </label>
            <button type="submit" className="btn btn-primary">
              Hinzufügen
            </button>
          </form>
        </SectionCard>
      )}

      {tab === 'hero' && (
        <SectionCard
          title="Hero Slider"
          description="Steuern Sie Bilder, Texte und Call-to-Actions der Startseite."
          actions={<span>Aktive Slides: {heroSlides.filter((slide) => slide.active).length}</span>}
        >
          {heroSlides.map((slide) => (
            <details key={slide.id} className="collapsible" open>
              <summary>
                <strong>{slide.title || 'Unbenannter Slide'}</strong>
                <span className="collapsible-meta">{slide.imageUrl && <a href={slide.imageUrl}>Bild ansehen</a>}</span>
              </summary>
              <div className="collapsible-body">
                <div className="form-grid">
                  <label>
                    <span>Titel</span>
                    <input value={slide.title} onChange={(event) => handleHeroChange(slide.id, 'title', event.target.value)} />
                  </label>
                  <label>
                    <span>Untertitel</span>
                    <input value={slide.subtitle || ''} onChange={(event) => handleHeroChange(slide.id, 'subtitle', event.target.value)} />
                  </label>
                  <label className="full-width">
                    <span>Beschreibung</span>
                    <textarea
                      value={slide.description || ''}
                      onChange={(event) => handleHeroChange(slide.id, 'description', event.target.value)}
                    ></textarea>
                  </label>
                  <label>
                    <span>CTA-Label</span>
                    <input value={slide.ctaLabel || ''} onChange={(event) => handleHeroChange(slide.id, 'ctaLabel', event.target.value)} />
                  </label>
                  <label>
                    <span>CTA-Link</span>
                    <input value={slide.ctaLink || ''} onChange={(event) => handleHeroChange(slide.id, 'ctaLink', event.target.value)} />
                  </label>
                  <label>
                    <span>Tag</span>
                    <input value={slide.tag || ''} onChange={(event) => handleHeroChange(slide.id, 'tag', event.target.value)} />
                  </label>
                  <label>
                    <span>Preislabel</span>
                    <input value={slide.priceLabel || ''} onChange={(event) => handleHeroChange(slide.id, 'priceLabel', event.target.value)} />
                  </label>
                  <label className="full-width">
                    <span>Hinweiszeile</span>
                    <input
                      value={slide.secondaryLine || ''}
                      onChange={(event) => handleHeroChange(slide.id, 'secondaryLine', event.target.value)}
                    />
                  </label>
                  <label className="full-width">
                    <span>Bild-URL</span>
                    <input value={slide.imageUrl || ''} onChange={(event) => handleHeroChange(slide.id, 'imageUrl', event.target.value)} />
                  </label>
                  <label>
                    <span>Reihenfolge</span>
                    <input
                      type="number"
                      value={slide.sortOrder}
                      onChange={(event) => handleHeroChange(slide.id, 'sortOrder', event.target.value)}
                    />
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(slide.active)}
                      onChange={(event) => handleHeroChange(slide.id, 'active', event.target.checked)}
                    />
                    <span className="toggle-indicator"></span>
                    <span>aktiv</span>
                  </label>
                </div>
                <div className="collapsible-actions">
                  <button type="button" className="btn" onClick={() => handleSaveSlide(slide)}>
                    Speichern
                  </button>
                  <button type="button" className="btn btn-link" onClick={() => handleDeleteSlide(slide.id)}>
                    Löschen
                  </button>
                </div>
              </div>
            </details>
          ))}

          <form className="hero-create" onSubmit={handleCreateSlide}>
            <h3>Neuen Slide anlegen</h3>
            <div className="form-grid">
              <label>
                <span>Titel</span>
                <input value={newSlide.title} onChange={(event) => setNewSlide((prev) => ({ ...prev, title: event.target.value }))} required />
              </label>
              <label>
                <span>Bild-URL</span>
                <input value={newSlide.imageUrl} onChange={(event) => setNewSlide((prev) => ({ ...prev, imageUrl: event.target.value }))} required />
              </label>
              <label>
                <span>CTA-Label</span>
                <input value={newSlide.ctaLabel} onChange={(event) => setNewSlide((prev) => ({ ...prev, ctaLabel: event.target.value }))} />
              </label>
              <label>
                <span>CTA-Link</span>
                <input value={newSlide.ctaLink} onChange={(event) => setNewSlide((prev) => ({ ...prev, ctaLink: event.target.value }))} />
              </label>
              <label>
                <span>Reihenfolge</span>
                <input
                  type="number"
                  value={newSlide.sortOrder || ''}
                  onChange={(event) => setNewSlide((prev) => ({ ...prev, sortOrder: event.target.value }))}
                />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Slide erstellen
            </button>
          </form>
        </SectionCard>
      )}

      {tab === 'contact' && (
        <SectionCard title="Kontaktinformationen" description="Zentrale Kontaktdaten für Website und Dokumente">
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.target;
              const value = {
                phone: form.phone.value,
                email: form.email.value,
                whatsapp: form.whatsapp.value,
                telegram: form.telegram.value,
                address: form.address.value,
                officeHours: form.officeHours.value
              };
              handleSaveSettings('contact', value);
            }}
          >
            <label>
              <span>Telefon</span>
              <input name="phone" defaultValue={contactSettings.phone || ''} />
            </label>
            <label>
              <span>E-Mail</span>
              <input name="email" defaultValue={contactSettings.email || ''} />
            </label>
            <label>
              <span>WhatsApp</span>
              <input name="whatsapp" defaultValue={contactSettings.whatsapp || ''} />
            </label>
            <label>
              <span>Telegram</span>
              <input name="telegram" defaultValue={contactSettings.telegram || ''} />
            </label>
            <label className="full-width">
              <span>Adresse</span>
              <textarea name="address" defaultValue={contactSettings.address || ''}></textarea>
            </label>
            <label className="full-width">
              <span>Öffnungszeiten</span>
              <input name="officeHours" defaultValue={contactSettings.officeHours || ''} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Speichern
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {tab === 'contact' && (
        <SectionCard title="Footer & Rechtliches" description="Firmendaten für Impressum, Verträge und Footer">
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.target;
              const value = {
                company: form.company.value,
                street: form.street.value,
                postalCode: form.postalCode.value,
                city: form.city.value,
                country: form.country.value,
                managingDirector: form.managingDirector.value,
                phone: form.phone.value,
                email: form.email.value,
                website: form.website.value,
                taxNumber: form.taxNumber.value,
                vatId: form.vatId.value
              };
              handleSaveSettings('footer', value);
            }}
          >
            <label className="full-width">
              <span>Firma</span>
              <input name="company" defaultValue={footerSettings.company || ''} />
            </label>
            <label>
              <span>Straße</span>
              <input name="street" defaultValue={footerSettings.street || ''} />
            </label>
            <label>
              <span>PLZ</span>
              <input name="postalCode" defaultValue={footerSettings.postalCode || ''} />
            </label>
            <label>
              <span>Ort</span>
              <input name="city" defaultValue={footerSettings.city || ''} />
            </label>
            <label>
              <span>Land</span>
              <input name="country" defaultValue={footerSettings.country || ''} />
            </label>
            <label>
              <span>Geschäftsführer</span>
              <input name="managingDirector" defaultValue={footerSettings.managingDirector || ''} />
            </label>
            <label>
              <span>Telefon</span>
              <input name="phone" defaultValue={footerSettings.phone || ''} />
            </label>
            <label>
              <span>E-Mail</span>
              <input name="email" defaultValue={footerSettings.email || ''} />
            </label>
            <label>
              <span>Website</span>
              <input name="website" defaultValue={footerSettings.website || ''} />
            </label>
            <label>
              <span>Steuernummer</span>
              <input name="taxNumber" defaultValue={footerSettings.taxNumber || ''} />
            </label>
            <label>
              <span>USt.-ID</span>
              <input name="vatId" defaultValue={footerSettings.vatId || ''} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn">
                Aktualisieren
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {tab === 'services' && (
        <SectionCard
          title="Service Highlights"
          description="Icon, Titel und Beschreibung für Kernleistungen"
          footer={<small>Diese Services werden auf der Startseite im B2C/B2B Bereich dargestellt.</small>}
        >
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <label>
                <span>Icon</span>
                <input
                  value={service.icon}
                  onChange={(event) => {
                    const next = [...services];
                    next[index] = { ...next[index], icon: event.target.value };
                    setSettings((prev) => ({ ...prev, services: next }));
                  }}
                />
              </label>
              <label>
                <span>Titel</span>
                <input
                  value={service.title}
                  onChange={(event) => {
                    const next = [...services];
                    next[index] = { ...next[index], title: event.target.value };
                    setSettings((prev) => ({ ...prev, services: next }));
                  }}
                />
              </label>
              <label className="full-width">
                <span>Beschreibung</span>
                <textarea
                  value={service.description}
                  onChange={(event) => {
                    const next = [...services];
                    next[index] = { ...next[index], description: event.target.value };
                    setSettings((prev) => ({ ...prev, services: next }));
                  }}
                ></textarea>
              </label>
            </div>
          ))}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => handleSaveSettings('services', services)}>
              Speichern
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setSettings((prev) => ({ ...prev, services: [...services, { icon: '✨', title: 'Neue Leistung', description: '' }] }))}
            >
              Service hinzufügen
            </button>
          </div>
        </SectionCard>
      )}

      {tab === 'blog' && (
        <SectionCard
          title="Beiträge"
          description="Reise-News, Visa-Updates und B2B Inhalte verwalten"
          actions={<span>{posts.length} Beiträge gesamt</span>}
        >
          <div className="post-list">
            {posts.map((post) => (
              <details key={post.id} className="collapsible">
                <summary>
                  <strong>{post.title}</strong>
                  <span className="collapsible-meta">
                    {post.status} · {post.publishedAt ? formatDate(post.publishedAt) : 'Entwurf'}
                  </span>
                </summary>
                <div className="collapsible-body">
                  <div className="form-grid">
                    <label className="full-width">
                      <span>Titel</span>
                      <input
                        value={post.title}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) => (item.id === post.id ? { ...item, title: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                    <label className="full-width">
                      <span>Slug</span>
                      <input
                        value={post.slug || ''}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) => (item.id === post.id ? { ...item, slug: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                    <label className="full-width">
                      <span>Teaser</span>
                      <textarea
                        value={post.excerpt || ''}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) => (item.id === post.id ? { ...item, excerpt: event.target.value } : item))
                          )
                        }
                      ></textarea>
                    </label>
                    <label className="full-width">
                      <span>Inhalt</span>
                      <textarea
                        rows={6}
                        value={post.content || ''}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) => (item.id === post.id ? { ...item, content: event.target.value } : item))
                          )
                        }
                      ></textarea>
                    </label>
                    <label className="full-width">
                      <span>Bild-URL</span>
                      <input
                        value={post.imageUrl || ''}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) => (item.id === post.id ? { ...item, imageUrl: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                    <label>
                      <span>Status</span>
                      <select
                        value={post.status}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) => (item.id === post.id ? { ...item, status: event.target.value } : item))
                          )
                        }
                      >
                        <option value="draft">Entwurf</option>
                        <option value="published">Veröffentlicht</option>
                        <option value="scheduled">Geplant</option>
                      </select>
                    </label>
                    <label>
                      <span>Veröffentlichung</span>
                      <input
                        type="date"
                        value={post.publishedAt ? post.publishedAt.substring(0, 10) : ''}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) =>
                              item.id === post.id ? { ...item, publishedAt: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label>
                      <span>Geplant</span>
                      <input
                        type="date"
                        value={post.scheduledAt ? post.scheduledAt.substring(0, 10) : ''}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) =>
                              item.id === post.id ? { ...item, scheduledAt: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="full-width">
                      <span>Tags (Kommagetrennt)</span>
                      <input
                        value={Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || ''}
                        onChange={(event) =>
                          setPosts((items) =>
                            items.map((item) => (item.id === post.id ? { ...item, tags: event.target.value } : item))
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="collapsible-actions">
                    <button type="button" className="btn" onClick={() => handleUpdatePost(post)}>
                      Speichern
                    </button>
                    <button type="button" className="btn btn-link" onClick={() => handleDeletePost(post.id)}>
                      Löschen
                    </button>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <form className="post-create" onSubmit={handleCreatePost}>
            <h3>Neuen Beitrag erstellen</h3>
            <div className="form-grid">
              <label className="full-width">
                <span>Titel</span>
                <input value={newPost.title} onChange={(event) => setNewPost((prev) => ({ ...prev, title: event.target.value }))} required />
              </label>
              <label className="full-width">
                <span>Slug</span>
                <input value={newPost.slug} onChange={(event) => setNewPost((prev) => ({ ...prev, slug: event.target.value }))} />
              </label>
              <label className="full-width">
                <span>Teaser</span>
                <textarea
                  value={newPost.excerpt}
                  onChange={(event) => setNewPost((prev) => ({ ...prev, excerpt: event.target.value }))}
                ></textarea>
              </label>
              <label className="full-width">
                <span>Inhalt</span>
                <textarea
                  rows={6}
                  value={newPost.content}
                  onChange={(event) => setNewPost((prev) => ({ ...prev, content: event.target.value }))}
                  required
                ></textarea>
              </label>
              <label className="full-width">
                <span>Bild-URL</span>
                <input value={newPost.imageUrl} onChange={(event) => setNewPost((prev) => ({ ...prev, imageUrl: event.target.value }))} />
              </label>
              <label>
                <span>Status</span>
                <select value={newPost.status} onChange={(event) => setNewPost((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="scheduled">Geplant</option>
                </select>
              </label>
              <label>
                <span>Veröffentlichung</span>
                <input
                  type="date"
                  value={newPost.publishedAt}
                  onChange={(event) => setNewPost((prev) => ({ ...prev, publishedAt: event.target.value }))}
                />
              </label>
              <label>
                <span>Geplante Veröffentlichung</span>
                <input
                  type="date"
                  value={newPost.scheduledAt}
                  onChange={(event) => setNewPost((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                />
              </label>
              <label className="full-width">
                <span>Tags</span>
                <input value={newPost.tags} onChange={(event) => setNewPost((prev) => ({ ...prev, tags: event.target.value }))} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Beitrag veröffentlichen
            </button>
          </form>
        </SectionCard>
      )}
    </div>
  );
}
