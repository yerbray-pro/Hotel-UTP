
/**
 * ============================================================
 * HOTEL UTP — Sistema de Gestión Hotelera
 * Lógica principal de la aplicación (Vanilla JS / ES2020+)
 * ============================================================
 *
 * Arquitectura: SPA (Single Page Application) sin framework.
 * El routing se implementa manualmente mostrando/ocultando
 * secciones HTML con la función showScreen().
 *
 * Tipado: JSDoc con @typedef para definir las estructuras de datos
 * principales. Equivalente a interfaces de TypeScript — permite
 * autocompletado en VS Code y verificación estática con ts-check.
 *
 * Estado global: appState (usuario actual).
 * Persistencia: localStorage (reservas, habitaciones, usuarios).
 * Permisos: mapa PERMISOS consultado por puedeHacer(accion).
 *
 * @fileoverview SPA hotelera — Hotel UTP
 * @version 2.0.0
 */

// @ts-check
// La directiva @ts-check activa la verificación de tipos de TypeScript
// sobre este archivo JS en editores compatibles (VS Code, WebStorm).

// ══════════════════════════════════════════════════════════════
//  DEFINICIONES DE TIPOS (equivalente a interfaces TypeScript)
// ══════════════════════════════════════════════════════════════

/**
 * Evento individual del historial de una reserva.
 * Equivalente TypeScript:
 *   interface HistorialEvento { date: string; event: string; }
 *
 * @typedef {Object} HistorialEvento
 * @property {string} date  - Fecha en formato ISO 'YYYY-MM-DD'
 * @property {string} event - Descripción textual del evento
 */

/**
 * Representa una reserva de habitación.
 * Equivalente TypeScript:
 *   interface Reserva { id: string; huesped: string; ... }
 *
 * @typedef {Object} Reserva
 * @property {string}           id         - Identificador único (p.ej. 'RES-001')
 * @property {string}           huesped    - Nombre completo del huésped
 * @property {string}           documento  - Cédula o pasaporte (solo dígitos)
 * @property {string}           habitacion - Número de habitación asignada
 * @property {string}           checkin    - Fecha de entrada 'YYYY-MM-DD'
 * @property {string}           checkout   - Fecha de salida 'YYYY-MM-DD'
 * @property {EstadoReserva}    estado     - Estado actual de la reserva
 * @property {string}           notas      - Observaciones opcionales
 * @property {HistorialEvento[]} history   - Bitácora de cambios de estado
 */

/**
 * Estados posibles de una reserva (union type).
 * Equivalente TypeScript:
 *   type EstadoReserva = 'Confirmada' | 'Check-in' | 'Check-out' | 'Cancelada';
 *
 * @typedef {'Confirmada' | 'Check-in' | 'Check-out' | 'Cancelada'} EstadoReserva
 */

/**
 * Estados posibles de una habitación (union type).
 * Equivalente TypeScript:
 *   type EstadoHabitacion = 'Disponible' | 'Ocupada' | 'Mantenimiento';
 *
 * @typedef {'Disponible' | 'Ocupada' | 'Mantenimiento'} EstadoHabitacion
 */

/**
 * Tipos de habitación disponibles en el hotel.
 * @typedef {'Sencilla' | 'Doble' | 'Suite' | 'Junior Suite' | 'Presidencial'} TipoHabitacion
 */

/**
 * Representa una habitación del hotel.
 * Equivalente TypeScript:
 *   interface Habitacion { numero: string; tipo: TipoHabitacion; ... }
 *
 * @typedef {Object} Habitacion
 * @property {string}           numero - Número de habitación (p.ej. '101')
 * @property {TipoHabitacion}   tipo   - Categoría de la habitación
 * @property {number}           precio - Precio por noche en pesos colombianos
 * @property {EstadoHabitacion} estado - Estado operativo actual
 */

/**
 * Roles de usuario disponibles en el sistema.
 * @typedef {'Administrador' | 'Gerente' | 'Recepcionista'} RolUsuario
 */

/**
 * Representa un usuario del sistema.
 * Equivalente TypeScript:
 *   interface Usuario { id: number; username: string; ... }
 *
 * @typedef {Object} Usuario
 * @property {number}     id       - Identificador numérico único
 * @property {string}     username - Nombre de usuario para login
 * @property {string}     password - Contraseña (texto plano — solo demo)
 * @property {RolUsuario} role     - Rol que determina los permisos
 * @property {boolean}    activo   - Si la cuenta está habilitada
 * @property {string}     nombre   - Nombre visible en la UI
 */

/**
 * Configuración de permisos para un rol específico.
 * Equivalente TypeScript:
 *   interface ConfigPermisos { screens: string[]; crearReserva: boolean; ... }
 *
 * @typedef {Object} ConfigPermisos
 * @property {string[]} screens              - Pantallas accesibles para el rol
 * @property {boolean}  crearReserva         - Puede crear reservas
 * @property {boolean}  cancelarReserva      - Puede cancelar reservas
 * @property {boolean}  cambiarEstadoReserva - Puede hacer check-in / check-out
 * @property {boolean}  verHuespedes         - Puede ver el módulo de huéspedes
 * @property {boolean}  verHistorial         - Puede ver el historial de actividad
 * @property {boolean}  gestionarUsuarios    - Puede crear / modificar usuarios
 * @property {boolean}  cambiarEstadoHab     - Puede poner habitaciones en mantenimiento
 */

/**
 * Estado global de la aplicación.
 * Equivalente TypeScript:
 *   interface AppState { currentUser: Usuario | null; }
 *
 * @typedef {Object} AppState
 * @property {Usuario | null} currentUser - Usuario autenticado, o null si no hay sesión
 */

/**
 * Alerta generada dinámicamente para el dashboard.
 * @typedef {Object} Alerta
 * @property {'checkout' | 'llegada' | 'mantenimiento'} tipo - Categoría visual
 * @property {string} icon  - Emoji representativo
 * @property {string} label - Etiqueta corta en mayúsculas
 * @property {string} texto - Descripción completa (puede contener HTML)
 */

