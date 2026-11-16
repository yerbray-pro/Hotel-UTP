/** usuarios: gestión y permisos de usuarios demo */
import { usuariosSistema, appState, puedeHacer, guardarDatos, PERMISOS } from '../core/data.js';
import { showToast, confirmModal, validarNombreAdmin, mostrarError, limpiarError, escapeHtml } from '../core/ui.js';
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
        <td><strong>${escapeHtml(u.nombre)}</strong></td>
        <td style="color:var(--text-muted)">${escapeHtml(u.username)}</td>
        <td>
          <select class="select-inline" data-action="rol" data-id="${u.id}" ${esSelf ? 'disabled title="No puedes cambiar tu propio rol"' : ''}>
            ${['Administrador','Gerente','Recepcionista',"Camarero"].map(r =>
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
              data-action="toggle" data-id="${u.id}">
              ${u.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button class="btn btn-sm btn-danger" data-action="eliminar" data-id="${u.id}">Eliminar</button>
          ` : '<span class="text-muted" style="font-size:0.8rem">Tú</span>'}
        </td>
      </tr>`;
  }).join('');
}

function cambiarRolUsuario(id, nuevoRol) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u || u.id === appState.currentUser?.id || !PERMISOS[nuevoRol]) return;
  const anterior = u.role;
  u.role = nuevoRol;
  guardarDatos();
  renderUsuarios();
  showToast(`${escapeHtml(u.nombre)}: ${anterior} → ${nuevoRol}`, 'success');
}

function toggleUsuario(id) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u || u.id === appState.currentUser?.id) return;
  u.activo = !u.activo;
  guardarDatos();
  renderUsuarios();
  showToast(`Usuario ${escapeHtml(u.username)} ${u.activo ? 'activado' : 'desactivado'}.`, u.activo ? 'success' : 'danger');
}

async function eliminarUsuario(id) {
  if (!puedeHacer('gestionarUsuarios')) return;
  const u = usuariosSistema.find(x => x.id === id);
  if (!u || u.id === appState.currentUser?.id) return;
  const ok = await confirmModal(`¿Eliminar al usuario "${escapeHtml(u.username)}"? Esta acción es permanente.`);
  if (!ok) return;
  const idx = usuariosSistema.indexOf(u);
  usuariosSistema.splice(idx, 1);
  guardarDatos();
  renderUsuarios();
  showToast(`Usuario ${escapeHtml(u.username)} eliminado.`, 'danger');
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

export function init() {
  document.getElementById('usuariosTable')?.addEventListener('change',e => {
    const el=e.target.closest('select[data-action="rol"][data-id]');
    if (el) cambiarRolUsuario(Number(el.dataset.id),el.value);
  });
  document.getElementById('usuariosTable')?.addEventListener('click',e => {
    const b=e.target.closest('button[data-action][data-id]');
    if (!b) return;
    if (b.dataset.action === 'toggle') toggleUsuario(Number(b.dataset.id));
    if (b.dataset.action === 'eliminar') eliminarUsuario(Number(b.dataset.id));
  });
  renderUsuarios();
}
