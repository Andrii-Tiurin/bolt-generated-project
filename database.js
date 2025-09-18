import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'monotours.json');

const defaultSettings = {
  branding: {
    brandName: 'Monotours24',
    tagline: 'Premium Reisen & B2B Lösungen',
    logoUrl: '',
    logoUpdatedAt: null
  },
  contact: {
    phone: '+49 175 9068548',
    email: 'Monotours24@gmail.com',
    whatsapp: '+49 175 9068548',
    telegram: 'https://t.me/Monotours24',
    address: 'Julian-Marchlewski-Ring 104, 16303 Schwedt/Oder',
    officeHours: 'Mo-Fr 09:00-18:00 Uhr'
  },
  footer: {
    company: 'Monotours24 – Andrii Tiurin',
    street: 'Julian-Marchlewski-Ring 104',
    postalCode: '16303',
    city: 'Schwedt/Oder',
    country: 'Deutschland',
    managingDirector: 'Andrii Tiurin',
    phone: '01759068548',
    email: 'Monotours24@gmail.com',
    website: 'monotours24.de',
    taxNumber: 'Bitte ergänzen',
    vatId: 'Bitte ergänzen'
  },
  theme: {
    primaryColor: '#0a6cff',
    secondaryColor: '#06b6d4',
    accentColor: '#f97316',
    neutralColor: '#0f172a',
    fontHeading: 'Montserrat',
    fontBody: 'Poppins',
    buttonShape: 'rounded'
  },
  multilingual: {
    defaultLocale: 'de',
    availableLocales: ['de', 'en'],
    englishEnabled: false
  },
  services: [
    {
      icon: '✈️',
      title: 'Flugexperten',
      description:
        'Direkte Anbindung an NDC & GDS – Monotours24 vergleicht live alle Airlines und Upsell-Optionen.'
    },
    {
      icon: '🏨',
      title: 'Hotelwelten',
      description:
        'Über 50.000 kuratierte Hotels mit Nachhaltigkeits-Scoring, Ratenvergleich und Zusatzleistungen.'
    },
    {
      icon: '🛡️',
      title: 'Reiseschutz',
      description:
        'Komplette Absicherung mit flexiblen Storno- und Umbuchungsmöglichkeiten inklusive Assistance-Service.'
    },
    {
      icon: '🤝',
      title: 'B2B Partnerschaften',
      description:
        'White-Label, API-Connect und individuelle Incentive-Programme für Agenturen und Firmenkunden.'
    }
  ]
};

let store;

function ensureStore() {
  if (!store) {
    throw new Error('Database not initialized');
  }
}

