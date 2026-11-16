/** habitaciones: estados de habitaciones y limpieza por rol */
import { habitaciones, puedeHacer, guardarDatos, agregarNotificacion } from '../core/data.js';
import { getHabStatusClass, showToast } from '../core/ui.js';
// ── Habitaciones ──────────────────────────────────────────────
function renderHabitaciones() {
  const filtro = document.getElementById('filtroHabitacion')?.value || 'Todos';
  const lista  = filtro === 'Todos' ? habitaciones : habitaciones.filter(h => h.estado === filtro);

  if (!lista.length) {
    document.getElementById('habitacionesGrid').innerHTML =
      `<div class="empty-state"><p>No hay habitaciones en estado "${filtro}".</p></div>`;
    return;
  }

  document.getElementById('habitacionesGrid').innerHTML = lista.map(h => {
    const cls = h.estado.toLowerCase().replace(' ','');
    const estadoBtns = getHabAcciones(h);
    const mantExtra = h.estado === 'Mantenimiento'
      ? `<p class="mant-eta">⚙️ Fuera de servicio</p>`
      : h.estado === 'Aseo'
        ? `<p class="mant-eta">🧹 En proceso de aseo</p>`
        : '';
    return `
      <div class="hab-card ${cls}">
        <div class="hab-numero">${h.numero}</div>
        <div class="hab-tipo">${h.tipo}</div>
        <div class="hab-precio">$${h.precio.toLocaleString('es-CO')}/noche</div>
        <span class="badge ${getHabStatusClass(h.estado)}">${h.estado}</span>
        ${mantExtra}
        ${estadoBtns ? `<div class="hab-actions">${estadoBtns}</div>` : ''}
      </div>`;
  }).join('');
}

function getHabAcciones(h) {
  // Aseo: SOLO el Camarero puede liberarla (quitarle el aseo). Ningún
  // otro rol ve un botón para tocar una habitación en Aseo.
  if (h.estado === 'Aseo') {
    if (puedeHacer('finalizarAseo')) {
      return `<button class="btn btn-sm btn-success" data-action="aseo" data-numero="${h.numero}">🧹 Finalizar aseo</button>`;
    }
    return '';
  }
  if (!puedeHacer('cambiarEstadoHab')) return '';
  if (h.estado === 'Disponible') {
    return `<button class="btn btn-sm btn-warning" data-action="mant" data-numero="${h.numero}">→ Mantenimiento</button>`;
  }
  if (h.estado === 'Mantenimiento') {
    return `<button class="btn btn-sm btn-success" data-action="disponible" data-numero="${h.numero}">✓ Marcar Disponible</button>`;
  }
  return '';
}

function cambiarEstadoHab(numero, nuevoEstado) {
  if (!puedeHacer('cambiarEstadoHab')) {
    showToast('Sin permiso para cambiar estado de habitación.', 'danger'); return;
  }
  const hab = habitaciones.find(h => h.numero === numero);
  if (!hab) return;
  // Nadie puede quitarle el Aseo a una habitación por esta vía — solo
  // el Camarero, mediante finalizarAseoHab().
  if (hab.estado === 'Aseo') {
    showToast('Esta habitación está en aseo. Solo el Camarero puede marcarla como Disponible.', 'danger');
    return;
  }
  const anterior = hab.estado;
  hab.estado = nuevoEstado;
  guardarDatos();
  renderHabitaciones();
  const emoji = nuevoEstado === 'Disponible' ? '✅' : '🔧';
  showToast(`${emoji} Habitación ${numero}: ${anterior} → ${nuevoEstado}`, nuevoEstado === 'Disponible' ? 'success' : 'warning');
}

// Solo el Camarero: termina el aseo y libera la habitación a Disponible.
function finalizarAseoHab(numero) {
  if (!puedeHacer('finalizarAseo')) {
    showToast('Solo el Camarero puede finalizar el aseo de una habitación.', 'danger'); return;
  }
  const hab = habitaciones.find(h => h.numero === numero);
  if (!hab || hab.estado !== 'Aseo') return;
  hab.estado = 'Disponible';
  agregarNotificacion('✅', `Habitación <strong>${numero}</strong> terminó aseo — ahora Disponible.`, 'llegada');
  guardarDatos();
  renderHabitaciones();
  showToast(`✅ Habitación ${numero}: Aseo → Disponible`, 'success');
}


export function init() {
  document.getElementById('filtroHabitacion')?.addEventListener('change',renderHabitaciones);
  document.getElementById('habitacionesGrid')?.addEventListener('click',e => {
    const b = e.target.closest('button[data-action][data-numero]');
    if (!b) return;
    if (b.dataset.action === 'aseo') finalizarAseoHab(b.dataset.numero);
    if (b.dataset.action === 'mant') cambiarEstadoHab(b.dataset.numero,'Mantenimiento');
    if (b.dataset.action === 'disponible') cambiarEstadoHab(b.dataset.numero,'Disponible');
  });
  renderHabitaciones();
}
