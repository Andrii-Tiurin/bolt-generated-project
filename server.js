import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import multer from 'multer';

import {
  initializeDatabase,
  getSetting,
  setSetting,
  getSettings,
  listNavigation,
  createNavigation,
  updateNavigation,
  deleteNavigation,
  listHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  listDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  listPosts,
  createPost,
  updatePost,
  deletePost,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listCustomers,
  getCustomerByEmail,
  createCustomer,
  updateCustomer,
  updateCustomerPassword,
  listPartners,
  createPartner,
  updatePartner,
  listBookings,
  createBooking,
  updateBooking,
  getAdminByEmail,
  getAdminById,
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  listContactRequests,
  addContactRequest,
  listPartnerRequests,
  addPartnerRequest,
  listNewsletterSubscribers,
  addNewsletterSubscriber,
  listSeoMetadata,
  updateSeoMetadata,
  listLegalPages,
  updateLegalPage,
  listPaymentGateways,
  updatePaymentGateway,
  recordActivity,
  listActivityLogs,
  getDashboardSummary,
  getPublicContent
} from './database.js';
import { hashPassword, verifyPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initializeDatabase();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'monotours24-admin-secret';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const distPath = path.join(__dirname, 'dist');
const staticRoot = fs.existsSync(distPath) ? distPath : __dirname;

app.use(express.static(staticRoot, { extensions: ['html', 'htm'] }));

const publicSettingsKeys = ['branding', 'contact', 'footer', 'theme', 'multilingual', 'services'];

function logActivity(adminId, action, entity, details) {
  recordActivity(adminId ?? null, action, entity ?? null, details ?? null);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Nicht autorisiert' });
  }
  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Ungültiger Token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Sitzung abgelaufen' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Nicht autorisiert' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Aktion' });
    }
    next();
  };
}

function findAdminById(id) {
  return getAdminById(id);
}

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich.' });
  }
  const user = getAdminByEmail(email.toLowerCase());
  if (!user || user.status !== 'active') {
    return res.status(401).json({ message: 'Ungültige Zugangsdaten.' });
  }
  const validPassword = verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Ungültige Zugangsdaten.' });
  }
  const token = createToken(user);
  logActivity(user.id, 'login', 'session', 'Admin Login erfolgreich');
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    branding: getSetting('branding')
  });
});

app.get('/api/admin/session', authenticate, (req, res) => {
  const user = findAdminById(req.user.id);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ message: 'Sitzung ungültig' });
  }
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    branding: getSetting('branding')
  });
});

app.get('/api/admin/dashboard', authenticate, (req, res) => {
  const summary = getDashboardSummary();
  res.json(summary);
});

app.get('/api/admin/navigation', authenticate, (req, res) => {
  res.json(listNavigation(true));
});

app.post('/api/admin/navigation', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { label, href, sortOrder = 0, visible = true } = req.body;
  if (!label || !href) {
    return res.status(400).json({ message: 'Label und Link sind erforderlich.' });
  }
  const created = createNavigation({ label, href, sortOrder: Number(sortOrder) || 0, visible: Boolean(visible) });
  logActivity(req.user.id, 'create', 'navigation', created);
  res.status(201).json(created);
});

app.put('/api/admin/navigation/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const { label, href, sortOrder, visible } = req.body;
  const updated = updateNavigation(id, {
    label,
    href,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
    visible: visible !== undefined ? Boolean(visible) : undefined
  });
  if (!updated) {
    return res.status(404).json({ message: 'Navigationspunkt nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'navigation', updated);
  res.json(updated);
});

app.delete('/api/admin/navigation/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const deleted = deleteNavigation(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Navigationspunkt nicht gefunden.' });
  }
  logActivity(req.user.id, 'delete', 'navigation', { id });
  res.status(204).end();
});

app.get('/api/admin/hero-slides', authenticate, (req, res) => {
  res.json(listHeroSlides());
});

app.post('/api/admin/hero-slides', authenticate, authorize('admin', 'editor'), (req, res) => {
  const {
    title,
    subtitle,
    description,
    tag,
    priceLabel,
    ctaLabel,
    ctaLink,
    secondaryLine,
    imageUrl,
    sortOrder = 0,
    active = true
  } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Titel ist erforderlich.' });
  }
  const created = createHeroSlide({
    title,
    subtitle,
    description,
    tag,
    priceLabel,
    ctaLabel,
    ctaLink,
    secondaryLine,
    imageUrl,
    sortOrder: Number(sortOrder) || 0,
    active: Boolean(active)
  });
  logActivity(req.user.id, 'create', 'hero_slide', created);
  res.status(201).json(created);
});

