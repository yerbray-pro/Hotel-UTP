/** portal: búsqueda, reserva demo, simulación de pago y consulta */
import { habitaciones, reservas } from '../core/data.js';
import { formatDate, getStatusClass, validarNombreHuesped, validarDocumento, validarCorreo, mostrarError, limpiarError, showToast, escapeHtml, hoyLocalISO } from '../core/ui.js';
import { crearNuevaReserva, habitacionDisponibleEnFechas, getPagoBadge } from '../core/reservas.js';

const ICONO_POR_TIPO = {
  'Sencilla': '🛏️', 'Doble': '🛌', 'Suite': '✨', 'Junior Suite': '🌟', 'Familiar': '👨‍👩‍👧‍👦', 'Presidencial': '👑',
};

const guestState = {
  habitacion: null, checkin: null, checkout: null, noches: 0,
  pendingGuest: null, totalReserva: 0, metodoPago: 'tarjeta',
};


function renderGuestTabs() {
  document.querySelectorAll('.guest-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.guest-tab').forEach(t => t.classList.toggle('active', t === tab));
      const target = tab.dataset.guesttab;
      document.getElementById('guestTabBuscar').classList.toggle('active', target === 'buscar');
      document.getElementById('guestTabConsultar').classList.toggle('active', target === 'consultar');
    });
  });
}

// ── Buscar habitaciones disponibles ────────────────────────────
document.getElementById('guestSearchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const checkin   = document.getElementById('guestCheckin').value;
  const checkout  = document.getElementById('guestCheckout').value;
  const personas  = parseInt(document.getElementById('guestPersonas').value, 10) || 1;
  const resultados = document.getElementById('guestRoomsResults');

  document.getElementById('guestBookingCard').style.display = 'none';
  document.getElementById('guestConfirmCard').style.display = 'none';

  if (!checkin || !checkout) {
    showToast('Selecciona las fechas de check-in y check-out.', 'danger'); return;
  }
  const hoy = hoyLocalISO();
  if (checkin < hoy) {
    showToast('La fecha de check-in no puede ser en el pasado.', 'danger'); return;
  }
  if (checkin >= checkout) {
    showToast('El check-out debe ser posterior al check-in.', 'danger'); return;
  }

  const noches = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);

  const disponibles = habitaciones.filter(h =>
    h.estado !== 'Mantenimiento' &&
    h.capacidad >= personas &&
    habitacionDisponibleEnFechas(h.numero, checkin, checkout)
  );

  if (!disponibles.length) {
    resultados.innerHTML = `<div class="empty-state"><p>No hay habitaciones disponibles para ${personas} persona(s) en esas fechas. Intenta con otro rango de fechas.</p></div>`;
    return;
  }

  resultados.innerHTML = disponibles.map(h => `
    <div class="guest-room-card">
      <div class="guest-room-top">
        <span class="guest-room-tipo">${ICONO_POR_TIPO[h.tipo] || '🛏️'} ${h.tipo}</span>
        <span class="badge badge-info">Hab. ${h.numero}</span>
      </div>
      <div class="guest-room-capacidad">👤 Hasta ${h.capacidad} persona${h.capacidad > 1 ? 's' : ''}</div>
      <div class="guest-room-precio">$${h.precio.toLocaleString('es-CO')} <span>/ noche</span></div>
      <div class="guest-room-total">${noches} noche${noches > 1 ? 's' : ''} · Total estimado $${(h.precio * noches).toLocaleString('es-CO')}</div>
      <button type="button" class="btn btn-primary guest-room-btn" data-numero="${h.numero}" data-tipo="${h.tipo}" data-precio="${h.precio}">Reservar esta habitación</button>
    </div>
  `).join('');

  guestState.checkin  = checkin;
  guestState.checkout = checkout;
  guestState.noches   = noches;
});

// ── Elegir habitación → mostrar formulario de datos ────────────
document.getElementById('guestRoomsResults')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.guest-room-btn');
  if (!btn) return;

  guestState.habitacion = btn.dataset.numero;
  const tipo   = btn.dataset.tipo;
  const precio = parseInt(btn.dataset.precio, 10);
  const total  = precio * guestState.noches;
  guestState.totalReserva = total;

  document.getElementById('guestBookingSummary').innerHTML = `
    <div class="guest-summary-row"><span>Habitación</span><strong>${guestState.habitacion} — ${tipo}</strong></div>
    <div class="guest-summary-row"><span>Check-in</span><strong>${formatDate(guestState.checkin)}</strong></div>
    <div class="guest-summary-row"><span>Check-out</span><strong>${formatDate(guestState.checkout)}</strong></div>
    <div class="guest-summary-row"><span>Total (${guestState.noches} noche${guestState.noches > 1 ? 's' : ''})</span><strong>$${total.toLocaleString('es-CO')}</strong></div>
  `;

  document.getElementById('guestBookingCard').style.display = '';
  document.getElementById('guestBookingCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('guestBookingCancelBtn')?.addEventListener('click', () => {
  document.getElementById('guestBookingCard').style.display = 'none';
  guestState.habitacion = null;
});