/**
 * Evento de historial enriquecido con datos de su reserva padre.
 * Se usa internamente en renderHistorial() después del flatMap.
 *
 * @typedef {HistorialEvento & Object} EventoTimeline
 * @property {string} reservaId  - ID de la reserva origen
 * @property {string} huesped    - Nombre del huésped
 * @property {string} habitacion - Número de habitación
 * @property {string} tipo       - Tipo clasificado por getEventoTipo()
 * @property {string} checkin    - Fecha de check-in de la reserva
 * @property {string} checkout   - Fecha de check-out de la reserva
 */

// ══════════════════════════════════════════════════════════════
//  MAPA DE PERMISOS
// ══════════════════════════════════════════════════════════════

/**
 * Mapa de permisos centralizado, tipado como Record de RolUsuario → ConfigPermisos.
 * Cada rol define qué pantallas puede ver (screens[]) y qué acciones ejecutar.
 *
 * Ventaja del diseño: agregar un nuevo rol o permiso solo requiere modificar
 * este objeto. puedeHacer() lo consulta sin necesidad de cambios adicionales.
 * Equivale a un enum + mapa de TypeScript.
 *
 * @type {Record<RolUsuario, ConfigPermisos>}
 */
const PERMISOS = {
  Administrador: {
    screens:              ['dashboard','reservas','habitaciones','huespedes','historial','usuarios'],
    crearReserva:         true,
    cancelarReserva:      true,
    cambiarEstadoReserva: true,
    verHuespedes:         true,
    verHistorial:         true,
    gestionarUsuarios:    true,
    cambiarEstadoHab:     true,
  },
  Gerente: {
    screens:              ['dashboard','reservas','habitaciones','huespedes','historial'],
    crearReserva:         true,
    cancelarReserva:      true,
    cambiarEstadoReserva: true,
    verHuespedes:         true,
    verHistorial:         true,
    gestionarUsuarios:    false,
    cambiarEstadoHab:     true,
  },
  Recepcionista: {
    screens:              ['dashboard','reservas','habitaciones'],
    crearReserva:         true,
    cancelarReserva:      false,
    cambiarEstadoReserva: true,
    verHuespedes:         false,
    verHistorial:         false,
    gestionarUsuarios:    false,
    cambiarEstadoHab:     false,
  },
};

/**
 * Verifica si el usuario actual tiene permiso para ejecutar una acción.
 *
 * Usa optional chaining (?.) para acceder de forma segura a currentUser
 * cuando no hay sesión activa (null). El doble negación (!!) convierte
 * cualquier valor truthy/falsy a boolean estricto — equivale al operador
 * `as boolean` de TypeScript.
 *
 * @param {keyof ConfigPermisos} accion - Clave del mapa PERMISOS a verificar
 * @returns {boolean} true si el rol actual tiene el permiso; false en caso contrario
 */
function puedeHacer(accion) {
  const role = appState.currentUser?.role;
  if (!role || !PERMISOS[role]) return false;
  return !!PERMISOS[role][accion];
}

// ══════════════════════════════════════════════════════════════
//  REFERENCIAS DOM
// ══════════════════════════════════════════════════════════════

/** @type {NodeListOf<HTMLElement>} */
const screens         = document.querySelectorAll('.screen');

/** @type {NodeListOf<HTMLButtonElement>} */
const navLinks        = document.querySelectorAll('.nav-link');

/** @type {HTMLFormElement | null} */
const loginForm = /** @type {HTMLFormElement | null} */ (document.getElementById('loginForm'));

/** @type {HTMLFormElement | null} */
const reservaForm = /** @type {HTMLFormElement | null} */ (document.getElementById('reservaForm'));

/** @type {HTMLButtonElement | null} */
const logoutBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('logoutBtn'));

/** @type {HTMLElement | null} */
const toast           = document.getElementById('toast');

/** @type {HTMLElement | null} */
const userInfo        = document.getElementById('userInfo');

/** @type {HTMLElement | null} */
const userNameDisplay = document.getElementById('userNameDisplay');

/** @type {HTMLElement | null} */
const userRoleDisplay = document.getElementById('userRoleDisplay');

// ══════════════════════════════════════════════════════════════
//  DATOS — Estado inicial / mock
// ══════════════════════════════════════════════════════════════

/**
 * Lista de usuarios del sistema.
 * Se carga desde localStorage si existe; si no, usa los valores mock.
 * @type {Usuario[]}
 */
let usuariosSistema = JSON.parse(localStorage.getItem('hotel_utp_usuarios') || 'null') || [
  { id: 1, username: 'admin',     password: 'admin123',   role: 'Administrador', activo: true, nombre: 'Administrador' },
  { id: 2, username: 'gerente',   password: 'gerente123', role: 'Gerente',       activo: true, nombre: 'María López'   },
  { id: 3, username: 'recepcion', password: '1234',       role: 'Recepcionista', activo: true, nombre: 'Juan Pérez'    },
];

/**
 * Estado global de la sesión activa.
 * @type {AppState}
 */
const appState = {
  currentUser: null,
};

/**
 * Lista de habitaciones del hotel.
 * Se carga desde localStorage si existe; si no, usa los valores mock.
 * @type {Habitacion[]}
 */
let habitaciones = [
  { numero: '101', tipo: 'Sencilla',     precio: 120000, estado: 'Disponible'   },
  { numero: '102', tipo: 'Sencilla',     precio: 120000, estado: 'Ocupada'      },
  { numero: '103', tipo: 'Sencilla',     precio: 120000, estado: 'Disponible'   },
  { numero: '104', tipo: 'Doble',        precio: 180000, estado: 'Mantenimiento'},
  { numero: '105', tipo: 'Doble',        precio: 180000, estado: 'Disponible'   },
  { numero: '201', tipo: 'Doble',        precio: 190000, estado: 'Ocupada'      },
  { numero: '202', tipo: 'Suite',        precio: 320000, estado: 'Disponible'   },
  { numero: '203', tipo: 'Suite',        precio: 320000, estado: 'Ocupada'      },
  { numero: '204', tipo: 'Suite',        precio: 350000, estado: 'Disponible'   },
  { numero: '301', tipo: 'Junior Suite', precio: 260000, estado: 'Disponible'   },
  { numero: '302', tipo: 'Junior Suite', precio: 260000, estado: 'Ocupada'      },
  { numero: '303', tipo: 'Presidencial', precio: 550000, estado: 'Disponible'   },
];

