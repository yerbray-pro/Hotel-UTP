# Hotel UTP — proyecto web multipágina y modular

Reorganización de los tres archivos originales (`index.html`, `app.js`, `styles.css`) en **ocho páginas HTML** con un punto de entrada compartido, módulos JavaScript por responsabilidad y hojas de estilo divididas. Se mantuvieron el diseño y los nombres de almacenamiento local para que los datos anteriores del **mismo origen web** sigan disponibles.

## Iniciar el proyecto

Necesitas servir el directorio con un servidor HTTP local porque JavaScript usa módulos ES. Desde la carpeta del proyecto, ejecuta:

```bash
python -m http.server 5500
```

Luego entra a `http://localhost:5500/`. No abras las páginas haciendo doble clic (`file://`). Si ya usas VS Code, también puedes usar **Live Server**. Para un despliegue estático, publica el contenido de esta carpeta, conservando las rutas. 

## Estructura

```text
hotel-utp-reestructurado/
├── index.html               Portal público de clientes
├── login.html               Acceso del personal
├── dashboard.html           Indicadores y alertas
├── reservas.html            Reservas y check-in/check-out
├── habitaciones.html        Estados y aseo
├── huespedes.html           Registro de huéspedes
├── historial.html           Actividad de reservas
├── usuarios.html            Administración de usuarios
└── assets/
    ├── css/
    │   ├── styles.css       Importa las hojas de estilos en orden
    │   ├── base.css
    │   ├── login.css
    │   ├── components.css
    │   ├── portal.css
    │   ├── responsive.css
    │   └── improvements.css
    └── js/
        ├── main.js          Arranque, protección y carga por página
        ├── core/
        │   ├── data.js      Estado, datos de muestra y localStorage
        │   ├── ui.js        Formato, validación y componentes
        │   ├── auth.js      Sesión y navegación según rol
        │   └── reservas.js  Reglas compartidas de reservas
        └── pages/            Un controlador JS por página HTML
```

## Alcance y limitaciones importantes

- **Es una demostración frontend, no un sistema hotelero de producción.** La autenticación y la autorización ocurren en JavaScript; los usuarios y sus contraseñas permanecen en almacenamiento local y los datos solo se comparten dentro del mismo navegador/origen. No debe usarse para datos reales ni publicarse como sistema seguro.
- Los usuarios de ejemplo se conservan para probar los cuatro roles (ver `assets/js/core/data.js`). Ahora **no se restablecen sus roles o contraseñas tras cada recarga**: los cambios almacenados se respetan.
- **No hay pasarela de pago ni servicio de correo**. El flujo de tarjeta y PSE es una simulación; nunca escribas números de tarjeta o CVV reales. La reserva muestra un código que se consulta en el propio navegador, sin envío de email.
- La disponibilidad se controla contra las reservas de ese navegador. Un sistema real debe mover datos, permisos y comprobación de solapamientos a una base de datos y al servidor; una opción sería Supabase/PostgreSQL con RLS y un servicio de correo/pagos integrado.
- Se conserva el historial de las reservas; no existe un historial inmutable garantizado al depender de almacenamiento local.

## Verificación

Ejecuta `node --test tests/*.test.mjs` (o `npm test`) para revisar módulos, roles, persistencia y creación de reservas.

## Cambios técnicos incluidos

1. HTML independiente para cada módulo, conservando los ID de formularios y el diseño.
2. Navegación con enlaces reales, estado activo y acceso condicionado a cada rol.
3. Persistencia entre páginas mediante `localStorage` y sesión activa por pestaña con `sessionStorage`.
4. Eliminación de manejadores `onclick` embebidos en tablas dinámicas; se usan eventos delegados.
5. Separación de operaciones de datos y renderizados de cada pantalla, evitando acceder a elementos HTML de otra página.
6. Protección extra contra reservar una habitación ya reservada en el mismo rango de fechas desde recepción.
7. Texto de pago/correo corregido para que sea claro que el flujo es de demostración.

## Migración

Antes de desplegar, haz copia de los datos si son importantes. Las claves de almacenamiento de las versiones previas siguen siendo `hotel_utp_reservas`, `hotel_utp_habitaciones`, `hotel_utp_usuarios`, `hotel_utp_notificaciones`. Cambiar de un dominio a otro **no transfiere** automáticamente sus datos locales.
