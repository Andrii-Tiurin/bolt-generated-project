const storage = {
  get(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn(`Konnte ${key} nicht lesen`, error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Konnte ${key} nicht speichern`, error);
    }
  },
  push(key, entry) {
    const existing = this.get(key, []);
    existing.push(entry);
    this.set(key, existing);
  }
};

const sliderData = [
  {
    title: 'Sommerträume auf den Malediven',
    description:
      '7 Nächte im 5★ Resort mit All Inclusive, Direktflug ab Frankfurt &amp; Speedboat-Transfer inklusive.',
    price: 'ab 2.499 €',
    tag: 'Top Deal',
    cta: 'Jetzt Traumreise sichern',
    secondary: 'Flexible Umbuchung bis 14 Tage vor Abreise',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Städtezauber in New York',
    description:
      '5 Nächte im Boutique-Hotel in Manhattan inkl. Direktflug ab Berlin, Hop-on Hop-off Pass &amp; Travel Concierge.',
    price: 'ab 1.399 €',
    tag: 'Last Minute',
    cta: 'Flug &amp; Hotel kombinieren',
    secondary: 'Nur wenige Plätze verfügbar – jetzt buchen',
    image: 'https://images.unsplash.com/photo-1526402464533-73a0528ff7a0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Family Special an der Türkischen Riviera',
    description:
      '1 Woche Ultra All Inclusive im 4★ Familienhotel inklusive Wasserpark, Kinderbetreuung &amp; Direktflug.',
    price: 'ab 899 €',
    tag: 'Family Deal',
    cta: 'Familienangebot anfragen',
    secondary: 'Kostenlose Stornierung bis 30 Tage vor Abreise',
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'
  }
];

const dealData = [
  {
    title: 'Dubai Deluxe Week',
    destination: 'Dubai, VAE',
    nights: 7,
    price: 1299,
    image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80',
    endDate: addDays(3),
    perks: ['5★ Strandhotel', 'Business Lounge Zugang', 'Wüstensafari inklusive']
  },
  {
    title: 'Mallorca Kurztrip',
    destination: 'Mallorca, Spanien',
    nights: 5,
    price: 599,
    image: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80',
    endDate: addDays(5),
    perks: ['Adults Only Hotel', 'Frühstück &amp; Dinner', 'Zimmer mit Meerblick']
  },
  {
    title: 'Island Explorer',
    destination: 'Reykjavík, Island',
    nights: 6,
    price: 1449,
    image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=900&q=80',
    endDate: addDays(2),
    perks: ['Nordlichter Tour', 'Golden Circle Ausflug', 'Reiseversicherung inklusive']
  },
  {
    title: 'Safari &amp; Strand Kombi',
    destination: 'Tansania &amp; Sansibar',
    nights: 10,
    price: 2899,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    endDate: addDays(7),
    perks: ['Serengeti Safari', 'Sansibar Beach Resort', 'Privater Guide']
  }
];

const serviceData = [
  {
    icon: '✈️',
    title: 'Flugexperten',
    description:
      'Direktanbindung an NDC &amp; GDS – wir finden die besten Verfügbarkeiten, Tarife und Upgrade-Optionen.'
  },
  {
    icon: '🏨',
    title: 'Hotelwelten',
    description:
      'Kuratiertes Portfolio mit über 50.000 Hotels, Bewertungen, Nachhaltigkeits-Scores und transparenten Preisen.'
  },
  {
    icon: '🛡️',
    title: 'Reiseschutz',
    description:
      'Reiseversicherung, Reiseschutzbrief und Assistance-Services optional in jedem Angebot enthalten.'
  },
  {
    icon: '👨‍💼',
    title: 'Concierge &amp; Betreuung',
    description:
      'Persönliche Reiseexperten, 24/7 erreichbar via WhatsApp &amp; Telegram inklusive digitalem Dokumentenversand.'
  }
];

const hotelData = [
  {
    title: 'The Address Sky View',
    location: 'Dubai, Downtown',
    category: 'luxury',
    rating: 5,
    price: 'ab 279 € / Nacht',
    image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb21063?auto=format&fit=crop&w=900&q=80',
    highlights: ['Infinity Pool', 'Sky Bridge Bar', 'Club Lounge']
  },
  {
    title: 'Majestic Palace',
    location: 'Rom, Italien',
    category: 'city',
    rating: 4,
    price: 'ab 189 € / Nacht',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    highlights: ['Zentrale Lage', 'Rooftop-Bar', 'Gratis City-Guide']
  },
  {
    title: 'Azure Coast Resort',
    location: 'Antalya, Türkei',
    category: 'beach',
    rating: 5,
    price: 'ab 159 € / Nacht',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    highlights: ['Privater Strand', 'Spa &amp; Wellness', 'Familienzimmer']
  },
  {
    title: 'Bergpanorama Lodge',
    location: 'Zermatt, Schweiz',
    category: 'luxury',
    rating: 5,
    price: 'ab 349 € / Nacht',
    image: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80',
    highlights: ['Alpin Spa', 'Ski-in/Ski-out', 'Gourmetküche']
  },
  {
    title: 'Urban Loft Berlin',
    location: 'Berlin, Deutschland',
    category: 'city',
    rating: 4,
    price: 'ab 139 € / Nacht',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    highlights: ['Design Zimmer', 'Co-Working Space', 'Late Checkout']
  },
  {
    title: 'Sunset Bay Suites',
    location: 'Santorini, Griechenland',
    category: 'beach',
    rating: 5,
    price: 'ab 299 € / Nacht',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=900&q=80',
    highlights: ['Infinity Pool', 'Adults Only', 'Sunset Dinner']
  }
];

const packageData = [
  {
    title: 'Griechische Inselhopping-Reise',
    description: 'Athen – Mykonos – Santorini mit Inlandsflügen, 4★ Hotels &amp; Insel-Highlights.',
    price: 1699,
    duration: '9 Tage',
    image: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Rundreise Vietnam Deluxe',
    description: 'Hanoi, Ha Long Bucht, Hoi An &amp; Ho-Chi-Minh-Stadt inklusive deutschsprachiger Reiseleitung.',
    price: 2149,
    duration: '12 Tage',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Skandinavisches Wintermärchen',
    description: 'Nordnorwegen mit Huskysafari, Eishotel &amp; Glas-Iglu – perfekte Sicht auf Polarlichter.',
    price: 1899,
    duration: '8 Tage',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'
  }
];

const transferData = [
  {
    icon: '🚐',
    title: 'Privater Chauffeur',
    description: 'Exklusive Limousinen- &amp; Van-Transfers vom Flughafen direkt ins Hotel – deutschlandweit &amp; international.'
  },
  {
    icon: '🚌',
    title: 'Shuttle &amp; Gruppentransfer',
    description: 'Kostengünstige Shuttle-Services, abgestimmt auf Flugzeiten. Perfekt für Gruppen &amp; Incentives.'
  },
  {
    icon: '🚢',
    title: 'Kreuzfahrt-An- &amp; Abreise',
    description: 'Vom Hafen zum Hotel: organisierte Transfers inkl. Gepäckservice und Meet &amp; Greet.'
  }
];

const blogPosts = [
  {
    title: 'Top 10 Fernreisen für den Winter 2024',
    excerpt:
      'Von Kapstadt bis Phuket: Unsere Reiseexperten haben die beliebtesten Langstreckenziele für Sie analysiert.',
    date: '12. Januar 2024',
    image: 'https://images.unsplash.com/photo-1500043208385-0c01be168b0d?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Visa-Update: Einreisebestimmungen USA &amp; Kanada',
    excerpt: 'Alles, was Sie jetzt zum ESTA, eTA und zu aktuellen Einreisebedingungen wissen müssen.',
    date: '04. Februar 2024',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Nachhaltig reisen mit Monotours24',
    excerpt: 'CO₂-Kompensation, Green Stay Hotels &amp; Rail &amp; Fly – so unterstützen wir nachhaltige Reisen.',
    date: '22. Februar 2024',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80'
  }
];

const legalContent = {
  impressum: `
    <h2>Impressum</h2>
    <p><strong>Monotours24 – Andrii Tiurin</strong><br />
    Julian-Marchlewski-Ring 104<br />
    16303 Schwedt/Oder, Deutschland</p>
    <p><strong>Geschäftsführer:</strong> Andrii Tiurin</p>
    <p><strong>Telefon:</strong> 0175 906 8548<br />
    <strong>E-Mail:</strong> <a href="mailto:Monotours24@gmail.com">Monotours24@gmail.com</a><br />
    <strong>Web:</strong> <a href="https://monotours24.de" target="_blank" rel="noopener">monotours24.de</a></p>
    <p><strong>Steuernummer:</strong> [Placeholder]<br />
    <strong>USt.-IDNr.:</strong> [Placeholder]</p>
    <p>Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV: Andrii Tiurin</p>
    <h3>Berufshaftpflicht</h3>
    <p>Versicherungsschutz über einen deutschen Versicherer. Genaue Daten auf Anfrage.</p>
  `,
  datenschutz: `
    <h2>Datenschutzerklärung</h2>
    <p>Wir verarbeiten personenbezogene Daten ausschließlich gemäß DSGVO. Verantwortlicher ist Monotours24 – Andrii Tiurin.</p>
    <h3>Welche Daten werden verarbeitet?</h3>
    <ul>
      <li>Kundendaten für Buchungen (Name, Kontaktdaten, Zahlungsdaten)</li>
      <li>Analysedaten zur Optimierung unseres Angebots</li>
      <li>Partnerdaten für B2B-Verträge</li>
    </ul>
    <h3>Ihre Rechte</h3>
    <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit. Kontaktieren Sie uns unter <a href="mailto:Monotours24@gmail.com">Monotours24@gmail.com</a>.</p>
    <h3>Cookies</h3>
    <p>Wir setzen technisch notwendige Cookies und, nach Zustimmung, Analyse-Cookies ein. Sie können Ihre Einwilligung jederzeit widerrufen.</p>
  `,
  agb: `
    <h2>Allgemeine Geschäftsbedingungen</h2>
    <ol>
      <li><strong>Vertragsabschluss:</strong> Ein Reisevertrag kommt mit schriftlicher oder elektronischer Bestätigung zustande.</li>
      <li><strong>Zahlung:</strong> Anzahlung 20 % bei Buchung, Restzahlung 30 Tage vor Abreise. Zahlungen via PayPal, Kreditkarte oder SEPA.</li>
      <li><strong>Umbuchung &amp; Storno:</strong> Gemäß gesetzlichen Regelungen und Veranstalterbedingungen. Individuelle Kulanzregelungen auf Anfrage.</li>
      <li><strong>Haftung:</strong> Wir haften im Rahmen der gesetzlichen Vorschriften; weitergehende Ansprüche richten sich nach dem BGB.</li>
      <li><strong>Gerichtsstand:</strong> Schwedt/Oder, Deutschland.</li>
    </ol>
  `
};

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function createSlider() {
  const slider = document.getElementById('hero-slider');
  if (!slider) return;

  slider.innerHTML = sliderData
    .map(
      (slide, index) => `
        <div class="hero-slide${index === 0 ? ' is-active' : ''}" style="--slide-image: url('${slide.image}')">
          <div class="slide-info">
            <span class="slide-tag">${slide.tag}</span>
            <h1>${slide.title}</h1>
            <p>${slide.description}</p>
            <div class="slide-actions">
              <a href="#angebote" class="btn">${slide.cta}</a>
              <span class="price-tag">${slide.price}</span>
            </div>
            <p class="form-hint">${slide.secondary}</p>
          </div>
          <div class="slide-image" aria-hidden="true">
            <img src="${slide.image}" alt="${slide.title}" loading="lazy" />
          </div>
        </div>
      `
    )
    .join('');

  let current = 0;
  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const total = slides.length;
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');

  const showSlide = (index) => {
    slides[current].classList.remove('is-active');
    current = (index + total) % total;
    slides[current].classList.add('is-active');
  };

  const autoRotate = () => showSlide(current + 1);
  let interval = setInterval(autoRotate, 7000);

  const resetInterval = () => {
    clearInterval(interval);
    interval = setInterval(autoRotate, 7000);
  };

  prevBtn?.addEventListener('click', () => {
    showSlide(current - 1);
    resetInterval();
  });

  nextBtn?.addEventListener('click', () => {
    showSlide(current + 1);
    resetInterval();
  });

  slider.addEventListener('mouseenter', () => clearInterval(interval));
  slider.addEventListener('mouseleave', resetInterval);
}

function createDeals() {
  const grid = document.getElementById('deal-grid');
  if (!grid) return;
  grid.innerHTML = dealData
    .map(
      (deal) => `
        <article class="deal-card" data-destination="${deal.destination}">
          <div class="deal-image">
            <img src="${deal.image}" alt="${deal.title}" loading="lazy" />
          </div>
          <div class="deal-content">
            <div class="deal-meta">
              <span>${deal.destination}</span>
              <span class="countdown" data-end-date="${deal.endDate}"></span>
            </div>
            <h3>${deal.title}</h3>
            <p>${deal.nights} Nächte · ${deal.perks.join(' · ')}</p>
            <div class="deal-meta">
              <span class="price-tag">ab ${deal.price.toLocaleString('de-DE')} €</span>
              <button class="btn btn-secondary" data-booking='${JSON.stringify({
                title: deal.title,
                price: deal.price,
                destination: deal.destination
              })}'>Angebot sichern</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function createServices() {
  const grid = document.getElementById('service-grid');
  if (!grid) return;
  grid.innerHTML = serviceData
    .map(
      (service) => `
        <article class="service-card">
          <div class="icon">${service.icon}</div>
          <h3>${service.title}</h3>
          <p>${service.description}</p>
        </article>
      `
    )
    .join('');
}

