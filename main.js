const state = {
  navigation: [],
  sliderData: [],
  deals: [],
  services: [],
  hotels: [],
  packages: [],
  transfers: [],
  flights: [],
  blogPosts: [],
  settings: {},
  legal: {},
  seo: []
};

let sliderTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  bootstrapInterface();
  loadPortalContent();
});

function bootstrapInterface() {
  setupSearchTabs();
  setupHotelFilter();
  setupForms();
  setupBookingButtons();
  setupModal();
  setupCookieBanner();
  setupNavigation();
  setupStatsObserver();
  setupFooterYear();
}

async function loadPortalContent() {
  try {
    const response = await fetch('/api/public/content');
    if (!response.ok) {
      throw new Error('Inhalte konnten nicht geladen werden');
    }
    const data = await response.json();
    state.navigation = data.navigation || [];
    state.sliderData = data.heroSlides || [];
    state.deals = data.hotDeals || [];
    state.services = (data.settings?.services || []);
    state.hotels = data.hotels || [];
    state.packages = data.packages || [];
    state.transfers = data.transfers || [];
    state.flights = data.flights || [];
    state.blogPosts = data.blogPosts || [];
    state.settings = data.settings || {};
    state.seo = data.seo || [];
    state.legal = (data.legal || []).reduce((acc, entry) => {
      acc[entry.slug] = entry;
      return acc;
    }, {});

    applyBranding();
    renderNavigation();
    renderHero();
    renderDeals();
    renderServices();
    renderHotels();
    renderPackages();
    renderTransfers();
    renderBlog();
    renderFooter();
    populateLegalContent();
    setupCountdowns();
  } catch (error) {
    console.error('Fehler beim Laden der Inhalte:', error);
  }
}

function applyBranding() {
  const branding = state.settings.branding || {};
  const theme = state.settings.theme || {};
  const contact = state.settings.contact || {};
  const footer = state.settings.footer || {};
  const multilingual = state.settings.multilingual || {};

  const root = document.documentElement;
  if (theme.primaryColor) root.style.setProperty('--color-primary', theme.primaryColor);
  if (theme.secondaryColor) root.style.setProperty('--color-secondary', theme.secondaryColor);
  if (theme.accentColor) root.style.setProperty('--color-accent', theme.accentColor);
  if (theme.neutralColor) root.style.setProperty('--color-text', theme.neutralColor);
  if (theme.fontBody) document.body.style.fontFamily = `${theme.fontBody}, 'Segoe UI', sans-serif`;

  document.querySelectorAll('.logo-text').forEach((element) => {
    element.textContent = branding.brandName || 'Monotours24';
  });

  const logoIconElements = document.querySelectorAll('.logo-icon');
  logoIconElements.forEach((element) => {
    if (branding.logoUrl) {
      element.innerHTML = `<img src="${branding.logoUrl}" alt="${branding.brandName || 'Monotours24'}" />`;
    } else {
      element.textContent = '✈️';
    }
  });

  const topBarLeft = document.querySelector('.top-bar-left');
  if (topBarLeft) {
    topBarLeft.innerHTML = `
      <span><strong>Hotline:</strong> ${contact.phone || '0175 906 8548'}</span>
      <span><strong>WhatsApp:</strong> ${contact.whatsapp || contact.phone || ''}</span>
      <span><strong>E-Mail:</strong> ${contact.email || 'Monotours24@gmail.com'}</span>
    `;
  }

  const languageSwitch = document.querySelector('.language-switch');
  if (languageSwitch && multilingual) {
    const enabled = multilingual.englishEnabled ? 'EN verfügbar' : 'EN demnächst';
    languageSwitch.innerHTML = `${multilingual.defaultLocale?.toUpperCase() || 'DE'} <span class="tag">${enabled}</span>`;
  }

  const floatingButtons = document.querySelector('.floating-contact');
  if (floatingButtons) {
    const whatsappLink = floatingButtons.querySelector('.whatsapp');
    const phoneLink = floatingButtons.querySelector('.phone');
    if (whatsappLink && contact.whatsapp) {
      const sanitized = contact.whatsapp.replace(/\D/g, '');
      whatsappLink.href = `https://wa.me/${sanitized}`;
    }
    if (phoneLink && contact.phone) {
      phoneLink.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
    }
  }

  const footerBrand = document.querySelector('.footer-brand p');
  if (footerBrand && branding.tagline) {
    footerBrand.textContent = branding.tagline;
  }

  const footerInfo = document.querySelector('.footer-bottom p:nth-of-type(2)');
  if (footerInfo) {
    footerInfo.textContent = `Steuernummer: ${footer.taxNumber || 'auf Anfrage'} · USt.-IDNr.: ${footer.vatId || 'auf Anfrage'}`;
  }
}

