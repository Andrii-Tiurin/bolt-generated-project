const STORAGE_KEYS = {
  offers: 'monotours24_offers',
  bookings: 'monotours24_bookings',
  requests: 'monotours24_requests',
  newsletter: 'monotours24_newsletter'
};

const DEMO_USER = {
  email: 'admin@monotours24.de',
  password: 'admin123'
};

const FALLBACK_OFFERS = [
  {
    id: 'deal-001',
    title: 'Dubai Deluxe Week',
    destination: 'Dubai, VAE',
    price: 1299,
    validUntil: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    notes: '5★ Strandhotel · Business Lounge Zugang · Wüstensafari inklusive',
    status: 'aktiv'
  },
  {
    id: 'deal-002',
    title: 'Mallorca Kurztrip',
    destination: 'Mallorca, Spanien',
    price: 599,
    validUntil: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Adults Only Hotel · Frühstück & Dinner · Meerblick',
    status: 'aktiv'
  }
];

const storage = {
  get(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn('Konnte Daten nicht lesen', error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Konnte Daten nicht speichern', error);
    }
  }
};

const appState = {
  offers: [],
  bookings: [],
  partnerRequests: [],
  newsletter: []
};

function init() {
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');

  loginForm?.addEventListener('submit', handleLogin);
  logoutBtn?.addEventListener('click', handleLogout);
  sidebarToggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setActiveSection(link.getAttribute('href').substring(1));
      document.querySelectorAll('[data-nav]').forEach((el) => el.classList.remove('active'));
      link.classList.add('active');
      if (sidebar?.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  });

  document.getElementById('offer-form')?.addEventListener('submit', handleOfferSubmit);
  document.getElementById('sync-offers')?.addEventListener('click', syncOffers);
  document.getElementById('export-bookings')?.addEventListener('click', exportBookings);
  document.getElementById('save-settings')?.addEventListener('click', () => alert('Einstellungen gespeichert (Demo).'));

  if (sessionStorage.getItem('monotours24_admin_session')) {
    openAdmin();
  }
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    sessionStorage.setItem('monotours24_admin_session', JSON.stringify({ email }));
    openAdmin();
  } else {
    alert('Zugangsdaten nicht korrekt.');
  }
}

function handleLogout() {
  sessionStorage.removeItem('monotours24_admin_session');
  document.getElementById('admin-app').setAttribute('hidden', 'true');
  document.getElementById('login-screen').style.display = 'grid';
}

function openAdmin() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').removeAttribute('hidden');
  const session = JSON.parse(sessionStorage.getItem('monotours24_admin_session') || '{}');
  document.getElementById('admin-user').textContent = session.email || DEMO_USER.email;
  loadData();
  setActiveSection('dashboard');
}

function loadData() {
  appState.bookings = storage.get(STORAGE_KEYS.bookings, []);
  appState.partnerRequests = storage
    .get(STORAGE_KEYS.requests, [])
    .filter((entry) => entry.type === 'partner');
  appState.offers = storage.get(STORAGE_KEYS.offers, FALLBACK_OFFERS);
  appState.newsletter = storage.get(STORAGE_KEYS.newsletter, []);

  renderStats();
  renderOffers();
  renderBookings();
  renderPartner();
}

async function syncOffers() {
  try {
    const response = await fetch('/api/offers');
    if (!response.ok) throw new Error('Fehler beim Abruf');
    const data = await response.json();
    const merged = [...data.hotDeals, ...data.packages].map((item) => ({
      id: item.id,
      title: item.title,
      destination: item.destination || item.title,
      price: item.price,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: item.destination ? `${item.destination} · ${item.nights || 'Paket'}` : 'Pauschalangebot',
      status: 'aktiv'
    }));
    appState.offers = merged;
    storage.set(STORAGE_KEYS.offers, merged);
    renderOffers();
    renderStats();
    alert('Live-Daten erfolgreich synchronisiert.');
  } catch (error) {
    console.warn('Sync fehlgeschlagen', error);
    alert('Live-Daten konnten nicht geladen werden. Es werden die lokalen Angebote angezeigt.');
  }
}

function handleOfferSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('offer-title').value.trim();
  const destination = document.getElementById('offer-destination').value.trim();
  const price = Number(document.getElementById('offer-price').value);
  const validUntil = document.getElementById('offer-valid').value;
  const notes = document.getElementById('offer-notes').value.trim();

  const offer = {
    id: `offer-${Date.now()}`,
    title,
    destination,
    price,
    validUntil,
    notes,
    status: 'aktiv'
  };

  appState.offers.unshift(offer);
  storage.set(STORAGE_KEYS.offers, appState.offers);
  renderOffers();
  renderStats();
  event.target.reset();
}

function renderOffers() {
  const table = document.getElementById('offer-table');
  if (!table) return;
  table.innerHTML = appState.offers
    .map((offer) => {
      const date = offer.validUntil ? new Date(offer.validUntil).toLocaleDateString('de-DE') : '-';
      return `
        <tr>
          <td>${offer.title}</td>
          <td>${offer.destination || '-'}</td>
          <td>${formatPrice(offer.price)}</td>
          <td>${date}</td>
          <td><span class="badge">${offer.status || 'aktiv'}</span></td>
        </tr>
      `;
    })
    .join('');
}

