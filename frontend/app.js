// ── DOM Referencias ──────────────────────────────────────────
const screens      = document.querySelectorAll('.screen');
const navLinks     = document.querySelectorAll('.nav-link');
const loginForm    = document.getElementById('loginForm');
const reservaForm  = document.getElementById('reservaForm');
const logoutBtn    = document.getElementById('logoutBtn');
const toast        = document.getElementById('toast');
const userInfo     = document.getElementById('userInfo');
const userNameDisplay = document.getElementById('userNameDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');

// ── Usuarios ─────────────────────────────────────────────────
const usuarios = [
  { username: 'recepcion',  password: '1234',     role: 'Recepcionista' },
  { username: 'gerente',    password: 'gerente123', role: 'Gerente' },
  { username: 'admin',      password: 'admin123',  role: 'Administrador' },
];

// ── Estado ───────────────────────────────────────────────────
const appState = {
  currentUser: null,
  selectedReservaId: null,
};

// ── Datos de habitaciones ─────────────────────────────────────
const habitaciones = [
  { numero: '101', tipo: 'Sencilla',   precio: 120000, estado: 'Disponible' },
  { numero: '102', tipo: 'Sencilla',   precio: 120000, estado: 'Ocupada' },
  { numero: '103', tipo: 'Sencilla',   precio: 120000, estado: 'Disponible' },
  { numero: '104', tipo: 'Doble',      precio: 180000, estado: 'Mantenimiento' },
  { numero: '105', tipo: 'Doble',      precio: 180000, estado: 'Disponible' },
  { numero: '201', tipo: 'Doble',      precio: 190000, estado: 'Ocupada' },
  { numero: '202', tipo: 'Suite',      precio: 320000, estado: 'Disponible' },
  { numero: '203', tipo: 'Suite',      precio: 320000, estado: 'Ocupada' },
  { numero: '204', tipo: 'Suite',      precio: 350000, estado: 'Disponible' },
  { numero: '301', tipo: 'Junior Suite', precio: 260000, estado: 'Disponible' },
  { numero: '302', tipo: 'Junior Suite', precio: 260000, estado: 'Ocupada' },
  { numero: '303', tipo: 'Presidencial', precio: 550000, estado: 'Disponible' },
];

// ── Reservas de muestra ───────────────────────────────────────
const reservas = [
  {
    id: 'RES-001',
    huesped: 'Carlos Ramírez',
    documento: '1012345678',
    habitacion: '102',
    checkin: '2026-05-25',
    checkout: '2026-05-28',
    estado: 'Check-in',
    notas: 'Solicita cama adicional',
    history: [
      { date: '2026-05-20', event: 'Reserva creada' },
      { date: '2026-05-25', event: 'Check-in realizado' },
    ],
  },
  {
    id: 'RES-002',
    huesped: 'María Fernández',
    documento: '1098765432',
    habitacion: '201',
    checkin: '2026-05-26',
    checkout: '2026-05-30',
    estado: 'Confirmada',
    notas: 'Llegada tardía después de las 10pm',
    history: [
      { date: '2026-05-21', event: 'Reserva creada' },
    ],
  },
  {
    id: 'RES-003',
    huesped: 'Jorge Mendoza',
    documento: '9876543210',
    habitacion: '203',
    checkin: '2026-05-24',
    checkout: '2026-05-27',
    estado: 'Check-in',
    notas: '',
    history: [
      { date: '2026-05-22', event: 'Reserva creada' },
      { date: '2026-05-24', event: 'Check-in realizado' },
    ],
  },
  {
    id: 'RES-004',
    huesped: 'Ana Gómez',
    documento: '1234567890',
    habitacion: '302',
    checkin: '2026-05-23',
    checkout: '2026-05-29',
    estado: 'Check-in',
    notas: 'Aniversario — decoración especial',
    history: [
      { date: '2026-05-18', event: 'Reserva creada' },
      { date: '2026-05-23', event: 'Check-in realizado' },
    ],
  },
  {
    id: 'RES-005',
    huesped: 'Luis Torres',
    documento: '1122334455',
    habitacion: '103',
    checkin: '2026-05-29',
    checkout: '2026-05-31',
    estado: 'Confirmada',
    notas: '',
    history: [
      { date: '2026-05-27', event: 'Reserva creada' },
    ],
  },
];

