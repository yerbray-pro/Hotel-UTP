/** main.js: arranque por página; importa únicamente la vista solicitada. */
import { cargarDatos } from './core/data.js';
import { recuperarSesion, protegerPagina, configurarNavegacion } from './core/auth.js';
import { attachInputValidation } from './core/ui.js';

const pagina = document.body.dataset.page;
const modulos = {
  index: './pages/portal.js', login: './pages/login.js',
  dashboard: './pages/dashboard.js', reservas: './pages/reservas.js',
  habitaciones: './pages/habitaciones.js', huespedes: './pages/huespedes.js',
  historial: './pages/historial.js', usuarios: './pages/usuarios.js'
};
cargarDatos();
recuperarSesion();
if (modulos[pagina] && protegerPagina(pagina)) {
  configurarNavegacion(pagina);
  attachInputValidation();
  const modulo = await import(modulos[pagina]);
  modulo.init();
}
