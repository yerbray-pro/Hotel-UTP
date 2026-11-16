/** reservas.js: reglas comunes de reserva y presentación de pagos */
import { reservas, generarCodigoReserva, agregarNotificacion, guardarDatos } from './data.js';
import { hoyLocalISO, escapeHtml } from './ui.js';
export function getPagoBadge(pago) {
  if (!pago) return `<span class="badge badge-muted">Pendiente</span>`;
  const clase = pago.estado === 'Pagado' ? 'badge-success'
              : pago.estado === 'Abono parcial' ? 'badge-warning'
              : 'badge-muted';
  return `<span class="badge ${clase}" title="${escapeHtml(pago.detalle || '')}">${pago.estado}</span>`;
}


export function crearNuevaReserva({ huesped, documento, habitacion, checkin, checkout, notas, correo = '', telefono = '', origen = 'staff', pago = null }) {
  const siguienteId = Math.max(0, ...reservas.map(r => Number(String(r.id).replace('RES-', '')) || 0)) + 1;
  const nuevaId = 'RES-' + String(siguienteId).padStart(3, '0');
  const codigoReserva = generarCodigoReserva();
  const nueva = {
    id: nuevaId, codigoReserva, huesped, documento, habitacion, checkin, checkout,
    estado: 'Confirmada',
    notas: notas || 'Sin observaciones',
    correo, telefono,
    pago: pago || { metodo: '—', estado: 'Pendiente', total: 0, montoPagado: 0, saldo: 0, detalle: 'Pago pendiente en recepción' },
    history: [{ date: hoyLocalISO(), event: 'Reserva creada' + (origen === 'cliente' ? ' (portal de clientes)' : '') }],
  };
  reservas.unshift(nueva);

  const pagoTxt = pago ? ` · Pago: ${pago.estado}` : '';
  agregarNotificacion('🆕', `Nueva reserva <strong>${nuevaId}</strong> — ${escapeHtml(huesped)} (Hab. ${habitacion}). Código: ${codigoReserva}${pagoTxt}`, 'llegada');

  guardarDatos();
  return nueva;
}

// Reservas confirmadas, check-in y checkout ocupan el rango indicado.
export function habitacionDisponibleEnFechas(numero, checkin, checkout) {
  return !reservas.some(r => r.habitacion === numero &&
    r.estado !== 'Cancelada' &&
    !(checkout <= r.checkin || checkin >= r.checkout));
}