const alertas = [
  'Habitación 104 en mantenimiento hasta el 30/05.',
  'Check-out pendiente: RES-003 — Jorge Mendoza (hab. 203).',
  'RES-002 — llegada tardía después de las 10pm.',
];

// ── Utilidades ────────────────────────────────────────────────
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2800);
}

function getStatusClass(estado) {
  switch (estado) {
    case 'Confirmada':    return 'badge-info';
    case 'Check-in':     return 'badge-success';
    case 'Check-out':    return 'badge-warning';
    case 'Cancelada':    return 'badge-danger';
    default:             return 'badge-muted';
  }
}

function getHabStatusClass(estado) {
  switch (estado) {
    case 'Disponible':    return 'badge-success';
    case 'Ocupada':       return 'badge-danger';
    case 'Mantenimiento': return 'badge-warning';
    default:              return 'badge-muted';
  }
}

// ── Navegación ────────────────────────────────────────────────
function showScreen(screenId) {
  screens.forEach(s => s.classList.toggle('active', s.id === screenId));

  if (screenId === 'screen-login') {
    navLinks.forEach(l => { l.style.display = 'none'; });
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo)  userInfo.style.display  = 'none';
    return;
  }

  if (logoutBtn) logoutBtn.style.display = 'block';
  if (userInfo)  userInfo.style.display  = 'flex';

  const role = appState.currentUser?.role;
  navLinks.forEach(link => {
    link.style.display = '';
    link.classList.toggle('active', link.dataset.screen === screenId);
    // Ocultar pantallas según rol
    if (role === 'Recepcionista' && link.dataset.screen === 'huespedes') {
      link.style.display = 'none';
    }
  });
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  const ocupadas     = habitaciones.filter(h => h.estado === 'Ocupada').length;
  const disponibles  = habitaciones.filter(h => h.estado === 'Disponible').length;
  const activas      = reservas.filter(r => r.estado === 'Confirmada' || r.estado === 'Check-in').length;
  const hoy          = new Date().toISOString().slice(0, 10);
  const checkoutHoy  = reservas.filter(r => r.checkout === hoy).length;

  document.getElementById('statOcupadas').textContent    = ocupadas;
  document.getElementById('statDisponibles').textContent = disponibles;
  document.getElementById('statReservas').textContent    = activas;
  document.getElementById('statCheckoutHoy').textContent = checkoutHoy;

  const tbody = document.getElementById('dashboardReservasTable');
  tbody.innerHTML = reservas.slice(0, 5).map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.huesped}</td>
      <td>Hab. ${r.habitacion}</td>
      <td>${formatDate(r.checkin)}</td>
      <td><span class="badge ${getStatusClass(r.estado)}">${r.estado}</span></td>
    </tr>`
  ).join('');

  const alertasList = document.getElementById('alertasList');
  alertasList.innerHTML = alertas.map(a => `<li>⚠️ ${a}</li>`).join('');
}

// ── Reservas ──────────────────────────────────────────────────
function renderReservas() {
  const filtro = document.getElementById('filtroEstadoReserva')?.value || 'Todos';
  const lista  = filtro === 'Todos' ? reservas : reservas.filter(r => r.estado === filtro);

  const tbody = document.getElementById('reservasTable');
  tbody.innerHTML = lista.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.huesped}</td>
      <td>Hab. ${r.habitacion}</td>
      <td>${formatDate(r.checkin)}</td>
      <td><span class="badge ${getStatusClass(r.estado)}">${r.estado}</span></td>
      <td>${getReservaAcciones(r)}</td>
    </tr>`
  ).join('');

  // Poblar select de habitaciones disponibles
  const selectHab = document.getElementById('resHabitacion');
  if (selectHab) {
    const disponibles = habitaciones.filter(h => h.estado === 'Disponible');
    selectHab.innerHTML = '<option value="">Seleccionar habitación...</option>' +
      disponibles.map(h =>
        `<option value="${h.numero}">${h.numero} — ${h.tipo} ($${h.precio.toLocaleString('es-CO')})</option>`
      ).join('');
  }
}

