/** huespedes: directorio derivado de las reservas */
import { reservas, puedeHacer } from '../core/data.js';
import { formatDate, getStatusClass, escapeHtml } from '../core/ui.js';
// ── Huéspedes ─────────────────────────────────────────────────
function renderHuespedes(filtro = '') {
  if (!puedeHacer('verHuespedes')) return;
  const porDocumento = {};
  reservas.forEach(r => {
    if (!porDocumento[r.documento]) {
      porDocumento[r.documento] = { documento: r.documento, nombre: r.huesped, reservas: 0, ultimaVisita: r.checkin, estado: r.estado };
    }
    porDocumento[r.documento].reservas++;
    if (r.checkin > porDocumento[r.documento].ultimaVisita) {
      porDocumento[r.documento].ultimaVisita = r.checkin;
      porDocumento[r.documento].estado = r.estado;
    }
  });
  let lista = Object.values(porDocumento);
  if (filtro) lista = lista.filter(h => h.nombre.toLowerCase().includes(filtro.toLowerCase()));

  document.getElementById('huespedesTable').innerHTML = lista.length ? lista.map(h => `
    <tr>
      <td><code style="font-family:'DM Mono',monospace;font-size:0.82rem">${escapeHtml(h.documento)}</code></td>
      <td><strong>${escapeHtml(h.nombre)}</strong></td>
      <td>${h.reservas} reserva${h.reservas !== 1 ? 's' : ''}</td>
      <td>${formatDate(h.ultimaVisita)}</td>
      <td><span class="badge ${getStatusClass(h.estado)}">${h.estado}</span></td>
    </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No se encontraron huéspedes${filtro ? ' con ese nombre' : ''}.</td></tr>`;
}


export function init() {
  document.getElementById('buscarHuesped')?.addEventListener('input',e => renderHuespedes(e.target.value));
  renderHuespedes();
}