function persist() {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function sanitizeCustomer(customer) {
  if (!customer) return null;
  const safe = clone(customer);
  if (safe) {
    delete safe.passwordHash;
  }
  return safe;
}

function sanitizeAdminUser(admin) {
  if (!admin) return null;
  const safe = clone(admin);
  if (safe) {
    delete safe.passwordHash;
  }
  return safe;
}

function nowIso() {
  return new Date().toISOString();
}

function futureDate(daysAhead) {
  const date = new Date(Date.now() + daysAhead * 86400000);
  return date.toISOString().split('T')[0];
}

function nextId(collectionName) {
  const collection = store[collectionName];
  if (!collection || collection.length === 0) {
    return 1;
  }
  return Math.max(...collection.map((item) => Number(item.id) || 0)) + 1;
}

function createSeedData() {
  const adminPassword = hashPassword('admin123');
  const customerPassword = hashPassword('kunde123');
  const now = nowIso();

  return {
    settings: clone(defaultSettings),
    navigation: [
      { id: 1, label: 'Startseite', href: '#start', sortOrder: 1, visible: true, createdAt: now, updatedAt: now },
      { id: 2, label: 'Angebote', href: '#angebote', sortOrder: 2, visible: true, createdAt: now, updatedAt: now },
      { id: 3, label: 'Flüge', href: '#fluege', sortOrder: 3, visible: true, createdAt: now, updatedAt: now },
      { id: 4, label: 'Hotels', href: '#hotels', sortOrder: 4, visible: true, createdAt: now, updatedAt: now },
      { id: 5, label: 'Transfers', href: '#transfers', sortOrder: 5, visible: true, createdAt: now, updatedAt: now },
      { id: 6, label: 'Pakete', href: '#pakete', sortOrder: 6, visible: true, createdAt: now, updatedAt: now },
      { id: 7, label: 'Geschäftskunden', href: '#b2b', sortOrder: 7, visible: true, createdAt: now, updatedAt: now },
      { id: 8, label: 'Über uns', href: '#ueber-uns', sortOrder: 8, visible: true, createdAt: now, updatedAt: now },
      { id: 9, label: 'Kontakt', href: '#kontakt', sortOrder: 9, visible: true, createdAt: now, updatedAt: now }
    ],
    heroSlides: [
      {
        id: 1,
        title: 'Sommerträume auf den Malediven',
        subtitle: '7 Nächte All Inclusive',
        description:
          'Luxusresort mit Privatstrand, Direktflug ab Frankfurt & exklusivem Speedboat-Transfer inklusive.',
        tag: 'Top Deal',
        priceLabel: 'ab 2.499 €',
        ctaLabel: 'Jetzt Traumreise sichern',
        ctaLink: '#angebote',
        secondaryLine: 'Flexible Umbuchung bis 14 Tage vor Abreise',
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
        sortOrder: 1,
        active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        title: 'Städtezauber in New York',
        subtitle: '5 Nächte Manhattan',
        description:
          'Boutique-Hotel in Midtown inkl. Direktflug ab Berlin, City-Pass & Travel Concierge Service.',
        tag: 'Last Minute',
        priceLabel: 'ab 1.399 €',
        ctaLabel: 'Flug & Hotel kombinieren',
        ctaLink: '#pakete',
        secondaryLine: 'Nur wenige Plätze verfügbar – jetzt buchen',
        imageUrl: 'https://images.unsplash.com/photo-1526402464533-73a0528ff7a0?auto=format&fit=crop&w=1600&q=80',
        sortOrder: 2,
        active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        title: 'Family Special Türkische Riviera',
        subtitle: 'Ultra All Inclusive',
        description:
          '1 Woche Familienresort mit Wasserpark, Kinderbetreuung & Direktflug inklusive.',
        tag: 'Family Deal',
        priceLabel: 'ab 899 €',
        ctaLabel: 'Familienangebot anfragen',
        ctaLink: '#kontakt',
        secondaryLine: 'Kostenlose Stornierung bis 30 Tage vor Abreise',
        imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
        sortOrder: 3,
        active: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    deals: [
      {
        id: 1,
        title: 'Dubai Deluxe Week',
        destination: 'Dubai, VAE',
        description: '5★ Strandhotel, Business Lounge Zugang & Wüstensafari inklusive.',
        price: 1299,
        currency: 'EUR',
        nights: 7,
        imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
        endDate: futureDate(3),
        perks: ['5★ Strandhotel', 'Business Lounge Zugang', 'Wüstensafari inklusive'],
        isHot: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        title: 'Mallorca Kurztrip',
        destination: 'Mallorca, Spanien',
        description: 'Adults Only Hotel, Halbpension & Zimmer mit Meerblick.',
        price: 599,
        currency: 'EUR',
        nights: 5,
        imageUrl: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80',
        endDate: futureDate(5),
        perks: ['Adults Only Hotel', 'Frühstück & Dinner', 'Zimmer mit Meerblick'],
        isHot: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        title: 'Island Explorer',
        destination: 'Reykjavík, Island',
        description: 'Nordlichter-Tour, Golden Circle Ausflug & Reiseversicherung inklusive.',
        price: 1449,
        currency: 'EUR',
        nights: 6,
        imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80',
        endDate: futureDate(2),
        perks: ['Nordlichter Tour', 'Golden Circle Ausflug', 'Reiseversicherung inklusive'],
        isHot: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        title: 'Safari & Strand Kombi',
        destination: 'Tansania & Sansibar',
        description: 'Serengeti Safari & Sansibar Beach Resort mit privatem Guide.',
        price: 2899,
        currency: 'EUR',
        nights: 10,
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        endDate: futureDate(7),
        perks: ['Serengeti Safari', 'Sansibar Beach Resort', 'Privater Guide'],
        isHot: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    posts: [
      {
        id: 1,
        title: '5 Insider-Tipps für Last Minute Luxusreisen',
        slug: 'last-minute-luxusreisen',
        excerpt: 'So sichern Sie sich Premium-Reisen in letzter Minute mit maximalen Vorteilen.',
        content:
          'Unsere Reiseexperten zeigen, wie Sie selbst wenige Tage vor Abflug die besten Luxusangebote finden und welche Zusatzleistungen wir für Sie verhandeln.',
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        status: 'published',
        publishedAt: now,
        scheduledAt: null,
        tags: ['Tipps', 'Last Minute'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        title: 'B2B White-Label Lösungen für Reisebüros',
        slug: 'b2b-white-label',
        excerpt: 'Monotours24 bietet skalierbare White-Label Portale und API-Anbindungen für Agenturen.',
        content:
          'Mit unserem B2B Hub stellen Sie Ihren Kunden ein eigenes Portal mit Echtzeit-Verfügbarkeiten zur Verfügung und steuern Margen in Echtzeit.',
        imageUrl: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80',
        status: 'published',
        publishedAt: now,
        scheduledAt: null,
        tags: ['B2B', 'Partner'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        title: 'Visa-Update: Fernreisen Winter 2024/2025',
        slug: 'visa-update-fernreisen',
        excerpt: 'Aktuelle Einreisebestimmungen und Visa-Tipps für die Wintersaison.',
        content:
          'Wir beobachten für Sie alle Visa-Regularien, unterstützen bei eVisa-Anträgen und halten Firmenkunden mit Compliance-News auf dem Laufenden.',
        imageUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=1200&q=80',
        status: 'scheduled',
        publishedAt: null,
        scheduledAt: futureDate(14),
        tags: ['Visa', 'Update'],
        createdAt: now,
        updatedAt: now
      }
    ],
    products: [
      {
        id: 1,
        type: 'flight',
        title: 'Lufthansa Business FRA → DXB',
        location: 'Frankfurt · Dubai',
        description: 'Direktflug Lufthansa Business Class inkl. Zug-zum-Flug und Loungezugang.',
        priceFrom: 1199,
        currency: 'EUR',
        priceDisplay: 'ab 1.199 €',
        availabilityStart: futureDate(10),
        availabilityEnd: futureDate(120),
        imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        amenities: ['Fast Lane', 'Lie-Flat Seats', 'Gepäck 2 x 32 kg'],
        isHot: true,
        commissionRule: '5% Aufschlag für B2B',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        type: 'flight',
        title: 'Emirates First Class MUC → SIN',
        location: 'München · Singapur',
        description: 'Erleben Sie Luxus pur inkl. Chauffeur-Service, Shower Spa & Fine Dining an Bord.',
        priceFrom: 3999,
        currency: 'EUR',
        priceDisplay: 'ab 3.999 €',
        availabilityStart: futureDate(30),
        availabilityEnd: futureDate(180),
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        rating: 5,
        amenities: ['Privatsuite', 'Shower Spa', 'Chauffeur Service'],
        isHot: false,
        commissionRule: '4% Nettorabatt für Agenturen',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        type: 'hotel',
        title: 'The Retreat Maldives',
        location: 'North Malé Atoll',
        description: 'Villenresort mit Privatpool, Butler-Service & nachhaltigem Konzept.',
        priceFrom: 2499,
        currency: 'EUR',
        priceDisplay: 'ab 2.499 €',
        availabilityStart: futureDate(15),
        availabilityEnd: futureDate(200),
        imageUrl: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb2100d?auto=format&fit=crop&w=1200&q=80',
        rating: 4.8,
        amenities: ['Butler', 'Private Pool', 'Schnorchel Riff'],
        isHot: true,
        commissionRule: '10% Provision',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        type: 'hotel',
        title: 'Boutique Stay New York',
        location: 'Manhattan, NYC',
        description: 'Designhotel mit Rooftop-Bar, Workation-Bereichen & Concierge Service.',
        priceFrom: 189,
        currency: 'EUR',
        priceDisplay: 'ab 189 € / Nacht',
        availabilityStart: futureDate(5),
        availabilityEnd: futureDate(90),
        imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
        rating: 4.6,
        amenities: ['Rooftop', 'Concierge', 'Coworking Space'],
        isHot: false,
        commissionRule: '12% Provision',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        type: 'package',
        title: 'Maldives Luxury Escape',
        location: 'Malediven',
        description: '10 Tage Inselhopping mit Privatguide, Wasserflugzeug & All Inclusive.',
        priceFrom: 5299,
        currency: 'EUR',
        priceDisplay: 'ab 5.299 €',
        availabilityStart: futureDate(20),
        availabilityEnd: futureDate(240),
        imageUrl: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80',
        rating: 5,
        amenities: ['Privatguide', 'Wasserflugzeug', 'All Inclusive'],
        isHot: true,
        commissionRule: '8% Provision + Upsell',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        type: 'package',
        title: 'Nordlichter Expedition',
        location: 'Island',
        description: '7 Tage Erlebnisreise mit Superjeep, Gletscherwanderung & Aurora Camp.',
        priceFrom: 2299,
        currency: 'EUR',
        priceDisplay: 'ab 2.299 €',
        availabilityStart: futureDate(45),
        availabilityEnd: futureDate(160),
        imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80',
        rating: 4.7,
        amenities: ['Aurora Camp', 'Gletscherwanderung', 'Superjeep'],
        isHot: false,
        commissionRule: '10% Provision',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        type: 'transfer',
        title: 'Private Limousine Flughafen Berlin',
        location: 'Berlin & Brandenburg',
        description: 'Luxuslimousine mit Chauffeur, 2 Stunden Wartezeit inklusive.',
        priceFrom: 129,
        currency: 'EUR',
        priceDisplay: 'ab 129 €',
        availabilityStart: futureDate(0),
        availabilityEnd: futureDate(365),
        imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
        rating: 4.9,
        amenities: ['WIFI', 'Getränke', 'Meet & Greet'],
        isHot: true,
        commissionRule: '15% Provision für Agenturen',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 8,
        type: 'transfer',
        title: 'Shuttle Balearen Inselhopping',
        location: 'Mallorca · Ibiza · Menorca',
        description: 'Shared Shuttle zwischen Flughafen und allen Küstenorten – tägliche Abfahrten.',
        priceFrom: 19,
        currency: 'EUR',
        priceDisplay: 'ab 19 €',
        availabilityStart: futureDate(0),
        availabilityEnd: futureDate(150),
        imageUrl: 'https://images.unsplash.com/photo-1451976426598-a7593bd6d0b2?auto=format&fit=crop&w=1200&q=80',
        rating: 4.3,
        amenities: ['24/7 Hotline', 'Versicherung inklusive', 'Flex Ticket'],
        isHot: false,
        commissionRule: '12% Partner',
        createdAt: now,
        updatedAt: now
      }
    ],
    customers: [
      {
        id: 1,
        firstName: 'Anna',
        lastName: 'Schmidt',
        email: 'anna.schmidt@example.com',
        phone: '+49 30 1234567',
        passwordHash: customerPassword,
        status: 'active',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        firstName: 'Markus',
        lastName: 'Weber',
        email: 'markus.weber@example.com',
        phone: '+49 89 7654321',
        passwordHash: customerPassword,
        status: 'active',
        createdAt: now,
        updatedAt: now
      }
    ],
    partners: [
      {
        id: 1,
        companyName: 'TravelPro GmbH',
        contactName: 'Julia Becker',
        email: 'julia.becker@travelpro.de',
        phone: '+49 211 998877',
        commissionRate: 12,
        accessEnabled: true,
        notes: 'Top Partner mit Firmenkundenfokus',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        companyName: 'CorporateTrips AG',
        contactName: 'Lukas Mayer',
        email: 'lukas.mayer@corporatetrips.de',
        phone: '+49 69 445566',
        commissionRate: 8,
        accessEnabled: true,
        notes: 'Managed Service Kunde – wöchentliche Reports',
        createdAt: now,
        updatedAt: now
      }
    ],
    bookings: [
      {
        id: 1,
        bookingReference: 'MT24-1001',
        customerId: 1,
        partnerId: null,
        productType: 'package',
        productId: 5,
        status: 'bestätigt',
        amount: 2499,
        currency: 'EUR',
        travelDate: futureDate(40),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        bookingReference: 'MT24-1002',
        customerId: 2,
        partnerId: 1,
        productType: 'flight',
        productId: 1,
        status: 'offen',
        amount: 1399,
        currency: 'EUR',
        travelDate: futureDate(20),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        bookingReference: 'MT24-1003',
        customerId: 1,
        partnerId: 2,
        productType: 'hotel',
        productId: 3,
        status: 'storniert',
        amount: 899,
        currency: 'EUR',
        travelDate: futureDate(90),
        createdAt: now,
        updatedAt: now
      }
    ],
    adminUsers: [
      {
        id: 1,
        name: 'Andrii Tiurin',
        email: 'admin@monotours24.de',
        passwordHash: adminPassword,
        role: 'admin',
        status: 'active',
        createdAt: now
      },
      {
        id: 2,
        name: 'Content Team',
        email: 'editor@monotours24.de',
        passwordHash: adminPassword,
        role: 'editor',
        status: 'active',
        createdAt: now
      },
      {
        id: 3,
        name: 'Customer Support',
        email: 'support@monotours24.de',
        passwordHash: adminPassword,
        role: 'support',
        status: 'active',
        createdAt: now
      }
    ],
    activityLogs: [],
    seoMetadata: [
      {
        page: 'home',
        title: 'Monotours24 – Premium Reiseportal für Deutschland',
        description:
          'Last Minute Angebote, Pauschalreisen, Flüge, Hotels & B2B Lösungen für Reisebüros und Firmenkunden in Deutschland.',
        keywords: ['Reisebüro', 'Pauschalreisen', 'Last Minute', 'Geschäftsreisen'],
        updatedAt: now
      },
      {
        page: 'angebote',
        title: 'Top Reiseangebote & Hot Deals | Monotours24',
        description: 'Aktuelle Last Minute Reisen, Hot Deals und Pauschalangebote mit flexiblen Umbuchungsmöglichkeiten.',
        keywords: ['Hot Deals', 'Last Minute Reisen', 'Angebote'],
        updatedAt: now
      },
      {
        page: 'b2b',
        title: 'B2B Partnerportal & API | Monotours24',
        description:
          'Partnerzugang für Reisebüros, Reseller und Firmenkunden. API, White-Label und individuelle Provisionen.',
        keywords: ['B2B Reisen', 'Partnerportal', 'Reise API'],
        updatedAt: now
      }
    ],
    legalPages: [
      {
        slug: 'impressum',
        title: 'Impressum',
        content:
          'Monotours24 – Andrii Tiurin · Julian-Marchlewski-Ring 104 · 16303 Schwedt/Oder · Deutschland · Telefon: 01759068548 · E-Mail: Monotours24@gmail.com',
        updatedAt: now
      },
      {
        slug: 'datenschutz',
        title: 'Datenschutzerklärung',
        content:
          'Monotours24 verarbeitet personenbezogene Daten gemäß DSGVO. Wir informieren transparent über Zwecke, Rechtsgrundlagen und Speicherdauer.',
        updatedAt: now
      },
      {
        slug: 'cookies',
        title: 'Cookie-Richtlinie',
        content:
          'Diese Website verwendet technisch notwendige sowie optionale Cookies für Analyse und Marketing. Sie können Ihre Einstellungen jederzeit anpassen.',
        updatedAt: now
      }
    ],
    paymentGateways: [
      {
        code: 'paypal',
        name: 'PayPal',
        config: { clientId: 'demo-client-id', mode: 'sandbox' },
        enabled: true,
        updatedAt: now
      },
      {
        code: 'credit_card',
        name: 'Kreditkarte',
        config: { provider: 'Stripe', descriptor: 'Monotours24' },
        enabled: true,
        updatedAt: now
      },
      {
        code: 'sepa',
        name: 'SEPA Lastschrift',
        config: { creditorId: 'DE98ZZZ09999999999' },
        enabled: false,
        updatedAt: now
      }
    ],
    contactRequests: [],
    partnerRequests: [],
    newsletterSubscribers: []
  };
}
export function initializeDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (fs.existsSync(dataFile)) {
    const raw = fs.readFileSync(dataFile, 'utf8');
    store = JSON.parse(raw);
  } else {
    store = createSeedData();
    persist();
  }
}

export function getSetting(key) {
  ensureStore();
  return clone(store.settings[key]);
}

export function setSetting(key, value) {
  ensureStore();
  store.settings[key] = clone(value);
  persist();
  return clone(store.settings[key]);
}

export function getSettings(keys) {
  ensureStore();
  if (!keys) {
    return clone(store.settings);
  }
  const result = {};
  for (const key of keys) {
    result[key] = clone(store.settings[key]);
  }
  return result;
}

export function listNavigation(includeHidden = false) {
  ensureStore();
  const items = store.navigation
    .filter((item) => includeHidden || item.visible)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return clone(items);
}

export function createNavigation(payload) {
  ensureStore();
  const item = {
    id: nextId('navigation'),
    label: payload.label,
    href: payload.href,
    sortOrder: Number(payload.sortOrder) || store.navigation.length + 1,
    visible: payload.visible !== false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  store.navigation.push(item);
  persist();
  return clone(item);
}

export function updateNavigation(id, payload) {
  ensureStore();
  const item = store.navigation.find((entry) => entry.id === Number(id));
  if (!item) return null;
  Object.assign(item, {
    label: payload.label ?? item.label,
    href: payload.href ?? item.href,
    sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder) : item.sortOrder,
    visible: payload.visible !== undefined ? Boolean(payload.visible) : item.visible,
    updatedAt: nowIso()
  });
  persist();
  return clone(item);
}

export function deleteNavigation(id) {
  ensureStore();
  const index = store.navigation.findIndex((entry) => entry.id === Number(id));
  if (index === -1) return false;
  store.navigation.splice(index, 1);
  persist();
  return true;
}

export function listHeroSlides() {
  ensureStore();
  const slides = [...store.heroSlides].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return clone(slides);
}

export function createHeroSlide(payload) {
  ensureStore();
  const slide = {
    id: nextId('heroSlides'),
    title: payload.title,
    subtitle: payload.subtitle ?? '',
    description: payload.description ?? '',
    tag: payload.tag ?? '',
    priceLabel: payload.priceLabel ?? '',
    ctaLabel: payload.ctaLabel ?? '',
    ctaLink: payload.ctaLink ?? '#',
    secondaryLine: payload.secondaryLine ?? '',
    imageUrl: payload.imageUrl ?? '',
    sortOrder: Number(payload.sortOrder) || store.heroSlides.length + 1,
    active: payload.active !== false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  store.heroSlides.push(slide);
  persist();
  return clone(slide);
}

export function updateHeroSlide(id, payload) {
  ensureStore();
  const slide = store.heroSlides.find((entry) => entry.id === Number(id));
  if (!slide) return null;
  Object.assign(slide, {
    title: payload.title ?? slide.title,
    subtitle: payload.subtitle ?? slide.subtitle,
    description: payload.description ?? slide.description,
    tag: payload.tag ?? slide.tag,
    priceLabel: payload.priceLabel ?? slide.priceLabel,
    ctaLabel: payload.ctaLabel ?? slide.ctaLabel,
    ctaLink: payload.ctaLink ?? slide.ctaLink,
    secondaryLine: payload.secondaryLine ?? slide.secondaryLine,
    imageUrl: payload.imageUrl ?? slide.imageUrl,
    sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder) : slide.sortOrder,
    active: payload.active !== undefined ? Boolean(payload.active) : slide.active,
    updatedAt: nowIso()
  });
  persist();
  return clone(slide);
}

export function deleteHeroSlide(id) {
  ensureStore();
  const index = store.heroSlides.findIndex((entry) => entry.id === Number(id));
  if (index === -1) return false;
  store.heroSlides.splice(index, 1);
  persist();
  return true;
}

export function listDeals() {
  ensureStore();
  const deals = [...store.deals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return clone(deals);
}

export function createDeal(payload) {
  ensureStore();
  const deal = {
    id: nextId('deals'),
    title: payload.title,
    destination: payload.destination ?? '',
    description: payload.description ?? '',
    price: payload.price !== undefined && payload.price !== null ? Number(payload.price) : null,
    currency: payload.currency ?? 'EUR',
    nights: payload.nights !== undefined && payload.nights !== null ? Number(payload.nights) : null,
    imageUrl: payload.imageUrl ?? '',
    endDate: payload.endDate ?? null,
    perks: Array.isArray(payload.perks) ? payload.perks : [],
    isHot: Boolean(payload.isHot),
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  store.deals.unshift(deal);
  persist();
  return clone(deal);
}

export function updateDeal(id, payload) {
  ensureStore();
  const deal = store.deals.find((entry) => entry.id === Number(id));
  if (!deal) return null;
  Object.assign(deal, {
    title: payload.title ?? deal.title,
    destination: payload.destination ?? deal.destination,
    description: payload.description ?? deal.description,
    price: payload.price !== undefined ? (payload.price === null ? null : Number(payload.price)) : deal.price,
    currency: payload.currency ?? deal.currency,
    nights: payload.nights !== undefined ? (payload.nights === null ? null : Number(payload.nights)) : deal.nights,
    imageUrl: payload.imageUrl ?? deal.imageUrl,
    endDate: payload.endDate !== undefined ? payload.endDate : deal.endDate,
    perks: payload.perks !== undefined ? (Array.isArray(payload.perks) ? payload.perks : []) : deal.perks,
    isHot: payload.isHot !== undefined ? Boolean(payload.isHot) : deal.isHot,
    updatedAt: nowIso()
  });
  persist();
  return clone(deal);
}

export function deleteDeal(id) {
  ensureStore();
  const index = store.deals.findIndex((entry) => entry.id === Number(id));
  if (index === -1) return false;
  store.deals.splice(index, 1);
  persist();
  return true;
}

export function listPosts() {
  ensureStore();
  const posts = [...store.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return clone(posts);
}

export function listPublishedPosts(limit = 4) {
  ensureStore();
  const posts = store.posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  return clone(posts.slice(0, limit));
}

export function createPost(payload) {
  ensureStore();
  const post = {
    id: nextId('posts'),
    title: payload.title,
    slug: payload.slug ?? null,
    excerpt: payload.excerpt ?? '',
    content: payload.content ?? '',
    imageUrl: payload.imageUrl ?? '',
    status: payload.status ?? 'draft',
    publishedAt: payload.publishedAt ?? null,
    scheduledAt: payload.scheduledAt ?? null,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  store.posts.unshift(post);
  persist();
  return clone(post);
}

export function updatePost(id, payload) {
  ensureStore();
  const post = store.posts.find((entry) => entry.id === Number(id));
  if (!post) return null;
  Object.assign(post, {
    title: payload.title ?? post.title,
    slug: payload.slug ?? post.slug,
    excerpt: payload.excerpt ?? post.excerpt,
    content: payload.content ?? post.content,
    imageUrl: payload.imageUrl ?? post.imageUrl,
    status: payload.status ?? post.status,
    publishedAt: payload.publishedAt !== undefined ? payload.publishedAt : post.publishedAt,
    scheduledAt: payload.scheduledAt !== undefined ? payload.scheduledAt : post.scheduledAt,
    tags: payload.tags !== undefined ? (Array.isArray(payload.tags) ? payload.tags : []) : post.tags,
    updatedAt: nowIso()
  });
  persist();
  return clone(post);
}

export function deletePost(id) {
  ensureStore();
  const index = store.posts.findIndex((entry) => entry.id === Number(id));
  if (index === -1) return false;
  store.posts.splice(index, 1);
  persist();
  return true;
}

export function listProducts(type) {
  ensureStore();
  let items = [...store.products];
  if (type && type !== 'all') {
    items = items.filter((product) => product.type === type);
  }
  items.sort((a, b) => {
    if (a.type === b.type) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.type.localeCompare(b.type);
  });
  return clone(items);
}
export function createProduct(payload) {
  ensureStore();
  const product = {
    id: nextId('products'),
    type: payload.type,
    title: payload.title,
    location: payload.location ?? '',
    description: payload.description ?? '',
    priceFrom: payload.priceFrom !== undefined && payload.priceFrom !== null ? Number(payload.priceFrom) : null,
    currency: payload.currency ?? 'EUR',
    priceDisplay: payload.priceDisplay ?? '',
    availabilityStart: payload.availabilityStart ?? null,
    availabilityEnd: payload.availabilityEnd ?? null,
    imageUrl: payload.imageUrl ?? '',
    rating: payload.rating !== undefined && payload.rating !== null ? Number(payload.rating) : null,
    amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
    isHot: Boolean(payload.isHot),
    commissionRule: payload.commissionRule ?? '',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  store.products.unshift(product);
  persist();
  return clone(product);
}

export function updateProduct(id, payload) {
  ensureStore();
  const product = store.products.find((entry) => entry.id === Number(id));
  if (!product) return null;
  Object.assign(product, {
    type: payload.type ?? product.type,
    title: payload.title ?? product.title,
    location: payload.location ?? product.location,
    description: payload.description ?? product.description,
    priceFrom:
      payload.priceFrom !== undefined
        ? payload.priceFrom === null
          ? null
          : Number(payload.priceFrom)
        : product.priceFrom,
    currency: payload.currency ?? product.currency,
    priceDisplay: payload.priceDisplay ?? product.priceDisplay,
    availabilityStart: payload.availabilityStart !== undefined ? payload.availabilityStart : product.availabilityStart,
    availabilityEnd: payload.availabilityEnd !== undefined ? payload.availabilityEnd : product.availabilityEnd,
    imageUrl: payload.imageUrl ?? product.imageUrl,
    rating:
      payload.rating !== undefined
        ? payload.rating === null
          ? null
          : Number(payload.rating)
        : product.rating,
    amenities: payload.amenities !== undefined ? (Array.isArray(payload.amenities) ? payload.amenities : []) : product.amenities,
    isHot: payload.isHot !== undefined ? Boolean(payload.isHot) : product.isHot,
    commissionRule: payload.commissionRule ?? product.commissionRule,
    updatedAt: nowIso()
  });
  persist();
  return clone(product);
}

export function deleteProduct(id) {
  ensureStore();
  const index = store.products.findIndex((entry) => entry.id === Number(id));
  if (index === -1) return false;
  store.products.splice(index, 1);
  persist();
  return true;
}

export function listCustomers() {
  ensureStore();
  const customers = store.customers
    .map((customer) => ({
      ...customer,
      bookingCount: store.bookings.filter((booking) => booking.customerId === customer.id).length
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((customer) => sanitizeCustomer(customer));
  return customers;
}

export function getCustomerByEmail(email) {
  ensureStore();
  if (!email) return null;
  const entry = store.customers.find((customer) => customer.email.toLowerCase() === email.toLowerCase());
  return sanitizeCustomer(entry);
}

export function getCustomerById(id) {
  ensureStore();
  const entry = store.customers.find((customer) => customer.id === Number(id));
  return sanitizeCustomer(entry);
}

export function createCustomer(payload) {
  ensureStore();
  const timestamp = nowIso();
  const customer = {
    id: nextId('customers'),
    firstName: payload.firstName ?? '',
    lastName: payload.lastName ?? '',
    email: (payload.email ?? '').toLowerCase(),
    phone: payload.phone ?? '',
    passwordHash: payload.passwordHash ?? hashPassword('kunde123'),
    status: payload.status ?? 'active',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  store.customers.unshift(customer);
  persist();
  return sanitizeCustomer(customer);
}

export function updateCustomer(id, payload) {
  ensureStore();
  const customer = store.customers.find((entry) => entry.id === Number(id));
  if (!customer) return null;
  Object.assign(customer, {
    firstName: payload.firstName ?? customer.firstName,
    lastName: payload.lastName ?? customer.lastName,
    email: payload.email !== undefined ? payload.email.toLowerCase() : customer.email,
    phone: payload.phone ?? customer.phone,
    status: payload.status ?? customer.status,
    updatedAt: nowIso()
  });
  persist();
  return sanitizeCustomer(customer);
}

export function updateCustomerPassword(id, passwordHash) {
  ensureStore();
  const customer = store.customers.find((entry) => entry.id === Number(id));
  if (!customer) return false;
  customer.passwordHash = passwordHash;
  customer.updatedAt = nowIso();
  persist();
  return true;
}

export function listPartners() {
  ensureStore();
  const partners = [...store.partners].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return clone(partners);
}

export function createPartner(payload) {
  ensureStore();
  const partner = {
    id: nextId('partners'),
    companyName: payload.companyName,
    contactName: payload.contactName ?? '',
    email: payload.email ?? '',
    phone: payload.phone ?? '',
    commissionRate: payload.commissionRate !== undefined ? Number(payload.commissionRate) : 0,
    accessEnabled: payload.accessEnabled !== undefined ? Boolean(payload.accessEnabled) : true,
    notes: payload.notes ?? '',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  store.partners.unshift(partner);
  persist();
  return clone(partner);
}

export function updatePartner(id, payload) {
  ensureStore();
  const partner = store.partners.find((entry) => entry.id === Number(id));
  if (!partner) return null;
  Object.assign(partner, {
    companyName: payload.companyName ?? partner.companyName,
    contactName: payload.contactName ?? partner.contactName,
    email: payload.email ?? partner.email,
    phone: payload.phone ?? partner.phone,
    commissionRate:
      payload.commissionRate !== undefined ? Number(payload.commissionRate) : partner.commissionRate,
    accessEnabled: payload.accessEnabled !== undefined ? Boolean(payload.accessEnabled) : partner.accessEnabled,
    notes: payload.notes ?? partner.notes,
    updatedAt: nowIso()
  });
  persist();
  return clone(partner);
}

export function listBookings() {
  ensureStore();
  const bookings = store.bookings
    .map((booking) => ({
      ...booking,
      customerName: (() => {
        const customer = store.customers.find((c) => c.id === booking.customerId);
        return customer ? `${customer.firstName} ${customer.lastName}`.trim() : null;
      })(),
      partnerName: (() => {
        const partner = store.partners.find((p) => p.id === booking.partnerId);
        return partner ? partner.companyName : null;
      })()
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return clone(bookings);
}

export function createBooking(payload) {
  ensureStore();
  const booking = {
    id: nextId('bookings'),
    bookingReference: payload.bookingReference ?? generateBookingReference(),
    customerId: payload.customerId ?? null,
    partnerId: payload.partnerId ?? null,
    productType: payload.productType ?? '',
    productId: payload.productId ?? null,
    status: payload.status ?? 'offen',
    amount: payload.amount ?? 0,
    currency: payload.currency ?? 'EUR',
    travelDate: payload.travelDate ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  store.bookings.unshift(booking);
  persist();
  return clone(booking);
}

export function updateBooking(id, payload) {
  ensureStore();
  const booking = store.bookings.find((entry) => entry.id === Number(id));
  if (!booking) return null;
  Object.assign(booking, {
    status: payload.status ?? booking.status,
    amount: payload.amount !== undefined ? Number(payload.amount) : booking.amount,
    travelDate: payload.travelDate !== undefined ? payload.travelDate : booking.travelDate,
    updatedAt: nowIso()
  });
  persist();
  return clone(booking);
}

export function generateBookingReference() {
  ensureStore();
  let reference;
  do {
    reference = `MT24-${Math.floor(Math.random() * 9000 + 1000)}`;
  } while (store.bookings.some((booking) => booking.bookingReference === reference));
  return reference;
}
export function getAdminByEmail(email) {
  ensureStore();
  return clone(store.adminUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()));
}

export function getAdminById(id) {
  ensureStore();
  const admin = store.adminUsers.find((user) => user.id === Number(id));
  return sanitizeAdminUser(admin);
}

export function listAdminUsers() {
  ensureStore();
  const admins = [...store.adminUsers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((admin) => sanitizeAdminUser(admin));
  return admins;
}

export function createAdminUser(payload) {
  ensureStore();
  const admin = {
    id: nextId('adminUsers'),
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash: payload.passwordHash ?? hashPassword('admin123'),
    role: payload.role ?? 'editor',
    status: payload.status ?? 'active',
    createdAt: nowIso()
  };
  store.adminUsers.unshift(admin);
  persist();
  return sanitizeAdminUser(admin);
}

export function updateAdminUser(id, payload) {
  ensureStore();
  const admin = store.adminUsers.find((entry) => entry.id === Number(id));
  if (!admin) return null;
  Object.assign(admin, {
    name: payload.name ?? admin.name,
    role: payload.role ?? admin.role,
    status: payload.status ?? admin.status
  });
  persist();
  return sanitizeAdminUser(admin);
}

export function deleteAdminUser(id) {
  ensureStore();
  const index = store.adminUsers.findIndex((entry) => entry.id === Number(id));
  if (index === -1) return false;
  store.adminUsers.splice(index, 1);
  persist();
  return true;
}

export function listContactRequests() {
  ensureStore();
  const requests = [...store.contactRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return clone(requests);
}

export function addContactRequest(payload) {
  ensureStore();
  const request = {
    id: nextId('contactRequests'),
    firstName: payload.firstName ?? '',
    lastName: payload.lastName ?? '',
    email: payload.email ?? '',
    phone: payload.phone ?? '',
    message: payload.message ?? '',
    createdAt: nowIso()
  };
  store.contactRequests.unshift(request);
  persist();
  return clone(request);
}

export function listPartnerRequests() {
  ensureStore();
  const requests = [...store.partnerRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return clone(requests);
}

export function addPartnerRequest(payload) {
  ensureStore();
  const request = {
    id: nextId('partnerRequests'),
    companyName: payload.companyName ?? '',
    contactName: payload.contactName ?? '',
    email: payload.email ?? '',
    phone: payload.phone ?? '',
    message: payload.message ?? '',
    createdAt: nowIso()
  };
  store.partnerRequests.unshift(request);
  persist();
  return clone(request);
}

export function listNewsletterSubscribers() {
  ensureStore();
  const subscribers = [...store.newsletterSubscribers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return clone(subscribers);
}

export function addNewsletterSubscriber(payload) {
  ensureStore();
  const normalizedEmail = (payload.email ?? '').toLowerCase();
  const existing = store.newsletterSubscribers.find((subscriber) => subscriber.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return clone(existing);
  }
  const subscriber = {
    id: nextId('newsletterSubscribers'),
    email: normalizedEmail,
    firstName: payload.firstName ?? '',
    createdAt: nowIso()
  };
  store.newsletterSubscribers.unshift(subscriber);
  persist();
  return clone(subscriber);
}

export function listSeoMetadata() {
  ensureStore();
  const seo = [...store.seoMetadata].sort((a, b) => a.page.localeCompare(b.page));
  return clone(seo);
}

export function updateSeoMetadata(page, payload) {
  ensureStore();
  let entry = store.seoMetadata.find((item) => item.page === page);
  if (!entry) {
    entry = { page, title: '', description: '', keywords: [], updatedAt: nowIso() };
    store.seoMetadata.push(entry);
  }
  Object.assign(entry, {
    title: payload.title ?? entry.title,
    description: payload.description ?? entry.description,
    keywords: Array.isArray(payload.keywords) ? payload.keywords : entry.keywords,
    updatedAt: nowIso()
  });
  persist();
  return clone(entry);
}

export function listLegalPages() {
  ensureStore();
  const legal = [...store.legalPages].sort((a, b) => a.slug.localeCompare(b.slug));
  return clone(legal);
}

export function updateLegalPage(slug, payload) {
  ensureStore();
  let page = store.legalPages.find((item) => item.slug === slug);
  if (!page) {
    page = { slug, title: payload.title ?? slug, content: payload.content ?? '', updatedAt: nowIso() };
    store.legalPages.push(page);
  } else {
    Object.assign(page, {
      title: payload.title ?? page.title,
      content: payload.content ?? page.content,
      updatedAt: nowIso()
    });
  }
  persist();
  return clone(page);
}

export function listPaymentGateways() {
  ensureStore();
  const gateways = [...store.paymentGateways].sort((a, b) => a.name.localeCompare(b.name));
  return clone(gateways);
}

export function updatePaymentGateway(code, payload) {
  ensureStore();
  const gateway = store.paymentGateways.find((item) => item.code === code);
  if (!gateway) return null;
  Object.assign(gateway, {
    enabled: payload.enabled !== undefined ? Boolean(payload.enabled) : gateway.enabled,
    config: payload.config !== undefined ? { ...payload.config } : gateway.config,
    updatedAt: nowIso()
  });
  persist();
  return clone(gateway);
}

export function recordActivity(adminId, action, entity, details) {
  ensureStore();
  const log = {
    id: nextId('activityLogs'),
    adminId: adminId ?? null,
    action,
    entity: entity ?? null,
    details: details ?? null,
    createdAt: nowIso()
  };
  store.activityLogs.unshift(log);
  persist();
  return clone(log);
}

export function listActivityLogs(limit = 100) {
  ensureStore();
  const logs = store.activityLogs.slice(0, limit).map((log) => {
    const admin = log.adminId ? store.adminUsers.find((user) => user.id === log.adminId) : null;
    return {
      ...clone(log),
      adminName: admin ? admin.name : null
    };
  });
  return logs;
}

export function getDashboardSummary() {
  ensureStore();
  const totals = {
    bookings: store.bookings.length,
    openBookings: store.bookings.filter((booking) => booking.status === 'offen').length,
    partners: store.partners.length,
    customers: store.customers.length,
    hotDeals: store.deals.filter((deal) => deal.isHot).length,
    publishedPosts: store.posts.filter((post) => post.status === 'published').length
  };
  const revenue = store.bookings
    .filter((booking) => ['bestätigt', 'abgeschlossen'].includes(booking.status))
    .reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
  const upcoming = store.bookings
    .filter((booking) => booking.travelDate && new Date(booking.travelDate) >= new Date())
    .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
    .slice(0, 5)
    .map((booking) => clone(booking));
  const latestLogs = store.activityLogs
    .slice(0, 6)
    .map((log) => ({
      ...log,
      adminName: (() => {
        const admin = store.adminUsers.find((user) => user.id === log.adminId);
        return admin ? admin.name : null;
      })()
    }));
  return { totals, revenue, upcoming, latestLogs };
}

export function getPublicContent() {
  ensureStore();
  return {
    navigation: listNavigation(false),
    heroSlides: listHeroSlides().filter((slide) => slide.active),
    hotDeals: listDeals(),
    blogPosts: listPublishedPosts(),
    flights: listProducts('flight'),
    hotels: listProducts('hotel'),
    packages: listProducts('package'),
    transfers: listProducts('transfer'),
    settings: getSettings(),
    legal: listLegalPages(),
    seo: listSeoMetadata()
  };
}
