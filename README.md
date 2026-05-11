# Runner Social Backend

Backend de portafolio construido con Express, TypeScript, Prisma y PostgreSQL para una red social enfocada en runners, coaches y administradores.

## Overview

Este proyecto expone una API REST para autenticacion, perfiles, feed social, metas personales, equipos, notificaciones y moderacion basica.

Stack principal:

- Express 5
- TypeScript
- Prisma
- PostgreSQL
- Vitest

## Arquitectura

La aplicacion sigue una arquitectura por capas:

- `src/routes`: define endpoints y conecta middlewares y controladores
- `src/controllers`: adapta HTTP hacia casos de uso
- `src/services`: concentra logica de negocio y acceso a Prisma
- `src/middlewares`: validacion, autenticacion, seguridad y manejo de errores
- `src/configs`: configuracion de entorno y cliente Prisma
- `src/types`: contratos compartidos
- `src/utils`: helpers reutilizables

Flujo principal:

`request -> route -> middleware -> controller -> service -> Prisma -> response`

## Funcionalidades

- Autenticacion con JWT
- Perfiles de usuario
- Feed de publicaciones
- Comentarios y likes
- Seguimiento entre usuarios
- Metas personales
- Equipos de coach
- Solicitudes de ingreso a equipos
- Publicacion de planes y tips
- Notificaciones
- Reportes y moderacion basica
- Controles administrativos

## Variables de entorno

Consulta [`.env.example`](</C:/Users/asdru/OneDrive/Desktop/Developer/Node JS/backend/.env.example>) para la configuracion base.

Variables principales:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `DIRECT_URL`
- `SHADOW_DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ALLOWED_ORIGINS`
- `AUTH_RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `WRITE_RATE_LIMIT_MAX`
- `WRITE_RATE_LIMIT_WINDOW_MS`

## Scripts

- `pnpm dev`: levanta el servidor en desarrollo
- `pnpm build`: compila TypeScript a `dist`
- `pnpm start`: ejecuta el build de produccion
- `pnpm typecheck`: verifica TypeScript
- `pnpm prisma:generate`: regenera el cliente Prisma
- `pnpm prisma:migrate`: crea y aplica migraciones en desarrollo
- `pnpm prisma:migrate:deploy`: aplica migraciones pendientes en produccion
- `pnpm prisma:push`: sincroniza el esquema con la base de datos en entornos de iteracion
- `pnpm seed`: carga datos demo
- `pnpm test`: ejecuta tests de Vitest

## Puesta en marcha local

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
pnpm dev
```

## Despliegue

Flujo recomendado para produccion:

```bash
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm build
pnpm start
```

Notas importantes:

- Define `CORS_ALLOWED_ORIGINS` con los dominios reales del frontend.
- Usa valores reales y seguros para `JWT_SECRET`.
- No ejecutes `seed` en produccion salvo que quieras una demo publica controlada.

## Datos demo

El script `pnpm seed` crea cuentas demo para pruebas locales y demos internas. Esas cuentas no deben considerarse credenciales de produccion.

Si despliegas una version publica, tienes dos opciones recomendadas:

- no ejecutar `pnpm seed`
- o documentar claramente que la instancia es una demo publica

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

## Verificacion

Comandos verificados recientemente:

- `pnpm build`
- `pnpm test`

## Estado del proyecto

Este backend esta mantenido como proyecto de portafolio y como base tecnica para futuras iteraciones del producto.
