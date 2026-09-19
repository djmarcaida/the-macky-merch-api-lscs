# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL and libc dependencies required by Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package manifests and install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate Prisma Client engine
COPY prisma ./prisma
RUN npx prisma generate

# Copy TypeScript configuration and source files
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript (dist/)
RUN npm run build

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL for Prisma engine runtime on Alpine
RUN apk add --no-cache openssl

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./prod.db"

# Copy runtime dependencies, generated Prisma client, compiled dist, and migrations
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY schema.sql ./

# Ensure non-root node user has read/write permissions for SQLite database and journals
RUN chown -R node:node /app

# Drop root privileges
USER node

# Expose HTTP port
EXPOSE 3000

# Apply pending migrations to SQLite on startup and launch server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
