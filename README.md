# Plataforma de Eventos e Inscripciones

## Pre-entrega 2 — Registro Seguro de Usuarios

### Descripción

Proyecto backend desarrollado como parte del curso **PBE II — Diseño y Arquitectura Backend**.

La aplicación está orientada a la gestión de eventos e inscripciones de usuarios.

La Pre-entrega 1 estableció la arquitectura modular inicial. En esta segunda pre-entrega se incorpora el registro seguro de usuarios, incluyendo validaciones, normalización de email, hashing de contraseñas con bcrypt y persistencia en MongoDB mediante Mongoose.

## Tecnologías utilizadas

- Node.js
- Express.js
- JavaScript con módulos ESM
- MongoDB
- Mongoose
- bcrypt
- dotenv
- Git y GitHub

## Requisitos previos

- Node.js y npm instalados.
- MongoDB Community Server instalado y en ejecución.
- Un cliente HTTP como Postman o curl para realizar las pruebas.

## Instalación

**1. Obtener el proyecto**

Clonar el repositorio público de la Pre-entrega 2 y abrir su carpeta.

**2. Instalar las dependencias**

```bash
npm install
```

**3. Configurar las variables de entorno**

Crear un archivo `.env` en la raíz del proyecto, tomando como referencia `.env.example`.

Ejemplo de configuración local:

```dotenv
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/plataforma_eventos
JWT_SECRET=reemplazar_por_clave_segura
```

La variable `JWT_SECRET` queda preparada para futuros módulos de autenticación. Todavía no se utiliza en el registro.

El archivo `.env` está excluido del repositorio mediante `.gitignore`.

**4. Iniciar el servidor**

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

El servidor se ejecuta por defecto en:

`http://localhost:8080`

La conexión con MongoDB se establece antes de iniciar Express.

## Arquitectura del proyecto

La aplicación utiliza una arquitectura modular con separación de responsabilidades.

```text
src/
├── app.js
├── server.js
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   └── Event.js
├── routes/
│   ├── sessions.router.js
│   ├── events.router.js
│   └── health.router.js
├── controllers/
│   ├── sessions.controller.js
│   ├── events.controller.js
│   └── health.controller.js
├── services/
│   ├── sessions.service.js
│   └── events.service.js
├── repositories/
│   └── users.repository.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   └── error.middleware.js
└── utils/
    └── hash.js
```

### Responsabilidades

- **Routes:** definen los endpoints disponibles.
- **Controllers:** gestionan solicitudes y respuestas HTTP.
- **Services:** implementan validaciones y reglas de negocio.
- **Repositories:** proporcionan una interfaz de acceso a datos.
- **DAO:** realizan las operaciones de persistencia.
- **Models:** definen los esquemas de Mongoose.
- **Utils:** contienen funciones reutilizables, como el hashing de contraseñas.
- **Config:** contiene la configuración de conexión a MongoDB.
- **Middlewares:** proporcionan procesamiento adicional y manejo de errores.

El flujo de registro sigue la secuencia:

**Router → Controller → Service → Repository → DAO → Modelo User → MongoDB**

## Modelo User

El modelo contiene los siguientes campos:

| Campo | Descripción |
|---|---|
| `first_name` | Nombre obligatorio |
| `last_name` | Apellido obligatorio |
| `email` | Correo obligatorio, normalizado y único |
| `password` | Contraseña almacenada mediante hash |
| `role` | Rol del usuario |
| `createdAt` | Fecha de creación |
| `updatedAt` | Fecha de actualización |

Los roles permitidos son `user`, `organizer` y `admin`.

En el registro público se asigna siempre el rol `user`, sin aceptar modificaciones desde el cuerpo de la solicitud.

## Endpoint de registro

### POST /api/sessions/register

Permite registrar un usuario de forma segura.

**Campos esperados en el body:**

```json
{
  "first_name": "Ana",
  "last_name": "Perez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Todos los campos son obligatorios.

### Validaciones

- Nombre y apellido obligatorios.
- Email obligatorio y con formato válido.
- Normalización de email mediante `trim()` y `toLowerCase()`.
- Contraseña de al menos 8 caracteres.
- Verificación de email previamente registrado.
- Asignación del rol `user` desde el backend.
- Hashing de la contraseña mediante bcrypt antes de guardarla.

### Respuesta exitosa — HTTP 201

```json
{
  "status": "success",
  "payload": {
    "id": "identificador_generado_por_mongodb",
    "first_name": "Ana",
    "last_name": "Perez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La respuesta no incluye el campo `password` ni su hash.

### Error por campos faltantes — HTTP 400

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Error por email inválido — HTTP 400

```json
{
  "status": "error",
  "message": "Formato de email inválido"
}
```

### Error por contraseña corta — HTTP 400

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

### Email duplicado — HTTP 409

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

## Cómo probar el registro

Con MongoDB y el servidor Express en funcionamiento, ejecutar desde Git Bash:

```bash
curl -i -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Perez","email":"ana@mail.com","password":"Secreta123"}'
```

Se espera una respuesta HTTP 201 cuando el correo no está registrado.

Si el mismo email se utiliza nuevamente, se espera una respuesta HTTP 409.

También se recomienda probar campos faltantes, emails inválidos, contraseñas cortas e intentos de asignar el rol `admin`.

## Seguridad de las contraseñas

Las contraseñas se procesan mediante el helper reutilizable `src/utils/hash.js`.

Se utiliza `bcrypt.hash()` con factor de costo 10.

El backend guarda solamente el hash de la contraseña, nunca su valor original.

Para verificar contraseñas en futuras implementaciones de login, el helper incluye `bcrypt.compare()`.

El modelo User configura `select: false` para el campo `password`, y el servicio construye la respuesta utilizando únicamente campos permitidos.

## Verificación en MongoDB

Abrir MongoDB Compass y conectarse a:

`mongodb://127.0.0.1:27017`

Ingresar a:

`plataforma_eventos → users → Documents`

Los documentos registrados deben contener:

- Email normalizado.
- Rol `user`.
- Contraseña almacenada como hash de bcrypt, normalmente comenzando por `$2b$10$`.

La contraseña original no debe aparecer en la base de datos ni en las respuestas de la API.

## Otros endpoints disponibles

**GET /api/health**

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

**GET /api/events**

```json
{
  "status": "success",
  "payload": []
}
```

**GET /api/sessions**

```json
{
  "status": "success",
  "message": "Módulo de sesiones preparado"
}
```

Estos endpoints se mantienen desde la Pre-entrega 1.

## Estado del proyecto

### Pre-entrega 1

- Arquitectura modular inicial.
- Configuración de Express.
- Modelos iniciales.
- Rutas de health, events y sessions.

### Pre-entrega 2

- Modelo User actualizado.
- Conexión efectiva a MongoDB.
- Registro seguro de usuarios.
- Validaciones de entrada.
- Normalización y unicidad de email.
- Protección de contraseñas con bcrypt.
- Separación de responsabilidades en capas.
- Respuestas HTTP sin datos sensibles.

## Próximas funcionalidades

- Login de usuarios.
- Autenticación mediante JWT.
- Cookies y sesiones.
- Passport.
- Autorización por roles.
- CRUD completo de eventos.
- Inscripciones y control de cupos.
- Notificaciones.