function createHotels(filter = 'alle') {
  const grid = document.getElementById('hotel-grid');
  if (!grid) return;
  const filtered = filter === 'alle' ? hotelData : hotelData.filter((hotel) => hotel.category === filter);
  grid.innerHTML = filtered
    .map(
      (hotel) => `
        <article class="hotel-card">
          <span class="badge">${hotel.category === 'luxury' ? 'Luxus' : hotel.category === 'beach' ? 'Strand' : 'City'}</span>
          <img src="${hotel.image}" alt="${hotel.title}" loading="lazy" />
          <h3>${hotel.title}</h3>
          <p>${hotel.location}</p>
          <div class="rating">${'★'.repeat(hotel.rating)}</div>
          <p class="price-tag">${hotel.price}</p>
          <p>${hotel.highlights.join(' · ')}</p>
          <button class="btn btn-secondary" data-booking='${JSON.stringify({
            title: hotel.title,
            price: hotel.price,
            destination: hotel.location
          })}'>Hotel anfragen</button>
        </article>
      `
    )
    .join('');
}

function createPackages() {
  const grid = document.getElementById('package-grid');
  if (!grid) return;
  grid.innerHTML = packageData
    .map(
      (pkg) => `
        <article class="package-card">
          <div class="icon">📦</div>
          <h3>${pkg.title}</h3>
          <p>${pkg.description}</p>
          <p><strong>Dauer:</strong> ${pkg.duration}</p>
          <span class="price-tag">ab ${pkg.price.toLocaleString('de-DE')} €</span>
          <button class="btn" data-booking='${JSON.stringify({
            title: pkg.title,
            price: pkg.price,
            destination: pkg.description
          })}'>Jetzt anfragen</button>
        </article>
      `
    )
    .join('');
}

