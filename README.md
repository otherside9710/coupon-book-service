# Coupon Book Service (scaffold)

Este repositorio contiene la estructura del servicio de cupones siguiendo arquitectura hexagonal y DDD. Se ha creado un scaffold mínimo con TypeORM y un caso de uso implementado: asignar cupón aleatorio (`assign-random-coupon`).

Cómo ejecutar (local):

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno (usar `.env.example` como referencia). Por ejemplo:

```bash
# Coupon Book Service

Servicio para gestionar libros de cupones (crear, subir códigos, asignar, bloquear y redimir) implementado con NestJS, TypeScript, TypeORM y arquitectura Hexagonal / DDD.

- Estado actual (resumen)
- La mayoría de los endpoints y use-cases están implementados: crear libro, subir códigos, asignar (aleatorio/específico), bloquear y canjear.

```

## Estructura del proyecto

```
coupon-book-service/
├── src/
│   ├── main.ts                          # Entrypoint de la aplicación
│   ├── app.module.ts                    # Módulo raíz
│   ├── apps/                            # Interfaces / Controllers
│   │   └── coupons/
│   │       └── http/
│   │           ├── controllers/
│   │           │   ├── coupons.controller.ts
│   │           │   └── users.controller.ts
│   │           └── middleware/
│   └── contexts/                        # Contextos de negocio (DDD)
│       └── coupons/
│           ├── coupons.module.ts        # Módulo principal del contexto
│           ├── application/
│           │   ├── use-cases/           # Casos de uso
│           │   │   ├── assign-random-coupon.use-case.ts
│           │   │   ├── assign-specific-coupon.use-case.ts
│           │   │   ├── create-coupon-book.use-case.ts
│           │   │   ├── get-user-coupons.use-case.ts
│           │   │   ├── lock-coupon.use-case.ts
│           │   │   ├── redeem-coupon.use-case.ts
│           │   │   └── upload-codes.use-case.ts
│           │   └── dto/
│           │       ├── request/
│           │       └── response/
│           ├── domain/                  # Lógica de dominio
│           │   ├── contracts/           # Puertos / Interfaces
│           │   │   ├── coupon-book.repository.port.ts
│           │   │   ├── coupon-code.repository.port.ts
│           │   │   ├── assignment.repository.port.ts
│           │   │   ├── redemption.repository.port.ts
│           │   │   ├── lock.service.port.ts
│           │   │   └── cache.service.port.ts
│           │   ├── entities/            # Entidades de dominio
│           │   │   ├── coupon-book.entity.ts
│           │   │   └── coupon-code.entity.ts
│           │   ├── enums/
│           │   ├── exceptions/
│           │   └── value-objects/
│           └── infrastructure/          # Adaptadores de infraestructura
│               ├── adapters/
│               │   ├── persistence/
│               │   │   └── typeorm/
│               │   │       ├── entities/     # Entidades ORM para TypeORM
│               │   │       │   ├── coupon-book.orm-entity.ts
│               │   │       │   ├── coupon-code.orm-entity.ts
│               │   │       │   ├── coupon-assignment.orm-entity.ts
│               │   │       │   └── coupon-redemption.orm-entity.ts
│               │   │       ├── repositories/    # Repositorios TypeORM
│               │   │       │   ├── coupon-book.repository.ts
│               │   │       │   ├── coupon-code.repository.ts
│               │   │       │   ├── assignment.repository.ts
│               │   │       │   └── redemption.repository.ts
│               │   │       └── mappers/         # Mappers ORM <-> Dominio
│               │   │           ├── coupon-book.mapper.ts
│               │   │           ├── coupon-code.mapper.ts
│               │   │           └── ...
│               │   ├── locking/
│               │   │   ├── redis-lock.service.ts    # Implementación con ioredis
│               │   │   └── in-memory-lock.service.ts # (stub deprecado)
│               │   └── cache/
│               │       └── in-memory-cache.service.ts # (stub deprecado)
│               ├── database/
│               │   ├── database.module.ts                          # Configuración TypeORM
│               │   └── migrations/
│               │       ├── data-source.ts                           # DataSource unificado (fuente única de verdad)
│               │       └── 1121202512_AddCouponTables.ts             # Migración TypeORM
│               └── modules/
│                   └── coupons.module.ts      # Módulo infra del contexto
├── docker-compose.yml                   # Servicios: PostgreSQL 15 + Redis 7
├── docker/
│   └── Dockerfile                       # Imagen Docker de la aplicación
├── test/
│   ├── unit/                            # Tests unitarios
│   ├── integration/                     # Tests de integración
│   └── e2e/                             # Tests end-to-end
├── package.json                         # Dependencias y scripts
├── tsconfig.json                        # Configuración TypeScript
├── nest-cli.json                        # Configuración NestJS
└── README.md                            # Este archivo
```

## Notas sobre la estructura:

- **Arquitectura Hexagonal + DDD:** La estructura separa claramente casos de uso (application), lógica de dominio (domain) y adaptadores de infraestructura (infrastructure).
- **Puertos y Adaptadores:** Los contratos (ports) están en `domain/contracts/` y sus implementaciones (adapters) en `infrastructure/adapters/`.
- **DataSource unificado:** `data-source.ts` es la fuente única de verdad para la configuración de TypeORM. Lo usan tanto el módulo (`database.module.ts`) como los scripts de migración.
- **Persistencia:** Las entidades ORM (`*.orm-entity.ts`) se sincronizan automáticamente con PostgreSQL gracias a TypeORM y `synchronize: true` en desarrollo.
- **Locking:** Las implementaciones in-memory fueron retiradas del DI; el proyecto usa `RedisLockService` (ioredis) como proveedor principal vía el token `'ILockService'`.
- **Migraciones TypeORM:** Migraciones como código (TypeScript) en lugar de SQL crudo, ejecutables vía `npm run migration:run`.