/**
 * Lista de reservas del hotel.
 * Se carga desde localStorage si existe; si no, usa los valores mock.
 * @type {Reserva[]}
 */
let reservas = [
  {
    id: 'RES-001', huesped: 'Carlos Ramírez',  documento: '1012345678',
    habitacion: '102', checkin: '2026-05-25', checkout: '2026-05-28',
    estado: 'Check-in', notas: 'Solicita cama adicional',
    history: [
      { date: '2026-05-20', event: 'Reserva creada'    },
      { date: '2026-05-25', event: 'Check-in realizado' },
    ],
  },
  {
    id: 'RES-002', huesped: 'María Fernández', documento: '1098765432',
    habitacion: '201', checkin: '2026-05-26', checkout: '2026-05-30',
    estado: 'Confirmada', notas: 'Llegada tardía después de las 10pm',
    history: [{ date: '2026-05-21', event: 'Reserva creada' }],
  },
  {
    id: 'RES-003', huesped: 'Jorge Mendoza',   documento: '9876543210',
    habitacion: '203', checkin: '2026-05-24', checkout: '2026-05-27',
    estado: 'Check-in', notas: '',
    history: [
      { date: '2026-05-22', event: 'Reserva creada'    },
      { date: '2026-05-24', event: 'Check-in realizado' },
    ],
  },
  {
    id: 'RES-004', huesped: 'Ana Gómez',       documento: '1234567890',
    habitacion: '302', checkin: '2026-05-23', checkout: '2026-05-29',
    estado: 'Check-in', notas: 'Aniversario — decoración especial',
    history: [
      { date: '2026-05-18', event: 'Reserva creada'    },
      { date: '2026-05-23', event: 'Check-in realizado' },
    ],
  },
  {
    id: 'RES-005', huesped: 'Luis Torres',     documento: '1122334455',
    habitacion: '103', checkin: '2026-05-29', checkout: '2026-05-31',
    estado: 'Confirmada', notas: '',
    history: [{ date: '2026-05-27', event: 'Reserva creada' }],
  },
];

// ══════════════════════════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════════════════════════

/**
 * Formatea una fecha ISO a formato corto colombiano (DD/MM/AAAA).
 * Añade 'T00:00:00' para evitar el desfase de zona horaria que ocurre
 * cuando Date() interpreta 'YYYY-MM-DD' como UTC medianoche.
 *
 * @param {string} d - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} Fecha formateada, o '—' si el valor es falsy
 */
function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

/**
 * Formatea una fecha ISO a formato largo legible (día, DD mes AAAA).
 *
 * @param {string} d - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} Fecha formateada larga, o '—' si el valor es falsy
 */
function formatDateLong(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** @type {ReturnType<typeof setTimeout> | null} Temporizador del toast activo */
let toastTimer = null;

/**
 * Muestra un mensaje de notificación flotante (toast) en la esquina inferior.
 * Cancela cualquier toast anterior para evitar superposición de timers.
 *
 * @param {string} msg  - Texto del mensaje a mostrar
 * @param {'default' | 'success' | 'danger' | 'warning'} [type='default'] - Variante de color
 * @returns {void}
 */
function showToast(msg, type = 'default') {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast--${type} visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

/**
 * Devuelve la clase CSS de badge correspondiente al estado de una reserva.
 *
 * @param {EstadoReserva} estado - Estado de la reserva
 * @returns {string} Clase CSS del badge (p.ej. 'badge-success')
 */
function getStatusClass(estado) {
  /** @type {Record<EstadoReserva, string>} */
  const map = {
    'Confirmada': 'badge-info',
    'Check-in':   'badge-success',
    'Check-out':  'badge-warning',
    'Cancelada':  'badge-danger',
  };
  return map[estado] || 'badge-muted';
}

/**
 * Devuelve la clase CSS de badge correspondiente al estado de una habitación.
 *
 * @param {EstadoHabitacion} estado - Estado de la habitación
 * @returns {string} Clase CSS del badge (p.ej. 'badge-success')
 */
function getHabStatusClass(estado) {
  /** @type {Record<EstadoHabitacion, string>} */
  const map = {
    'Disponible':    'badge-success',
    'Ocupada':       'badge-danger',
    'Mantenimiento': 'badge-warning',
  };
  return map[estado] || 'badge-muted';
}

// ══════════════════════════════════════════════════════════════
//  HISTORIAL — Clasificación de eventos
// ══════════════════════════════════════════════════════════════

/**
 * Clasifica el texto de un evento de historial en una categoría normalizada.
 * Se usa para aplicar estilos visuales consistentes independientemente
 * de cómo esté redactado el texto del evento.
 *
 * @param {string} event - Texto del evento (p.ej. 'Check-in realizado')
 * @returns {'checkin' | 'checkout' | 'cancelada' | 'creada' | 'otro'} Tipo normalizado
 */
function getEventoTipo(event) {
  const e = event.toLowerCase();
  if (e.includes('check-in')  || e.includes('checkin'))  return 'checkin';
  if (e.includes('check-out') || e.includes('checkout')) return 'checkout';
  if (e.includes('cancelad'))                            return 'cancelada';
  if (e.includes('creada')    || e.includes('creado'))   return 'creada';
  return 'otro';
}

/**
 * Genera el HTML del badge de evento para la timeline del historial.
 *
 * @param {string} event - Texto del evento
 * @returns {string} Fragmento HTML con el badge estilizado
 */
function getEventoBadge(event) {
  const tipo = getEventoTipo(event);

  /** @type {Record<string, {cls: string, label: string}>} */
  const map = {
    checkin:   { cls: 'ev--checkin',   label: 'Check-in'  },
    checkout:  { cls: 'ev--checkout',  label: 'Check-out' },
    cancelada: { cls: 'ev--cancelada', label: 'Cancelada' },
    creada:    { cls: 'ev--creada',    label: 'Creación'  },
    otro:      { cls: '',              label: event        },
  };

  const { cls, label } = map[tipo];
  return `<span class="timeline-evento-badge ${cls}">${label}</span>`;
}

/**
 * Devuelve la clase CSS del punto de la timeline según el tipo de evento.
 *
 * @param {string} event - Texto del evento
 * @returns {string} Clase CSS modificadora del punto (p.ej. 'dot--checkin')
 */
function getTimelineDotClass(event) {
  const tipo = getEventoTipo(event);
  /** @type {Record<string, string>} */
  const map = {
    checkin:   'dot--checkin',
    checkout:  'dot--checkout',
    cancelada: 'dot--cancelada',
    creada:    'dot--creada',
  };
  return map[tipo] || '';
}

// ══════════════════════════════════════════════════════════════
//  VALIDACIONES DE FORMULARIO
// ══════════════════════════════════════════════════════════════

/**
 * Valida que el nombre del huésped contenga solo letras y espacios.
 * La expresión regular incluye caracteres acentuados (á, é, í, ó, ú) y ñ
 * para soportar correctamente nombres en español.
 *
 * @param {string} valor - Valor del campo a validar
 * @returns {string | null} Mensaje de error, o null si la validación pasa
 */
function validarNombreHuesped(valor) {
  const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!soloLetras.test(valor))
    return 'El nombre solo puede contener letras y espacios (sin números ni símbolos).';
  if (valor.trim().length < 5)
    return 'El nombre debe tener al menos 5 caracteres.';
  return null;
}

/**
 * Valida el nombre de un usuario administrado (mínimo más corto que el huésped).
 *
 * @param {string} valor - Valor del campo a validar
 * @returns {string | null} Mensaje de error, o null si la validación pasa
 */
function validarNombreAdmin(valor) {
  const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!soloLetras.test(valor))
    return 'El nombre solo puede contener letras y espacios.';
  if (valor.trim().length < 3)
    return 'El nombre debe tener al menos 3 caracteres.';
  return null;
}

