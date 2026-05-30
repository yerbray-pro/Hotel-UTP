// ══════════════════════════════════════════════════════════════
//  Hotel UTP — app.js  (v3 — Mejorado)
// ══════════════════════════════════════════════════════════════

// ── Permisos por rol ─────────────────────────────────────────
const PERMISOS = {
  Administrador: {
    screens:       ['dashboard','reservas','habitaciones','huespedes','historial','usuarios'],
    crearReserva:  true,
    cancelarReserva: true,
    cambiarEstadoReserva: true,
    verHuespedes:  true,
    verHistorial:  true,
    gestionarUsuarios: true,
    cambiarEstadoHab: true,
  },
  Gerente: {
    screens:       ['dashboard','reservas','habitaciones','huespedes','historial'],
    crearReserva:  true,
    cancelarReserva: true,
    cambiarEstadoReserva: true,
    verHuespedes:  true,
    verHistorial:  true,
    gestionarUsuarios: false,
    cambiarEstadoHab: true,
  },
  Recepcionista: {
    screens:       ['dashboard','reservas','habitaciones'],
    crearReserva:  true,
    cancelarReserva: false,
    cambiarEstadoReserva: true,
    verHuespedes:  false,
    verHistorial:  false,
    gestionarUsuarios: false,
    cambiarEstadoHab: false,
  },
};

function puedeHacer(accion) {
  const role = appState.currentUser?.role;
  if (!role || !PERMISOS[role]) return false;
  return !!PERMISOS[role][accion];
}

// ── DOM Referencias ───────────────────────────────────────────
const screens         = document.querySelectorAll('.screen');
const navLinks        = document.querySelectorAll('.nav-link');
const loginForm       = document.getElementById('loginForm');
const reservaForm     = document.getElementById('reservaForm');
const logoutBtn       = document.getElementById('logoutBtn');
const toast           = document.getElementById('toast');
const userInfo        = document.getElementById('userInfo');
const userNameDisplay = document.getElementById('userNameDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');

// ── Usuarios del sistema ─────────────────────────────────────
let usuariosSistema = JSON.parse(localStorage.getItem('hotel_utp_usuarios') || 'null') || [
  { id: 1, username: 'admin',      password: 'admin123',   role: 'Administrador', activo: true,  nombre: 'Administrador' },
  { id: 2, username: 'gerente',    password: 'gerente123', role: 'Gerente',       activo: true,  nombre: 'María López' },
  { id: 3, username: 'recepcion',  password: '1234',       role: 'Recepcionista', activo: true,  nombre: 'Juan Pérez' },
];

// ── Estado global ─────────────────────────────────────────────
const appState = {
  currentUser: null,
};

// ── Habitaciones ─────────────────────────────────────────────
let habitaciones = [
  { numero: '101', tipo: 'Sencilla',    precio: 120000, estado: 'Disponible' },
  { numero: '102', tipo: 'Sencilla',    precio: 120000, estado: 'Ocupada' },
  { numero: '103', tipo: 'Sencilla',    precio: 120000, estado: 'Disponible' },
  { numero: '104', tipo: 'Doble',       precio: 180000, estado: 'Mantenimiento' },
  { numero: '105', tipo: 'Doble',       precio: 180000, estado: 'Disponible' },
  { numero: '201', tipo: 'Doble',       precio: 190000, estado: 'Ocupada' },
  { numero: '202', tipo: 'Suite',       precio: 320000, estado: 'Disponible' },
  { numero: '203', tipo: 'Suite',       precio: 320000, estado: 'Ocupada' },
  { numero: '204', tipo: 'Suite',       precio: 350000, estado: 'Disponible' },
  { numero: '301', tipo: 'Junior Suite',precio: 260000, estado: 'Disponible' },
  { numero: '302', tipo: 'Junior Suite',precio: 260000, estado: 'Ocupada' },
  { numero: '303', tipo: 'Presidencial',precio: 550000, estado: 'Disponible' },
];

