import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname, { extensions: ['html', 'htm'] }));

const hotDeals = [
  {
    id: 'deal-001',
    title: 'Dubai Deluxe Week',
    destination: 'Dubai, VAE',
    price: 1299,
    nights: 7
  },
  {
    id: 'deal-002',
    title: 'Mallorca Kurztrip',
    destination: 'Mallorca, Spanien',
    price: 599,
    nights: 5
  },
  {
    id: 'deal-003',
    title: 'Island Explorer',
    destination: 'Reykjavík, Island',
    price: 1449,
    nights: 6
  }
];

const packages = [
  {
    id: 'pkg-001',
    title: 'Griechische Inselhopping-Reise',
    duration: '9 Tage',
    price: 1699
  },
  {
    id: 'pkg-002',
    title: 'Rundreise Vietnam Deluxe',
    duration: '12 Tage',
    price: 2149
  }
];

const bookings = [];
const partnerRequests = [];
const contactRequests = [];
const newsletterSubscriptions = [];

app.get('/api/offers', (_, res) => {
  res.json({ hotDeals, packages });
});

app.get('/api/bookings', (_, res) => {
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const booking = {
    id: `booking-${Date.now()}`,
    ...req.body,
    status: 'offen',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  res.status(201).json({ success: true, booking });
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const booking = bookings.find((item) => item.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Buchung nicht gefunden' });
  }
  booking.status = req.body.status ?? booking.status;
  booking.updatedAt = new Date().toISOString();
  res.json({ success: true, booking });
});

app.post('/api/partner-requests', (req, res) => {
  const request = {
    id: `partner-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  partnerRequests.push(request);
  res.status(201).json({ success: true, request });
});

app.post('/api/contact', (req, res) => {
  const contact = {
    id: `contact-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  contactRequests.push(contact);
  res.status(201).json({ success: true });
});

app.post('/api/newsletter', (req, res) => {
  const subscription = {
    id: `newsletter-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  newsletterSubscriptions.push(subscription);
  res.status(201).json({ success: true });
});

app.post('/api/requests', (req, res) => {
  res.status(201).json({ success: true });
});

app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.use((_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Monotours24 Demo-Server läuft auf http://localhost:${port}`);
});
