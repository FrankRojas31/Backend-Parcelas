# API de Autenticación - Documentación

## Endpoints Implementados

### 1. Registro de Usuario

**POST** `/api/register`

**Body:**

```json
{
  "username": "usuario_ejemplo",
  "password": "contraseña123",
  "email": "usuario@ejemplo.com",
  "id_role": 1,
  "id_persona": 1
}
```

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "username": "usuario_ejemplo",
      "email": "usuario@ejemplo.com",
      "id_role": 1,
      "id_persona": 1,
      "borrado": false,
      "created_at": "2024-10-13T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Usuario registrado exitosamente"
}
```

### 2. Login de Usuario

**POST** `/api/login`

**Body:**

```json
{
  "username": "usuario_ejemplo",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "username": "usuario_ejemplo",
      "email": "usuario@ejemplo.com",
      "id_role": 1,
      "id_persona": 1,
      "borrado": false,
      "created_at": "2024-10-13T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login exitoso"
}
```

### 3. Verificar Token

**POST** `/api/verify-token`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "usuario": {
      "id": 1,
      "username": "usuario_ejemplo",
      "email": "usuario@ejemplo.com",
      "id_role": 1,
      "id_persona": 1,
      "borrado": false,
      "created_at": "2024-10-13T..."
    },
    "tokenInfo": {
      "id": 1,
      "username": "usuario_ejemplo",
      "email": "usuario@ejemplo.com",
      "id_role": 1,
      "id_persona": 1,
      "iat": 1697234567,
      "exp": 1697320967
    }
  },
  "message": "Token válido"
}
```

## JWT (JSON Web Token)

### Configuración:

- **Algoritmo**: HS256
- **Expiración**: 24 horas (configurable con JWT_EXPIRES_IN)
- **Secret**: Configurable con JWT_SECRET (default: parcela-backend-secret-key-2024)

### Payload del Token:

```json
{
  "id": 1,
  "username": "usuario_ejemplo",
  "email": "usuario@ejemplo.com",
  "id_role": 1,
  "id_persona": 1,
  "iat": 1697234567,
  "exp": 1697320967
}
```

## Middleware de Autenticación

### `AuthMiddleware.verifyToken`

Middleware para proteger rutas que requieren autenticación:

```typescript
import { AuthMiddleware } from "../middleware/auth.middleware";

// Proteger una ruta
router.get("/protected", AuthMiddleware.verifyToken, (req, res) => {
  // req.user contiene la información del usuario autenticado
  res.json({ user: req.user });
});
```

### `AuthMiddleware.requireRole`

Middleware para requerir roles específicos:

```typescript
// Solo usuarios con rol 1 o 2 pueden acceder
router.get(
  "/admin",
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole([1, 2]),
  (req, res) => {
    res.json({ message: "Área de administración" });
  }
);
```

### `AuthMiddleware.optionalAuth`

Middleware que agrega información del usuario si está autenticado, pero no falla si no lo está:

```typescript
router.get("/public", AuthMiddleware.optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: "Hola usuario autenticado", user: req.user });
  } else {
    res.json({ message: "Hola usuario anónimo" });
  }
});
```

## Validaciones Implementadas

### Registro:

- ✅ Todos los campos son requeridos
- ✅ Formato de email válido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Username único
- ✅ Email único
- ✅ Hash de contraseña con bcrypt

### Login:

- ✅ Username y password requeridos
- ✅ Validación de credenciales con bcrypt
- ✅ Verificación de usuario no eliminado (borrado lógico)
- ✅ Generación de JWT token

### Verify Token:

- ✅ Header Authorization requerido
- ✅ Formato Bearer token
- ✅ Verificación de firma JWT
- ✅ Verificación de expiración
- ✅ Verificación de usuario existente

## Errores Comunes

### 400 - Bad Request

```json
{
  "success": false,
  "error": "Todos los campos son requeridos"
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "error": "No tienes permisos para acceder a este recurso"
}
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=24h
PORT=3000
```

## Pruebas con curl

### Registro:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "test123",
    "email": "test@ejemplo.com",
    "id_role": 1,
    "id_persona": 1
  }'
```

### Login:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "test123"
  }'
```

### Verificar Token:

```bash
# Usar el token obtenido del login
curl -X POST http://localhost:3000/api/verify-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Ejemplo de Uso Completo

1. **Registrar usuario** y obtener token
2. **Usar el token** en headers para acceder a rutas protegidas
3. **Verificar token** para validar sesión antes de operaciones sensibles
4. **Renovar token** haciendo login nuevamente cuando expire

## Seguridad Implementada

- ✅ **Hash de contraseñas**: Utiliza bcrypt con salt rounds = 10
- ✅ **JWT Tokens**: Tokens firmados con secret key
- ✅ **No exposición de contraseñas**: Las respuestas nunca incluyen el hash
- ✅ **Expiración de tokens**: Tokens expiran en 24h por defecto
- ✅ **Validación de datos**: Validaciones en frontend y backend
- ✅ **Borrado lógico**: Los usuarios eliminados no pueden hacer login
- ✅ **Verificación de existencia**: Tokens verifican que el usuario siga existiendo