// ── Reservas de muestra ───────────────────────────────────────
let reservas = [
  {
    id: 'RES-001', huesped: 'Carlos Ramírez', documento: '1012345678',
    habitacion: '102', checkin: '2026-05-25', checkout: '2026-05-28',
    estado: 'Check-in', notas: 'Solicita cama adicional',
    history: [{ date: '2026-05-20', event: 'Reserva creada' }, { date: '2026-05-25', event: 'Check-in realizado' }],
  },
  {
    id: 'RES-002', huesped: 'María Fernández', documento: '1098765432',
    habitacion: '201', checkin: '2026-05-26', checkout: '2026-05-30',
    estado: 'Confirmada', notas: 'Llegada tardía después de las 10pm',
    history: [{ date: '2026-05-21', event: 'Reserva creada' }],
  },
  {
    id: 'RES-003', huesped: 'Jorge Mendoza', documento: '9876543210',
    habitacion: '203', checkin: '2026-05-24', checkout: '2026-05-27',
    estado: 'Check-in', notas: '',
    history: [{ date: '2026-05-22', event: 'Reserva creada' }, { date: '2026-05-24', event: 'Check-in realizado' }],
  },
  {
    id: 'RES-004', huesped: 'Ana Gómez', documento: '1234567890',
    habitacion: '302', checkin: '2026-05-23', checkout: '2026-05-29',
    estado: 'Check-in', notas: 'Aniversario — decoración especial',
    history: [{ date: '2026-05-18', event: 'Reserva creada' }, { date: '2026-05-23', event: 'Check-in realizado' }],
  },
  {
    id: 'RES-005', huesped: 'Luis Torres', documento: '1122334455',
    habitacion: '103', checkin: '2026-05-29', checkout: '2026-05-31',
    estado: 'Confirmada', notas: '',
    history: [{ date: '2026-05-27', event: 'Reserva creada' }],
  },
];

// ── Utilidades ────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateLong(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

let toastTimer = null;
function showToast(msg, type = 'default') {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast--${type} visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

function getStatusClass(estado) {
  const map = { 'Confirmada': 'badge-info', 'Check-in': 'badge-success', 'Check-out': 'badge-warning', 'Cancelada': 'badge-danger' };
  return map[estado] || 'badge-muted';
}

function getHabStatusClass(estado) {
  const map = { 'Disponible': 'badge-success', 'Ocupada': 'badge-danger', 'Mantenimiento': 'badge-warning' };
  return map[estado] || 'badge-muted';
}

// ── Clasificar tipo de evento del historial ───────────────────
function getEventoTipo(event) {
  const e = event.toLowerCase();
  if (e.includes('check-in') || e.includes('checkin')) return 'checkin';
  if (e.includes('check-out') || e.includes('checkout')) return 'checkout';
  if (e.includes('cancelad')) return 'cancelada';
  if (e.includes('creada') || e.includes('creado')) return 'creada';
  return 'otro';
}

function getEventoBadge(event) {
  const tipo = getEventoTipo(event);
  const map = {
    checkin:   { cls: 'ev--checkin',   label: 'Check-in' },
    checkout:  { cls: 'ev--checkout',  label: 'Check-out' },
    cancelada: { cls: 'ev--cancelada', label: 'Cancelada' },
    creada:    { cls: 'ev--creada',    label: 'Creación' },
    otro:      { cls: '',              label: event },
  };
  const { cls, label } = map[tipo];
  return `<span class="timeline-evento-badge ${cls}">${label}</span>`;
}

function getTimelineDotClass(event) {
  const tipo = getEventoTipo(event);
  const map = { checkin: 'dot--checkin', checkout: 'dot--checkout', cancelada: 'dot--cancelada', creada: 'dot--creada' };
  return map[tipo] || '';
}

// ── Validaciones de formulario ────────────────────────────────
function validarNombreHuesped(valor) {
  const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!soloLetras.test(valor)) return 'El nombre solo puede contener letras y espacios (sin números ni símbolos).';
  if (valor.trim().length < 5) return 'El nombre debe tener al menos 5 caracteres.';
  return null;
}

function validarNombreAdmin(valor) {
  const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!soloLetras.test(valor)) return 'El nombre solo puede contener letras y espacios.';
  if (valor.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  return null;
}

