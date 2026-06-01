# 🏨 HOTEL UTP - Sistema de Gestión Hotelera

Sistema integral de gestión hotelera diseñado para administrar reservas, habitaciones, huéspedes y usuarios mediante un control centralizado y seguro.

## ✨ Características

* 🔐 **Autenticación por roles** - Administrador, Gerente y Recepcionista.
* 🏨 **Gestión de habitaciones** - Consulta de disponibilidad y estado.
* 📅 **Gestión de reservas** - Creación, modificación y cancelación.
* 👤 **Registro de huéspedes** - Información completa de clientes.
* ✅ **Check-In y Check-Out** - Control de ingreso y salida.
* 📋 **Historial de actividades** - Seguimiento de eventos realizados.
* 📊 **Panel administrativo** - Información general del hotel.
* 💾 **Persistencia local** - Almacenamiento mediante LocalStorage.

---

# 🚀 Inicio Rápido

## Frontend

```bash
Abrir index.html en el navegador
```

O utilizar Live Server en Visual Studio Code.

### Usuarios de prueba

```text
Administrador
Usuario: admin
Contraseña: admin123

Gerente
Usuario: gerente
Contraseña: gerente123

Recepcionista
Usuario: recepcion
Contraseña: recepcion123
```

---

# 📁 Estructura del Proyecto

```text
HOTEL_UTP/

├── 📄 index.html               # Página principal
├── 📄 app.js                   # Lógica principal
├── 📄 styles.css               # Estilos generales

├── 📁 assets/
│   ├── 🖼️ logo.png
│   ├── 🖼️ habitaciones/
│   └── 🖼️ iconos/

├── 📁 docs/
│   ├── 📄 CasosDeUso.pdf
│   ├── 📄 DiagramaClases.pdf
│   ├── 📄 DiagramaSecuencia.pdf
│   └── 📄 DocumentacionFinal.pdf

├── 📄 README.md
├── 📄 package.json
└── 📄 .gitignore
```

---

# 🎯 Funcionalidades

## 1️⃣ Inicio de Sesión

* Validación de usuarios.
* Control de acceso por rol.

## 2️⃣ Gestión de Habitaciones

* Consultar disponibilidad.
* Consultar estado.
* Actualizar estado.

## 3️⃣ Gestión de Reservas

* Crear reservas.
* Modificar reservas.
* Cancelar reservas.

## 4️⃣ Check-In

* Validar reserva.
* Asignar habitación.
* Actualizar historial.

## 5️⃣ Check-Out

* Liberar habitación.
* Actualizar estado.
* Registrar salida.

## 6️⃣ Historial

* Registrar actividades.
* Consultar eventos realizados.

---

# 🛠️ Tecnologías Utilizadas

## Frontend

* HTML5
* CSS3
* JavaScript

## Herramientas de Desarrollo

* Visual Studio Code
* Git
* GitHub

## Diagramación

* PlantUML
* Draw.io

---

# 📊 Arquitectura del Sistema

```text
+----------------------+
|      PRESENTACIÓN    |
| HTML - CSS           |
+----------------------+

          |

+----------------------+
| LÓGICA DE NEGOCIO    |
| JavaScript           |
| app.js               |
+----------------------+

          |

+----------------------+
| ALMACENAMIENTO       |
| LocalStorage         |
+----------------------+
```

---

# 🔄 Flujo General

```text
Usuario
   ↓
Login
   ↓
Dashboard
   ↓
Reservas
   ↓
Check-In / Check-Out
   ↓
Historial
```

---

# ✅ Validaciones

* Campos obligatorios.
* Fechas válidas.
* Habitaciones disponibles.
* Usuarios autorizados según rol.
* Verificación de reservas existentes.

---

# 📱 Responsividad

* Desktop
* Tablet
* Móvil

---

# 📋 Diagramas UML Incluidos

* Diagrama de Casos de Uso
* Diagrama de Clases
* Diagrama de Secuencia

---

# 👥 Integrantes

* Sebastián Valencia Abadía
* María Fernanda Pimentel
* Yerbrai Barboza

---

# 📄 Estado del Proyecto

✅ Proyecto académico finalizado para la asignatura Entornos de Desarrollo de Software.

**Versión:** 1.0.0
**Sistema:** HOTEL UTP
**Año:** 2026

# Estructura y jerarquía

Se eliminaron los emojis redundantes y se reemplazaron por iconos consistentes de Tabler, que se ven más profesionales en un README.
Se añadieron descripciones a cada característica, no solo el título. Antes decía "Gestión de habitaciones - Consulta de disponibilidad y estado"; ahora explica qué hace y por qué importa.

# Credenciales de prueba

Las tres cuentas ahora tienen tarjetas visuales con etiquetas de rol codificadas en color (rojo, ámbar, verde), lo que hace más fácil distinguirlas de un vistazo.

# Estructura del proyecto

Se añadieron comentarios en línea a cada archivo/carpeta explicando su propósito, lo que ayuda a alguien que entra al proyecto por primera vez.

# Funcionalidades

Cada módulo ahora tiene su propia sección con descripción más detallada en lugar de una lista de verbos solos (Crear reservas, Modificar reservas). 

# Arquitectura

El diagrama ASCII plano se reemplazó por un esquema visual de tres capas que comunica la separación de responsabilidades de forma más clara.

# Flujo general

El diagrama de flechas ahora es horizontal y visualmente conectado, lo que transmite mejor el flujo temporal del sistema.

# Tecnologías

Agrupadas en tres columnas (interfaz, herramientas, diagramación) para facilitar la lectura rápida.

# Estado del proyecto

La barra final consolida versión, año y asignatura en un solo lugar limpio, en lugar de quedar disperso al final del texto.
