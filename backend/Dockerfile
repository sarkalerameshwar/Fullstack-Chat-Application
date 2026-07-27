# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Stage 2: Lightweight Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy production dependencies and application code from builder
COPY --from=builder /app ./

# Use unprivileged node user for enhanced container security
USER node

EXPOSE 5001

# Container health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

CMD ["node", "index.js"]