function renderNavigation() {
  const menu = document.getElementById('primary-menu');
  if (menu && state.navigation.length) {
    menu.innerHTML = state.navigation
      .filter((item) => item.visible !== 0)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
      .join('');
  }
}

function renderHero() {
  const container = document.getElementById('hero-slider');
  if (!container) return;

  if (sliderTimer) {
    clearInterval(sliderTimer);
    sliderTimer = null;
  }

  if (!state.sliderData.length) {
    container.innerHTML = '<div class="hero-slide is-active"><div class="slide-info"><h1>Monotours24</h1><p>Ihr Reiseexperte für Traumreisen.</p></div></div>';
    return;
  }

  container.innerHTML = state.sliderData
    .map(
      (slide, index) => `
        <div class="hero-slide${index === 0 ? ' is-active' : ''}" style="--slide-image: url('${slide.imageUrl || slide.image}')">
          <div class="slide-info">
            ${slide.tag ? `<span class="slide-tag">${slide.tag}</span>` : ''}
            <h1>${slide.title}</h1>
            ${slide.description ? `<p>${slide.description}</p>` : ''}
            <div class="slide-actions">
              <a href="${slide.ctaLink || '#angebote'}" class="btn">${slide.ctaLabel || 'Jetzt anfragen'}</a>
              ${slide.priceLabel ? `<span class="price-tag">${slide.priceLabel}</span>` : ''}
            </div>
            ${slide.secondaryLine ? `<p class="form-hint">${slide.secondaryLine}</p>` : ''}
          </div>
          <div class="slide-image" aria-hidden="true">
            <img src="${slide.imageUrl || slide.image}" alt="${slide.title}" loading="lazy" />
          </div>
        </div>
      `
    )
    .join('');

  const slides = Array.from(container.querySelectorAll('.hero-slide'));
  let current = 0;
  const total = slides.length;
  const prev = document.getElementById('slider-prev');
  const next = document.getElementById('slider-next');

  const showSlide = (index) => {
    slides[current]?.classList.remove('is-active');
    current = (index + total) % total;
    slides[current]?.classList.add('is-active');
  };

  const rotate = () => showSlide(current + 1);
  sliderTimer = setInterval(rotate, 7000);

  const reset = () => {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(rotate, 7000);
  };

  prev?.addEventListener('click', () => {
    showSlide(current - 1);
    reset();
  });

  next?.addEventListener('click', () => {
    showSlide(current + 1);
    reset();
  });

  container.addEventListener('mouseenter', () => clearInterval(sliderTimer));
  container.addEventListener('mouseleave', reset);
}