function getReservaAcciones(r) {
  if (r.estado === 'Confirmada') {
    return `<button class="btn btn-success btn-sm" onclick="cambiarEstado('${r.id}','Check-in')">Check-in</button>`;
  }
  if (r.estado === 'Check-in') {
    return `<button class="btn btn-primary btn-sm" onclick="cambiarEstado('${r.id}','Check-out')">Check-out</button>`;
  }
  if (r.estado === 'Check-out') {
    return `<span class="badge badge-muted">Completada</span>`;
  }
  if (r.estado === 'Cancelada') {
    return `<span class="badge badge-danger">Cancelada</span>`;
  }
  return '';
}

function cambiarEstado(id, nuevoEstado) {
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return;

  const estadoAnterior = reserva.estado;
  reserva.estado = nuevoEstado;
  reserva.history.push({
    date: new Date().toISOString().slice(0, 10),
    event: `${nuevoEstado} realizado`,
  });

  // Actualizar estado de habitación
  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  if (hab) {
    if (nuevoEstado === 'Check-in')  hab.estado = 'Ocupada';
    if (nuevoEstado === 'Check-out') hab.estado = 'Disponible';
  }

  guardarDatos();
  renderDashboard();
  renderReservas();
  renderHabitaciones();
  renderHistorial();
  showToast(`Reserva ${id}: ${estadoAnterior} → ${nuevoEstado}`);
}

// ── Habitaciones ──────────────────────────────────────────────
function renderHabitaciones() {
  const filtro = document.getElementById('filtroHabitacion')?.value || 'Todos';
  const lista  = filtro === 'Todos' ? habitaciones : habitaciones.filter(h => h.estado === filtro);
  const grid   = document.getElementById('habitacionesGrid');

  grid.innerHTML = lista.map(h => `
    <div class="hab-card ${h.estado.toLowerCase().replace(' ','')}">
      <div class="hab-numero">${h.numero}</div>
      <div class="hab-tipo">${h.tipo}</div>
      <div class="hab-precio">$${h.precio.toLocaleString('es-CO')}/noche</div>
      <span class="badge ${getHabStatusClass(h.estado)}">${h.estado}</span>
    </div>`
  ).join('');
}

// ── Huéspedes ─────────────────────────────────────────────────
function renderHuespedes(filtro = '') {
  const porDocumento = {};
  reservas.forEach(r => {
    if (!porDocumento[r.documento]) {
      porDocumento[r.documento] = {
        documento: r.documento,
        nombre: r.huesped,
        reservas: 0,
        ultimaVisita: r.checkin,
        estado: r.estado,
      };
    }
    porDocumento[r.documento].reservas++;
    if (r.checkin > porDocumento[r.documento].ultimaVisita) {
      porDocumento[r.documento].ultimaVisita = r.checkin;
      porDocumento[r.documento].estado = r.estado;
    }
  });

  let lista = Object.values(porDocumento);
  if (filtro) {
    lista = lista.filter(h => h.nombre.toLowerCase().includes(filtro.toLowerCase()));
  }

  const tbody = document.getElementById('huespedesTable');
  tbody.innerHTML = lista.map(h => `
    <tr>
      <td>${h.documento}</td>
      <td>${h.nombre}</td>
      <td>${h.reservas} reserva${h.reservas !== 1 ? 's' : ''}</td>
      <td>${formatDate(h.ultimaVisita)}</td>
      <td><span class="badge ${getStatusClass(h.estado)}">${h.estado}</span></td>
    </tr>`
  ).join('');
}

