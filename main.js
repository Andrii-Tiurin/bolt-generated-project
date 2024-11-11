// Добавьте в конец файла
function showBookingForm(tourName, price) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h3>Бронювання туру: ${tourName}</h3>
      <p class="tour-price">Вартість: ${price} грн</p>
      <form id="booking-form">
        <input type="hidden" name="tour_name" value="${tourName}">
        <div class="form-group">
          <label for="client_name">Ваше ім'я:</label>
          <input type="text" id="client_name" name="client_name" required>
        </div>
        <div class="form-group">
          <label for="phone">Телефон:</label>
          <input type="tel" id="phone" name="phone" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="message">Повідомлення:</label>
          <textarea id="message" name="message" rows="3"></textarea>
        </div>
        <button type="submit">Відправити заявку</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.close');
  closeBtn.onclick = () => modal.remove();

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  };

  const form = modal.querySelector('#booking-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Дякуємо! Ваша заявка прийнята. Ми зв'яжемося з вами найближчим часом.');
        modal.remove();
      } else {
        alert('Помилка при відправці заявки. Спробуйте пізніше.');
      }
    } catch (error) {
      alert('Помилка при відправці заявки. Спробуйте пізніше.');
    }
  };
}

// Обновите функцию displayTours
function displayTours(tours) {
  const container = document.querySelector('.tours-grid');
  container.innerHTML = tours.map(tour => `
    <div class="tour-card">
      <img src="${tour.image_url}" alt="${tour.title}" class="card-image">
      <div class="card-content">
        <h3>${tour.title}</h3>
        <p>${tour.nights} ночей, ${tour.description}</p>
        <p class="price">від ${tour.price} грн</p>
        <button onclick="showBookingForm('${tour.title}', ${tour.price})" class="book-button">
          Забронювати
        </button>
      </div>
    </div>
  `).join('');
}