// ── Confirmar reserva del cliente ──────────────────────────────
document.getElementById('guestBookingForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const huesped   = document.getElementById('guestNombre').value.trim();
  const documento = document.getElementById('guestDocumento').value.trim();
  const correo    = document.getElementById('guestCorreo').value.trim();
  const telefono  = document.getElementById('guestTelefono').value.trim();
  const notas     = document.getElementById('guestNotas').value.trim();

  const errNombre = validarNombreHuesped(huesped);
  if (errNombre) { mostrarError('guestNombre', errNombre); showToast(errNombre, 'danger'); return; }
  limpiarError('guestNombre');

  const errDoc = validarDocumento(documento);
  if (errDoc) { mostrarError('guestDocumento', errDoc); showToast(errDoc, 'danger'); return; }
  limpiarError('guestDocumento');

  const errCorreo = validarCorreo(correo);
  if (errCorreo) { mostrarError('guestCorreo', errCorreo); showToast(errCorreo, 'danger'); return; }
  limpiarError('guestCorreo');

  if (!guestState.habitacion || !guestState.checkin || !guestState.checkout) {
    showToast('Selecciona primero una habitación disponible.', 'danger'); return;
  }

  // Doble verificación por si alguien más reservó mientras se llenaba el formulario.
  if (!habitacionDisponibleEnFechas(guestState.habitacion, guestState.checkin, guestState.checkout)) {
    showToast('Esa habitación ya no está disponible en esas fechas. Vuelve a buscar.', 'danger');
    document.getElementById('guestBookingCard').style.display = 'none';
    return;
  }

  // Guardamos los datos del huésped y pasamos al paso de pago.
  guestState.pendingGuest = { huesped, documento, correo, telefono, notas };

  const habPago = habitaciones.find(h => h.numero === guestState.habitacion);
  const totalPago = guestState.totalReserva || ((habPago ? habPago.precio : 0) * guestState.noches);
  guestState.totalReserva = totalPago;

  document.getElementById('guestBookingCard').style.display = 'none';
  abrirPasoPago(habPago, totalPago);
});

// ── Paso de pago: mostrar el card y resetear su estado ─────────
function abrirPasoPago(hab, total) {
  document.getElementById('guestPaymentSummary').innerHTML = `
    <div class="guest-summary-row"><span>Habitación</span><strong>${guestState.habitacion}${hab ? ' — ' + hab.tipo : ''}</strong></div>
    <div class="guest-summary-row"><span>Check-in</span><strong>${formatDate(guestState.checkin)}</strong></div>
    <div class="guest-summary-row"><span>Check-out</span><strong>${formatDate(guestState.checkout)}</strong></div>
    <div class="guest-summary-row"><span>Total a pagar</span><strong>$${total.toLocaleString('es-CO')}</strong></div>
  `;

  document.getElementById('guestPaymentForm')?.reset();
  document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.toggle('active', b.dataset.method === 'tarjeta'));
  document.querySelectorAll('.payment-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === 'tarjeta'));
  guestState.metodoPago = 'tarjeta';

  document.querySelectorAll('.abono-opt').forEach(b => b.classList.toggle('active', b.dataset.pct === '100'));
  const abonoMonto = document.getElementById('abonoMonto');
  if (abonoMonto) abonoMonto.value = total;
  actualizarSaldoAbono();

  const paymentCard = document.getElementById('guestPaymentCard');
  paymentCard.style.display = '';
  paymentCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('guestPaymentBackBtn')?.addEventListener('click', () => {
  document.getElementById('guestPaymentCard').style.display = 'none';
  document.getElementById('guestBookingCard').style.display = '';
});

// ── Selección de método de pago ────────────────────────────────
document.querySelectorAll('.payment-method-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const metodo = btn.dataset.method;
    guestState.metodoPago = metodo;
    document.querySelectorAll('.payment-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === metodo));
  });
});

