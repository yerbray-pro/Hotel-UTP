/** dashboard: estadísticas, gráficos y alertas */
import { habitaciones, reservas, notificaciones } from '../core/data.js';
import { formatDate, getStatusClass, escapeHtml, hoyLocalISO } from '../core/ui.js';
// ── Dashboard ─────────────────────────────────────────────────
// 

function renderDashboard() {
  const ocupadas     = habitaciones.filter(h => h.estado === 'Ocupada').length;
  const disponibles  = habitaciones.filter(h => h.estado === 'Disponible').length;
  const activas      = reservas.filter(r => r.estado === 'Confirmada' || r.estado === 'Check-in').length;
  const hoy          = hoyLocalISO();
  const checkoutHoy  = reservas.filter(r => r.checkout === hoy).length;

  document.getElementById('statOcupadas').textContent    = ocupadas;
  document.getElementById('statDisponibles').textContent = disponibles;
  document.getElementById('statReservas').textContent    = activas;
  document.getElementById('statCheckoutHoy').textContent = checkoutHoy;

  const tbody = document.getElementById('dashboardReservasTable');
  tbody.innerHTML = reservas.slice(0, 5).map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${escapeHtml(r.huesped)}</td>
      <td>Hab. ${r.habitacion}</td>
      <td>${formatDate(r.checkin)}</td>
      <td><span class="badge ${getStatusClass(r.estado)}">${r.estado}</span></td>
    </tr>`
  ).join('');

  const alertasList = document.getElementById('alertasList');
  const ultimas = notificaciones.slice(0, 5);
  alertasList.innerHTML = ultimas.length
    ? ultimas.map(n => `
        <li class="alerta-item alerta--${n.tipo}">
          <span>${n.icon}</span>
          <span>${n.texto}</span>
        </li>`).join('')
    : '<li class="alerta-item alerta--default"><span>ℹ️</span><span>No hay novedades por ahora.</span></li>';

  renderOcupacionChart();
}

// ── Gráfico de ocupación por tipo de habitación ────────────────
function renderOcupacionChart() {
  const el = document.getElementById('ocupacionChart');
  if (!el) return;

  const porTipo = {};
  habitaciones.forEach(h => {
    if (!porTipo[h.tipo]) porTipo[h.tipo] = { total: 0, ocupadas: 0 };
    porTipo[h.tipo].total++;
    if (h.estado === 'Ocupada') porTipo[h.tipo].ocupadas++;
  });

  const tipos = Object.keys(porTipo);
  if (!tipos.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No hay habitaciones registradas.</p>';
    return;
  }

  el.innerHTML = tipos.map(tipo => {
    const { total, ocupadas } = porTipo[tipo];
    const pct = total ? Math.round((ocupadas / total) * 100) : 0;
    return `
      <div class="ocupacion-row">
        <span class="ocupacion-label">${tipo}</span>
        <div class="ocupacion-track"><div class="ocupacion-fill" style="width:${pct}%"></div></div>
        <span class="ocupacion-pct">${pct}%</span>
      </div>`;
  }).join('');
}

function buildAlertas() {
  const hoy = hoyLocalISO();
  const alertas = [];

  // Check-outs pendientes hoy
  reservas.filter(r => r.checkout === hoy && r.estado === 'Check-in').forEach(r => {
    alertas.push({
      tipo: 'checkout',
      icon: '🔔',
      label: 'Check-out Hoy',
      texto: `<strong>${escapeHtml(r.huesped)}</strong> — Hab. ${r.habitacion} (${r.id}) debe hacer check-out hoy.`,
    });
  });

  // Confirmadas con check-in hoy (pendiente hacer check-in)
  reservas.filter(r => r.checkin === hoy && r.estado === 'Confirmada').forEach(r => {
    alertas.push({
      tipo: 'llegada',
      icon: '🏨',
      label: 'Llegada Hoy',
      texto: `<strong>${escapeHtml(r.huesped)}</strong> — Hab. ${r.habitacion} (${r.id}) llega hoy.${r.notas ? ' Nota: ' + r.notas : ''}`,
    });
  });

  // Habitaciones en mantenimiento
  habitaciones.filter(h => h.estado === 'Mantenimiento').forEach(h => {
    alertas.push({
      tipo: 'mantenimiento',
      icon: '🔧',
      label: 'Mantenimiento',
      texto: `Habitación <strong>${h.numero}</strong> (${h.tipo}) está fuera de servicio por mantenimiento.`,
    });
  });

  // Reservas confirmadas con llegada en los próximos 2 días
  const en2dias = new Date();
  en2dias.setDate(en2dias.getDate() + 2);
  const en2str = en2dias.toISOString().slice(0, 10);
  reservas.filter(r => r.checkin > hoy && r.checkin <= en2str && r.estado === 'Confirmada').forEach(r => {
    alertas.push({
      tipo: 'llegada',
      icon: '📅',
      label: 'Próxima Llegada',
      texto: `<strong>${escapeHtml(r.huesped)}</strong> — Hab. ${r.habitacion} llega el ${formatDate(r.checkin)}.`,
    });
  });

  // Alertas fijas adicionales
  reservas.filter(r => r.notas && r.notas.toLowerCase().includes('tarde') && r.estado !== 'Cancelada' && r.estado !== 'Check-out').forEach(r => {
    alertas.push({
      tipo: 'llegada',
      icon: '🌙',
      label: 'Llegada Tardía',
      texto: `<strong>${escapeHtml(r.huesped)}</strong> (${r.id}) — ${r.notas}`,
    });
  });

   return alertas.slice(0, 6);
}


export function init() { renderDashboard(); }