function createTransfers() {
  const grid = document.getElementById('transfer-grid');
  if (!grid) return;
  grid.innerHTML = transferData
    .map(
      (transfer) => `
        <article class="transfer-card">
          <div class="icon">${transfer.icon}</div>
          <h3>${transfer.title}</h3>
          <p>${transfer.description}</p>
        </article>
      `
    )
    .join('');
}

function createBlog() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;
  grid.innerHTML = blogPosts
    .map(
      (post) => `
        <article class="blog-card">
          <img src="${post.image}" alt="${post.title}" loading="lazy" />
          <p class="form-hint">${post.date}</p>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <a href="#" class="btn btn-secondary">Mehr erfahren</a>
        </article>
      `
    )
    .join('');
}

function setupSearchTabs() {
  const tabs = document.querySelectorAll('.search-tab');
  const forms = document.querySelectorAll('.search-form');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      forms.forEach((form) => form.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target)?.classList.add('active');
    });
  });
}

function setupHotelFilter() {
  const select = document.getElementById('hotel-filter-select');
  if (!select) return;
  select.addEventListener('change', () => createHotels(select.value));
}

function setupCountdowns() {
  const countdowns = document.querySelectorAll('.countdown');
  const update = () => {
    countdowns.forEach((element) => {
      const end = new Date(element.dataset.endDate);
      const diff = end - new Date();
      if (diff <= 0) {
        element.textContent = 'Nur noch heute';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      element.textContent = `${days}T ${hours}Std`;
    });
  };
  update();
  setInterval(update, 60 * 1000);
}

function setupForms() {
  const flightForm = document.getElementById('flight-search');
  const hotelForm = document.getElementById('hotel-search');
  const packageForm = document.getElementById('package-search');
  const partnerForm = document.getElementById('partner-request');
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  const customerLoginForm = document.getElementById('customer-login-form');

  const handleSubmit = (form, type, callback) => {
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const entry = {
        type,
        data: payload,
        createdAt: new Date().toISOString()
      };
      storage.push('monotours24_requests', entry);
      callback?.(payload, entry);
      alert('Vielen Dank! Wir melden uns in Kürze bei Ihnen.');
      form.reset();
    });
  };

  handleSubmit(flightForm, 'flights');
  handleSubmit(hotelForm, 'hotels');
  handleSubmit(packageForm, 'packages');
  handleSubmit(partnerForm, 'partner');
  handleSubmit(contactForm, 'contact');
  handleSubmit(newsletterForm, 'newsletter', (payload, entry) => {
    const newsletterData = storage.get('monotours24_newsletter', []);
    newsletterData.push({ email: payload['newsletter-email'] || payload.email, createdAt: entry.createdAt });
    storage.set('monotours24_newsletter', newsletterData);
  });

  customerLoginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('customer-email').value;
    const password = document.getElementById('customer-password').value;
    if (email === 'kunde@monotours24.de' && password === 'reisen2024') {
      alert('Login erfolgreich. Dies ist eine Demo-Ansicht.');
    } else {
      alert('Bitte prüfen Sie Ihre Zugangsdaten.');
    }
  });
}