function validarDocumento(valor) {
  const soloNumeros = /^\d+$/;
  if (!soloNumeros.test(valor)) return 'El documento solo puede contener números.';
  if (valor.length < 6) return 'El documento debe tener al menos 6 dígitos.';
  return null;
}

function mostrarError(inputId, mensaje) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const existente = input.parentElement.querySelector('.field-error');
  if (existente) existente.remove();
  input.classList.add('input-error');
  if (mensaje) {
    const span = document.createElement('span');
    span.className = 'field-error';
    span.textContent = mensaje;
    input.parentElement.appendChild(span);
  }
}

function limpiarError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.remove('input-error');
  const existente = input.parentElement.querySelector('.field-error');
  if (existente) existente.remove();
}

// Validación en tiempo real para reservas
function attachInputValidation() {
  const resHuesped   = document.getElementById('resHuesped');
  const resDocumento = document.getElementById('resDocumento');

  if (resHuesped) {
    resHuesped.addEventListener('input', () => {
      const err = validarNombreHuesped(resHuesped.value.trim());
      if (err) mostrarError('resHuesped', err);
      else limpiarError('resHuesped');
    });
    resHuesped.addEventListener('keypress', (e) => {
      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
        mostrarError('resHuesped', 'No se permiten números en el nombre del huésped.');
      }
    });
  }

  if (resDocumento) {
    resDocumento.addEventListener('input', () => {
      resDocumento.value = resDocumento.value.replace(/\D/g, '');
      const err = validarDocumento(resDocumento.value.trim());
      if (err) mostrarError('resDocumento', err);
      else limpiarError('resDocumento');
    });
  }

  // Validación nombre en formulario de usuario: solo letras
  const uNombre = document.getElementById('uNombre');
  if (uNombre) {
    uNombre.addEventListener('keypress', (e) => {
      // Permitir solo letras, espacios y teclas de control
      if (!/[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    });
    uNombre.addEventListener('input', () => {
      // Quitar cualquier carácter no letra en tiempo real
      const pos = uNombre.selectionStart;
      const clean = uNombre.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      if (uNombre.value !== clean) {
        uNombre.value = clean;
        uNombre.setSelectionRange(pos - 1, pos - 1);
      }
    });
  }
}

// ── Navegación ────────────────────────────────────────────────
function showScreen(screenId) {
  if (!appState.currentUser) { showScreen('screen-login'); return; }

  const role    = appState.currentUser.role;
  const permitidas = PERMISOS[role]?.screens || [];

  if (screenId !== 'screen-login' && !permitidas.includes(screenId)) {
    showToast('No tienes permiso para acceder a esa sección.', 'danger');
    return;
  }

  screens.forEach(s => s.classList.toggle('active', s.id === screenId));

  if (screenId === 'screen-login') {
    navLinks.forEach(l => l.style.display = 'none');
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo)  userInfo.style.display  = 'none';
    return;
  }

  if (logoutBtn) logoutBtn.style.display = 'block';
  if (userInfo)  userInfo.style.display  = 'flex';

  navLinks.forEach(link => {
    const target = link.dataset.screen;
    link.style.display = permitidas.includes(target) ? '' : 'none';
    link.classList.toggle('active', target === screenId);
  });

  if (screenId === 'dashboard')    renderDashboard();
  if (screenId === 'reservas')     renderReservas();
  if (screenId === 'habitaciones') renderHabitaciones();
  if (screenId === 'huespedes')    renderHuespedes();
  if (screenId === 'historial')    renderHistorial();
  if (screenId === 'usuarios')     renderUsuarios();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  const ocupadas    = habitaciones.filter(h => h.estado === 'Ocupada').length;
  const disponibles = habitaciones.filter(h => h.estado === 'Disponible').length;
  const activas     = reservas.filter(r => r.estado === 'Confirmada' || r.estado === 'Check-in').length;
  const hoy         = new Date().toISOString().slice(0, 10);
  const checkoutHoy = reservas.filter(r => r.checkout === hoy).length;

  document.getElementById('statOcupadas').textContent    = ocupadas;
  document.getElementById('statDisponibles').textContent = disponibles;
  document.getElementById('statReservas').textContent    = activas;
  document.getElementById('statCheckoutHoy').textContent = checkoutHoy;

  document.getElementById('dashboardReservasTable').innerHTML =
    reservas.slice(0, 5).map(r => `
      <tr>
        <td><code style="font-family:'DM Mono',monospace;font-size:0.82rem;color:var(--primary-dark)">${r.id}</code></td>
        <td><strong>${r.huesped}</strong></td>
        <td>Hab. ${r.habitacion}</td>
        <td>${formatDate(r.checkin)}</td>
        <td><span class="badge ${getStatusClass(r.estado)}">${r.estado}</span></td>
      </tr>`).join('');

  // Alertas mejoradas con tipo y contexto
  const alertasDinamicas = buildAlertas();
  document.getElementById('alertasList').innerHTML = alertasDinamicas.map(a => `
    <li class="alerta-item alerta--${a.tipo}">
      <div class="alerta-icon-wrap">${a.icon}</div>
      <div class="alerta-body">
        <div class="alerta-label">${a.label}</div>
        <div class="alerta-texto">${a.texto}</div>
      </div>
    </li>`).join('') || '<li class="alerta-item alerta--default"><div class="alerta-icon-wrap">✅</div><div class="alerta-body"><div class="alerta-label">Sin alertas</div><div class="alerta-texto">No hay alertas pendientes para hoy.</div></div></li>';
}