/**
 * Valida que un número de documento contenga solo dígitos y tenga longitud mínima.
 *
 * @param {string} valor - Valor del campo a validar
 * @returns {string | null} Mensaje de error, o null si la validación pasa
 */
function validarDocumento(valor) {
  const soloNumeros = /^\d+$/;
  if (!soloNumeros.test(valor))
    return 'El documento solo puede contener números.';
  if (valor.length < 6)
    return 'El documento debe tener al menos 6 dígitos.';
  return null;
}

/**
 * Muestra un mensaje de error visual bajo un campo de formulario.
 * Elimina cualquier error previo antes de insertar el nuevo, para evitar
 * acumulación de mensajes en el DOM.
 *
 * @param {string} inputId - ID del elemento input objetivo
 * @param {string} mensaje - Texto del mensaje de error a mostrar
 * @returns {void}
 */
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

/**
 * Elimina el estado de error visual de un campo de formulario.
 *
 * @param {string} inputId - ID del elemento input a limpiar
 * @returns {void}
 */
function limpiarError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.remove('input-error');
  const existente = input.parentElement.querySelector('.field-error');
  if (existente) existente.remove();
}

/**
 * Adjunta validadores en tiempo real a los inputs del formulario de reserva.
 *
 * Estrategia de UX elegida: validación inmediata (no solo al submit).
 * - resHuesped:  bloquea teclas numéricas con keypress (prevención proactiva)
 *   y valida el valor completo en cada input (retroalimentación reactiva).
 * - resDocumento: limpia caracteres no numéricos con replace(/\D/g,'')
 *   antes de validar, para que el usuario nunca vea un error evitable.
 * - uNombre (admin): mismo enfoque de bloqueo proactivo + limpieza reactiva.
 *
 * Se ejecuta una sola vez al cargar la página (en el bloque init al final).
 *
 * @returns {void}
 */
