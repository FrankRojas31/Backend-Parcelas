# Usar Node.js 18 con Alpine (imagen más ligera)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar el esquema de Prisma para generar el cliente
COPY prisma ./prisma

# Generar cliente de Prisma (necesario para compilación)
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Copiar archivos generados de Prisma al directorio dist (necesario para runtime)
RUN cp -r src/generated dist/

# Crear usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar propietario de los archivos al usuario nextjs
RUN chown -R nextjs:nodejs /app

# Cambiar al usuario no root
USER nextjs

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]