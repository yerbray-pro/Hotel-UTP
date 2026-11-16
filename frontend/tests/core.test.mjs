import test from 'node:test';
import assert from 'node:assert/strict';

const entries = new Map();
globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};
globalThis.localStorage = {
  getItem(key) { return entries.get(key) ?? null; },
  setItem(key,value) { entries.set(key,value); },
  removeItem(key) { entries.delete(key); }
};
globalThis.sessionStorage = {
  getItem(key) { return entries.get('session:'+key) ?? null; },
  setItem(key,value) { entries.set('session:'+key,value); },
  removeItem(key) { entries.delete('session:'+key); }
};
const data = await import('../assets/js/core/data.js');
const auth = await import('../assets/js/core/auth.js');
const service = await import('../assets/js/core/reservas.js');
data.cargarDatos();

test('módulos por pantalla importan sin errores de dependencias', async () => {
  const names=['dashboard','reservas','habitaciones','huespedes','historial','usuarios','login','portal'];
  for (const name of names) {
    const page = await import(`../assets/js/pages/${name}.js`);
    assert.equal(typeof page.init,'function',`${name}.js debe exportar init()`);
  }
});

test('mantiene estructura de perfiles y permisos por rol', () => {
  assert.equal(data.usuariosSistema.length,4);
  assert.equal(data.PERMISOS.Administrador.gestionarUsuarios,true);
  assert.equal(data.PERMISOS.Recepcionista.gestionarUsuarios,false);
  assert.equal(data.PERMISOS.Camarero.finalizarAseo,true);
});

test('sesión de prueba, limitación por rol y recuperación', () => {
  const user = auth.iniciarSesion('recepcion','1234');
  assert.equal(user.role,'Recepcionista');
  assert.equal(data.puedeHacer('crearReserva'),true);
  assert.equal(data.puedeHacer('cancelarReserva'),false);
  assert.equal(auth.recuperarSesion()?.username,'recepcion');
});

test('creación de reserva guarda datos y evita duplicar códigos', () => {
  const antes=data.reservas.length;
  const reserva=service.crearNuevaReserva({
    huesped:'Prueba Sistema',documento:'123456789',habitacion:'105',
    checkin:'2027-06-20',checkout:'2027-06-22',notas:'Prueba',origen:'cliente'
  });
  assert.equal(data.reservas.length,antes+1);
  assert.ok(/^HTL-[A-Z2-9]{6}$/.test(reserva.codigoReserva));
  assert.equal(entries.has('hotel_utp_reservas'),true);
  assert.equal(service.habitacionDisponibleEnFechas('105','2027-06-21','2027-06-23'),false);
  assert.equal(service.habitacionDisponibleEnFechas('105','2027-06-22','2027-06-24'),true);
});

test('almacenamiento recupera cuentas modificadas sin restablecerlas', () => {
  const admin=data.usuariosSistema.find(u=>u.username==='admin');
  admin.nombre='Nombre Personalizado';
  data.guardarDatos();
  data.cargarDatos();
  assert.equal(data.usuariosSistema.find(u=>u.username==='admin').nombre,'Nombre Personalizado');
});