function renderDeals() {
  const grid = document.getElementById('deal-grid');
  if (!grid) return;

  grid.innerHTML = state.deals
    .map((deal) => {
      const price = typeof deal.price === 'number' ? `ab ${deal.price.toLocaleString('de-DE')} €` : deal.priceLabel || '';
      const perks = Array.isArray(deal.perks) ? deal.perks.join(' · ') : '';
      const payload = encodeBookingPayload({
        productType: 'deal',
        productId: deal.id,
        title: deal.title,
        destination: deal.destination,
        price: deal.price,
        travelDate: deal.endDate
      });
      return `
        <article class="deal-card" data-destination="${deal.destination || ''}">
          <div class="deal-image">
            <img src="${deal.imageUrl || ''}" alt="${deal.title}" loading="lazy" />
          </div>
          <div class="deal-content">
            <div class="deal-meta">
              <span>${deal.destination || ''}</span>
              <span class="countdown" data-end-date="${deal.endDate || ''}"></span>
            </div>
            <h3>${deal.title}</h3>
            <p>${perks}</p>
            <div class="deal-meta">
              <span class="price-tag">${price}</span>
              <button class="btn btn-secondary" data-booking="${payload}">Angebot sichern</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderServices() {
  const grid = document.getElementById('service-grid');
  if (!grid) return;
  const services = state.services.length ? state.services : defaultServices();
  grid.innerHTML = services
    .map(
      (service) => `
        <article class="service-card">
          <div class="icon">${service.icon || '✨'}</div>
          <h3>${service.title}</h3>
          <p>${service.description}</p>
        </article>
      `
    )
    .join('');
}

function renderHotels(filter = 'alle') {
  const grid = document.getElementById('hotel-grid');
  if (!grid) return;
  const hotels = state.hotels.map((hotel) => ({ ...hotel, category: determineHotelCategory(hotel) }));
  const filtered = filter === 'alle' ? hotels : hotels.filter((hotel) => hotel.category === filter);

  grid.innerHTML = filtered
    .map((hotel) => {
      const amenities = Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 3).join(' · ') : '';
      const price = hotel.priceDisplay || (hotel.priceFrom ? `ab ${hotel.priceFrom.toLocaleString('de-DE')} €` : 'auf Anfrage');
      const rating = hotel.rating ? '★'.repeat(Math.round(hotel.rating)) : '';
      const payload = encodeBookingPayload({
        productType: 'hotel',
        productId: hotel.id,
        title: hotel.title,
        destination: hotel.location,
        price: hotel.priceFrom
      });
      return `
        <article class="hotel-card" data-category="${hotel.category}">
          <span class="badge">${renderCategoryLabel(hotel.category)}</span>
          <img src="${hotel.imageUrl || hotel.image || ''}" alt="${hotel.title}" loading="lazy" />
          <h3>${hotel.title}</h3>
          <p>${hotel.location || ''}</p>
          <div class="rating">${rating}</div>
          <p class="price-tag">${price}</p>
          <p>${amenities}</p>
          <button class="btn btn-secondary" data-booking="${payload}">Hotel anfragen</button>
        </article>
      `;
    })
    .join('');
}

function renderPackages() {
  const grid = document.getElementById('package-grid');
  if (!grid) return;
  grid.innerHTML = state.packages
    .map((pkg) => {
      const payload = encodeBookingPayload({
        productType: 'package',
        productId: pkg.id,
        title: pkg.title,
        destination: pkg.location,
        price: pkg.priceFrom
      });
      const price = pkg.priceDisplay || (pkg.priceFrom ? `ab ${pkg.priceFrom.toLocaleString('de-DE')} €` : 'auf Anfrage');
      return `
        <article class="package-card">
          <div class="icon">📦</div>
          <h3>${pkg.title}</h3>
          <p>${pkg.description || ''}</p>
          <p><strong>Verfügbarkeit:</strong> ${formatAvailability(pkg)}</p>
          <span class="price-tag">${price}</span>
          <button class="btn" data-booking="${payload}">Jetzt anfragen</button>
        </article>
      `;
    })
    .join('');
}

function renderTransfers() {
  const grid = document.getElementById('transfer-grid');
  if (!grid) return;
  grid.innerHTML = state.transfers
    .map((transfer) => {
      const amenities = Array.isArray(transfer.amenities) ? transfer.amenities.join(' · ') : '';
      const payload = encodeBookingPayload({
        productType: 'transfer',
        productId: transfer.id,
        title: transfer.title,
        destination: transfer.location,
        price: transfer.priceFrom
      });
      const price = transfer.priceDisplay || (transfer.priceFrom ? `ab ${transfer.priceFrom.toLocaleString('de-DE')} €` : 'auf Anfrage');
      return `
        <article class="transfer-card">
          <div class="icon">🚐</div>
          <h3>${transfer.title}</h3>
          <p>${transfer.description || ''}</p>
          <p class="form-hint">${amenities}</p>
          <span class="price-tag">${price}</span>
          <button class="btn btn-secondary" data-booking="${payload}">Transfer anfragen</button>
        </article>
      `;
    })
    .join('');
}

function renderBlog() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;
  grid.innerHTML = state.blogPosts
    .map((post) => `
      <article class="blog-card">
        <img src="${post.imageUrl || post.image || ''}" alt="${post.title}" loading="lazy" />
        <p class="form-hint">${formatPostDate(post.publishedAt)}</p>
        <h3>${post.title}</h3>
        <p>${post.excerpt || ''}</p>
        <a href="#" class="btn btn-secondary">Mehr erfahren</a>
      </article>
    `)
    .join('');
}

function renderFooter() {
  const footerBrand = document.querySelector('.footer-brand p');
  const footerBottom = document.querySelector('.footer-bottom .container');
  const footer = state.settings.footer || {};
  const contact = state.settings.contact || {};
  if (footerBrand && footer.company) {
    footerBrand.textContent = `${footer.company} · ${footer.street}, ${footer.postalCode} ${footer.city}`;
  }
  if (footerBottom) {
    const paragraphs = footerBottom.querySelectorAll('p');
    if (paragraphs[0]) {
      paragraphs[0].innerHTML = `© <span id="current-year"></span> ${footer.company || 'Monotours24'} – ${footer.managingDirector || 'Geschäftsführung'}. Alle Rechte vorbehalten.`;
      setupFooterYear();
    }
    if (paragraphs[1]) {
      paragraphs[1].textContent = `Steuernummer: ${footer.taxNumber || 'auf Anfrage'} · USt.-IDNr.: ${footer.vatId || 'auf Anfrage'}`;
    }
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const phoneInput = contactForm.querySelector('#contact-phone');
    if (phoneInput && contact.phone) {
      phoneInput.placeholder = contact.phone;
    }
  }
}

function populateLegalContent() {
  window.legalContent = window.legalContent || {};
  const defaults = {
    agb: '<h2>Allgemeine Geschäftsbedingungen</h2><p>Die vollständigen Geschäftsbedingungen werden derzeit vorbereitet.</p>'
  };

  Object.entries(state.legal).forEach(([slug, entry]) => {
    window.legalContent[slug] = `<h2>${entry.title}</h2>${entry.content}`;
  });

  Object.entries(defaults).forEach(([key, value]) => {
    if (!window.legalContent[key]) {
      window.legalContent[key] = value;
    }
  });
}

function setupSearchTabs() {
  const tabs = document.querySelectorAll('.search-tab');
  const forms = document.querySelectorAll('.search-form');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('active'));
      forms.forEach((form) => form.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target)?.classList.add('active');
    });
  });
}

function setupHotelFilter() {
  const select = document.getElementById('hotel-filter-select');
  if (!select) return;
  select.addEventListener('change', () => renderHotels(select.value));
}

function setupCountdowns() {
  const countdowns = document.querySelectorAll('.countdown');
  if (!countdowns.length) return;
  const update = () => {
    countdowns.forEach((element) => {
      const end = new Date(element.dataset.endDate || '');
      if (Number.isNaN(end.getTime())) {
        element.textContent = '';
        return;
      }
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
  setInterval(update, 60000);
}

function setupForms() {
  const partnerForm = document.getElementById('partner-request');
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  const customerLoginForm = document.getElementById('customer-login-form');
  const flightForm = document.getElementById('flight-search');
  const hotelForm = document.getElementById('hotel-search');
  const packageForm = document.getElementById('package-search');

  partnerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(partnerForm);
    const payload = Object.fromEntries(formData.entries());
    try {
      await submitJson('/api/partner-requests', {
        companyName: payload['partner-company'],
        contactName: payload['partner-contact'],
        email: payload['partner-email'],
        phone: '',
        message: [payload['partner-type'], payload['partner-message']].filter(Boolean).join(' – ')
      });
      alert('Vielen Dank! Wir melden uns mit Ihrem Partnerzugang.');
      partnerForm.reset();
    } catch (error) {
      alert(error.message || 'Anfrage konnte nicht gesendet werden.');
    }
  });

  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    try {
      await submitJson('/api/contact', {
        firstName: payload['contact-name']?.split(' ')[0] || '',
        lastName: payload['contact-name']?.split(' ').slice(1).join(' '),
        email: payload['contact-email'],
        phone: payload['contact-phone'],
        message: payload['contact-message'],
        topic: payload['contact-topic']
      });
      alert('Vielen Dank für Ihre Anfrage! Wir melden uns schnellstmöglich.');
      contactForm.reset();
    } catch (error) {
      alert(error.message || 'Nachricht konnte nicht gesendet werden.');
    }
  });

  newsletterForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(newsletterForm);
    const payload = Object.fromEntries(formData.entries());
    try {
      await submitJson('/api/newsletter', {
        email: payload['newsletter-email'],
        firstName: ''
      });
      alert('Vielen Dank für Ihre Anmeldung zum Newsletter!');
      newsletterForm.reset();
    } catch (error) {
      alert(error.message || 'Newsletter-Anmeldung fehlgeschlagen.');
    }
  });

  customerLoginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Dies ist eine Demo. Login-Funktion wird im Kundenportal aktiviert.');
    customerLoginForm.reset();
  });

  const bindSearchForm = (form, type) => {
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      openBookingModal({
        productType: type,
        title: `Anfrage ${type}`,
        destination: payload[`${type}-destination`] || payload[`${type}-to`] || payload[`${type}-city`] || '',
        travelDate: payload[`${type}-date`] || payload[`${type}-checkin`] || null,
        meta: payload
      });
    });
  };

  bindSearchForm(flightForm, 'flight');
  bindSearchForm(hotelForm, 'hotel');
  bindSearchForm(packageForm, 'package');
}

function setupBookingButtons() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-booking]');
    if (!button) return;
    try {
      const data = JSON.parse(decodeURIComponent(button.dataset.booking));
      openBookingModal(data);
    } catch (error) {
      console.error('Ungültige Buchungsdaten', error);
    }
  });
}

function openBookingModal(payload) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;

  const travelInfo = [payload.destination ? `<p><strong>Reiseziel:</strong> ${payload.destination}</p>` : '', payload.price ? `<p><strong>ab Preis:</strong> ${formatPrice(payload.price)}</p>` : '', payload.travelDate ? `<p><strong>Reisedatum:</strong> ${formatDate(payload.travelDate)}</p>` : '']
    .filter(Boolean)
    .join('');

  content.innerHTML = `
    <div class="booking-modal">
      <h2>Reiseanfrage</h2>
      <div class="booking-summary">
        <p><strong>Leistung:</strong> ${payload.title || 'Individuelle Anfrage'}</p>
        ${travelInfo}
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
  bookingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const name = formData.get('name')?.toString() || '';
    const [firstName, ...rest] = name.trim().split(' ');
    const customer = {
      firstName: firstName || name,
      lastName: rest.join(' '),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: 'reiseportal123'
    };
    const message = formData.get('message');

    try {
      await submitJson('/api/bookings', {
        productType: payload.productType || 'anfrage',
        productId: payload.productId || null,
        amount: payload.price || 0,
        currency: 'EUR',
        travelDate: payload.travelDate || null,
        customer
      });
      if (message) {
        submitJson('/api/contact', {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          message: `${message}\n\nAnfrage: ${payload.title || ''}`
        }).catch(() => {});
      }
      alert('Vielen Dank! Ihre Reiseanfrage wurde übermittelt.');
      closeModal();
    } catch (error) {
      alert(error.message || 'Die Anfrage konnte nicht gespeichert werden.');
    }
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
      const legal = window.legalContent?.[key];
      content.innerHTML = legal || '<p>Inhalt wird derzeit überarbeitet.</p>';
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
  settings?.addEventListener('click', () => alert('Cookie-Einstellungen folgen in Kürze.'));
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
  return price || '';
}

function formatDate(date) {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('de-DE').format(new Date(date));
  } catch (error) {
    return date;
  }
}

function formatPostDate(date) {
  if (!date) return 'Aktuell';
  try {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(date));
  } catch (error) {
    return date;
  }
}