app.put('/api/admin/hero-slides/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const {
    title,
    subtitle,
    description,
    tag,
    priceLabel,
    ctaLabel,
    ctaLink,
    secondaryLine,
    imageUrl,
    sortOrder = 0,
    active = true
  } = req.body;
  const updated = updateHeroSlide(id, {
    title,
    subtitle,
    description,
    tag,
    priceLabel,
    ctaLabel,
    ctaLink,
    secondaryLine,
    imageUrl,
    sortOrder: Number(sortOrder) || 0,
    active: Boolean(active)
  });
  if (!updated) {
    return res.status(404).json({ message: 'Slide nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'hero_slide', updated);
  res.json(updated);
});

app.delete('/api/admin/hero-slides/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const deleted = deleteHeroSlide(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Slide nicht gefunden.' });
  }
  logActivity(req.user.id, 'delete', 'hero_slide', { id });
  res.status(204).end();
});

app.get('/api/admin/deals', authenticate, (req, res) => {
  res.json(listDeals());
});

app.post('/api/admin/deals', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { title, destination, description, price, currency = 'EUR', nights, imageUrl, endDate, perks = [], isHot = false } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Titel ist erforderlich.' });
  }
  const created = createDeal({
    title,
    destination,
    description,
    price: price !== undefined && price !== null ? Number(price) : null,
    currency,
    nights: nights !== undefined && nights !== null ? Number(nights) : null,
    imageUrl,
    endDate,
    perks: Array.isArray(perks) ? perks : [],
    isHot: Boolean(isHot)
  });
  logActivity(req.user.id, 'create', 'deal', created);
  res.status(201).json(created);
});

app.put('/api/admin/deals/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const { title, destination, description, price, currency = 'EUR', nights, imageUrl, endDate, perks = [], isHot = false } = req.body;
  const updated = updateDeal(id, {
    title,
    destination,
    description,
    price: price !== undefined && price !== null ? Number(price) : price,
    currency,
    nights: nights !== undefined && nights !== null ? Number(nights) : nights,
    imageUrl,
    endDate,
    perks: Array.isArray(perks) ? perks : [],
    isHot: Boolean(isHot)
  });
  if (!updated) {
    return res.status(404).json({ message: 'Angebot nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'deal', updated);
  res.json(updated);
});

app.delete('/api/admin/deals/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const deleted = deleteDeal(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Angebot nicht gefunden.' });
  }
  logActivity(req.user.id, 'delete', 'deal', { id });
  res.status(204).end();
});

app.get('/api/admin/posts', authenticate, (req, res) => {
  res.json(listPosts());
});

app.post('/api/admin/posts', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { title, slug, excerpt, content, imageUrl, status = 'draft', publishedAt, scheduledAt, tags = [] } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Titel ist erforderlich.' });
  }
  const created = createPost({
    title,
    slug,
    excerpt,
    content,
    imageUrl,
    status,
    publishedAt: publishedAt || null,
    scheduledAt: scheduledAt || null,
    tags: Array.isArray(tags) ? tags : []
  });
  logActivity(req.user.id, 'create', 'post', created);
  res.status(201).json(created);
});

app.put('/api/admin/posts/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, content, imageUrl, status = 'draft', publishedAt, scheduledAt, tags = [] } = req.body;
  const updated = updatePost(id, {
    title,
    slug,
    excerpt,
    content,
    imageUrl,
    status,
    publishedAt: publishedAt || null,
    scheduledAt: scheduledAt || null,
    tags: Array.isArray(tags) ? tags : []
  });
  if (!updated) {
    return res.status(404).json({ message: 'Beitrag nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'post', updated);
  res.json(updated);
});

app.delete('/api/admin/posts/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const deleted = deletePost(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Beitrag nicht gefunden.' });
  }
  logActivity(req.user.id, 'delete', 'post', { id });
  res.status(204).end();
});

app.get('/api/admin/products', authenticate, (req, res) => {
  const type = req.query.type;
  res.json(listProducts(type));
});