function renderBookings() {
  const table = document.getElementById('booking-table');
  const latest = document.getElementById('latest-bookings');
  if (!table || !latest) return;
  table.innerHTML = '';
  latest.innerHTML = '';

  appState.bookings.forEach((booking) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${booking.customer?.name || '-'}</td>
      <td>${booking.title}</td>
      <td>${booking.destination || '-'}</td>
      <td>${formatPrice(booking.price)}</td>
      <td>
        <select class="status-select" data-booking-id="${booking.customer?.name || booking.createdAt}">
          <option value="offen" ${booking.status === 'offen' ? 'selected' : ''}>Offen</option>
          <option value="in Bearbeitung" ${booking.status === 'in Bearbeitung' ? 'selected' : ''}>In Bearbeitung</option>
          <option value="abgeschlossen" ${booking.status === 'abgeschlossen' ? 'selected' : ''}>Abgeschlossen</option>
        </select>
      </td>
      <td><button class="btn btn-secondary" data-detail="${booking.createdAt}">Details</button></td>
    `;
    table.appendChild(row);
  });

  document.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', (event) => updateBookingStatus(event.target));
  });

  const recent = [...appState.bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  recent.forEach((booking) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <span><strong>${booking.customer?.name || 'Unbekannt'}</strong> – ${booking.title}</span>
      <span>${new Date(booking.createdAt).toLocaleString('de-DE')}</span>
    `;
    latest.appendChild(item);
  });

  table.querySelectorAll('[data-detail]').forEach((button) => {
    button.addEventListener('click', () => showBookingDetails(button.dataset.detail));
  });
}

function updateBookingStatus(select) {
  const id = select.dataset.bookingId;
  const booking = appState.bookings.find((entry) => (entry.customer?.name || entry.createdAt) === id);
  if (!booking) return;
  booking.status = select.value;
  storage.set(STORAGE_KEYS.bookings, appState.bookings);
}

function showBookingDetails(id) {
  const booking = appState.bookings.find((entry) => entry.createdAt === id);
  if (!booking) return;
  const lines = [
    `Kunde: ${booking.customer?.name || '-'}` ,
    `E-Mail: ${booking.customer?.email || '-'}` ,
    `Telefon: ${booking.customer?.phone || '-'}` ,
    `Leistung: ${booking.title}` ,
    `Ziel: ${booking.destination || '-'}` ,
    `Nachricht: ${booking.customer?.message || '-'}`
  ];
  alert(lines.join('\n'));
}

function renderPartner() {
  const table = document.getElementById('partner-table');
  if (!table) return;
  table.innerHTML = appState.partnerRequests
    .map((partner) => {
      const created = new Date(partner.createdAt || Date.now()).toLocaleDateString('de-DE');
      const data = partner.data || {};
      const company = data['partner-company'] || data.partnerCompany || data.company || data.partner_company || '-';
      const contact = data['partner-contact'] || data.partnerContact || data.contact || data.partner_contact || '-';
      const email = data['partner-email'] || data.partnerEmail || data.email || '-';
      const type = data['partner-type'] || data.partnerType || data.type || '-';
      return `
        <tr>
          <td>${company}</td>
          <td>${contact}</td>
          <td>${email}</td>
          <td>${type}</td>
          <td>${created}</td>
        </tr>
      `;
    })
    .join('');
}

function renderStats() {
  document.getElementById('stat-bookings').textContent = appState.bookings.length;
  document.getElementById('stat-partners').textContent = appState.partnerRequests.length;
  document.getElementById('stat-offers').textContent = appState.offers.length;
  document.getElementById('stat-newsletter').textContent = appState.newsletter.length;
}

function exportBookings() {
  if (!appState.bookings.length) {
    alert('Keine Buchungen zum Exportieren vorhanden.');
    return;
  }
  const headers = ['Kunde', 'E-Mail', 'Telefon', 'Leistung', 'Ziel', 'Preis', 'Status', 'Datum'];
  const rows = appState.bookings.map((booking) => [
    booking.customer?.name || '',
    booking.customer?.email || '',
    booking.customer?.phone || '',
    booking.title,
    booking.destination || '',
    booking.price || '',
    booking.status || '',
    booking.createdAt
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `monotours24-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function setActiveSection(id) {
  document.querySelectorAll('.panel-section').forEach((section) => {
    section.classList.toggle('active', section.id === id);
  });
  const titleMap = {
    dashboard: 'Dashboard',
    offers: 'Hot Deals & Angebote',
    bookings: 'Buchungsverwaltung',
    partners: 'Partner & B2B',
    settings: 'Einstellungen'
  };
  document.getElementById('section-title').textContent = titleMap[id] || 'Dashboard';
}

function formatPrice(value) {
  if (value === undefined || value === null || value === '') return '-';
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return `${number.toLocaleString('de-DE')} €`;
}

document.addEventListener('DOMContentLoaded', init);
