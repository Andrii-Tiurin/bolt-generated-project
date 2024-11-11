// Добавьте новую таблицу для заказов
await db.execute(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_name TEXT,
    client_name TEXT,
    phone TEXT,
    email TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Добавьте новые API endpoints для заказов
app.post('/api/bookings', async (req, res) => {
  const { tour_name, client_name, phone, email, message } = req.body;
  await db.execute(
    'INSERT INTO bookings (tour_name, client_name, phone, email, message) VALUES (?, ?, ?, ?, ?)',
    [tour_name, client_name, phone, email, message]
  );
  res.json({ success: true });
});

app.get('/api/bookings', async (req, res) => {
  const result = await db.execute('SELECT * FROM bookings ORDER BY created_at DESC');
  res.json(result.rows);
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true });
});
