document.querySelector('.menu-toggle')?.addEventListener('click', (event) => {
  const nav = document.querySelector('.nav-links');
  const open = nav.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('[data-demo-whatsapp]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    window.alert('Demo WhatsApp button — add the guest house’s real WhatsApp number before launch.');
  });
});

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
});

const form = document.querySelector('#booking-form');
if (form) {
  const rates = { standard: 1800, deluxe: 2100, family: 2600 };
  const labels = { standard: 'Standard Double', deluxe: 'Deluxe Double', family: 'Family Room' };
  const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const fields = Object.fromEntries([...form.elements].filter((el) => el.name).map((el) => [el.name, el]));

  function calculate() {
    const checkIn = fields.checkin.value ? new Date(`${fields.checkin.value}T12:00:00`) : null;
    const checkOut = fields.checkout.value ? new Date(`${fields.checkout.value}T12:00:00`) : null;
    const room = fields.room.value;
    const adults = Number(fields.adults.value || 1);
    const rooms = Number(fields.rooms.value || 1);
    let nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / 86400000) : 1;
    nights = Math.max(1, nights);
    const base = rates[room] * rooms * nights;
    const extra = Math.max(0, adults - rooms * 2) * 800 * nights;
    const subtotal = base + extra;
    const taxes = subtotal * .12;
    const total = subtotal + taxes;
    document.querySelector('#est-nights').textContent = `${nights} night${nights === 1 ? '' : 's'}`;
    document.querySelector('#est-rate').textContent = money(rates[room]);
    document.querySelector('#est-rooms').textContent = String(rooms);
    document.querySelector('#est-taxes').textContent = money(taxes);
    document.querySelector('#est-total').textContent = money(total);
    return { nights, room, adults, rooms, total };
  }

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const result = calculate();
    const message = [
      'Hello Comfort Guest House, I would like to enquire about a stay.',
      '',
      `Guest: ${fields.name.value}`,
      `Phone: ${fields.phone.value}`,
      `Stay: ${fields.checkin.value} to ${fields.checkout.value} (${result.nights} night${result.nights === 1 ? '' : 's'})`,
      `Room: ${labels[result.room]} × ${result.rooms}`,
      `Guests: ${result.adults} adult(s), ${fields.children.value || 0} child(ren)`,
      `Website estimate: ${money(result.total)} including indicative taxes`,
      fields.requests.value ? `Special request: ${fields.requests.value}` : '',
      '',
      'Please confirm availability and the final payable tariff.'
    ].filter(Boolean).join('\n');
    const copyToClipboard = async () => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        return;
      }
      const helper = document.createElement('textarea');
      helper.value = message;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    };
    copyToClipboard().then(() => {
      const status = document.querySelector('#copy-status');
      const button = form.querySelector('[type="submit"]');
      if (status) status.textContent = 'Enquiry copied. Paste it into your preferred messaging app when you have the property’s confirmed contact number.';
      if (button) button.textContent = 'Enquiry copied ✓';
    }).catch(() => {
      const status = document.querySelector('#copy-status');
      if (status) status.textContent = 'Copy failed. Please select and copy the details manually.';
    });
  });

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
  const iso = (d) => d.toISOString().slice(0, 10);
  fields.checkin.min = iso(today);
  fields.checkout.min = iso(tomorrow);
  fields.checkin.value = iso(tomorrow);
  fields.checkout.value = iso(dayAfter);
  fields.checkin.addEventListener('change', () => {
    const minOut = new Date(`${fields.checkin.value}T12:00:00`); minOut.setDate(minOut.getDate() + 1);
    fields.checkout.min = iso(minOut);
    if (!fields.checkout.value || fields.checkout.value <= fields.checkin.value) fields.checkout.value = iso(minOut);
    calculate();
  });
  calculate();
}
