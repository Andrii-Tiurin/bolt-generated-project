// Добавьте в начало файла после существующих функций
function showSection(section) {
  currentSection = section;
  document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
  document.getElementById(`${section}-section`).style.display = 'block';
  
  if (section === 'bookings') {
    loadBookings();
  }
}

async function loadBookings() {
  const response = await fetch('/api/bookings');
  const bookings = await response.json();
  const container = document.getElementById('bookings-list');
  
  container.innerHTML = bookings.map(booking => `
    <div class="booking-card">
      <h3>Тур: ${booking.tour_name}</h3>
      <p><strong>Клієнт:</strong> ${booking.client_name}</p>
      <p><strong>Телефон:</strong> ${booking.phone}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Повідомлення:</strong> ${booking.message}</p>
      <p><strong>Дата:</strong> ${new Date(booking.created_at).toLocaleString('uk-UA')}</p>
      <p><strong>Статус:</strong> 
        <select onchange="updateBookingStatus(${booking.id}, this.value)">
          <option value="new" ${booking.status === 'new' ? 'selected' : ''}>Новий</option>
          <option value="processing" ${booking.status === 'processing' ? 'selected' : ''}>В обробці</option>
          <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Підтверджено</option>
          <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Відмінено</option>
        </select>
      </p>
    </div>
  `).join('');
}

async function updateBookingStatus(id, status) {
  try {
    const response = await fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      loadBookings();
    }
  } catch (error) {
    alert('Помилка при оновленні статусу');
  }
}

// Добавьте кнопку в навигацию админ-панели
document.querySelector('nav').innerHTML += `
  <button onclick="showSection('bookings')">Заявки</button>
`;
