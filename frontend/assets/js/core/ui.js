/** ui.js: componentes y validadores compartidos */
// ── Utilidades ────────────────────────────────────────────────
export function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateLong(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

const toast = document.getElementById('toast');
let toastTimer = null;
export function showToast(msg, type = 'default') {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast--${type} visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

// ── Modal de confirmación (reemplaza confirm() nativo) ─────────
export function confirmModal(mensaje) {
  return new Promise(resolve => {
    const overlay   = document.getElementById('confirmOverlay');
    const msgEl     = document.getElementById('confirmMessage');
    const okBtn     = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    if (!overlay || !msgEl || !okBtn || !cancelBtn) { resolve(window.confirm(mensaje)); return; }

    msgEl.textContent = mensaje;
    overlay.classList.add('visible');

    const cleanup = (result) => {
      overlay.classList.remove('visible');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      resolve(result);
    };
    const onOk      = () => cleanup(true);
    const onCancel  = () => cleanup(false);
    const onOverlay = (e) => { if (e.target === overlay) cleanup(false); };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
  });
}

export function getStatusClass(estado) {
  const map = { 'Confirmada': 'badge-info', 'Check-in': 'badge-success', 'Check-out': 'badge-warning', 'Cancelada': 'badge-danger' };
  return map[estado] || 'badge-muted';
}

export function getHabStatusClass(estado) {
  const map = { 'Disponible': 'badge-success', 'Ocupada': 'badge-danger', 'Mantenimiento': 'badge-warning', 'Aseo': 'badge-info' };
  return map[estado] || 'badge-muted';
}

// ── Clasificar tipo de evento del historial ───────────────────
export function getEventoTipo(event) {
  const e = event.toLowerCase();
  if (e.includes('check-in') || e.includes('checkin')) return 'checkin';
  if (e.includes('check-out') || e.includes('checkout')) return 'checkout';
  if (e.includes('cancelad')) return 'cancelada';
  if (e.includes('creada') || e.includes('creado')) return 'creada';
  return 'otro';
}

export function getEventoBadge(event) {
  const tipo = getEventoTipo(event);
  const map = {
    checkin:   { cls: 'ev--checkin',   label: 'Check-in' },
    checkout:  { cls: 'ev--checkout',  label: 'Check-out' },
    cancelada: { cls: 'ev--cancelada', label: 'Cancelada' },
    creada:    { cls: 'ev--creada',    label: 'Creación' },
    otro:      { cls: '',              label: event },
  };
  const { cls, label } = map[tipo];
  return `<span class="timeline-evento-badge ${cls}">${escapeHtml(label)}</span>`;
}

export function getTimelineDotClass(event) {
  const tipo = getEventoTipo(event);
  const map = { checkin: 'dot--checkin', checkout: 'dot--checkout', cancelada: 'dot--cancelada', creada: 'dot--creada' };
  return map[tipo] || '';
}

// ── Validaciones de formulario ────────────────────────────────
export function validarNombreHuesped(valor) {
  const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!soloLetras.test(valor)) return 'El nombre solo puede contener letras y espacios (sin números ni símbolos).';
  if (valor.trim().length < 5) return 'El nombre debe tener al menos 5 caracteres.';
  return null;
}

export function validarNombreAdmin(valor) {
  const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!soloLetras.test(valor)) return 'El nombre solo puede contener letras y espacios.';
  if (valor.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  return null;
}

export function validarDocumento(valor) {
  const soloNumeros = /^\d+$/;
  if (!soloNumeros.test(valor)) return 'El documento solo puede contener números.';
  if (valor.length < 6) return 'El documento debe tener al menos 6 dígitos.';
  return null;
}

export function validarCorreo(valor) {
  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formatoCorreo.test(valor)) return 'Ingresa un correo electrónico válido.';
  return null;
}

export function mostrarError(inputId, mensaje) {
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

export function limpiarError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.remove('input-error');
  const existente = input.parentElement.querySelector('.field-error');
  if (existente) existente.remove();
}

// Validación en tiempo real para reservas
export function attachInputValidation() {
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

  // Validación en tiempo real para el formulario del portal de clientes
  const guestNombre    = document.getElementById('guestNombre');
  const guestDocumento = document.getElementById('guestDocumento');
  const guestCorreo    = document.getElementById('guestCorreo');

  if (guestNombre) {
    guestNombre.addEventListener('input', () => {
      const err = validarNombreHuesped(guestNombre.value.trim());
      if (err) mostrarError('guestNombre', err);
      else limpiarError('guestNombre');
    });
    guestNombre.addEventListener('keypress', (e) => {
      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
        mostrarError('guestNombre', 'No se permiten números en el nombre.');
      }
    });
  }

  if (guestDocumento) {
    guestDocumento.addEventListener('input', () => {
      guestDocumento.value = guestDocumento.value.replace(/\D/g, '');
      const err = validarDocumento(guestDocumento.value.trim());
      if (err) mostrarError('guestDocumento', err);
      else limpiarError('guestDocumento');
    });
  }

  if (guestCorreo) {
    guestCorreo.addEventListener('input', () => {
      const err = validarCorreo(guestCorreo.value.trim());
      if (err) mostrarError('guestCorreo', err);
      else limpiarError('guestCorreo');
    });
  }
}


export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
}
export function hoyLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
