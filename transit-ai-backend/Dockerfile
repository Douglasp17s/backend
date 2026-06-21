# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY .eslintrc.js ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src
COPY prisma ./prisma

# Compilar TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/main"]