async function submitJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    let message = 'Aktion fehlgeschlagen.';
    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }
  return response.json().catch(() => ({}));
}

function encodeBookingPayload(payload) {
  return encodeURIComponent(JSON.stringify(payload));
}

function determineHotelCategory(hotel) {
  if (hotel.category) return hotel.category;
  const rating = Number(hotel.rating || 0);
  const description = `${hotel.description || ''}`.toLowerCase();
  if (rating >= 4.7 || description.includes('luxus')) return 'luxury';
  if (description.includes('strand') || description.includes('beach')) return 'beach';
  return 'city';
}

function renderCategoryLabel(category) {
  switch (category) {
    case 'luxury':
      return 'Luxus';
    case 'beach':
      return 'Strand';
    case 'city':
    default:
      return 'City';
  }
}

function formatAvailability(product) {
  if (product.availabilityStart && product.availabilityEnd) {
    return `${formatDate(product.availabilityStart)} – ${formatDate(product.availabilityEnd)}`;
  }
  if (product.availabilityStart) {
    return `ab ${formatDate(product.availabilityStart)}`;
  }
  return 'flexibel';
}

function defaultServices() {
  return [
    {
      icon: '✈️',
      title: 'Flugexperten',
      description: 'Direkte Anbindung an GDS & NDC – wir sichern Verfügbarkeiten und Upgrades.'
    },
    {
      icon: '🏨',
      title: 'Hotelwelten',
      description: 'Über 50.000 Hotels mit Bewertungen, Nachhaltigkeits-Scores und Zusatzleistungen.'
    },
    {
      icon: '🛡️',
      title: 'Reiseschutz',
      description: 'Flexible Umbuchungs- und Stornomöglichkeiten inklusive Assistance-Service.'
    },
    {
      icon: '🤝',
      title: 'B2B Partnerschaften',
      description: 'White-Label, API & individuelle Provisionen für Reisebüros und Firmenkunden.'
    }
  ];
}
