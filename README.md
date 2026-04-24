# Runner Social Backend

Backend de portafolio construido con Express, TypeScript, Prisma y PostgreSQL para una red social enfocada en runners y coaches.

## Arquitectura

La aplicación sigue una arquitectura por capas:

- `src/routes`: define endpoints y conecta middlewares/controladores.
- `src/controllers`: adapta HTTP hacia casos de uso.
- `src/services`: concentra lógica de negocio y acceso a Prisma.
- `src/middlewares`: validación, autenticación y manejo de errores.
- `src/configs`: configuración de entorno y cliente Prisma.
- `src/types`: contratos compartidos.
- `src/utils`: helpers reutilizables.

Flujo principal:

`request -> route -> middleware -> controller -> service -> Prisma -> response`

## Dominio implementado

- Autenticación con JWT
- Perfiles de usuario
- Feed de publicaciones
- Comentarios y likes
- Seguimiento entre usuarios
- Metas personales
- Equipos de coach
- Solicitudes de ingreso
- Publicación de planes/tips
- Notificaciones
- Reportes y moderación básica

## Variables de entorno

Consulta [`.env.example`](</C:/Users/asdru/OneDrive/Desktop/Developer/Node JS/backend/.env.example>) para la configuración base.

Para Neon y Prisma:

- `DATABASE_URL`: conexión pooled de runtime
- `DIRECT_URL`: conexión directa para CLI
- `SHADOW_DATABASE_URL`: base de sombra para migraciones

## Scripts

- `pnpm dev`: levanta el servidor en desarrollo
- `pnpm typecheck`: verifica TypeScript
- `pnpm prisma:generate`: regenera el cliente Prisma
- `pnpm prisma:push`: sincroniza el esquema con la base
- `pnpm seed`: carga datos demo
- `pnpm test`: ejecuta tests de Vitest

## Endpoints principales

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Users

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me/profile`
- `GET /api/v1/users/:userId`
- `GET /api/v1/users/discover/nearby`
- `POST /api/v1/users/:userId/follow`
- `DELETE /api/v1/users/:userId/follow`
- `GET /api/v1/users/:userId/followers`
- `GET /api/v1/users/:userId/following`
- `POST /api/v1/users/goals`
- `GET /api/v1/users/goals/me`
- `PATCH /api/v1/users/goals/:goalId/progress`

### Posts

- `GET /api/v1/posts`
- `GET /api/v1/posts/feed`
- `POST /api/v1/posts`
- `GET /api/v1/posts/:postId`
- `PATCH /api/v1/posts/:postId`
- `DELETE /api/v1/posts/:postId`
- `POST /api/v1/posts/:postId/like`
- `DELETE /api/v1/posts/:postId/like`
- `POST /api/v1/posts/:postId/comments`
- `GET /api/v1/posts/:postId/comments`

### Teams

- `GET /api/v1/teams`
- `GET /api/v1/teams/:teamId`
- `POST /api/v1/teams`
- `POST /api/v1/teams/:teamId/join-requests`
- `GET /api/v1/teams/:teamId/join-requests`
- `PATCH /api/v1/teams/join-requests/:requestId`
- `POST /api/v1/teams/content`
- `GET /api/v1/teams/content/all`

### Notifications

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:notificationId/read`

### Admin

- `POST /api/v1/admin/reports`
- `GET /api/v1/admin/reports`
- `PATCH /api/v1/admin/reports/:reportId/resolve`
- `PATCH /api/v1/admin/users/:userId/status`
- `PATCH /api/v1/admin/coaches/:userId/validate`

## Notas de implementación

- El proyecto usa `db push` para seguir iterando rápido sobre Neon mientras se define la estrategia final de shadow database.
- La primera migración ya existe para `User` y `Profile`.
- El modelo Prisma ya contempla crecimiento hacia feed social, coach tools y moderación.