function buildAlertas() {
  const hoy = new Date().toISOString().slice(0, 10);
  const alertas = [];

  // Check-outs pendientes hoy
  reservas.filter(r => r.checkout === hoy && r.estado === 'Check-in').forEach(r => {
    alertas.push({
      tipo: 'checkout',
      icon: '🔔',
      label: 'Check-out Hoy',
      texto: `<strong>${r.huesped}</strong> — Hab. ${r.habitacion} (${r.id}) debe hacer check-out hoy.`,
    });
  });

  // Confirmadas con check-in hoy (pendiente hacer check-in)
  reservas.filter(r => r.checkin === hoy && r.estado === 'Confirmada').forEach(r => {
    alertas.push({
      tipo: 'llegada',
      icon: '🏨',
      label: 'Llegada Hoy',
      texto: `<strong>${r.huesped}</strong> — Hab. ${r.habitacion} (${r.id}) llega hoy.${r.notas ? ' Nota: ' + r.notas : ''}`,
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
      texto: `<strong>${r.huesped}</strong> — Hab. ${r.habitacion} llega el ${formatDate(r.checkin)}.`,
    });
  });

  // Alertas fijas adicionales
  reservas.filter(r => r.notas && r.notas.toLowerCase().includes('tarde') && r.estado !== 'Cancelada' && r.estado !== 'Check-out').forEach(r => {
    alertas.push({
      tipo: 'llegada',
      icon: '🌙',
      label: 'Llegada Tardía',
      texto: `<strong>${r.huesped}</strong> (${r.id}) — ${r.notas}`,
    });
  });

  return alertas.slice(0, 6);
}

// ── Reservas ──────────────────────────────────────────────────
function renderReservas() {
  const filtro = document.getElementById('filtroEstadoReserva')?.value || 'Todos';
  const lista  = filtro === 'Todos' ? reservas : reservas.filter(r => r.estado === filtro);
  const canCancel = puedeHacer('cancelarReserva');

  document.getElementById('reservasTable').innerHTML = lista.map(r => `
    <tr>
      <td><code style="font-family:'DM Mono',monospace;font-size:0.82rem;color:var(--primary-dark)">${r.id}</code></td>
      <td><strong>${r.huesped}</strong></td>
      <td>Hab. ${r.habitacion}</td>
      <td>${formatDate(r.checkin)}</td>
      <td><span class="badge ${getStatusClass(r.estado)}">${r.estado}</span></td>
      <td class="acciones-cell">${getReservaAcciones(r, canCancel)}</td>
    </tr>`).join('');

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
    acciones.push(`<button class="btn btn-success btn-sm" onclick="cambiarEstado('${r.id}','Check-in')">✓ Check-in</button>`);
    if (canCancel) {
      acciones.push(`<button class="btn btn-danger btn-sm" onclick="cancelarReserva('${r.id}')">✗ Cancelar</button>`);
    }
  }
  if (r.estado === 'Check-in') {
    acciones.push(`<button class="btn btn-primary btn-sm" onclick="cambiarEstado('${r.id}','Check-out')">→ Check-out</button>`);
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
  reserva.history.push({ date: new Date().toISOString().slice(0,10), event: `${nuevoEstado} realizado` });

  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  if (hab) {
    if (nuevoEstado === 'Check-in')  hab.estado = 'Ocupada';
    if (nuevoEstado === 'Check-out') hab.estado = 'Disponible';
  }

  guardarDatos();
  renderDashboard(); renderReservas(); renderHabitaciones(); renderHistorial();
  showToast(`Reserva ${id}: ${anterior} → ${nuevoEstado}`, 'success');
}