function attachInputValidation() {
  /** @type {HTMLInputElement | null} */
  const resHuesped = document.getElementById('resHuesped');

  /** @type {HTMLInputElement | null} */
  const resDocumento = document.getElementById('resDocumento');

  if (resHuesped) {
    resHuesped.addEventListener('input', () => {
      const err = validarNombreHuesped(resHuesped.value.trim());
      if (err) mostrarError('resHuesped', err);
      else     limpiarError('resHuesped');
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
      else     limpiarError('resDocumento');
    });
  }

  /** @type {HTMLInputElement | null} */
  const uNombre = document.getElementById('uNombre');
  if (uNombre) {
    // Bloqueo proactivo de teclas no permitidas
    uNombre.addEventListener('keypress', (e) => {
      if (!/[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
      }
    });
    // Limpieza reactiva: quitar cualquier carácter no letra que haya entrado
    uNombre.addEventListener('input', () => {
      const pos = uNombre.selectionStart;
      const clean = uNombre.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      if (uNombre.value !== clean) {
        uNombre.value = clean;
        uNombre.setSelectionRange(pos - 1, pos - 1);
      }
    });
  }
}

// ══════════════════════════════════════════════════════════════
//  ROUTER (SPA Navigation)
// ══════════════════════════════════════════════════════════════

/**
 * Router de la SPA: muestra la sección solicitada y oculta las demás.
 * Implementa el patrón "show one, hide all":
 *   1. Itera todas las .screen y activa solo la que coincide con screenId.
 *   2. Si es login, oculta toda la navegación (sesión no iniciada).
 *   3. Si no, muestra solo los nav-links permitidos para el rol actual.
 *   4. Llama al render correspondiente para poblar la vista con datos frescos.
 *
 * La verificación de permisos se hace aquí —no solo en el nav-link— para
 * proteger el acceso directo desde código (p.ej. botones con data-screen).
 *
 * @param {string} screenId - ID del elemento <section> a mostrar
 * @returns {void}
 */
function showScreen(screenId) {
  screens.forEach(s => s.classList.toggle('active', s.id === screenId));
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (screenId === 'screen-login') {
    navLinks.forEach(l => { l.style.display = 'none'; });
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo)  userInfo.style.display  = 'none';
    return;
  }

  if (logoutBtn) logoutBtn.style.display = 'block';
  if (userInfo)  userInfo.style.display  = 'flex';

  const role = appState.currentUser?.role;
<<<<<<< HEAD
  const permisosRol = PERMISOS[role] || {};

  // Si no-admin intenta entrar a usuarios, redirigir al dashboard
=======
  const permisosRol = role ? (PERMISOS[role] || {}) : {};

  // Protección extra: redirigir si no hay permiso para la pantalla solicitada
>>>>>>> 5b770d4 (Actualización de la aplicación)
  if (screenId === 'usuarios' && !permisosRol.gestionarUsuarios) {
    showToast('No tienes permiso para acceder a esta sección.', 'danger');
    showScreen('dashboard');
    return;
  }

  navLinks.forEach(link => {
    const pantalla = link.dataset.screen;
    const permitida = !permisosRol.screens || permisosRol.screens.includes(pantalla);
    link.style.display = permitida ? '' : 'none';
    link.classList.toggle('active', pantalla === screenId);
  });

  if (screenId === 'dashboard')    renderDashboard();
  if (screenId === 'reservas')     renderReservas();
  if (screenId === 'habitaciones') renderHabitaciones();
  if (screenId === 'huespedes')    renderHuespedes();
  if (screenId === 'historial')    renderHistorial();
  if (screenId === 'usuarios')     renderUsuarios();
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza el panel principal con estadísticas, reservas recientes y alertas.
 * Recalcula todos los valores desde el estado en memoria para reflejar
 * cambios realizados en otras vistas sin necesidad de recargar la página.
 *
 * @returns {void}
 */
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
  const alerts = buildAlertas();
  if (alerts.length === 0) {
    alertasList.innerHTML = `
      <li class="alerta-item alerta--default">
        <div class="alerta-icon-wrap">✅</div>
        <div class="alerta-body">
          <div class="alerta-label">Sin alertas</div>
          <div class="alerta-texto">No hay alertas pendientes para hoy.</div>
        </div>
      </li>`;
  } else {
    alertasList.innerHTML = alerts.map(a => `
      <li class="alerta-item alerta--${a.tipo}">
        <div class="alerta-icon-wrap">${a.icon}</div>
        <div class="alerta-body">
          <div class="alerta-label">${a.label}</div>
          <div class="alerta-texto">${a.texto}</div>
        </div>
      </li>`).join('');
  }
}

/**
 * Genera dinámicamente la lista de alertas del Dashboard revisando
 * el estado actual de reservas y habitaciones en tiempo real.
 *
 * Tipos de alerta:
 *  - checkout:     reservas con estado 'Check-in' que vencen hoy
 *  - llegada:      reservas 'Confirmadas' con check-in hoy
 *  - mantenimiento: habitaciones fuera de servicio
 *  - próxima:      llegadas en los próximos 2 días
 *  - tardía:       reservas con nota "tarde" aún activas
 *
 * Se limita a 6 alertas para no saturar el panel lateral.
 *
 * @returns {Alerta[]} Lista de alertas a mostrar (máximo 6)
 */
function buildAlertas() {
  const hoy = new Date().toISOString().slice(0, 10);

  /** @type {Alerta[]} */
  const alertas = [];

  // Check-outs pendientes hoy
  reservas
    .filter(r => r.checkout === hoy && r.estado === 'Check-in')
    .forEach(r => {
      alertas.push({
        tipo:  'checkout',
        icon:  '🔔',
        label: 'Check-out Hoy',
        texto: `<strong>${r.huesped}</strong> — Hab. ${r.habitacion} (${r.id}) debe hacer check-out hoy.`,
      });
    });

  // Confirmadas con check-in hoy (pendiente de check-in)
  reservas
    .filter(r => r.checkin === hoy && r.estado === 'Confirmada')
    .forEach(r => {
      alertas.push({
        tipo:  'llegada',
        icon:  '🏨',
        label: 'Llegada Hoy',
        texto: `<strong>${r.huesped}</strong> — Hab. ${r.habitacion} (${r.id}) llega hoy.${r.notas ? ' Nota: ' + r.notas : ''}`,
      });
    });

  // Habitaciones en mantenimiento
  habitaciones
    .filter(h => h.estado === 'Mantenimiento')
    .forEach(h => {
      alertas.push({
        tipo:  'mantenimiento',
        icon:  '🔧',
        label: 'Mantenimiento',
        texto: `Habitación <strong>${h.numero}</strong> (${h.tipo}) está fuera de servicio.`,
      });
    });

  // Llegadas en los próximos 2 días
  const en2dias = new Date();
  en2dias.setDate(en2dias.getDate() + 2);
  const en2str = en2dias.toISOString().slice(0, 10);

  reservas
    .filter(r => r.checkin > hoy && r.checkin <= en2str && r.estado === 'Confirmada')
    .forEach(r => {
      alertas.push({
        tipo:  'llegada',
        icon:  '📅',
        label: 'Próxima Llegada',
        texto: `<strong>${r.huesped}</strong> — Hab. ${r.habitacion} llega el ${formatDate(r.checkin)}.`,
      });
    });

  // Reservas activas con nota de llegada tardía
  reservas
    .filter(r =>
      r.notas?.toLowerCase().includes('tarde') &&
      r.estado !== 'Cancelada' &&
      r.estado !== 'Check-out'
    )
    .forEach(r => {
      alertas.push({
        tipo:  'llegada',
        icon:  '🌙',
        label: 'Llegada Tardía',
        texto: `<strong>${r.huesped}</strong> (${r.id}) — ${r.notas}`,
      });
    });

  return alertas.slice(0, 6);
}