// ── Formateo en vivo de los campos de tarjeta ──────────────────
document.getElementById('cardNumero')?.addEventListener('input', (e) => {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
  e.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
});
document.getElementById('cardVenc')?.addEventListener('input', (e) => {
  let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) digits = digits.slice(0, 2) + '/' + digits.slice(2);
  e.target.value = digits;
});
document.getElementById('cardCvv')?.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// ── Opciones de abono ───────────────────────────────────────────
document.querySelectorAll('.abono-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.abono-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const pct = parseInt(btn.dataset.pct, 10);
    const monto = Math.round((guestState.totalReserva || 0) * pct / 100);
    const input = document.getElementById('abonoMonto');
    if (input) input.value = monto;
    actualizarSaldoAbono();
  });
});
document.getElementById('abonoMonto')?.addEventListener('input', () => {
  document.querySelectorAll('.abono-opt').forEach(b => b.classList.remove('active'));
  actualizarSaldoAbono();
});
function actualizarSaldoAbono() {
  const total = guestState.totalReserva || 0;
  const monto = parseInt(document.getElementById('abonoMonto')?.value, 10) || 0;
  const saldo = Math.max(total - monto, 0);
  const saldoEl = document.getElementById('abonoSaldo');
  if (saldoEl) saldoEl.textContent = '$' + saldo.toLocaleString('es-CO');
}

// ── Confirmar pago y crear la reserva ──────────────────────────
document.getElementById('guestPaymentForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const metodo = guestState.metodoPago || 'tarjeta';
  const total  = guestState.totalReserva || 0;
  let pago = null;

  if (metodo === 'tarjeta') {
    const numero = (document.getElementById('cardNumero').value || '').replace(/\s/g, '');
    const venc   = (document.getElementById('cardVenc').value || '').trim();
    const cvv    = (document.getElementById('cardCvv').value || '').trim();
    const nombre = (document.getElementById('cardNombre').value || '').trim();

    if (numero.length < 15 || numero.length > 16) { showToast('Ingresa un número de tarjeta válido.', 'danger'); return; }
    if (!/^\d{2}\/\d{2}$/.test(venc)) { showToast('Ingresa la fecha de vencimiento (MM/AA).', 'danger'); return; }
    if (cvv.length < 3) { showToast('Ingresa un CVV válido.', 'danger'); return; }
    if (!nombre) { showToast('Ingresa el nombre en la tarjeta.', 'danger'); return; }

    pago = {
      metodo: 'Tarjeta', estado: 'Pagado', total, montoPagado: total, saldo: 0,
      detalle: `Tarjeta terminada en ${numero.slice(-4)}`,
    };
  } else if (metodo === 'pse') {
    const banco     = document.getElementById('pseBanco').value;
    const documento = (document.getElementById('pseDocumento').value || '').trim();

    if (!banco) { showToast('Selecciona tu banco.', 'danger'); return; }
    if (!documento) { showToast('Ingresa tu número de documento.', 'danger'); return; }

    pago = {
      metodo: 'PSE', estado: 'Pagado', total, montoPagado: total, saldo: 0,
      detalle: `PSE — ${banco}`,
    };
  } else if (metodo === 'abono') {
    const monto  = parseInt(document.getElementById('abonoMonto').value, 10) || 0;
    const minimo = Math.round(total * 0.3);

    if (monto < minimo) { showToast(`El abono mínimo es $${minimo.toLocaleString('es-CO')} (30% del total).`, 'danger'); return; }
    if (monto > total)  { showToast('El abono no puede superar el total de la reserva.', 'danger'); return; }

    pago = {
      metodo: 'Abono', estado: monto >= total ? 'Pagado' : 'Abono parcial', total,
      montoPagado: monto, saldo: total - monto,
      detalle: `Abono inicial de $${monto.toLocaleString('es-CO')}`,
    };
  }

  const { huesped, documento, correo, telefono, notas } = guestState.pendingGuest || {};

  const nueva = crearNuevaReserva({
    huesped, documento,
    habitacion: guestState.habitacion,
    checkin: guestState.checkin,
    checkout: guestState.checkout,
    notas,
    correo, telefono,
    origen: 'cliente',
    pago,
  });

  document.getElementById('guestPaymentForm').reset(); // Nunca conservar el CVV.
  document.getElementById('guestPaymentCard').style.display = 'none';

  document.getElementById('guestConfirmCode').textContent = nueva.codigoReserva;
  document.getElementById('guestConfirmEmailMsg').textContent =
    `Reserva registrada en este navegador. Guarda el código ${nueva.codigoReserva}; no se ha enviado un correo real.`;
  document.getElementById('guestConfirmDetails').innerHTML = `
    <div class="guest-summary-row"><span>Huésped</span><strong>${escapeHtml(nueva.huesped)}</strong></div>
    <div class="guest-summary-row"><span>Habitación</span><strong>${nueva.habitacion}</strong></div>
    <div class="guest-summary-row"><span>Método de pago</span><strong>${escapeHtml(nueva.pago.detalle)}</strong></div>
    <div class="guest-summary-row"><span>Estado de pago</span><strong>${nueva.pago.estado}</strong></div>
    ${nueva.pago.saldo ? `<div class="guest-summary-row"><span>Saldo pendiente</span><strong>$${nueva.pago.saldo.toLocaleString('es-CO')}</strong></div>` : ''}
    <div class="guest-summary-row"><span>Check-in</span><strong>${formatDate(nueva.checkin)}</strong></div>
    <div class="guest-summary-row"><span>Check-out</span><strong>${formatDate(nueva.checkout)}</strong></div>
    <div class="guest-summary-row"><span>Correo</span><strong>${escapeHtml(nueva.correo)}</strong></div>
  `;
  document.getElementById('guestConfirmCard').style.display = '';
  document.getElementById('guestConfirmCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

  guestState.habitacion = null;
});