function cancelarReserva(id) {
  if (!puedeHacer('cancelarReserva')) {
    showToast('No tienes permiso para cancelar reservas.', 'danger'); return;
  }
  if (!confirm(`¿Cancelar la reserva ${id}? Esta acción no se puede deshacer.`)) return;
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return;
  reserva.estado = 'Cancelada';
  reserva.history.push({ date: new Date().toISOString().slice(0,10), event: 'Reserva cancelada' });

  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  if (hab && hab.estado === 'Ocupada') hab.estado = 'Disponible';

  guardarDatos();
  renderDashboard(); renderReservas(); renderHabitaciones(); renderHistorial();
  showToast(`Reserva ${id} cancelada.`, 'danger');
}

// ── Habitaciones ──────────────────────────────────────────────
function renderHabitaciones() {
  const filtro = document.getElementById('filtroHabitacion')?.value || 'Todos';
  const lista  = filtro === 'Todos' ? habitaciones : habitaciones.filter(h => h.estado === filtro);
  const canChange = puedeHacer('cambiarEstadoHab');

  document.getElementById('habitacionesGrid').innerHTML = lista.map(h => {
    const cls = h.estado.toLowerCase().replace(' ','');
    const estadoBtns = canChange ? getHabAcciones(h) : '';
    const mantExtra = h.estado === 'Mantenimiento'
      ? `<p class="mant-eta">⚙️ Fuera de servicio</p>`
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
  if (h.estado === 'Disponible') {
    return `<button class="btn btn-sm btn-warning" onclick="cambiarEstadoHab('${h.numero}','Mantenimiento')">→ Mantenimiento</button>`;
  }
  if (h.estado === 'Mantenimiento') {
    return `<button class="btn btn-sm btn-success" onclick="cambiarEstadoHab('${h.numero}','Disponible')">✓ Marcar Disponible</button>`;
  }
  return '';
}

function cambiarEstadoHab(numero, nuevoEstado) {
  if (!puedeHacer('cambiarEstadoHab')) {
    showToast('Sin permiso para cambiar estado de habitación.', 'danger'); return;
  }
  const hab = habitaciones.find(h => h.numero === numero);
  if (!hab) return;
  const anterior = hab.estado;
  hab.estado = nuevoEstado;
  guardarDatos();
  renderHabitaciones(); renderDashboard();
  const emoji = nuevoEstado === 'Disponible' ? '✅' : '🔧';
  showToast(`${emoji} Habitación ${numero}: ${anterior} → ${nuevoEstado}`, nuevoEstado === 'Disponible' ? 'success' : 'warning');
}

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

  document.getElementById('huespedesTable').innerHTML = lista.map(h => `
    <tr>
      <td><code style="font-family:'DM Mono',monospace;font-size:0.82rem">${h.documento}</code></td>
      <td><strong>${h.nombre}</strong></td>
      <td>${h.reservas} reserva${h.reservas !== 1 ? 's' : ''}</td>
      <td>${formatDate(h.ultimaVisita)}</td>
      <td><span class="badge ${getStatusClass(h.estado)}">${h.estado}</span></td>
    </tr>`).join('');
}

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
            <div class="timeline-huesped">${e.huesped}</div>
            <div class="timeline-detalle">
              ${habInfo}
              <span>${e.event}</span>
            </div>
          </div>
        </div>
      </li>`;
  }).join('') || '<li style="padding:20px;color:var(--text-muted);text-align:center;">No hay eventos que coincidan con el filtro.</li>';
}

// ── Gestión de Usuarios ───────────────────────────────────────
function renderUsuarios() {
  if (!puedeHacer('gestionarUsuarios')) return;
  const tbody = document.getElementById('usuariosTable');
  const currentId = appState.currentUser?.id;

  tbody.innerHTML = usuariosSistema.map(u => {
    const esSelf = u.id === currentId;
    return `
      <tr class="${!u.activo ? 'row-inactive' : ''}">
        <td><code style="font-size:0.82rem;font-family:'DM Mono',monospace">${u.id}</code></td>
        <td><strong>${u.nombre}</strong></td>
        <td style="color:var(--text-muted)">${u.username}</td>
        <td>
          <select class="select-inline" onchange="cambiarRolUsuario(${u.id}, this.value)" ${esSelf ? 'disabled title="No puedes cambiar tu propio rol"' : ''}>
            ${['Administrador','Gerente','Recepcionista'].map(r =>
              `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <span class="badge ${u.activo ? 'badge-success' : 'badge-danger'}">
            ${u.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td class="acciones-cell">
          ${!esSelf ? `
            <button class="btn btn-sm ${u.activo ? 'btn-warning' : 'btn-success'}"
              onclick="toggleUsuario(${u.id})">
              ${u.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id})">Eliminar</button>
          ` : '<span class="text-muted" style="font-size:0.8rem">Tú</span>'}
        </td>
      </tr>`;
  }).join('');
}

