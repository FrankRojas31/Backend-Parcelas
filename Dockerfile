# Usar Node.js 18 con Alpine (imagen más ligera)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Instalar Prisma CLI globalmente
RUN npm install -g prisma

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Crear usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Comando para ejecutar la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]