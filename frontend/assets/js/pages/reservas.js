/** reservas: gestión staff, registro y flujo check-in/check-out */
import { habitaciones, reservas, puedeHacer, agregarNotificacion, guardarDatos } from '../core/data.js';
import { formatDate, getStatusClass, getHabStatusClass, showToast, confirmModal, validarNombreHuesped, validarDocumento, mostrarError, limpiarError, hoyLocalISO, escapeHtml } from '../core/ui.js';
import { crearNuevaReserva, getPagoBadge, habitacionDisponibleEnFechas } from '../core/reservas.js';
// ── Reservas ──────────────────────────────────────────────────
function renderReservas() {
  const filtro   = document.getElementById('filtroEstadoReserva')?.value || 'Todos';
  const busqueda = (document.getElementById('buscarCodigoReserva')?.value || '').trim().toUpperCase();
  let lista = filtro === 'Todos' ? reservas : reservas.filter(r => r.estado === filtro);
  if (busqueda) {
    lista = lista.filter(r =>
      (r.codigoReserva || '').toUpperCase().includes(busqueda) ||
      r.id.toUpperCase().includes(busqueda)
    );
  }
  const canCancel = puedeHacer('cancelarReserva');

  document.getElementById('reservasTable').innerHTML = lista.length ? lista.map(r => `
    <tr>
      <td><code style="font-family:'DM Mono',monospace;font-size:0.82rem;color:var(--primary-dark)">${r.id}</code></td>
      <td><code style="font-family:'DM Mono',monospace;font-size:0.82rem;color:var(--primary)">${r.codigoReserva || '—'}</code></td>
      <td><strong>${escapeHtml(r.huesped)}</strong></td>
      <td>Hab. ${r.habitacion}</td>
      <td>${formatDate(r.checkin)}</td>
      <td><span class="badge ${getStatusClass(r.estado)}">${r.estado}</span></td>
      <td>${getPagoBadge(r.pago)}</td>
      <td class="acciones-cell">${getReservaAcciones(r, canCancel)}</td>
    </tr>`).join('') : `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px;">No se encontraron reservas${busqueda ? ' con ese código' : ''}.</td></tr>`;

  const selectHab = document.getElementById('resHabitacion');
  if (selectHab) {
    const disponibles = habitaciones.filter(h => h.estado === 'Disponible');
    selectHab.innerHTML = '<option value="">Seleccionar habitación...</option>' +
      disponibles.map(h =>
        `<option value="${h.numero}">${h.numero} — ${h.tipo} ($${h.precio.toLocaleString('es-CO')})</option>`
      ).join('');
  }

  const formContainer = document.getElementById('reservaFormContainer');
  if (formContainer) {
    formContainer.style.display = puedeHacer('crearReserva') ? '' : 'none';
  }

  const noPermiso = document.getElementById('reservaNopermiso');
  if (noPermiso) {
    noPermiso.style.display = puedeHacer('crearReserva') ? 'none' : '';
  }
}


function getReservaAcciones(r, canCancel) {
  const acciones = [];
  if (r.estado === 'Confirmada') {
    acciones.push(`<button class="btn btn-success btn-sm" data-action="checkin" data-id="${r.id}">✓ Check-in</button>`);
    if (canCancel) {
      acciones.push(`<button class="btn btn-danger btn-sm" data-action="cancelar" data-id="${r.id}">✗ Cancelar</button>`);
    }
  }
  if (r.estado === 'Check-in') {
    acciones.push(`<button class="btn btn-primary btn-sm" data-action="checkout" data-id="${r.id}">→ Check-out</button>`);
  }
  if (r.estado === 'Check-out') {
    acciones.push(`<span class="badge badge-muted">Completada</span>`);
  }
  if (r.estado === 'Cancelada') {
    acciones.push(`<span class="badge badge-danger">Cancelada</span>`);
  }
  return acciones.join(' ') || '—';
}