function cambiarRolUsuario(id, nuevoRol) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u) return;
  const anterior = u.role;
  u.role = nuevoRol;
  guardarDatos();
  renderUsuarios();
  showToast(`${u.nombre}: ${anterior} → ${nuevoRol}`, 'success');
}

function toggleUsuario(id) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u) return;
  u.activo = !u.activo;
  guardarDatos();
  renderUsuarios();
  showToast(`Usuario ${u.username} ${u.activo ? 'activado' : 'desactivado'}.`, u.activo ? 'success' : 'danger');
}

function eliminarUsuario(id) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u) return;
  if (!confirm(`¿Eliminar al usuario "${u.username}"? Esta acción es permanente.`)) return;
  const idx = usuariosSistema.indexOf(u);
  usuariosSistema.splice(idx, 1);
  guardarDatos();
  renderUsuarios();
  showToast(`Usuario ${u.username} eliminado.`, 'danger');
}

// Formulario: crear nuevo usuario — nombre solo letras
document.getElementById('usuarioForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!puedeHacer('gestionarUsuarios')) return;

  const nombre   = document.getElementById('uNombre').value.trim();
  const username = document.getElementById('uUsername').value.trim().toLowerCase();
  const password = document.getElementById('uPassword').value.trim();
  const role     = document.getElementById('uRole').value;

  if (!nombre || !username || !password) {
    showToast('Completa todos los campos del nuevo usuario.', 'danger'); return;
  }

  const errNombre = validarNombreAdmin(nombre);
  if (errNombre) {
    showToast(errNombre, 'danger');
    mostrarError('uNombre', errNombre);
    return;
  }
  limpiarError('uNombre');

  if (password.length < 4) {
    showToast('La contraseña debe tener al menos 4 caracteres.', 'danger'); return;
  }
  if (usuariosSistema.find(u => u.username === username)) {
    showToast('Ese nombre de usuario ya existe.', 'danger'); return;
  }

  const nuevoId = Math.max(...usuariosSistema.map(u => u.id), 0) + 1;
  usuariosSistema.push({ id: nuevoId, nombre, username, password, role, activo: true });
  guardarDatos();
  document.getElementById('usuarioForm').reset();
  document.getElementById('uRole').value = 'Recepcionista';
  renderUsuarios();
  showToast(`✅ Usuario "${username}" creado con rol ${role}.`, 'success');
});

