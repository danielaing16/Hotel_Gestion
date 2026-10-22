# Etapa 1: Base con Node.js 20 LTS
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++

# Etapa 2: Instalación de dependencias
FROM base AS dependencies
COPY package*.json ./
RUN npm install

# Etapa 3: Compilación
FROM dependencies AS builder
COPY . .
RUN npm run build

# Etapa 4: Imagen final de ejecución
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development
ENV PORT=3002

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/nest-cli.json ./

EXPOSE 3002

# En desarrollo usamos start:dev para recarga en caliente
CMD ["npm", "run", "start:dev"]