// ══════════════════════════════════════════════════════════════
//  RESERVAS
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza la tabla de reservas aplicando el filtro de estado activo.
 * También actualiza el select de habitaciones con las opciones disponibles
 * y muestra/oculta el formulario según los permisos del usuario actual.
 *
 * @returns {void}
 */
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

  /** @type {HTMLSelectElement | null} */
  const selectHab = document.getElementById('resHabitacion');
  if (selectHab) {
    const disponibles = habitaciones.filter(h => h.estado === 'Disponible');
    selectHab.innerHTML =
      '<option value="">Seleccionar habitación...</option>' +
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

/**
 * Genera el HTML de los botones de acción para una fila de reserva.
 * Las acciones disponibles dependen del estado actual de la reserva
 * y del permiso 'cancelarReserva' del usuario en sesión.
 *
 * @param {Reserva} r         - Objeto reserva con estado y datos completos
 * @param {boolean} canCancel - Si el usuario actual puede cancelar reservas
 * @returns {string} Fragmento HTML con los botones de acción
 */
function getReservaAcciones(r, canCancel) {
  /** @type {string[]} */
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

/**
 * Cambia el estado de una reserva y actualiza el estado de la habitación.
 *
 * Regla de negocio implementada:
 *  - Check-in  → la habitación pasa a 'Ocupada'
 *  - Check-out → la habitación pasa a 'Disponible' (liberada para nuevas reservas)
 *
 * Cada cambio queda registrado en el historial de la reserva (history[])
 * con la fecha actual en formato ISO. Este historial alimenta renderHistorial().
 *
 * @param {string}       id          - ID de la reserva a modificar (p.ej. 'RES-001')
 * @param {EstadoReserva} nuevoEstado - Nuevo estado a asignar
 * @returns {void}
 */
function cambiarEstado(id, nuevoEstado) {
  if (!puedeHacer('cambiarEstadoReserva')) {
    showToast('No tienes permiso para cambiar el estado.', 'danger'); return;
  }
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return;

  const anterior  = reserva.estado;
  reserva.estado  = nuevoEstado;
  reserva.history.push({
    date:  new Date().toISOString().slice(0, 10),
    event: `${nuevoEstado} realizado`,
  });

  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  if (hab) {
    if (nuevoEstado === 'Check-in')  hab.estado = 'Ocupada';
    if (nuevoEstado === 'Check-out') hab.estado = 'Disponible';
  }

  guardarDatos();
  renderDashboard(); renderReservas(); renderHabitaciones(); renderHistorial();
  showToast(`Reserva ${id}: ${anterior} → ${nuevoEstado}`, 'success');
}

/**
 * Cancela una reserva tras confirmación del usuario.
 * Si la habitación estaba ocupada por esta reserva, la libera ('Disponible').
 *
 * @param {string} id - ID de la reserva a cancelar
 * @returns {void}
 */
function cancelarReserva(id) {
  if (!puedeHacer('cancelarReserva')) {
    showToast('No tienes permiso para cancelar reservas.', 'danger'); return;
  }
  if (!confirm(`¿Cancelar la reserva ${id}? Esta acción no se puede deshacer.`)) return;

  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return;

  reserva.estado = 'Cancelada';
  reserva.history.push({
    date:  new Date().toISOString().slice(0, 10),
    event: 'Reserva cancelada',
  });

  const hab = habitaciones.find(h => h.numero === reserva.habitacion);
  if (hab && hab.estado === 'Ocupada') hab.estado = 'Disponible';

  guardarDatos();
  renderDashboard(); renderReservas(); renderHabitaciones(); renderHistorial();
  showToast(`Reserva ${id} cancelada.`, 'danger');
}

// ══════════════════════════════════════════════════════════════
//  HABITACIONES
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza la cuadrícula de habitaciones con filtro de estado activo.
 * Las tarjetas muestran número, tipo, precio y estado actual.
 * Si el usuario tiene permiso, muestra botones para cambiar el estado.
 *
 * @returns {void}
 */
function renderHabitaciones() {
  const filtro    = document.getElementById('filtroHabitacion')?.value || 'Todos';
  const lista     = filtro === 'Todos' ? habitaciones : habitaciones.filter(h => h.estado === filtro);
  const canChange = puedeHacer('cambiarEstadoHab');

  document.getElementById('habitacionesGrid').innerHTML = lista.map(h => {
    const cls       = h.estado.toLowerCase().replace(' ', '');
    const estadoBtns = canChange ? getHabAcciones(h) : '';
    const mantExtra  = h.estado === 'Mantenimiento'
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

/**
 * Genera los botones de cambio de estado para una habitación.
 * Solo muestra transiciones válidas: Disponible ↔ Mantenimiento.
 * Las habitaciones 'Ocupada' no se pueden cambiar manualmente desde aquí
 * (su estado lo controla cambiarEstado() via Check-in/Check-out).
 *
 * @param {Habitacion} h - Objeto habitación
 * @returns {string} HTML de botones de acción, o cadena vacía si no aplica
 */
function getHabAcciones(h) {
  if (h.estado === 'Disponible') {
    return `<button class="btn btn-sm btn-warning" onclick="cambiarEstadoHab('${h.numero}','Mantenimiento')">→ Mantenimiento</button>`;
  }
  if (h.estado === 'Mantenimiento') {
    return `<button class="btn btn-sm btn-success" onclick="cambiarEstadoHab('${h.numero}','Disponible')">✓ Marcar Disponible</button>`;
  }
  return '';
}

/**
 * Cambia el estado operativo de una habitación.
 * Persiste el cambio y re-renderiza las vistas afectadas.
 *
 * @param {string}           numero     - Número de habitación (p.ej. '104')
 * @param {EstadoHabitacion} nuevoEstado - Nuevo estado a asignar
 * @returns {void}
 */
function cambiarEstadoHab(numero, nuevoEstado) {
  if (!puedeHacer('cambiarEstadoHab')) {
    showToast('Sin permiso para cambiar estado de habitación.', 'danger'); return;
  }
  const hab = habitaciones.find(h => h.numero === numero);
  if (!hab) return;

  const anterior = hab.estado;
  hab.estado     = nuevoEstado;
  guardarDatos();
  renderHabitaciones(); renderDashboard();

  const emoji = nuevoEstado === 'Disponible' ? '✅' : '🔧';
  showToast(
    `${emoji} Habitación ${numero}: ${anterior} → ${nuevoEstado}`,
    nuevoEstado === 'Disponible' ? 'success' : 'warning'
  );
}

// ══════════════════════════════════════════════════════════════
//  HUÉSPEDES
// ══════════════════════════════════════════════════════════════

/**
 * Construye y renderiza la lista de huéspedes derivada de las reservas.
 *
 * No existe un array separado de huéspedes; se genera en tiempo real
 * agrupando reservas por número de documento mediante un objeto acumulador.
 *
 * Algoritmo de deduplicación:
 *  1. Por cada reserva, si el documento ya existe en porDocumento, incrementa
 *     el contador de reservas; si no, crea una entrada nueva.
 *  2. La 'última visita' se actualiza solo si el check-in es más reciente,
 *     para mostrar siempre la visita más nueva.
 *
 * @param {string} [filtro=''] - Texto de búsqueda para filtrar por nombre
 * @returns {void}
 */
function renderHuespedes(filtro = '') {
  if (!puedeHacer('verHuespedes')) return;

  /** @type {Record<string, {documento: string, nombre: string, reservas: number, ultimaVisita: string, estado: EstadoReserva}>} */
  const porDocumento = {};

  reservas.forEach(r => {
    if (!porDocumento[r.documento]) {
      porDocumento[r.documento] = {
        documento:   r.documento,
        nombre:      r.huesped,
        reservas:    0,
        ultimaVisita: r.checkin,
        estado:      r.estado,
      };
    }
    porDocumento[r.documento].reservas++;
    if (r.checkin > porDocumento[r.documento].ultimaVisita) {
      porDocumento[r.documento].ultimaVisita = r.checkin;
      porDocumento[r.documento].estado       = r.estado;
    }
  });

  let lista = Object.values(porDocumento);
  if (filtro) {
    lista = lista.filter(h => h.nombre.toLowerCase().includes(filtro.toLowerCase()));
  }

  document.getElementById('huespedesTable').innerHTML = lista.map(h => `
    <tr>
      <td><code style="font-family:'DM Mono',monospace;font-size:0.82rem">${h.documento}</code></td>
      <td><strong>${h.nombre}</strong></td>
      <td>${h.reservas} reserva${h.reservas !== 1 ? 's' : ''}</td>
      <td>${formatDate(h.ultimaVisita)}</td>
      <td><span class="badge ${getStatusClass(h.estado)}">${h.estado}</span></td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════════════
//  HISTORIAL
// ══════════════════════════════════════════════════════════════

/**
 * Genera y renderiza la timeline del historial de actividad del sistema.
 *
 * Algoritmo complejo — flatMap + sort:
 *  1. flatMap() aplana los arrays history[] de cada reserva en una sola lista.
 *     (M reservas × N eventos → 1 lista plana de EventoTimeline)
 *  2. Se enriquece cada evento con datos de la reserva padre para mostrarlos
 *     en la timeline sin búsquedas adicionales (join en memoria).
 *  3. sort() ordena por fecha descendente (más reciente primero).
 *  4. Se aplica el filtro del <select> antes de renderizar.
 *  5. Se limita a 30 eventos para no degradar el rendimiento del DOM.
 *
 * @returns {void}
 */
function renderHistorial() {
  if (!puedeHacer('verHistorial')) return;

  const filtroEl = document.getElementById('filtroHistorial');
  const filtro   = filtroEl ? filtroEl.value : 'Todos';

  /** @type {EventoTimeline[]} */
  let eventos = reservas
    .flatMap(r => r.history.map(h => ({
      ...h,
      reservaId:  r.id,
      huesped:    r.huesped,
      habitacion: r.habitacion,
      tipo:       getEventoTipo(h.event),
      checkin:    r.checkin,
      checkout:   r.checkout,
    })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtro !== 'Todos') {
    eventos = eventos.filter(e => {
      const tipo = getEventoTipo(e.event);
      return tipo === filtro || e.event.toLowerCase().includes(filtro.toLowerCase());
    });
  }

  eventos = eventos.slice(0, 30);

  document.getElementById('historialTimeline').innerHTML = eventos.map(e => {
    const dotCls   = getTimelineDotClass(e.event);
    const badgeHtml = getEventoBadge(e.event);
    const habInfo   = e.habitacion
      ? `<span class="timeline-hab-chip">Hab. ${e.habitacion}</span>`
      : '';
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
  }).join('') ||
    '<li style="padding:20px;color:var(--text-muted);text-align:center;">No hay eventos que coincidan con el filtro.</li>';
}

// ══════════════════════════════════════════════════════════════
//  GESTIÓN DE USUARIOS
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza la tabla de usuarios del sistema.
 * El usuario en sesión activa no puede cambiar su propio rol ni eliminarse.
 *
 * @returns {void}
 */
function renderUsuarios() {
  if (!puedeHacer('gestionarUsuarios')) return;

  const tbody     = document.getElementById('usuariosTable');
  const currentId = appState.currentUser?.id;

  tbody.innerHTML = usuariosSistema.map(u => {
    const esSelf = u.id === currentId;
    return `
      <tr class="${!u.activo ? 'row-inactive' : ''}">
        <td><code style="font-size:0.82rem;font-family:'DM Mono',monospace">${u.id}</code></td>
        <td><strong>${u.nombre}</strong></td>
        <td style="color:var(--text-muted)">${u.username}</td>
        <td>
          <select class="select-inline"
            onchange="cambiarRolUsuario(${u.id}, this.value)"
            ${esSelf ? 'disabled title="No puedes cambiar tu propio rol"' : ''}>
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

/**
 * Cambia el rol de un usuario y persiste el cambio.
 *
 * @param {number}    id      - ID del usuario a modificar
 * @param {RolUsuario} nuevoRol - Nuevo rol a asignar
 * @returns {void}
 */
function cambiarRolUsuario(id, nuevoRol) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u) return;
  const anterior = u.role;
  u.role         = nuevoRol;
  guardarDatos();
  renderUsuarios();
  showToast(`${u.nombre}: ${anterior} → ${nuevoRol}`, 'success');
}

/**
 * Alterna el estado activo/inactivo de un usuario.
 * Un usuario inactivo no puede iniciar sesión en el sistema.
 *
 * @param {number} id - ID del usuario a activar o desactivar
 * @returns {void}
 */
function toggleUsuario(id) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u) return;
  u.activo = !u.activo;
  guardarDatos();
  renderUsuarios();
  showToast(
    `Usuario ${u.username} ${u.activo ? 'activado' : 'desactivado'}.`,
    u.activo ? 'success' : 'danger'
  );
}

/**
 * Elimina permanentemente un usuario tras confirmación.
 * No permite eliminar al usuario en sesión activa.
 *
 * @param {number} id - ID del usuario a eliminar
 * @returns {void}
 */
function eliminarUsuario(id) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u) return;
  if (!confirm(`¿Eliminar al usuario "${u.username}"? Esta acción es permanente.`)) return;
  usuariosSistema.splice(usuariosSistema.indexOf(u), 1);
  guardarDatos();
  renderUsuarios();
  showToast(`Usuario ${u.username} eliminado.`, 'danger');
}

// ══════════════════════════════════════════════════════════════
//  MANEJADORES DE EVENTOS (Event Handlers)
// ══════════════════════════════════════════════════════════════

// Formulario: crear nuevo usuario
document.getElementById('usuarioForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!puedeHacer('gestionarUsuarios')) return;

  /** @type {string} */
  const nombre   = document.getElementById('uNombre').value.trim();
  /** @type {string} */
  const username = document.getElementById('uUsername').value.trim().toLowerCase();
  /** @type {string} */
  const password = document.getElementById('uPassword').value.trim();
  /** @type {RolUsuario} */
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

// Formulario: crear nueva reserva
reservaForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!puedeHacer('crearReserva')) {
    showToast('No tienes permiso para crear reservas.', 'danger'); return;
  }

  /** @type {string} */
  const huesped    = document.getElementById('resHuesped').value.trim();
  /** @type {string} */
  const documento  = document.getElementById('resDocumento').value.trim();
  /** @type {string} */
  const habitacion = document.getElementById('resHabitacion').value;
  /** @type {string} */
  const checkin    = document.getElementById('resCheckin').value;
  /** @type {string} */
  const checkout   = document.getElementById('resCheckout').value;
  /** @type {string} */
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

  /** @type {Reserva} */
  const nuevaReserva = {
    id:        'RES-' + String(reservas.length + 1).padStart(3, '0'),
    huesped,
    documento,
    habitacion,
    checkin,
    checkout,
    estado:    'Confirmada',
    notas:     notas || 'Sin observaciones',
    history:   [{ date: new Date().toISOString().slice(0, 10), event: 'Reserva creada' }],
  };

  reservas.unshift(nuevaReserva);
  guardarDatos();
  reservaForm.reset();
  renderDashboard(); renderReservas(); renderHuespedes(); renderHistorial();
  showToast(`✅ Reserva ${nuevaReserva.id} creada para ${huesped}`, 'success');
});

