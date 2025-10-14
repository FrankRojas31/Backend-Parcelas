# Parcela Backend - Deployment con PostgreSQL

## 🚀 Configuración para Desarrollo Local

### Prerrequisitos

- Docker y Docker Compose instalados
- Node.js 18+ (opcional si usas Docker)

### Desarrollo con Docker

1. **Construir y ejecutar todo el stack:**

```bash
npm run docker:dev
```

2. **Parar los servicios:**

```bash
npm run docker:down
```

3. **Limpiar volúmenes (resetear base de datos):**

```bash
npm run docker:clean
```

### Desarrollo sin Docker

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar PostgreSQL local** y actualizar `.env`

3. **Ejecutar migraciones:**

```bash
npm run prisma:migrate
```

4. **Iniciar en modo desarrollo:**

```bash
npm run dev
```

## 🌐 Deployment en Render.com

### Paso 1: Preparar el repositorio

1. Asegúrate de que todos los archivos estén commiteados
2. Sube tu código a GitHub

### Paso 2: Crear servicio web en Render

1. Ve a [Render.com](https://render.com) y conecta tu repositorio
2. Configura el servicio web:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** `Node`

### Paso 3: Crear base de datos PostgreSQL

1. En el dashboard de Render, crea una nueva base de datos PostgreSQL
2. Copia la URL de conexión interna

### Paso 4: Configurar variables de entorno

En la sección "Environment" de tu servicio web, agrega:

```
DATABASE_URL=<URL_PostgreSQL_de_Render>
MONGO_URI=mongodb+srv://admin:TJkbAFEVPHP2krAk@parcelasbd.ubiwgfs.mongodb.net/parcelas
API_EXTERNAL_URL=https://sensores-async-api.onrender.com/api/sensors/all
JWT_SECRET=<tu_secreto_jwt_super_seguro>
NODE_ENV=production
PORT=10000
```

### Paso 5: Conectar la base de datos

1. En la configuración de tu servicio web, ve a la sección "Environment"
2. Conecta la base de datos PostgreSQL que creaste
3. Render automáticamente agregará la variable `DATABASE_URL`

### Paso 6: Deploy

1. Render detectará automáticamente el `Dockerfile`
2. Ejecutará las migraciones automáticamente en el inicio
3. Tu aplicación estará disponible en la URL proporcionada

## 📝 Scripts disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Desarrollo con hot-reload
- `npm run build` - Compilar TypeScript
- `npm run docker:dev` - Desarrollo con Docker
- `npm run docker:down` - Parar Docker
- `npm run docker:clean` - Limpiar Docker
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio

## 🔧 Configuración de archivos

### Variables de entorno por ambiente:

- `.env` - Desarrollo local
- `.env.development` - Desarrollo con Docker
- `.env.production` - Template para producción

### Docker:

- `Dockerfile` - Imagen de producción optimizada
- `docker-compose.yml` - Stack completo de desarrollo
- `.dockerignore` - Archivos excluidos del build

## 🗄️ Migración desde SQL Server

Si vienes de SQL Server, los cambios principales son:

1. **Provider en schema.prisma:** Cambiado de `sqlserver` a `postgresql`
2. **DATABASE_URL:** Nuevo formato PostgreSQL
3. **Dependencias:** Removido `mssql`, agregado `pg`
4. **Conexiones:** El código de Prisma funciona igual, solo cambia la configuración

## ⚠️ Notas importantes

- Las migraciones se ejecutan automáticamente en Render
- Asegúrate de que el `JWT_SECRET` sea único y seguro en producción
- El puerto se asigna automáticamente en Render
- La base de datos PostgreSQL de Render tiene backups automáticos