function setupBookingButtons() {
  const handler = (event) => {
    const button = event.target.closest('button[data-booking]');
    if (!button) return;
    const payload = JSON.parse(button.dataset.booking);
    openBookingModal(payload);
  };
  document.addEventListener('click', handler);
}

function openBookingModal(payload) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;

  content.innerHTML = `
    <div class="booking-modal">
      <h2>Reiseanfrage</h2>
      <div class="booking-summary">
        <p><strong>Leistung:</strong> ${payload.title}</p>
        ${payload.destination ? `<p><strong>Reiseziel:</strong> ${payload.destination}</p>` : ''}
        ${payload.price ? `<p><strong>ab Preis:</strong> ${formatPrice(payload.price)}</p>` : ''}
      </div>
      <form id="booking-form">
        <div class="form-group">
          <label for="booking-name">Name</label>
          <input id="booking-name" name="name" required />
        </div>
        <div class="form-group">
          <label for="booking-email">E-Mail</label>
          <input id="booking-email" name="email" type="email" required />
        </div>
        <div class="form-group">
          <label for="booking-phone">Telefon</label>
          <input id="booking-phone" name="phone" type="tel" />
        </div>
        <div class="form-group">
          <label for="booking-message">Nachricht</label>
          <textarea id="booking-message" name="message" rows="3" placeholder="Reisetermin, Wünsche, Budget"></textarea>
        </div>
        <label class="checkbox">
          <input type="checkbox" name="privacy" required />
          <span>Ich akzeptiere die Datenschutzerklärung.</span>
        </label>
        <button type="submit" class="btn">Anfrage absenden</button>
      </form>
    </div>
  `;

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');

  const bookingForm = document.getElementById('booking-form');
  bookingForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const booking = {
      ...payload,
      customer: Object.fromEntries(formData.entries()),
      createdAt: new Date().toISOString(),
      status: 'offen'
    };
    storage.push('monotours24_bookings', booking);
    alert('Vielen Dank! Ihre Reiseanfrage wurde übermittelt.');
    closeModal();
  });
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
  closeBtn?.addEventListener('click', closeModal);

  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const key = trigger.dataset.openModal;
      const content = document.getElementById('modal-content');
      if (!key || !content) return;
      content.innerHTML = legalContent[key] || '<p>Inhalt wird derzeit überarbeitet.</p>';
      const overlay = document.getElementById('modal-overlay');
      overlay?.classList.add('show');
      overlay?.setAttribute('aria-hidden', 'false');
    });
  });
}

function setupCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const accept = document.getElementById('cookie-accept');
  const settings = document.getElementById('cookie-settings');
  if (!banner || !accept) return;
  if (!localStorage.getItem('monotours24_cookie')) {
    banner.classList.add('show');
  }
  accept.addEventListener('click', () => {
    localStorage.setItem('monotours24_cookie', JSON.stringify({ consent: true, date: new Date().toISOString() }));
    banner.classList.remove('show');
  });
  settings?.addEventListener('click', () => alert('Cookie-Einstellungen sind in Vorbereitung.'));
}

function setupNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('primary-menu');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu?.classList.toggle('open');
  });

  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function setupStatsObserver() {
  const values = document.querySelectorAll('.stat-value');
  if (!values.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  values.forEach((value) => observer.observe(value));
}

function animateValue(element) {
  const target = Number(element.dataset.target || 0);
  let current = 0;
  const step = Math.max(1, Math.round(target / 60));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = target.toLocaleString('de-DE');
      clearInterval(timer);
    } else {
      element.textContent = current.toLocaleString('de-DE');
    }
  }, 20);
}

function setupFooterYear() {
  const element = document.getElementById('current-year');
  if (element) {
    element.textContent = new Date().getFullYear();
  }
}

function formatPrice(price) {
  if (typeof price === 'number') {
    return `${price.toLocaleString('de-DE')} €`;
  }
  return price;
}

document.addEventListener('DOMContentLoaded', () => {
  createSlider();
  createDeals();
  createServices();
  createHotels();
  createPackages();
  createTransfers();
  createBlog();
  setupSearchTabs();
  setupHotelFilter();
  setupCountdowns();
  setupForms();
  setupBookingButtons();
  setupModal();
  setupCookieBanner();
  setupNavigation();
  setupStatsObserver();
  setupFooterYear();
});
