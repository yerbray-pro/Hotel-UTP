/** historial: línea de tiempo de cambios de reserva */
import { reservas, puedeHacer } from '../core/data.js';
import { getEventoTipo, getEventoBadge, getTimelineDotClass, formatDate, escapeHtml } from '../core/ui.js';
// ── Historial mejorado ────────────────────────────────────────
function renderHistorial() {
  if (!puedeHacer('verHistorial')) return;

  const filtroEl = document.getElementById('filtroHistorial');
  const filtro = filtroEl ? filtroEl.value : 'Todos';

  let eventos = reservas
    .flatMap(r => r.history.map(h => ({
      ...h,
      reservaId: r.id,
      huesped: r.huesped,
      habitacion: r.habitacion,
      tipo: h.tipo || getEventoTipo(h.event),
      checkin: r.checkin,
      checkout: r.checkout,
    })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Aplicar filtro
  if (filtro !== 'Todos') {
    eventos = eventos.filter(e => {
      const tipo = getEventoTipo(e.event);
      return tipo === filtro || e.event.toLowerCase().includes(filtro.toLowerCase());
    });
  }

  eventos = eventos.slice(0, 30);

  document.getElementById('historialTimeline').innerHTML = eventos.map(e => {
    const dotCls = getTimelineDotClass(e.event);
    const badgeHtml = getEventoBadge(e.event);
    const habInfo = e.habitacion ? `<span class="timeline-hab-chip">Hab. ${e.habitacion}</span>` : '';
    return `
      <li>
        <div class="timeline-entry">
          <div class="timeline-left">
            <div class="timeline-dot ${dotCls}"></div>
          </div>
          <div class="timeline-right">
            <div class="timeline-meta">
              <span class="timeline-fecha">${formatDate(e.date)}</span>
              <span class="timeline-res-id">${e.reservaId}</span>
              ${badgeHtml}
            </div>
            <div class="timeline-huesped">${escapeHtml(e.huesped)}</div>
            <div class="timeline-detalle">
              ${habInfo}
              <span>${escapeHtml(e.event)}</span>
            </div>
          </div>
        </div>
      </li>`;
  }).join('') || '<li style="padding:20px;color:var(--text-muted);text-align:center;">No hay eventos que coincidan con el filtro.</li>';
}


export function init() {
  document.getElementById('filtroHistorial')?.addEventListener('change',renderHistorial);
  renderHistorial();
}