// ── Historial ─────────────────────────────────────────────────
function renderHistorial() {
  const eventos = reservas
    .flatMap(r => r.history.map(h => ({ ...h, reservaId: r.id, huesped: r.huesped })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const timeline = document.getElementById('historialTimeline');
  timeline.innerHTML = eventos.map(e => `
    <li>
      <span class="timeline-dot"></span>
      <div>
        <strong>${formatDate(e.date)} — ${e.reservaId}</strong>
        <p>${e.huesped}: ${e.event}</p>
      </div>
    </li>`
  ).join('');
}

// ── Formulario de reserva ─────────────────────────────────────
reservaForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const huesped    = document.getElementById('resHuesped').value.trim();
  const documento  = document.getElementById('resDocumento').value.trim();
  const habitacion = document.getElementById('resHabitacion').value;
  const checkin    = document.getElementById('resCheckin').value;
  const checkout   = document.getElementById('resCheckout').value;
  const notas      = document.getElementById('resNotas').value.trim();

  if (!huesped || !documento || !habitacion || !checkin || !checkout) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }

  if (checkin >= checkout) {
    alert('La fecha de check-out debe ser posterior al check-in.');
    return;
  }

  const nuevaId = 'RES-' + String(reservas.length + 1).padStart(3, '0');
  const nuevaReserva = {
    id: nuevaId,
    huesped, documento, habitacion,
    checkin, checkout,
    estado: 'Confirmada',
    notas: notas || 'Sin observaciones',
    history: [{ date: new Date().toISOString().slice(0, 10), event: 'Reserva creada' }],
  };

  reservas.unshift(nuevaReserva);
  guardarDatos();
  reservaForm.reset();
  renderDashboard();
  renderReservas();
  renderHuespedes();
  renderHistorial();
  showToast(`Reserva ${nuevaId} creada para ${huesped}`);
});

// ── Login ─────────────────────────────────────────────────────
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();

  const usuario = usuarios.find(u => u.username === username && u.password === password);

  if (!usuario) {
    alert('Usuario o contraseña incorrectos.');
    return;
  }

  appState.currentUser = usuario;

  if (userNameDisplay) userNameDisplay.textContent = usuario.username;
  if (userRoleDisplay) userRoleDisplay.textContent  = usuario.role;

  // Fecha mínima para reservas
  document.getElementById('resCheckin').min  = new Date().toISOString().slice(0, 10);
  document.getElementById('resCheckout').min = new Date().toISOString().slice(0, 10);

  showScreen('dashboard');
  renderDashboard();
  renderReservas();
  renderHabitaciones();
  renderHuespedes();
  renderHistorial();
});

// ── Logout ────────────────────────────────────────────────────
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    appState.currentUser = null;
    loginForm.reset();
    showScreen('screen-login');
  });
}

// ── Navegación ────────────────────────────────────────────────
navLinks.forEach(link => {
  link.addEventListener('click', () => showScreen(link.dataset.screen));
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn) return;
  e.preventDefault();
  showScreen(btn.dataset.screen);
});

// ── Filtros ───────────────────────────────────────────────────
document.getElementById('filtroEstadoReserva')?.addEventListener('change', renderReservas);
document.getElementById('filtroHabitacion')?.addEventListener('change', renderHabitaciones);
document.getElementById('buscarHuesped')?.addEventListener('input', (e) => {
  renderHuespedes(e.target.value);
});

// ── Persistencia ──────────────────────────────────────────────
function guardarDatos() {
  try {
    localStorage.setItem('hotel_utp_reservas',    JSON.stringify(reservas));
    localStorage.setItem('hotel_utp_habitaciones', JSON.stringify(habitaciones));
  } catch (err) {
    console.warn('localStorage no disponible:', err);
  }
}

function cargarDatos() {
  try {
    const r = localStorage.getItem('hotel_utp_reservas');
    const h = localStorage.getItem('hotel_utp_habitaciones');
    if (r) { reservas.length = 0; JSON.parse(r).forEach(x => reservas.push(x)); }
    if (h) { habitaciones.length = 0; JSON.parse(h).forEach(x => habitaciones.push(x)); }
  } catch (err) {
    console.warn('Error al cargar datos:', err);
  }
}

// ── Init ──────────────────────────────────────────────────────
function appInit() {
  navLinks.forEach(l => { l.style.display = 'none'; });
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (userInfo)  userInfo.style.display  = 'none';
}

cargarDatos();
appInit();
