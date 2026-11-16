/** auth.js: sesión de demostración (NUNCA usar como seguridad de servidor). */
import { usuariosSistema, appState, PERMISOS } from './data.js';
import { showToast } from './ui.js';

const SESION = 'hotel_utp_sesion';
const RUTAS = Object.freeze({
  'screen-guest':'index.html', 'screen-login':'login.html',
  dashboard:'dashboard.html', reservas:'reservas.html', habitaciones:'habitaciones.html',
  huespedes:'huespedes.html', historial:'historial.html', usuarios:'usuarios.html'
});
export function recuperarSesion() {
  try {
    const id = Number(sessionStorage.getItem(SESION));
    const usuario = usuariosSistema.find(u => u.id === id && u.activo);
    appState.currentUser = usuario || null;
  } catch { appState.currentUser = null; }
  return appState.currentUser;
}
export function iniciarSesion(username,password) {
  const usuario = usuariosSistema.find(u => u.username === username.trim().toLowerCase() && u.password === password);
  if (!usuario || !usuario.activo) return null;
  appState.currentUser = usuario;
  sessionStorage.setItem(SESION,String(usuario.id));
  return usuario;
}
export function cerrarSesion() {
  appState.currentUser = null;
  sessionStorage.removeItem(SESION);
  window.location.assign(RUTAS['screen-guest']);
}
export function protegerPagina(pagina) {
  if (pagina === 'index' || pagina === 'login') return true;
  if (!appState.currentUser) { window.location.replace(RUTAS['screen-login']); return false; }
  const permitidas = PERMISOS[appState.currentUser.role]?.screens || [];
  if (!permitidas.includes(pagina)) {
    window.location.replace(RUTAS[permitidas[0] || 'screen-login']);
    return false;
  }
  return true;
}
export function irAPagina(screen) {
  const url = RUTAS[screen];
  if (!url) return;
  const permitidas = PERMISOS[appState.currentUser?.role]?.screens || [];
  if (!screen.startsWith('screen-') && !permitidas.includes(screen)) {
    showToast('No tienes permiso para acceder a esta sección.','danger'); return;
  }
  window.location.assign(url);
}
export function configurarNavegacion(pagina) {
  const user = appState.currentUser;
  const permitidas = PERMISOS[user?.role]?.screens || [];
  document.querySelectorAll('a.nav-link[data-screen]').forEach(a => {
    const ok = permitidas.includes(a.dataset.screen);
    a.hidden = !ok;
    a.style.display = ok ? '' : 'none';
    a.classList.toggle('active', a.dataset.screen === pagina);
    if (a.dataset.screen === pagina) a.setAttribute('aria-current','page');
  });
  const nombre = document.getElementById('userNameDisplay');
  const rol = document.getElementById('userRoleDisplay');
  if (nombre) nombre.textContent = user?.nombre || user?.username || '';
  if (rol) rol.textContent = user?.role || '';
  const info = document.getElementById('userInfo');
  const logout = document.getElementById('logoutBtn');
  const portal = document.getElementById('verPortalBtn');
  if (info) info.style.display = user ? 'flex' : 'none';
  if (logout) logout.style.display = user ? 'block' : 'none';
  if (portal) portal.style.display = user ? 'block' : 'none';
  logout?.addEventListener('click', cerrarSesion);
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-screen]:not(a)');
    if (!control) return;
    event.preventDefault();
    irAPagina(control.dataset.screen);
  });
}
