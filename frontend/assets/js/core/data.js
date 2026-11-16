/** data.js: almacenamiento local y entidades compartidas */
// ── Permisos por rol ─────────────────────────────────────────
export const PERMISOS = {
  Administrador: {
    screens:       ['dashboard','reservas','habitaciones','huespedes','historial','usuarios'],
    crearReserva:  true,
    cancelarReserva: true,
    cambiarEstadoReserva: true,
    verHuespedes:  true,
    verHistorial:  true,
    gestionarUsuarios: true,
    cambiarEstadoHab: true,
    finalizarAseo: false,
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
    finalizarAseo: false,
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
    finalizarAseo: false,
  },
  Camarero: {
    screens:       ['dashboard',"habitaciones","historial"],
    crearReserva:  false,
    cancelarReserva: false,
    cambiarEstadoReserva: false,
    verHuespedes:  false,
    verHistorial:  true,
    gestionarUsuarios: false,
    cambiarEstadoHab: false,
    // Solo el Camarero puede marcar una habitación en "Aseo" como Disponible.
    finalizarAseo: true,
  },
};

export function puedeHacer(accion) {
  const role = appState.currentUser?.role;
  if (!role || !PERMISOS[role]) return false;
  return !!PERMISOS[role][accion];
}

// ── Usuarios del sistema ─────────────────────────────────────
export const usuariosPorDefecto = [
  { id: 1, username: 'admin', password: 'admin123', role: 'Administrador', activo: true, nombre: 'Administrador' },
  { id: 2, username: 'gerente', password: 'gerente123', role: 'Gerente', activo: true, nombre: 'María López' },
  { id: 3, username: 'recepcion', password: '1234', role: 'Recepcionista', activo: true, nombre: 'Juan Pérez' },
  { id: 4, username: 'camarero', password: '2001', role: 'Camarero', activo: true, nombre: 'Javier Barbosa' }
];

export let usuariosSistema = [];

// ── Estado global ─────────────────────────────────────────────
export const appState = {
  currentUser: null,
};

// ── Habitaciones ─────────────────────────────────────────────
export let habitaciones = [
  { numero: '101', tipo: 'Sencilla',    precio: 120000, estado: 'Disponible',    capacidad: 1 },
  { numero: '102', tipo: 'Sencilla',    precio: 120000, estado: 'Ocupada',       capacidad: 1 },
  { numero: '103', tipo: 'Sencilla',    precio: 120000, estado: 'Disponible',    capacidad: 1 },
  { numero: '106', tipo: 'Sencilla',    precio: 125000, estado: 'Disponible',    capacidad: 1 },
  { numero: '107', tipo: 'Sencilla',    precio: 125000, estado: 'Disponible',    capacidad: 2 },
  { numero: '104', tipo: 'Doble',       precio: 180000, estado: 'Mantenimiento', capacidad: 2 },
  { numero: '105', tipo: 'Doble',       precio: 180000, estado: 'Disponible',    capacidad: 2 },
  { numero: '201', tipo: 'Doble',       precio: 190000, estado: 'Ocupada',       capacidad: 2 },
  { numero: '108', tipo: 'Doble',       precio: 185000, estado: 'Disponible',    capacidad: 3 },
  { numero: '206', tipo: 'Doble',       precio: 190000, estado: 'Disponible',    capacidad: 3 },
  { numero: '202', tipo: 'Suite',       precio: 320000, estado: 'Disponible',    capacidad: 3 },
  { numero: '203', tipo: 'Suite',       precio: 320000, estado: 'Ocupada',       capacidad: 3 },
  { numero: '204', tipo: 'Suite',       precio: 350000, estado: 'Disponible',    capacidad: 4 },
  { numero: '205', tipo: 'Suite',       precio: 340000, estado: 'Disponible',    capacidad: 4 },
  { numero: '301', tipo: 'Junior Suite',precio: 260000, estado: 'Disponible',    capacidad: 4 },
  { numero: '302', tipo: 'Junior Suite',precio: 260000, estado: 'Ocupada',       capacidad: 4 },
  { numero: '304', tipo: 'Junior Suite',precio: 265000, estado: 'Disponible',    capacidad: 5 },
  { numero: '305', tipo: 'Familiar',    precio: 300000, estado: 'Disponible',    capacidad: 5 },
  { numero: '306', tipo: 'Familiar',    precio: 300000, estado: 'Disponible',    capacidad: 6 },
  { numero: '303', tipo: 'Presidencial',precio: 550000, estado: 'Disponible',    capacidad: 6 },
  { numero: '401', tipo: 'Presidencial',precio: 580000, estado: 'Disponible',    capacidad: 8 },
];

// Capacidad esperada por tipo de habitación (usada para migrar datos antiguos guardados
// en el navegador que no tenían el campo "capacidad").
export const CAPACIDAD_POR_TIPO = {
  'Sencilla': 1, 'Doble': 2, 'Suite': 3, 'Junior Suite': 4, 'Familiar': 5, 'Presidencial': 6,
};