// Formulario: login
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

  document.getElementById('resCheckin').min  = new Date().toISOString().slice(0, 10);
  document.getElementById('resCheckout').min = new Date().toISOString().slice(0, 10);

  showScreen('dashboard');
  showToast(`Bienvenido, ${usuario.nombre || usuario.username} 👋`, 'success');
});

// Botón: cerrar sesión
logoutBtn?.addEventListener('click', () => {
  appState.currentUser = null;
  loginForm?.reset();
  screens.forEach(s => s.classList.toggle('active', s.id === 'screen-login'));
  navLinks.forEach(l => l.style.display = 'none');
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (userInfo)  userInfo.style.display  = 'none';
});

// Navegación por sidebar
navLinks.forEach(link => {
  link.addEventListener('click', () => showScreen(link.dataset.screen));
});

// Delegación de clicks en botones con data-screen (p.ej. "Nueva reserva" del dashboard)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn || btn.classList.contains('nav-link')) return;
  e.preventDefault();
  showScreen(btn.dataset.screen);
});

// Filtros
document.getElementById('filtroEstadoReserva')?.addEventListener('change', renderReservas);
document.getElementById('filtroHabitacion')?.addEventListener('change', renderHabitaciones);
document.getElementById('buscarHuesped')?.addEventListener('input', (e) => renderHuespedes(e.target.value));
document.getElementById('filtroHistorial')?.addEventListener('change', renderHistorial);

