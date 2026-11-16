/** login.js: acceso de demostración por usuario y contraseña local. */
import { iniciarSesion } from '../core/auth.js';
import { showToast } from '../core/ui.js';
export function init() {
  document.getElementById('loginForm')?.addEventListener('submit',event => {
    event.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value;
    const u = iniciarSesion(username,password);
    if (!u) {
      showToast('Usuario, contraseña o estado de cuenta incorrecto.','danger');
      document.getElementById('loginUser').classList.add('input-error');
      document.getElementById('loginPassword').classList.add('input-error');
      return;
    }
    window.location.assign('dashboard.html');
  });
}