## Requisitos y decisiones técnicas

- **Base de datos:** PostgreSQL (uso de `FOR UPDATE SKIP LOCKED` en selección aleatoria).
- **Locking distribuido:** `RedisLockService` (ioredis) provisto como DI token `'ILockService'`. Las implementaciones in-memory fueron retiradas del contenedor de dependencias.
- **Persistencia:** TypeORM con sincronización automática de esquema (`synchronize: true`).
- **Repositorios:** Implementados con TypeORM para assignments y redemptions; mappers alineados con entidades de dominio.
- **Estado del build:** Compilación verificada localmente (`npm run build` exitoso).

## Cómo ejecutar localmente (rápido)

1) Instalar dependencias

```bash
npm install
```

2) Configurar variables de entorno (ejemplo)

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=coupon_service
export REDIS_HOST=localhost
export REDIS_PORT=6379
```

3) Levantar infra con Docker

```bash
docker-compose up -d
```

4) Ejecutar migraciones TypeORM

```bash
npm run migration:run
```

Esto ejecutará la migración `1121202512_AddCouponTables.ts` que crea:
- Tablas: `coupon_books`, `coupon_codes`, `coupon_assignments`, `coupon_redemptions`
- Columnas de lock/redemption en `coupon_codes`
- Opciones de configuración en `coupon_books`

5) Compilar y arrancar en modo desarrollo

```bash
npm run build
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts npm principales

- `npm run build` — Compilar el proyecto
- `npm run start:dev` — Iniciar en modo desarrollo (watch)
- `npm run start:prod` — Iniciar en modo producción
- `npm run migration:run` — Ejecutar migraciones pendientes
- `npm run migration:generate` — Generar nueva migración (después de cambios en entidades)
- `npm run migration:revert` — Revertir última migración ejecutada
- `npm run test` — Ejecutar tests
- `npm run lint` — Ejecutar linter

## Endpoints principales (resumen)

- `POST /coupons` — Crear libro de cupones (payload admite `maxCodesPerUser` y `allowMultipleRedemptionsPerUser`).
- `POST /coupons/:couponBookId/codes` — Subir lista de códigos al libro.
- `POST /coupons/assign` — Asignar cupón aleatorio a usuario.
- `POST /coupons/assign/:code` — Asignar cupón específico a usuario.
- `POST /coupons/lock/:code` — Bloquear temporalmente cupón (requiere asignación previa o pertenencia al usuario según reglas).
- `POST /coupons/redeem/:code` — Canjear cupón.
- `GET /users/:userId/coupons` — Obtener cupones asignados a un usuario.
- `DELETE /coupons/:couponBookId` — Eliminar un libro de cupones y sus códigos asociados (204 No Content en éxito; 404 si no existe).
- `GET /api/coupons` — Obtener todos los `Coupon Books` con sus códigos cargados (endpoint administrativo).

## Notas sobre comportamiento implementado

- Al asignar, si `couponBook.maxCodesPerUser` está configurado se verifica y evita asignaciones adicionales.
- Al canjear, si `allowMultipleRedemptionsPerUser` es `false` se verifica el histórico en `coupon_redemptions` y se rechaza si ya canjeó.

## Documentación y recursos relacionados

Encontrarás documentación adicional, ejemplos de uso de la API y diagramas en la carpeta `docs/`:

- `docs/API_EXAMPLES.md` — colección de ejemplos prácticos (curl) para los endpoints principales, incluyendo el ejemplo de `DELETE /api/coupons/:couponBookId` y flujos completos de prueba.
- `docs/CHALLENGE.md` — enunciado del reto técnico que sirvió de guía para el diseño y los endpoints implementados.
- `docs/diagrams/` — múltiples diagramas Mermaid (.mmd) con la arquitectura, modelo de datos (ERD) y el diagrama de secuencia. Puedes generar PNG/SVG usando el script de exportación.

## Migraciones

Las migraciones están implementadas como código TypeORM (TypeScript) en `/src/contexts/coupons/infrastructure/database/migrations/`:

- **`data-source.ts`** — DataSource unificado que define la configuración de conexión, entidades y ubicación de migraciones. Es la fuente única de verdad para TypeORM.
- **`1121202512_AddCouponTables.ts`** — Migración TypeORM que crea todas las tablas iniciales y columnas necesarias.

### Ejecutar migraciones:

```bash
# Ejecutar todas las migraciones pendientes
npm run migration:run

# Generar nueva migración (después de cambios en entidades ORM)
npm run migration:generate

# Revertir última migración ejecutada
npm run migration:revert
```

Las migraciones son idempotentes y seguras para ejecutar múltiples veces.

## Pruebas y verificación

- Aún faltan pruebas automáticas (unit/e2e). Recomendado añadir al menos un e2e que cubra flujo: crear libro → subir códigos → asignar → redimir.

## Pendientes / mejoras sugeridas

1. **Locking robusto:** Mejorar a Redis + Redlock para entornos multi-instancia con garantías más fuertes.
2. **Validación y autenticación:** Añadir ValidationPipe global y guards de autenticación para endpoints.
3. **Tests unitarios e integración:** Cobertura de unit tests y e2e con docker-compose stack.
4. **Documentación OpenAPI:** Integrar Swagger/OpenAPI para documentación automática de endpoints.

## Contacto y mantenimiento

- **Autor:** Julio Sarmiento Peña
- **Licencia:** UNLICENSED