// ══════════════════════════════════════════════════════════════
//  PERSISTENCIA (localStorage)
// ══════════════════════════════════════════════════════════════

/**
 * Serializa el estado actual a localStorage.
 * Se llama después de cada operación que modifica datos
 * (crear reserva, cambiar estado, crear usuario, etc.).
 *
 * El try-catch protege ante contextos donde localStorage no está disponible
 * (modo incógnito con bloqueo de sitios, iframes con restricciones CSP).
 *
 * @returns {void}
 */
function guardarDatos() {
  try {
    localStorage.setItem('hotel_utp_reservas',    JSON.stringify(reservas));
    localStorage.setItem('hotel_utp_habitaciones', JSON.stringify(habitaciones));
    localStorage.setItem('hotel_utp_usuarios',     JSON.stringify(usuariosSistema));
  } catch (err) {
    console.warn('localStorage no disponible:', err);
  }
}

/**
 * Carga los datos persistidos desde localStorage al iniciar la aplicación.
 * Solo sobreescribe los arrays en memoria si existe un valor guardado,
 * preservando los datos mock iniciales si el usuario nunca ha usado la app.
 *
 * @returns {void}
 */
function cargarDatos() {
  try {
    const r = localStorage.getItem('hotel_utp_reservas');
    const h = localStorage.getItem('hotel_utp_habitaciones');
    const u = localStorage.getItem('hotel_utp_usuarios');
    if (r) reservas        = JSON.parse(r);
    if (h) habitaciones    = JSON.parse(h);
    if (u) usuariosSistema = JSON.parse(u);
  } catch (err) {
    console.warn('Error al cargar datos:', err);
  }
}

// ══════════════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ══════════════════════════════════════════════════════════════

cargarDatos();
navLinks.forEach(l => l.style.display = 'none');
if (logoutBtn) logoutBtn.style.display = 'none';
if (userInfo)  userInfo.style.display  = 'none';
attachInputValidation();
