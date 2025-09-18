import React, { useEffect, useMemo, useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import TabNav from '../components/TabNav.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import InlineAlert from '../components/InlineAlert.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const PRODUCT_TYPES = [
  { value: 'flight', label: 'Flüge' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'package', label: 'Pakete' },
  { value: 'transfer', label: 'Transfers' }
];

const EMPTY_PRODUCT = {
  title: '',
  location: '',
  description: '',
  priceFrom: '',
  priceDisplay: '',
  availabilityStart: '',
  availabilityEnd: '',
  imageUrl: '',
  rating: '',
  amenitiesText: '',
  isHot: false,
  commissionRule: ''
};

export default function ProductsPage() {
  const { request } = useApi();
  const [products, setProducts] = useState([]);
  const [activeType, setActiveType] = useState(PRODUCT_TYPES[0].value);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT, type: PRODUCT_TYPES[0].value });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request('/api/admin/products');
        if (!active) return;
        setProducts(response.map((product) => ({ ...product, amenitiesText: (product.amenities || []).join('\n') })));
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

  const filteredProducts = useMemo(
    () => products.filter((product) => product.type === activeType),
    [products, activeType]
  );

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChange = (id, field, value) => {
    setProducts((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSave = async (product) => {
    try {
      const payload = {
        type: product.type,
        title: product.title,
        location: product.location,
        description: product.description,
        priceFrom: product.priceFrom ? Number(product.priceFrom) : null,
        priceDisplay: product.priceDisplay,
        availabilityStart: product.availabilityStart || null,
        availabilityEnd: product.availabilityEnd || null,
        imageUrl: product.imageUrl,
        rating: product.rating ? Number(product.rating) : null,
        amenities: product.amenitiesText
          ? product.amenitiesText
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        isHot: Boolean(product.isHot),
        commissionRule: product.commissionRule
      };
      const updated = await request(`/api/admin/products/${product.id}`, { method: 'PUT', body: payload });
      setProducts((items) =>
        items.map((item) => (item.id === product.id ? { ...updated, amenitiesText: (updated.amenities || []).join('\n') } : item))
      );
      showMessage('Produkt aktualisiert.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await request(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts((items) => items.filter((item) => item.id !== id));
      showMessage('Produkt entfernt.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        type: newProduct.type,
        title: newProduct.title,
        location: newProduct.location,
        description: newProduct.description,
        priceFrom: newProduct.priceFrom ? Number(newProduct.priceFrom) : null,
        priceDisplay: newProduct.priceDisplay,
        availabilityStart: newProduct.availabilityStart || null,
        availabilityEnd: newProduct.availabilityEnd || null,
        imageUrl: newProduct.imageUrl,
        rating: newProduct.rating ? Number(newProduct.rating) : null,
        amenities: newProduct.amenitiesText
          ? newProduct.amenitiesText
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        isHot: Boolean(newProduct.isHot),
        commissionRule: newProduct.commissionRule
      };
      const created = await request('/api/admin/products', { method: 'POST', body: payload });
      setProducts((items) => [{ ...created, amenitiesText: (created.amenities || []).join('\n') }, ...items]);
      setNewProduct({ ...EMPTY_PRODUCT, type: newProduct.type });
      showMessage('Produkt angelegt.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingScreen message="Produkte werden geladen …" />;
  }

  if (error) {
    return <InlineAlert type="error" title="Fehler" message={error} />;
  }

  return (
    <div className="products-page">
      {message && <InlineAlert type={message.type} message={message.text} />}
      <TabNav items={PRODUCT_TYPES} active={activeType} onChange={(value) => setActiveType(value)} />

      <SectionCard
        title={`Bestand: ${PRODUCT_TYPES.find((item) => item.value === activeType)?.label ?? ''}`}
        description="Daten werden im Frontend automatisch aktualisiert"
      >
        {filteredProducts.length === 0 ? (
          <p className="empty-state">Keine Produkte vorhanden.</p>
        ) : (
          filteredProducts.map((product) => (
            <details key={product.id} className="collapsible" open>
              <summary>
                <strong>{product.title}</strong>
                <span className="collapsible-meta">
                  {formatCurrency(product.priceFrom)} · {product.availabilityStart ? formatDate(product.availabilityStart) : 'Flexibel'}
                </span>
              </summary>
              <div className="collapsible-body">
                <div className="form-grid">
                  <label className="full-width">
                    <span>Titel</span>
                    <input
                      value={product.title}
                      onChange={(event) => handleChange(product.id, 'title', event.target.value)}
                    />
                  </label>
                  <label className="full-width">
                    <span>Standort / Route</span>
                    <input
                      value={product.location || ''}
                      onChange={(event) => handleChange(product.id, 'location', event.target.value)}
                    />
                  </label>
                  <label className="full-width">
                    <span>Beschreibung</span>
                    <textarea
                      rows={4}
                      value={product.description || ''}
                      onChange={(event) => handleChange(product.id, 'description', event.target.value)}
                    ></textarea>
                  </label>
                  <label>
                    <span>Preis ab (EUR)</span>
                    <input
                      type="number"
                      value={product.priceFrom ?? ''}
                      onChange={(event) => handleChange(product.id, 'priceFrom', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Preistext</span>
                    <input
                      value={product.priceDisplay || ''}
                      onChange={(event) => handleChange(product.id, 'priceDisplay', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Verfügbar ab</span>
                    <input
                      type="date"
                      value={product.availabilityStart ? product.availabilityStart.substring(0, 10) : ''}
                      onChange={(event) => handleChange(product.id, 'availabilityStart', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Verfügbar bis</span>
                    <input
                      type="date"
                      value={product.availabilityEnd ? product.availabilityEnd.substring(0, 10) : ''}
                      onChange={(event) => handleChange(product.id, 'availabilityEnd', event.target.value)}
                    />
                  </label>
                  <label className="full-width">
                    <span>Bild-URL</span>
                    <input
                      value={product.imageUrl || ''}
                      onChange={(event) => handleChange(product.id, 'imageUrl', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Bewertung</span>
                    <input
                      type="number"
                      step="0.1"
                      value={product.rating ?? ''}
                      onChange={(event) => handleChange(product.id, 'rating', event.target.value)}
                    />
                  </label>
                  <label className="full-width">
                    <span>Leistungen / Amenities</span>
                    <textarea
                      value={product.amenitiesText || ''}
                      onChange={(event) => handleChange(product.id, 'amenitiesText', event.target.value)}
                    ></textarea>
                  </label>
                  <label className="full-width">
                    <span>Provision / Nettoregel</span>
                    <input
                      value={product.commissionRule || ''}
                      onChange={(event) => handleChange(product.id, 'commissionRule', event.target.value)}
                    />
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(product.isHot)}
                      onChange={(event) => handleChange(product.id, 'isHot', event.target.checked)}
                    />
                    <span className="toggle-indicator"></span>
                    <span>Hot Deal</span>
                  </label>
                </div>
                <div className="collapsible-actions">
                  <button type="button" className="btn" onClick={() => handleSave(product)}>
                    Speichern
                  </button>
                  <button type="button" className="btn btn-link" onClick={() => handleDelete(product.id)}>
                    Löschen
                  </button>
                </div>
              </div>
            </details>
          ))
        )}
      </SectionCard>

      <SectionCard title="Neues Produkt" description="Dem gewählten Bereich hinzufügen">
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            <span>Kategorie</span>
            <select value={newProduct.type} onChange={(event) => setNewProduct((prev) => ({ ...prev, type: event.target.value }))}>
              {PRODUCT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="full-width">
            <span>Titel</span>
            <input value={newProduct.title} onChange={(event) => setNewProduct((prev) => ({ ...prev, title: event.target.value }))} required />
          </label>
          <label className="full-width">
            <span>Standort / Route</span>
            <input value={newProduct.location} onChange={(event) => setNewProduct((prev) => ({ ...prev, location: event.target.value }))} />
          </label>
          <label className="full-width">
            <span>Beschreibung</span>
            <textarea
              rows={4}
              value={newProduct.description}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, description: event.target.value }))}
            ></textarea>
          </label>
          <label>
            <span>Preis ab (EUR)</span>
            <input
              type="number"
              value={newProduct.priceFrom}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, priceFrom: event.target.value }))}
            />
          </label>
          <label>
            <span>Preistext</span>
            <input
              value={newProduct.priceDisplay}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, priceDisplay: event.target.value }))}
            />
          </label>
          <label>
            <span>Verfügbar ab</span>
            <input
              type="date"
              value={newProduct.availabilityStart}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, availabilityStart: event.target.value }))}
            />
          </label>
          <label>
            <span>Verfügbar bis</span>
            <input
              type="date"
              value={newProduct.availabilityEnd}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, availabilityEnd: event.target.value }))}
            />
          </label>
          <label className="full-width">
            <span>Bild-URL</span>
            <input value={newProduct.imageUrl} onChange={(event) => setNewProduct((prev) => ({ ...prev, imageUrl: event.target.value }))} />
          </label>
          <label>
            <span>Bewertung</span>
            <input
              type="number"
              step="0.1"
              value={newProduct.rating}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, rating: event.target.value }))}
            />
          </label>
          <label className="full-width">
            <span>Ausstattung / Leistungen</span>
            <textarea
              value={newProduct.amenitiesText}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, amenitiesText: event.target.value }))}
            ></textarea>
          </label>
          <label className="full-width">
            <span>Provision / Nettoregel</span>
            <input
              value={newProduct.commissionRule}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, commissionRule: event.target.value }))}
            />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={newProduct.isHot}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, isHot: event.target.checked }))}
            />
            <span className="toggle-indicator"></span>
            <span>Hot Deal</span>
          </label>
          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary">
              Produkt speichern
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