document.getElementById('guestConfirmNuevaBtn')?.addEventListener('click', () => {
  document.getElementById('guestConfirmCard').style.display = 'none';
  document.getElementById('guestRoomsResults').innerHTML = '';
  document.getElementById('guestSearchForm')?.reset();
  document.getElementById('guestPersonas').value = 1;
});

// ── Consultar reserva por código ────────────────────────────────
document.getElementById('guestLookupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('guestLookupCodigo');
  const codigo = input.value.trim().toUpperCase();
  const resultBox = document.getElementById('guestLookupResult');

  if (!codigo) {
    showToast('Ingresa tu código de reserva.', 'danger'); return;
  }

  const reserva = reservas.find(r => r.codigoReserva.toUpperCase() === codigo);

  if (!reserva) {
    resultBox.innerHTML = `<div class="guest-lookup-notfound">😕 No encontramos ninguna reserva con el código <strong>${escapeHtml(codigo)}</strong>. Verifica que esté bien escrito.</div>`;
    return;
  }

  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  resultBox.innerHTML = `
    <div class="guest-lookup-found">
      <div class="guest-lookup-found-header">
        <span class="guest-lookup-code">${reserva.codigoReserva}</span>
        <span class="badge ${getStatusClass(reserva.estado)}">${reserva.estado}</span>
      </div>
      <div class="guest-summary-row"><span>Huésped</span><strong>${escapeHtml(reserva.huesped)}</strong></div>
      <div class="guest-summary-row"><span>Habitación</span><strong>${reserva.habitacion}${hab ? ' — ' + hab.tipo : ''}</strong></div>
      <div class="guest-summary-row"><span>Check-in</span><strong>${formatDate(reserva.checkin)}</strong></div>
      <div class="guest-summary-row"><span>Check-out</span><strong>${formatDate(reserva.checkout)}</strong></div>
      ${reserva.correo ? `<div class="guest-summary-row"><span>Correo</span><strong>${escapeHtml(reserva.correo)}</strong></div>` : ''}
      <div class="guest-summary-row"><span>Observaciones</span><strong>${escapeHtml(reserva.notas || '—')}</strong></div>
      <div class="guest-summary-row"><span>Pago</span><strong>${escapeHtml(reserva.pago ? reserva.pago.detalle : 'Pendiente')}</strong></div>
      <div class="guest-summary-row"><span>Estado de pago</span>${getPagoBadge(reserva.pago)}</div>
      ${reserva.pago && reserva.pago.saldo ? `<div class="guest-summary-row"><span>Saldo pendiente</span><strong>$${reserva.pago.saldo.toLocaleString('es-CO')}</strong></div>` : ''}
    </div>
  `;
});

document.getElementById('guestLookupClearBtn')?.addEventListener('click', () => {
  const input = document.getElementById('guestLookupCodigo');
  const resultBox = document.getElementById('guestLookupResult');
  if (input) input.value = '';
  if (resultBox) resultBox.innerHTML = '';
  input?.focus();
});

document.getElementById('guestCheckin')?.addEventListener('change', (e) => {
  const checkout = document.getElementById('guestCheckout');
  if (checkout) checkout.min = e.target.value;
});

renderGuestTabs();


export function init() {
  const hoy = hoyLocalISO();
  document.getElementById('guestCheckin')?.setAttribute('min',hoy);
  document.getElementById('guestCheckout')?.setAttribute('min',hoy);
  // El servicio de correo/pago real requiere un backend.
}
