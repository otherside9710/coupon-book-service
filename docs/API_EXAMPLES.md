# API Examples - Coupon Book Service

## 📋 Descripción General de la Solución

El **Coupon Book Service** es un servicio backend escalable y robusto para gestionar sistemas de cupones y descuentos. La solución está diseñada siguiendo principios de **Arquitectura Hexagonal** y **Domain-Driven Design (DDD)**, garantizando un código mantenible, testeable y profesional.

### Objetivo Principal

Proporcionar una API REST que permita:
- **Crear y gestionar libros de cupones** (colecciones de códigos)
- **Asignar cupones** a usuarios (aleatoriamente o específicamente)
- **Bloquear cupones** temporalmente durante operaciones sensibles (usando Redis para locking distribuido)
- **Canjear/redimir cupones** con validaciones de negocio
- **Consultar el historial** de cupones de un usuario

### Características Clave

#### 🏗️ Arquitectura Hexagonal
- **Application Layer:** Casos de uso (use-cases) que orquestan la lógica de negocio
- **Domain Layer:** Entidades de dominio y reglas de negocio puro
- **Infrastructure Layer:** Adaptadores para persistencia (TypeORM), locking (Redis), cache, etc.
- **Interface Layer:** Controllers HTTP centralizados en `/src/apps/controllers`

#### 💾 Persistencia
- **Base de datos:** PostgreSQL con TypeORM como ORM
- **Tablas principales:**
  - `coupon_books` — Libros de cupones con configuraciones
  - `coupon_codes` — Códigos individuales con metadata de lock/redención
  - `coupon_assignments` — Historial de asignaciones a usuarios
  - `coupon_redemptions` — Historial de redenciones con detalles

#### 🔒 Locking Distribuido
- **Implementación:** RedisLockService (ioredis)
- **Propósito:** Prevenir race conditions al redimir/asignar cupones simultáneamente
- **Garantía:** SET NX con Lua script para operaciones atómicas

#### 📏 Validaciones de Negocio
- **maxCodesPerUser:** Limita cuántos cupones puede asignar a un usuario
- **allowMultipleRedemptionsPerUser:** Controla si un usuario puede canjear múltiples cupones del mismo libro
- **Validez temporal:** Respeta `validFrom` y `validUntil` en libros

## Flujo completo de prueba

Este es un flujo paso a paso actualizado para probar la aplicación completa y las nuevas reglas/formatos (locks en Redis, `ttlSeconds`, respuestas 423, formato `userId` en user coupons):

```bash
#!/bin/bash

set -euo pipefail

# 1. Crear un libro de cupones (ejemplo con límite 1 redención por usuario)
echo "1. Creando libro de cupones..."
BOOK_ID=$(curl -s -X POST http://localhost:3000/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Coupons",
    "maxCodesPerUser": 2,
    "allowMultipleRedemptionsPerUser": false
  }' | jq -r '.id')

echo "Libro creado con ID: $BOOK_ID"

# 2. Subir códigos
echo "2. Subiendo códigos..."
curl -s -X POST http://localhost:3000/api/coupons/$BOOK_ID/codes \
  -H "Content-Type: application/json" \
  -d '{ "codes": ["TEST001", "TEST002", "TEST003"] }' | jq

# 3. Asignar cupón aleatorio a USER (locker)
echo "3. Asignando cupón aleatorio..."
USER_ID="660e8400-e29b-41d4-a716-446655440001"
OTHER_USER_ID="770e8400-e29b-41d4-a716-446655440002"
ASSIGN_RESP=$(curl -s -X POST http://localhost:3000/api/coupons/assign \
  -H "Content-Type: application/json" \
  -d "{ \"userId\": \"$USER_ID\", \"couponBookId\": \"$BOOK_ID\" }")
echo "$ASSIGN_RESP" | jq
COUPON_CODE=$(echo "$ASSIGN_RESP" | jq -r '.code')

# 4. Bloquear cupón (usar ttlSeconds exactos)
echo "4. Bloqueando cupón $COUPON_CODE por 30s (ttlSeconds)..."
curl -s -X POST http://localhost:3000/api/coupons/lock/$COUPON_CODE \
  -H "Content-Type: application/json" \
  -d "{ \"userId\": \"$USER_ID\", \"ttlSeconds\": 30 }" | jq

# Mostrar TTL en Redis (ms)
echo "Redis PTTL (ms):"
docker-compose exec -T redis redis-cli PTTL lock:coupon:$COUPON_CODE || true

# 5. Intentar canjear desde otro usuario -> debe devolver 423 Locked
echo "5. Intento de canje por otro usuario (esperado: 423 Locked)..."
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/coupons/redeem/$COUPON_CODE \
  -H "Content-Type: application/json" \
  -d "{ \"userId\": \"$OTHER_USER_ID\" }"

# 6. Intentar canjear por el locker (USER_ID)
echo "6. Intento de canje por el locker (puede devolver 200 OK o 400 si ya alcanzó límite de redenciones dependiendo de la política)..."
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/coupons/redeem/$COUPON_CODE \
  -H "Content-Type: application/json" \
  -d "{ \"userId\": \"$USER_ID\" }"

# 7. (Opcional) Esperar a que el lock expire y reintentar
echo "7. Esperando 35s para que expire el lock y reintentando con otro usuario (si policy lo permite)..."
sleep 35
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/coupons/redeem/$COUPON_CODE \
  -H "Content-Type: application/json" \
  -d "{ \"userId\": \"$OTHER_USER_ID\" }"

# 8. Obtener cupones del usuario (nuevo formato userId + data)
echo "8. Obteniendo cupones del usuario..."
curl -s -X GET http://localhost:3000/api/users/$USER_ID/coupons | jq

echo "Prueba completada!"
```