// ── Formulario de reserva ─────────────────────────────────────
reservaForm?.addEventListener('submit', (e) => {
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

  const nuevaId = 'RES-' + String(reservas.length + 1).padStart(3, '0');
  reservas.unshift({
    id: nuevaId, huesped, documento, habitacion, checkin, checkout,
    estado: 'Confirmada',
    notas: notas || 'Sin observaciones',
    history: [{ date: new Date().toISOString().slice(0,10), event: 'Reserva creada' }],
  });

  guardarDatos();
  reservaForm.reset();
  renderDashboard(); renderReservas(); renderHuespedes(); renderHistorial();
  showToast(`✅ Reserva ${nuevaId} creada para ${huesped}`, 'success');
});

// ── Login ─────────────────────────────────────────────────────
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();

  const usuario = usuariosSistema.find(u => u.username === username && u.password === password);

  if (!usuario) {
    showToast('Usuario o contraseña incorrectos.', 'danger');
    document.getElementById('loginUser').classList.add('input-error');
    document.getElementById('loginPassword').classList.add('input-error');
    return;
  }
  if (!usuario.activo) {
    showToast('Tu cuenta está desactivada. Contacta al administrador.', 'danger'); return;
  }

  document.getElementById('loginUser').classList.remove('input-error');
  document.getElementById('loginPassword').classList.remove('input-error');
  appState.currentUser = usuario;

  if (userNameDisplay) userNameDisplay.textContent = usuario.nombre || usuario.username;
  if (userRoleDisplay) userRoleDisplay.textContent  = usuario.role;

  document.getElementById('resCheckin').min  = new Date().toISOString().slice(0,10);
  document.getElementById('resCheckout').min = new Date().toISOString().slice(0,10);

  showScreen('dashboard');
  showToast(`Bienvenido, ${usuario.nombre || usuario.username}`, 'success');
});

// ── Logout ────────────────────────────────────────────────────
logoutBtn?.addEventListener('click', () => {
  appState.currentUser = null;
  loginForm?.reset();
  screens.forEach(s => s.classList.toggle('active', s.id === 'screen-login'));
  navLinks.forEach(l => l.style.display = 'none');
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (userInfo)  userInfo.style.display  = 'none';
});

// ── Navegación general ────────────────────────────────────────
navLinks.forEach(link => {
  link.addEventListener('click', () => showScreen(link.dataset.screen));
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn || btn.classList.contains('nav-link')) return;
  e.preventDefault();
  showScreen(btn.dataset.screen);
});

// ── Filtros ───────────────────────────────────────────────────
document.getElementById('filtroEstadoReserva')?.addEventListener('change', renderReservas);
document.getElementById('filtroHabitacion')?.addEventListener('change', renderHabitaciones);
document.getElementById('buscarHuesped')?.addEventListener('input', (e) => renderHuespedes(e.target.value));
document.getElementById('filtroHistorial')?.addEventListener('change', renderHistorial);

// ── Persistencia ──────────────────────────────────────────────
function guardarDatos() {
  try {
    localStorage.setItem('hotel_utp_reservas',    JSON.stringify(reservas));
    localStorage.setItem('hotel_utp_habitaciones', JSON.stringify(habitaciones));
    localStorage.setItem('hotel_utp_usuarios',     JSON.stringify(usuariosSistema));
  } catch (err) { console.warn('localStorage no disponible:', err); }
}

function cargarDatos() {
  try {
    const r = localStorage.getItem('hotel_utp_reservas');
    const h = localStorage.getItem('hotel_utp_habitaciones');
    const u = localStorage.getItem('hotel_utp_usuarios');
    if (r) reservas      = JSON.parse(r);
    if (h) habitaciones  = JSON.parse(h);
    if (u) usuariosSistema = JSON.parse(u);
  } catch (err) { console.warn('Error al cargar datos:', err); }
}

// ── Init ──────────────────────────────────────────────────────
cargarDatos();
navLinks.forEach(l => l.style.display = 'none');
if (logoutBtn) logoutBtn.style.display = 'none';
if (userInfo)  userInfo.style.display  = 'none';
attachInputValidation();