app.post('/api/admin/products', authenticate, authorize('admin', 'editor'), (req, res) => {
  const {
    type,
    title,
    location,
    description,
    priceFrom,
    currency = 'EUR',
    priceDisplay,
    availabilityStart,
    availabilityEnd,
    imageUrl,
    rating,
    amenities = [],
    isHot = false,
    commissionRule
  } = req.body;
  if (!type || !title) {
    return res.status(400).json({ message: 'Produkttyp und Titel sind erforderlich.' });
  }
  const created = createProduct({
    type,
    title,
    location,
    description,
    priceFrom: priceFrom !== undefined && priceFrom !== null ? Number(priceFrom) : null,
    currency,
    priceDisplay,
    availabilityStart,
    availabilityEnd,
    imageUrl,
    rating: rating !== undefined && rating !== null ? Number(rating) : null,
    amenities: Array.isArray(amenities) ? amenities : [],
    isHot: Boolean(isHot),
    commissionRule
  });
  logActivity(req.user.id, 'create', 'product', created);
  res.status(201).json(created);
});

app.put('/api/admin/products/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const {
    type,
    title,
    location,
    description,
    priceFrom,
    currency = 'EUR',
    priceDisplay,
    availabilityStart,
    availabilityEnd,
    imageUrl,
    rating,
    amenities = [],
    isHot = false,
    commissionRule
  } = req.body;
  const updated = updateProduct(id, {
    type,
    title,
    location,
    description,
    priceFrom: priceFrom !== undefined && priceFrom !== null ? Number(priceFrom) : priceFrom,
    currency,
    priceDisplay,
    availabilityStart,
    availabilityEnd,
    imageUrl,
    rating: rating !== undefined && rating !== null ? Number(rating) : rating,
    amenities: Array.isArray(amenities) ? amenities : [],
    isHot: Boolean(isHot),
    commissionRule
  });
  if (!updated) {
    return res.status(404).json({ message: 'Produkt nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'product', updated);
  res.json(updated);
});

app.delete('/api/admin/products/:id', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { id } = req.params;
  const deleted = deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Produkt nicht gefunden.' });
  }
  logActivity(req.user.id, 'delete', 'product', { id });
  res.status(204).end();
});

app.get('/api/admin/settings', authenticate, (req, res) => {
  res.json(getSettings());
});

app.put('/api/admin/settings/:key', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { key } = req.params;
  if (!publicSettingsKeys.includes(key)) {
    return res.status(400).json({ message: 'Unbekannter Einstellungsbereich.' });
  }
  setSetting(key, req.body);
  logActivity(req.user.id, 'update', `settings_${key}`, req.body);
  res.json(getSetting(key));
});

app.post(
  '/api/admin/settings/logo',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('logo'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Es wurde keine Datei hochgeladen.' });
    }
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const branding = getSetting('branding') || {};
    branding.logoUrl = base64;
    branding.logoUpdatedAt = new Date().toISOString();
    setSetting('branding', branding);
    logActivity(req.user.id, 'upload', 'branding_logo', { size: req.file.size });
    res.json(branding);
  }
);

app.get('/api/admin/seo', authenticate, (req, res) => {
  res.json(listSeoMetadata());
});

app.put('/api/admin/seo/:page', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { page } = req.params;
  const { title, description, keywords = [] } = req.body;
  const updated = updateSeoMetadata(page, {
    title,
    description,
    keywords: Array.isArray(keywords) ? keywords : []
  });
  logActivity(req.user.id, 'update', 'seo', { page });
  res.json(updated);
});

app.get('/api/admin/legal', authenticate, (req, res) => {
  res.json(listLegalPages());
});

app.put('/api/admin/legal/:slug', authenticate, authorize('admin', 'editor'), (req, res) => {
  const { slug } = req.params;
  const { title, content } = req.body;
  const updated = updateLegalPage(slug, { title, content });
  logActivity(req.user.id, 'update', 'legal', { slug });
  res.json(updated);
});

app.get('/api/admin/payment', authenticate, (req, res) => {
  res.json(listPaymentGateways());
});