**Payload:**
```bash
curl -X POST http://localhost:3000/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cupones Navidad 2025",
    "maxCodesPerUser": 3,
    "allowMultipleRedemptionsPerUser": false,
    "validFrom": "2025-11-22T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Cupones Navidad 2025",
  "totalCodes": 0,
  "availableCodes": 0,
  "maxCodesPerUser": 3,
  "allowMultipleRedemptionsPerUser": false,
  "validFrom": "2025-11-22T00:00:00.000Z",
  "validUntil": "2025-12-31T23:59:59.000Z"
}
```

---

## 2. Subir códigos a un libro (Upload Codes)

**Endpoint:** `POST /api/coupons/:couponBookId/codes`

**Descripción:** Sube una lista de códigos de cupones a un libro existente. Los códigos deben ser únicos dentro del libro.

**Payload:**
```bash
curl -X POST http://localhost:3000/api/coupons/550e8400-e29b-41d4-a716-446655440000/codes \
  -H "Content-Type: application/json" \
  -d '{
    "codes": [
      "ABC123XYZ",
      "DEF456UVW",
      "GHI789RST",
      "JKL012OPQ",
      "MNO345NML"
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "message": "5 códigos subidos correctamente",
  "couponBookId": "550e8400-e29b-41d4-a716-446655440000",
  "codesCount": 5,
  "totalAvailable": 5
}
```

---

## 3. Asignar cupón aleatorio (Assign Random Coupon)

**Endpoint:** `POST /api/coupons/assign`

**Descripción:** Asigna aleatoriamente un cupón disponible de un libro específico a un usuario. Respeta el límite `maxCodesPerUser` si está configurado.

**Payload:**
```bash
curl -X POST http://localhost:3000/api/coupons/assign \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "couponBookId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Respuesta esperada:**
```json
{
  "code": "JKL012OPQ",
  "couponBookId": "de55de77-e8a1-4360-b536-0aa96ab355cf",
  "userId": "660e8400-e29b-41d4-a716-446655440001",
  "status": "ASSIGNED",
  "assignedAt": "2025-11-22T20:46:29.112Z"
}
```

---

## 4. Asignar cupón específico (Assign Specific Coupon)

**Endpoint:** `POST /api/coupons/assign/:code`

**Descripción:** Asigna un código específico de cupón a un usuario. Útil cuando quieres asignar un cupón en particular en lugar de uno aleatorio.

**Payload:**
```bash
curl -X POST http://localhost:3000/api/coupons/assign/ABC123XYZ \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "couponBookId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Respuesta esperada:**
```json
{
  "code": "DEF456UVW",
  "couponBookId": "de55de77-e8a1-4360-b536-0aa96ab355cf",
  "userId": "660e8400-e29b-41d4-a716-446655440001",
  "status": "ASSIGNED",
  "assignedAt": "2025-11-22T20:49:24.881Z"
}
```

---

## 5. Bloquear cupón (Lock Coupon)

**Endpoint:** `POST /api/coupons/lock/:code`

**Descripción:** Bloquea temporalmente un cupón para evitar que otros usuarios lo rediman simultáneamente. El bloqueo expira según el TTL configurado. Usa Redis para locking distribuido.

**Payload:**
```bash
curl -X POST http://localhost:3000/api/coupons/lock/ABC123XYZ \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "ttlSeconds": 30
  }'
```

**Respuesta esperada:**
```json
{
  "code": "ABC123XYZ",
  "locked": true,
  "lockedBy": "660e8400-e29b-41d4-a716-446655440001",
  "lockExpiresAt": "2025-11-22T14:32:00.000Z",
  "message": "Cupón bloqueado exitosamente"
}
```

**Respuesta esperada (error - ya bloqueado):**

HTTP 423 Locked

```json
{
  "error": "CouponAlreadyLocked",
  "message": "El cupón ya está bloqueado por otro usuario",
  "secondsRemaining": 12
}
```

---

## 6. Canjear cupón (Redeem Coupon)

**Endpoint:** `POST /api/coupons/redeem/:code`

**Descripción:** Canjea un cupón. Verifica que:
- El cupón existe y está disponible
- El usuario tiene asignado el cupón (o ha sido asignado a él)
- Si `allowMultipleRedemptionsPerUser` es false, verifica que el usuario no haya canjeado ya un cupón de este libro
- Persiste la redención en la tabla `coupon_redemptions`

**Payload:**
```bash
curl -X POST http://localhost:3000/api/coupons/redeem/ABC123XYZ \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "660e8400-e29b-41d4-a716-446655440001"
  }'
```