// ── Reservas de muestra ───────────────────────────────────────
export let reservas = [
  {
    id: 'RES-001', codigoReserva: 'HTL-4F8K2Q', huesped: 'Carlos Ramírez', documento: '1012345678',
    habitacion: '102', checkin: '2026-05-25', checkout: '2026-05-28',
    estado: 'Check-in', notas: 'Solicita cama adicional',
    pago: { metodo: 'Tarjeta', estado: 'Pagado', total: 360000, montoPagado: 360000, saldo: 0, detalle: 'Tarjeta terminada en 4821' },
    history: [{ date: '2026-05-20', event: 'Reserva creada' }, { date: '2026-05-25', event: 'Check-in realizado' }],
  },
  {
    id: 'RES-002', codigoReserva: 'HTL-9M3X7R', huesped: 'María Fernández', documento: '1098765432',
    habitacion: '201', checkin: '2026-05-26', checkout: '2026-05-30',
    estado: 'Confirmada', notas: 'Llegada tardía después de las 10pm',
    pago: { metodo: 'PSE', estado: 'Pagado', total: 760000, montoPagado: 760000, saldo: 0, detalle: 'PSE — Bancolombia' },
    history: [{ date: '2026-05-21', event: 'Reserva creada' }],
  },
  {
    id: 'RES-003', codigoReserva: 'HTL-2P6L1Z', huesped: 'Jorge Mendoza', documento: '9876543210',
    habitacion: '203', checkin: '2026-05-24', checkout: '2026-05-27',
    estado: 'Check-in', notas: '',
    pago: { metodo: 'Abono', estado: 'Abono parcial', total: 960000, montoPagado: 288000, saldo: 672000, detalle: 'Abono inicial de $288.000' },
    history: [{ date: '2026-05-22', event: 'Reserva creada' }, { date: '2026-05-24', event: 'Check-in realizado' }],
  },
  {
    id: 'RES-004', codigoReserva: 'HTL-7Q4N8W', huesped: 'Ana Gómez', documento: '1234567890',
    habitacion: '302', checkin: '2026-05-23', checkout: '2026-05-29',
    estado: 'Check-in', notas: 'Aniversario — decoración especial',
    pago: { metodo: 'Tarjeta', estado: 'Pagado', total: 1560000, montoPagado: 1560000, saldo: 0, detalle: 'Tarjeta terminada en 7735' },
    history: [{ date: '2026-05-18', event: 'Reserva creada' }, { date: '2026-05-23', event: 'Check-in realizado' }],
  },
  {
    id: 'RES-005', codigoReserva: 'HTL-5T1V6H', huesped: 'Luis Torres', documento: '1122334455',
    habitacion: '103', checkin: '2026-05-29', checkout: '2026-05-31',
    estado: 'Confirmada', notas: '',
    pago: { metodo: '—', estado: 'Pendiente', total: 240000, montoPagado: 0, saldo: 240000, detalle: 'Pago pendiente en recepción' },
    history: [{ date: '2026-05-27', event: 'Reserva creada' }],
  },
];

// ── Notificaciones / Alertas del día ───────────────────────────
// Registro dinámico de eventos: nuevas reservas, habitaciones que
// entran en aseo (se liberan) y habitaciones que salen de aseo.
// El dashboard siempre muestra solo las últimas 5.
export let notificaciones = [
  { icon: '🔧', texto: 'Habitación <strong>104</strong> en mantenimiento.', tipo: 'mantenimiento', fecha: new Date().toISOString() },
];

export function agregarNotificacion(icon, texto, tipo = 'default') {
  notificaciones.unshift({ icon, texto, tipo, fecha: new Date().toISOString() });
  notificaciones = notificaciones.slice(0, 20);
  guardarDatos();
}


// ── Código único de reserva ────────────────────────────────────
export function generarCodigoReserva() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos
  let codigo;
  do {
    codigo = 'HTL-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (reservas.some(r => r.codigoReserva === codigo));
  return codigo;
}

// ── Persistencia ──────────────────────────────────────────────
export function guardarDatos() {
  try {
    localStorage.setItem('hotel_utp_reservas',    JSON.stringify(reservas));
    localStorage.setItem('hotel_utp_habitaciones', JSON.stringify(habitaciones));
    localStorage.setItem('hotel_utp_usuarios',     JSON.stringify(usuariosSistema));
    localStorage.setItem('hotel_utp_notificaciones', JSON.stringify(notificaciones));
  } catch (err) { console.warn('localStorage no disponible:', err); }
}

export function cargarDatos() {
  try {
    const r = localStorage.getItem('hotel_utp_reservas');
    const h = localStorage.getItem('hotel_utp_habitaciones');
    const u = localStorage.getItem('hotel_utp_usuarios');
    const n = localStorage.getItem('hotel_utp_notificaciones');
    if (r) reservas      = JSON.parse(r);
    if (h) {
      const habitacionesGuardadas = JSON.parse(h);
      // Migración: si vienen de una versión anterior, aseguramos el campo "capacidad"
      // y agregamos como nuevas cualquier habitación que no exista todavía (para que
      // el portal de clientes siempre tenga más opciones disponibles).
      habitacionesGuardadas.forEach(hab => {
        if (!hab.capacidad) hab.capacidad = CAPACIDAD_POR_TIPO[hab.tipo] || 2;
      });
      const numerosGuardados = new Set(habitacionesGuardadas.map(hab => hab.numero));
      habitaciones.forEach(habDefault => {
        if (!numerosGuardados.has(habDefault.numero)) habitacionesGuardadas.push(habDefault);
      });
      habitaciones = habitacionesGuardadas;
    }
    usuariosSistema = u ? JSON.parse(u) : usuariosPorDefecto.map(item => ({ ...item }));
    // No sobrescribir contraseñas, roles ni estados modificados por el administrador.
    if (n) notificaciones = JSON.parse(n);
    // Migración: reservas guardadas antes de esta función no tienen código único.
    reservas.forEach(res => { if (!res.codigoReserva) res.codigoReserva = generarCodigoReserva(); });
  } catch (err) {
    console.warn('Error al cargar datos:', err);
    if (!Array.isArray(usuariosSistema) || !usuariosSistema.length) usuariosSistema = usuariosPorDefecto.map(u => ({ ...u }));
  }
  if (!usuariosSistema.length) usuariosSistema = usuariosPorDefecto.map(u => ({ ...u }));
}