app.put('/api/admin/payment/:code', authenticate, authorize('admin'), (req, res) => {
  const { code } = req.params;
  const { enabled, config = {} } = req.body;
  const updated = updatePaymentGateway(code, { enabled: Boolean(enabled), config });
  if (!updated) {
    return res.status(404).json({ message: 'Zahlungsart nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'payment_gateway', { code, enabled });
  res.json(updated);
});

app.get('/api/admin/customers', authenticate, (req, res) => {
  res.json(listCustomers());
});

app.post('/api/admin/customers', authenticate, authorize('admin'), (req, res) => {
  const { firstName, lastName, email, phone, password = 'reise123', status = 'active' } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'E-Mail ist erforderlich.' });
  }
  const normalizedEmail = email.toLowerCase();
  const existing = getCustomerByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ message: 'Ein Kunde mit dieser E-Mail existiert bereits.' });
  }
  const created = createCustomer({
    firstName,
    lastName,
    email: normalizedEmail,
    phone,
    passwordHash: hashPassword(password),
    status
  });
  logActivity(req.user.id, 'create', 'customer', created);
  res.status(201).json(created);
});

app.put('/api/admin/customers/:id', authenticate, authorize('admin', 'support'), (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, status } = req.body;
  const updated = updateCustomer(id, { firstName, lastName, email, phone, status });
  if (!updated) {
    return res.status(404).json({ message: 'Kunde nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'customer', updated);
  res.json(updated);
});

app.post('/api/admin/customers/:id/reset-password', authenticate, authorize('admin', 'support'), (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Neues Passwort erforderlich.' });
  }
  const hash = hashPassword(password);
  const success = updateCustomerPassword(id, hash);
  if (!success) {
    return res.status(404).json({ message: 'Kunde nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'customer_password', { id });
  res.json({ success: true });
});

app.get('/api/admin/partners', authenticate, (req, res) => {
  res.json(listPartners());
});

app.post('/api/admin/partners', authenticate, authorize('admin'), (req, res) => {
  const { companyName, contactName, email, phone, commissionRate = 10, accessEnabled = true, notes } = req.body;
  if (!companyName) {
    return res.status(400).json({ message: 'Firmenname ist erforderlich.' });
  }
  const created = createPartner({
    companyName,
    contactName,
    email,
    phone,
    commissionRate,
    accessEnabled,
    notes
  });
  logActivity(req.user.id, 'create', 'partner', created);
  res.status(201).json(created);
});

app.put('/api/admin/partners/:id', authenticate, authorize('admin', 'support'), (req, res) => {
  const { id } = req.params;
  const { companyName, contactName, email, phone, commissionRate = 0, accessEnabled = true, notes } = req.body;
  const updated = updatePartner(id, { companyName, contactName, email, phone, commissionRate, accessEnabled, notes });
  if (!updated) {
    return res.status(404).json({ message: 'Partner nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'partner', updated);
  res.json(updated);
});

app.get('/api/admin/bookings', authenticate, (req, res) => {
  res.json(listBookings());
});

app.put('/api/admin/bookings/:id', authenticate, authorize('admin', 'support'), (req, res) => {
  const { id } = req.params;
  const { status, amount, travelDate } = req.body;
  const updated = updateBooking(id, { status, amount, travelDate });
  if (!updated) {
    return res.status(404).json({ message: 'Buchung nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'booking', updated);
  res.json(updated);
});

app.get('/api/admin/bookings/export', authenticate, authorize('admin', 'support'), (req, res) => {
  const bookings = listBookings();
  const header = 'Buchungsnummer;Status;Betrag;Währung;Reisedatum;Erstellt am';
  const lines = bookings.map((booking) =>
    [
      booking.bookingReference,
      booking.status,
      booking.amount,
      booking.currency,
      booking.travelDate,
      booking.createdAt
    ]
      .map((value) => (value ?? '').toString().replace(/;/g, ','))
      .join(';')
  );
  const csv = [header, ...lines].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="monotours24-buchungen.csv"');
  logActivity(req.user.id, 'export', 'bookings', { count: bookings.length });
  res.send(csv);
});

app.get('/api/admin/logs', authenticate, authorize('admin'), (req, res) => {
  res.json(listActivityLogs());
});

app.get('/api/admin/admin-users', authenticate, authorize('admin'), (req, res) => {
  res.json(listAdminUsers());
});

app.post('/api/admin/admin-users', authenticate, authorize('admin'), (req, res) => {
  const { name, email, password = 'admin123', role = 'editor', status = 'active' } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: 'Name und E-Mail sind erforderlich.' });
  }
  const existing = getAdminByEmail(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'E-Mail wird bereits verwendet.' });
  }
  const created = createAdminUser({
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    status
  });
  logActivity(req.user.id, 'create', 'admin_user', created);
  res.status(201).json(created);
});

app.put('/api/admin/admin-users/:id', authenticate, authorize('admin'), (req, res) => {
  const { id } = req.params;
  const { name, role, status } = req.body;
  const updated = updateAdminUser(id, { name, role, status });
  if (!updated) {
    return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
  }
  logActivity(req.user.id, 'update', 'admin_user', updated);
  res.json(updated);
});

app.delete('/api/admin/admin-users/:id', authenticate, authorize('admin'), (req, res) => {
  const { id } = req.params;
  const success = deleteAdminUser(id);
  if (!success) {
    return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
  }
  logActivity(req.user.id, 'delete', 'admin_user', { id: Number(id) });
  res.status(204).end();
});

app.get('/api/admin/requests/contact', authenticate, authorize('admin', 'support'), (req, res) => {
  res.json(listContactRequests());
});

app.get('/api/admin/requests/partners', authenticate, authorize('admin', 'support'), (req, res) => {
  res.json(listPartnerRequests());
});

app.get('/api/admin/newsletter', authenticate, authorize('admin', 'marketing', 'editor'), (req, res) => {
  res.json(listNewsletterSubscribers());
});

app.get('/api/public/content', (req, res) => {
  res.json(getPublicContent());
});

app.post('/api/bookings', (req, res) => {
  const { customer = {}, partnerId = null, productType, productId = null, amount = 0, currency = 'EUR', travelDate } = req.body;
  let customerId = null;
  if (customer.email) {
    const normalizedEmail = customer.email.toLowerCase();
    const existingCustomer = getCustomerByEmail(normalizedEmail);
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const createdCustomer = createCustomer({
        firstName: customer.firstName ?? '',
        lastName: customer.lastName ?? '',
        email: normalizedEmail,
        phone: customer.phone ?? '',
        passwordHash: hashPassword(customer.password ?? 'reise123'),
        status: 'active'
      });
      customerId = createdCustomer.id;
    }
  }
  const booking = createBooking({
    customerId,
    partnerId: partnerId !== undefined && partnerId !== null && partnerId !== '' ? Number(partnerId) : null,
    productType: productType ?? '',
    productId: productId !== undefined && productId !== null && productId !== '' ? Number(productId) : null,
    status: 'offen',
    amount: amount !== undefined && amount !== null ? Number(amount) : 0,
    currency: currency ?? 'EUR',
    travelDate: travelDate ?? null
  });
  logActivity(null, 'create', 'booking_public', { bookingReference: booking.bookingReference });
  res.status(201).json({ success: true, bookingReference: booking.bookingReference });
});

app.post('/api/partner-requests', (req, res) => {
  const request = addPartnerRequest(req.body || {});
  logActivity(null, 'create', 'partner_request', { id: request.id });
  res.status(201).json({ success: true });
});

app.post('/api/contact', (req, res) => {
  const request = addContactRequest(req.body || {});
  logActivity(null, 'create', 'contact_request', { id: request.id });
  res.status(201).json({ success: true });
});

app.post('/api/newsletter', (req, res) => {
  const { email, firstName } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'E-Mail erforderlich' });
  }
  addNewsletterSubscriber({ email, firstName });
  res.status(201).json({ success: true });
});

app.get('/api/offers', (req, res) => {
  res.json({ hotDeals: listDeals(), packages: listProducts('package') });
});

app.get('/admin*', (req, res) => {
  const adminHtmlPath = fs.existsSync(path.join(staticRoot, 'admin/index.html'))
    ? path.join(staticRoot, 'admin/index.html')
    : path.join(staticRoot, 'admin.html');
  res.sendFile(adminHtmlPath);
});

app.use((req, res) => {
  const entryPath = fs.existsSync(path.join(staticRoot, 'index.html'))
    ? path.join(staticRoot, 'index.html')
    : path.join(__dirname, 'index.html');
  res.sendFile(entryPath);
});

app.listen(port, () => {
  console.log(`Monotours24 Server läuft auf http://localhost:${port}`);
});