function cambiarEstado(id, nuevoEstado) {
  if (!puedeHacer('cambiarEstadoReserva')) {
    showToast('No tienes permiso para cambiar el estado.', 'danger'); return;
  }
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return;
  const anterior = reserva.estado;
  reserva.estado = nuevoEstado;
  reserva.history.push({ date: hoyLocalISO(), event: `${nuevoEstado} realizado` });

  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  if (hab) {
    if (nuevoEstado === 'Check-in')  hab.estado = 'Ocupada';
    // La habitación NUNCA se libera directamente a Disponible: siempre
    // pasa automáticamente a Aseo. Solo el Camarero puede marcarla
    // como Disponible una vez terminada la limpieza.
    if (nuevoEstado === 'Check-out') {
      hab.estado = 'Aseo';
      agregarNotificacion('🧹', `Habitación <strong>${hab.numero}</strong> se liberó (${id}) y pasó a Aseo.`, 'mantenimiento');
    }
  }

  guardarDatos();
  renderReservas();
  showToast(`Reserva ${id}: ${anterior} → ${nuevoEstado}`, 'success');
}

async function cancelarReserva(id) {
  if (!puedeHacer('cancelarReserva')) {
    showToast('No tienes permiso para cancelar reservas.', 'danger'); return;
  }
  const ok = await confirmModal(`¿Cancelar la reserva ${id}? Esta acción no se puede deshacer.`);
  if (!ok) return;
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return;
  reserva.estado = 'Cancelada';
  reserva.history.push({ date: hoyLocalISO(), event: 'Reserva cancelada' });

  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  if (hab && hab.estado === 'Ocupada') {
    hab.estado = 'Aseo';
    agregarNotificacion('🧹', `Habitación <strong>${hab.numero}</strong> se liberó (${id} cancelada) y pasó a Aseo.`, 'mantenimiento');
  }

  guardarDatos();
  renderReservas();
  showToast(`Reserva ${id} cancelada.`, 'danger');
}


document.getElementById('reservaForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!puedeHacer('crearReserva')) {
    showToast('No tienes permiso para crear reservas.', 'danger'); return;
  }

  const huesped    = document.getElementById('resHuesped').value.trim();
  const documento  = document.getElementById('resDocumento').value.trim();
  const habitacion = document.getElementById('resHabitacion').value;
  const checkin    = document.getElementById('resCheckin').value;
  const checkout   = document.getElementById('resCheckout').value;
  const notas      = document.getElementById('resNotas').value.trim();

  const errNombre = validarNombreHuesped(huesped);
  if (errNombre) { mostrarError('resHuesped', errNombre); showToast(errNombre, 'danger'); return; }
  limpiarError('resHuesped');

  const errDoc = validarDocumento(documento);
  if (errDoc) { mostrarError('resDocumento', errDoc); showToast(errDoc, 'danger'); return; }
  limpiarError('resDocumento');

  if (!habitacion || !checkin || !checkout) {
    showToast('Completa todos los campos obligatorios.', 'danger'); return;
  }
  if (checkin >= checkout) {
    showToast('El check-out debe ser posterior al check-in.', 'danger'); return;
  }

  if (!habitacionDisponibleEnFechas(habitacion,checkin,checkout)) {
    showToast('Ya existe una reserva para esa habitación en esas fechas.', 'danger'); return;
  }
  const nueva = crearNuevaReserva({ huesped, documento, habitacion, checkin, checkout, notas, origen: 'staff' });
  renderReservas();
  document.getElementById('reservaForm').reset();
  showToast(`✅ Reserva ${nueva.id} creada para ${huesped} — Código: ${nueva.codigoReserva}`, 'success');
});

export function init() {
  document.getElementById('resCheckin').min = hoyLocalISO();
  document.getElementById('resCheckout').min = hoyLocalISO();
  document.getElementById('resCheckin').addEventListener('change', e => {
    document.getElementById('resCheckout').min = e.target.value;
  });
  document.getElementById('filtroEstadoReserva')?.addEventListener('change', renderReservas);
  document.getElementById('buscarCodigoReserva')?.addEventListener('input', renderReservas);
  document.getElementById('reservasTable')?.addEventListener('click', e => {
    const b = e.target.closest('button[data-action][data-id]');
    if (!b) return;
    if (b.dataset.action === 'checkin') cambiarEstado(b.dataset.id,'Check-in');
    if (b.dataset.action === 'checkout') cambiarEstado(b.dataset.id,'Check-out');
    if (b.dataset.action === 'cancelar') cancelarReserva(b.dataset.id);
  });
  renderReservas();
}