**Respuesta esperada:**
```json
{
  "code": "ABC123XYZ",
  "userId": "660e8400-e29b-41d4-a716-446655440001",
  "redeemedAt": "2025-11-22T14:32:45.789Z",
  "message": "Cupón canjeado exitosamente"
}
```

**Respuesta esperada (error - cupón bloqueado):**

HTTP 423 Locked

```json
{
  "error": "CouponAlreadyLocked",
  "message": "Coupon is currently locked",
  "secondsRemaining": 281
}
```

---

## 7. Obtener cupones de un usuario (Get User Coupons)

**Endpoint:** `GET /api/users/:userId/coupons`

**Descripción:** Obtiene todos los cupones asignados a un usuario, incluyendo su estado (asignado, bloqueado, canjeado).

**Comando:**
```bash
curl -X GET http://localhost:3000/api/users/660e8400-e29b-41d4-a716-446655440001/coupons
```

**Respuesta esperada (nuevo formato):**
```json
{
  "userId": "660e8400-e29b-41d4-a716-446655440001",
  "data": [
    {
      "id": "1d208d1b-17b2-48e1-b061-e3aa0d819414",
      "code": "JKL012OPQ",
      "status": "ASSIGNED",
      "assignedAt": "2025-11-22T20:46:29.112Z",
      "couponBookId": "de55de77-e8a1-4360-b536-0aa96ab355cf",
      "assignedToUserId": "660e8400-e29b-41d4-a716-446655440001",
      "lockedBy": null,
      "lockedAt": null,
      "lockExpiresAt": null,
      "redeemedAt": null,
      "redeemedByUserId": null
    },
    {
      "id": "...",
      "code": "DEF456UVW",
      "status": "REDEEMED",
      "assignedAt": "2025-11-22T20:49:24.881Z",
      "couponBookId": "de55de77-e8a1-4360-b536-0aa96ab355cf",
      "assignedToUserId": "660e8400-e29b-41d4-a716-446655440001",
      "lockedBy": null,
      "lockedAt": null,
      "lockExpiresAt": null,
      "redeemedAt": "2025-11-22T20:49:24.881Z",
      "redeemedByUserId": "660e8400-e29b-41d4-a716-446655440001"
    },
    {
      "id": "...",
      "code": "GHI789RST",
      "status": "LOCKED",
      "assignedAt": "2025-11-22T21:05:24.163Z",
      "couponBookId": "de55de77-e8a1-4360-b536-0aa96ab355cf",
      "assignedToUserId": "660e8400-e29b-41d4-a716-446655440001",
      "lockedBy": "660e8400-e29b-41d4-a716-446655440001",
      "lockedAt": "2025-11-22T21:05:24.163Z",
      "lockExpiresAt": "2025-11-22T21:10:24.163Z",
      "redeemedAt": null,
      "redeemedByUserId": null
    }
  ]
}
```

---

## 8. Obtener todos los libros y códigos (Get all Coupon Books with Codes)

**Endpoint:** `GET /api/coupons`

**Descripción:** Devuelve todos los `Coupon Books` registrados junto con los códigos asociados a cada libro. Útil para vistas administrativas o para listar el catálogo completo.

**Comando:**
```bash
curl -X GET http://localhost:3000/api/coupons
```

**Respuesta esperada (ejemplo):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Cupones Navidad 2025",
    "totalCodes": 5,
    "availableCodes": 5,
    "maxCodesPerUser": 3,
    "allowMultipleRedemptionsPerUser": false,
    "validFrom": "2025-11-22T00:00:00.000Z",
    "validUntil": "2025-12-31T23:59:59.000Z",
    "codes": [
      { "id": "...", "code": "ABC123XYZ", "status": "AVAILABLE" },
      { "id": "...", "code": "DEF456UVW", "status": "AVAILABLE" }
    ]
  }
]
```

---

## 9. Health Check

**Endpoint:** `GET /api/health`

**Descripción:** Endpoint de salud para verificar que la aplicación está corriendo.

**Comando:**
```bash
curl -X GET http://localhost:3000/api/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T14:33:00.123Z"
}
```

---

## Notas

- **Redis Locking:** El bloqueo de cupones usa Redis (ioredis) para garantizar que el lock es distribuido y seguro en entornos multi-instancia.
- **Database:** Las asignaciones y redenciones se persisten en PostgreSQL en las tablas `coupon_assignments` y `coupon_redemptions`.
- **Validaciones:** Cada endpoint valida reglas de negocio como `maxCodesPerUser` y `allowMultipleRedemptionsPerUser`.
- **IDs:** Usa UUIDs (v4) para todos los IDs. Puedes generar UUIDs con `uuidgen` en macOS/Linux.

---

## Troubleshooting

Si encuentras errores:

1. **"database not connected"** — Asegúrate de que Docker está corriendo: `docker-compose up -d`
2. **"redis connection failed"** — Verifica que Redis está disponible en `localhost:6379`
3. **"coupon not found"** — Asegúrate de que subiste códigos al libro primero
4. **"user already has max codes"** — Respeta el límite `maxCodesPerUser` al asignar

